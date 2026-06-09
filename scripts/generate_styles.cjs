const fs = require('fs');
const path = require('path');
const https = require('https');
const { layers, namedFlavor } = require('@protomaps/basemaps');

const OUT_DIR = path.resolve(__dirname, '../public/map');
const SPRITES_DIR = path.join(OUT_DIR, 'sprites');
const STYLES_DIR = path.join(OUT_DIR, 'styles');

// Helper to make directory recursively
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Download file helper
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    ensureDir(path.dirname(dest));
    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });
    
    request.on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Download Protomaps sprites
async function downloadSprites() {
  console.log('1. Đang tải Protomaps spritesheets...');
  const base = 'https://protomaps.github.io/basemaps-assets/sprites/v4';
  const files = [
    'light.json', 'light.png', 'light@2x.json', 'light@2x.png',
    'dark.json', 'dark.png', 'dark@2x.json', 'dark@2x.png'
  ];

  for (const file of files) {
    const url = `${base}/${file}`;
    const dest = path.join(SPRITES_DIR, file);
    try {
      await downloadFile(url, dest);
      console.log(`   - Tải thành công: ${file}`);
    } catch (err) {
      console.error(`   - ❌ Lỗi khi tải ${file}:`, err.message);
      throw err;
    }
  }
}

// Map layer processor (replacing Noto Sans Medium with Noto Sans Regular, and adding overlap options for pois)
function processLayers(layerList) {
  layerList.forEach(layer => {
    if (layer.layout && layer.layout['text-font']) {
      let json = JSON.stringify(layer.layout['text-font']);
      // Replace Noto Sans Medium with Noto Sans Regular
      json = json.replace(/"Noto Sans Medium"/g, '"Noto Sans Regular"');
      layer.layout['text-font'] = JSON.parse(json);
    }

    // Force POI icons to be visible by bypassing collision checks
    if (layer.id === 'pois') {
      if (!layer.layout) layer.layout = {};
      layer.layout['icon-allow-overlap'] = true;
      layer.layout['icon-ignore-placement'] = true;
      layer.layout['icon-optional'] = false; // icon is mandatory
      layer.layout['text-optional'] = true;  // text is optional (can hide text but keep icon)
    }
  });
  return layerList;
}

// Generate the style files
function generateStyle(theme) {
  console.log(`2. Đang tạo cấu hình style cho theme: ${theme}...`);
  
  const flavor = namedFlavor(theme);
  const rawLayers = layers('openmaptiles', flavor, { lang: 'vi' }); // use 'vi' for Vietnamese labels fallback
  const processedLayers = processLayers(rawLayers);

  const style = {
    version: 8,
    name: `Protomaps Local ${theme === 'light' ? 'Light' : 'Dark'}`,
    metadata: {
      "mapbox:autocomposer": {
        "light": theme === 'light'
      }
    },
    sources: {
      ne2_shaded: {
        maxzoom: 6,
        tileSize: 256,
        tiles: [
          "/map/ne/ne2sr/{z}/{x}/{y}.png"
        ],
        type: "raster"
      },
      openmaptiles: {
        type: "vector",
        tiles: [
          "pmtiles://{host}/map/tiles/danang_hoian.pmtiles/{z}/{x}/{y}.mvt"
        ],
        minzoom: 0,
        maxzoom: 15
      }
    },
    sprite: `/map/sprites/${theme}`,
    glyphs: `/map/fonts/{fontstack}/{range}.pbf`,
    layers: processedLayers
  };

  const filename = theme === 'light' ? 'positron.json' : 'dark.json';
  const destPath = path.join(STYLES_DIR, filename);
  
  ensureDir(STYLES_DIR);
  fs.writeFileSync(destPath, JSON.stringify(style, null, 2), 'utf8');
  console.log(`   - Đã ghi file style: public/map/styles/${filename}`);
}

async function main() {
  try {
    ensureDir(OUT_DIR);
    ensureDir(SPRITES_DIR);
    
    await downloadSprites();
    
    generateStyle('light');
    generateStyle('dark');
    
    console.log('\n✅ Cập nhật style và sprites thành công!');
  } catch (err) {
    console.error('\n❌ Thất bại:', err.message);
    process.exit(1);
  }
}

main();

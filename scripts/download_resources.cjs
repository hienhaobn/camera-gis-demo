const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const BASE_URL = 'https://tiles.openfreemap.org';
const OUT_DIR = path.resolve(__dirname, '../public/map');

const CONCURRENCY_LIMIT = 15; // Number of parallel downloads
const MAX_RETRIES = 3;

// Helper to make directory recursively
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Download a single file to destination
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    ensureDir(path.dirname(dest));

    let attempt = 0;
    
    function tryDownload() {
      attempt++;
      
      const request = https.get(url, (response) => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(dest);
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(true);
          });
          file.on('error', (err) => {
            fs.unlink(dest, () => {}); // Delete the file async
            if (attempt < MAX_RETRIES) {
              setTimeout(tryDownload, 500 * attempt);
            } else {
              reject(err);
            }
          });
        } else if (response.statusCode === 404) {
          // Silent ignore for 404 (some font/tile ranges might not exist)
          resolve(false);
        } else if (response.statusCode === 429 || response.statusCode >= 500) {
          // Rate limit or server error, retry
          if (attempt < MAX_RETRIES) {
            const delay = 1000 * attempt;
            setTimeout(tryDownload, delay);
          } else {
            reject(new Error(`Server returned status code ${response.statusCode} for ${url}`));
          }
        } else {
          reject(new Error(`Failed to get '${url}' (status code: ${response.statusCode})`));
        }
      });

      request.on('error', (err) => {
        if (attempt < MAX_RETRIES) {
          setTimeout(tryDownload, 500 * attempt);
        } else {
          reject(err);
        }
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
      });
    }

    tryDownload();
  });
}

// Concurrency pool runner
async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = [];
  let completed = 0;

  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);

    if (limit <= tasks.length) {
      const e = p.then(() => {
        executing.splice(executing.indexOf(e), 1);
        completed++;
        if (completed % 50 === 0 || completed === tasks.length) {
          console.log(`   Progress: ${completed}/${tasks.length} tasks completed...`);
        }
      });
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function main() {
  console.log('=== KHỞI TẠO TẢI TÀI NGUYÊN BẢN ĐỒ OFFLINE ===');
  console.log(`Thư mục lưu trữ: ${OUT_DIR}`);

  // Get options from arguments
  // Usage: node download_resources.cjs [--max-zoom 4]
  const args = process.argv.slice(2);
  let maxZoom = 4;
  const zoomIndex = args.indexOf('--max-zoom');
  if (zoomIndex !== -1 && args[zoomIndex + 1]) {
    maxZoom = parseInt(args[zoomIndex + 1], 10);
  }

  const tasks = [];

  // 1. Sprites (Biểu tượng bản đồ)
  console.log('\n1. Chuẩn bị danh sách Sprite Sheets...');
  const spriteFiles = ['ofm.json', 'ofm.png', 'ofm@2x.json', 'ofm@2x.png'];
  for (const file of spriteFiles) {
    const url = `${BASE_URL}/sprites/ofm_f384/${file}`;
    const dest = path.join(OUT_DIR, 'sprites', file);
    tasks.push(() => {
      // console.log(`   - Tải sprite: ${file}`);
      return downloadFile(url, dest);
    });
  }

  // 2. Glyphs (Fonts Noto Sans)
  console.log('2. Chuẩn bị danh sách font Glyphs (Noto Sans Regular, Bold, Italic)...');
  const fonts = ['Noto Sans Regular', 'Noto Sans Bold', 'Noto Sans Italic'];
  for (const font of fonts) {
    const fontUrlName = font.replace(/ /g, '%20');
    // Glyphs are split into 256-character ranges (0-255, 256-511, ..., 65280-65535)
    for (let start = 0; start <= 65280; start += 256) {
      const end = start + 255;
      const file = `${start}-${end}.pbf`;
      const url = `${BASE_URL}/fonts/${fontUrlName}/${file}`;
      const dest = path.join(OUT_DIR, 'fonts', font, file);
      
      tasks.push(() => downloadFile(url, dest));
    }
  }

  // 3. Natural Earth raster tiles (z0-z4)
  console.log(`3. Chuẩn bị danh sách Natural Earth raster tiles (Zoom 0 đến Zoom ${maxZoom})...`);
  for (let z = 0; z <= maxZoom; z++) {
    const maxXY = Math.pow(2, z) - 1;
    for (let x = 0; x <= maxXY; x++) {
      for (let y = 0; y <= maxXY; y++) {
        const file = `${y}.png`;
        const url = `${BASE_URL}/natural_earth/ne2sr/${z}/${x}/${y}.png`;
        const dest = path.join(OUT_DIR, 'ne', 'ne2sr', String(z), String(x), file);
        tasks.push(() => downloadFile(url, dest));
      }
    }
  }

  console.log(`\nTổng cộng có ${tasks.length} files cần tải.`);
  console.log(`Bắt đầu tải với tối đa ${CONCURRENCY_LIMIT} kết nối song song...`);
  
  const startTime = Date.now();
  try {
    await runWithConcurrency(tasks, CONCURRENCY_LIMIT);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Hoàn tất tải tài nguyên offline thành công! (Thời gian: ${duration}s)`);
    console.log(`Tài nguyên được lưu tại: ${OUT_DIR}`);
  } catch (err) {
    console.error('\n❌ Đã xảy ra lỗi trong quá trình tải:', err.message);
    process.exit(1);
  }
}

main();

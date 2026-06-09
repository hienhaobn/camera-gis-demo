const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const TEMP_DIR = path.resolve(__dirname, '../.temp_pmtiles');
const TILES_DIR = path.resolve(__dirname, '../public/map/tiles');
const PMTILES_ZIP = path.join(TEMP_DIR, 'pmtiles.zip');
const PMTILES_EXE = path.join(TEMP_DIR, 'pmtiles.exe');

// Helper to ensure directories exist
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
        // Handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: status ${response.statusCode}`));
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

// Check if a build date is available
function checkBuildDate(date) {
  return new Promise((resolve) => {
    const req = https.request({
      method: 'HEAD',
      host: 'build.protomaps.com',
      path: `/${date}.pmtiles`
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function getAvailableBuildDate() {
  const today = new Date();
  // Check the last 7 days
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
    const isAvail = await checkBuildDate(dateStr);
    if (isAvail) {
      return dateStr;
    }
  }
  return null;
}

async function main() {
  console.log('=== KHỞI TẠO TRÍCH XUẤT BẢN ĐỒ OFFLINE (PMTILES) ===');
  
  // Arguments: node extract_tiles.cjs [--maxzoom 15]
  const args = process.argv.slice(2);
  let maxZoom = 15; // default to 15 for fast dev testing
  const zoomIdx = args.indexOf('--maxzoom');
  if (zoomIdx !== -1 && args[zoomIdx + 1]) {
    maxZoom = parseInt(args[zoomIdx + 1], 10);
  }

  ensureDir(TEMP_DIR);
  ensureDir(TILES_DIR);

  // 1. Download go-pmtiles if not exists
  if (!fs.existsSync(PMTILES_EXE)) {
    console.log('\n1. Đang tải công cụ go-pmtiles CLI cho Windows...');
    const url = 'https://github.com/protomaps/go-pmtiles/releases/download/v1.30.3/go-pmtiles_1.30.3_Windows_x86_64.zip';
    try {
      await downloadFile(url, PMTILES_ZIP);
      console.log('   - Tải file ZIP thành công.');
      
      console.log('2. Đang giải nén go-pmtiles...');
      execSync(`tar -xf "${PMTILES_ZIP}" -C "${TEMP_DIR}"`);
      console.log('   - Giải nén thành công.');
    } catch (err) {
      console.error('❌ Lỗi khi tải/giải nén go-pmtiles CLI:', err.message);
      cleanup();
      process.exit(1);
    }
  } else {
    console.log('\n1. Đã tìm thấy go-pmtiles CLI locally.');
  }

  // 2. Determine best build date
  console.log('\n3. Đang kiểm tra bản build Protomaps khả dụng gần nhất...');
  const buildDate = await getAvailableBuildDate();
  if (!buildDate) {
    console.error('❌ Không tìm thấy bản build Protomaps nào trong vòng 7 ngày qua!');
    cleanup();
    process.exit(1);
  }
  console.log(`   - Bản build khả dụng: ${buildDate}.pmtiles`);

  // 3. Extracting region tiles
  const sourceUrl = `https://build.protomaps.com/${buildDate}.pmtiles`;
  const destFile = path.join(TILES_DIR, 'danang_hoian.pmtiles');
  const bbox = '107.9,15.85,108.45,16.2';

  console.log(`\n4. Đang trích xuất dữ liệu bản đồ Đà Nẵng & Hội An...`);
  console.log(`   - Bounding Box: ${bbox}`);
  console.log(`   - Độ phóng to tối đa (Max Zoom): ${maxZoom} ${maxZoom === 15 ? '(Khuyên dùng cho DEV - nhẹ, tải nhanh)' : '(Độ chi tiết cao)'}`);
  console.log(`   - File đầu ra: public/map/tiles/danang_hoian.pmtiles`);
  console.log(`   - Quá trình này có thể mất từ vài chục giây đến vài phút tùy thuộc vào mạng của bạn. Vui lòng đợi...`);

  try {
    if (fs.existsSync(destFile)) {
      console.log('   - Đã phát hiện file cũ, đang xóa để chuẩn bị tải mới...');
      fs.unlinkSync(destFile);
    }
    const cmd = `"${PMTILES_EXE}" extract "${sourceUrl}" "${destFile}" --bbox="${bbox}" --maxzoom=${maxZoom}`;
    console.log(`   Chạy lệnh: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    console.log('\n✅ Trích xuất bản đồ thành công!');
    console.log(`Tổng dung lượng file pmtiles:`);
    execSync(`powershell -Command "Get-Item '${destFile}' | Select-Object Name, @{Name='Size (MB)';Expression={'{0:N2}' -f ($_.Length / 1MB)}}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Trích xuất bản đồ thất bại:', err.message);
    process.exit(1);
  } finally {
    cleanup();
  }
}

function cleanup() {
  try {
    if (fs.existsSync(PMTILES_ZIP)) fs.unlinkSync(PMTILES_ZIP);
    // Keep pmtiles.exe for future runs, or clean up if you want
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  } catch (e) {
    // ignore cleanup errors
  }
}

main();

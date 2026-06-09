# 🗺️ GIS Camera Monitoring Dashboard — Hướng Dẫn Chạy Dự Án Lần Đầu

Chào mừng bạn đến với dự án **GIS Camera Monitoring Dashboard**! Tài liệu này sẽ giúp bạn thiết lập môi trường phát triển và chạy ứng dụng offline hoàn chỉnh trên máy cá nhân lần đầu tiên.

Dự án sử dụng bản đồ offline dựa trên định dạng **PMTiles (Protomaps)** chạy hoàn toàn dưới Client thông qua **HTTP Range Requests** được phục vụ trực tiếp bởi Vite dev server. Quy trình cài đặt đã được tự động hóa hoàn toàn bằng các script Node.js tương thích chéo nền tảng (chạy mượt mà trên cả Windows, macOS, Linux).

---

## 🛠️ Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js**: Phiên bản 18 trở lên (khuyên dùng v20+).
- **Trình quản lý gói**: `npm` hoặc `yarn`.

---

## 🚀 Quy trình thiết lập nhanh (Quick Start)

Thực hiện lần lượt 5 bước đơn giản sau để chạy dự án:

### Bước 1: Cài đặt thư viện phụ thuộc (Dependencies)
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
npm install
# hoặc
yarn install
```

### Bước 2: Tải tài nguyên bản đồ offline (Fonts, Sprites, Shaded Earth)
Tải các font chữ (Noto Sans), sprite icons ban đầu và các ô ảnh vệ tinh mức zoom thấp toàn cầu (Natural Earth z0-z4):
```bash
node scripts/download_resources.cjs
```
*Tài nguyên sẽ được lưu trực tiếp vào thư mục `public/map/`.*

### Bước 3: Trích xuất lát bản đồ Đà Nẵng & Hội An (PMTiles)
Script này sẽ tự động tải công cụ `go-pmtiles` CLI tương thích với OS của bạn, tìm kiếm bản build hành tinh OpenStreetMap khả dụng gần nhất trên hệ thống Protomaps, trích xuất khu vực Đà Nẵng & Hội An và lưu vào đúng vị trí:
```bash
# Lựa chọn 1: Trích xuất bản đồ phát triển (Khuyên dùng cho DEV - nhẹ ~8.2MB, tải cực nhanh)
node scripts/extract_tiles.cjs --maxzoom 15

# Lựa chọn 2: Trích xuất bản đồ sản xuất đầy đủ chi tiết ngõ ngách, số nhà (Dung lượng lớn ~1.5GB - 2GB)
node scripts/extract_tiles.cjs --maxzoom 18
```

### Bước 4: Tạo cấu hình bản đồ (Styles) và tải Spritesheets chính thức
Sinh các file style bản đồ tương thích với cấu trúc lớp Protomaps Basemap v4 và tải bộ sprite biểu tượng chính thức (để hiển thị các cơ sở trường học, bệnh viện, trạm xe bus...):
```bash
node scripts/generate_styles.cjs
```
*Script sẽ tự động cấu hình tính năng đè nhãn ưu tiên hiển thị biểu tượng, giúp icon trường học/trạm xe bus luôn nổi bật ngay cả khi nhãn chữ bị đè.*

### Bước 5: Khởi động Server Phát Triển (Vite Dev Server)
Bây giờ, mọi tài nguyên bản đồ offline đã sẵn sàng trên máy của bạn. Hãy khởi chạy dự án:
```bash
npm run dev
# hoặc
yarn dev
```

Mở trình duyệt và truy cập: **[http://localhost:5173](http://localhost:5173)**. Bản đồ nền Đà Nẵng cùng 200+ camera giám sát sẽ hiển thị đầy đủ và hoàn toàn offline!

---

## 📂 Cấu trúc thư mục tài nguyên bản đồ local
Sau khi chạy các bước trên, thư mục `public/map` trong dự án của bạn sẽ có cấu trúc như sau:
```
public/map/
├── tiles/
│   └── danang_hoian.pmtiles   # Cơ sở dữ liệu bản đồ vector Đà Nẵng - Hội An
├── styles/
│   ├── positron.json          # Cấu hình phong cách bản đồ sáng (Light Mode)
│   └── dark.json              # Cấu hình phong cách bản đồ tối (Dark Mode)
├── fonts/
│   ├── Noto Sans Regular/     # Các tệp font chữ dạng phân đoạn (.pbf)
│   ├── Noto Sans Bold/
│   └── Noto Sans Italic/
├── sprites/
│   ├── light.json, light.png  # Icon biểu tượng của bản đồ sáng
│   └── dark.json, dark.png    # Icon biểu tượng của bản đồ tối
└── ne/
    └── ne2sr/
        └── {z}/{x}/{y}.png    # Bản đồ vệ tinh toàn cầu mức zoom thấp (z0-z4)
```

---

## 🧪 Chạy kiểm thử (Testing)

Nếu bạn thực hiện các thay đổi mã nguồn và muốn đảm bảo không gây lỗi hệ thống, hãy chạy bộ công cụ kiểm thử tự động (Vitest):
```bash
npm run test
# hoặc
yarn test
```

---

## 📖 Quy tắc và Tài liệu dự án khác
Vui lòng tham khảo thêm các bộ quy tắc chi tiết của từng bộ phận tại:
- [📋 Quy tắc Quản lý Dự án (PM Rules)](file:///c:/Code/Project/camera-gis-demo/docs/rules/PM_RULES.md)
- [📊 Quy tắc Phân tích Nghiệp vụ (BA Rules)](file:///c:/Code/Project/camera-gis-demo/docs/rules/BA_RULES.md)
- [🧪 Quy tắc Kiểm thử (Test Rules)](file:///c:/Code/Project/camera-gis-demo/docs/rules/TEST_RULES.md)
- [💻 Quy tắc Phát triển Phần mềm (Coding Rules)](file:///c:/Code/Project/camera-gis-demo/docs/rules/CODING_RULES.md)

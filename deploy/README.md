# Hướng dẫn Triển khai Bản đồ Offline (Production-Ready)

Hệ thống này được thiết kế theo kiến trúc **Same-Origin**, loại bỏ hoàn toàn các liên kết ra mạng internet ngoài, đáp ứng tiêu chuẩn an ninh mạng (Air-Gapped / Zero-Internet).

---

## Bước 1: Trích xuất Dữ liệu Bản đồ (PMTiles)

Chúng ta trích xuất khu vực Đà Nẵng + Hội An từ bản build toàn cầu của Protomaps với độ thu phóng tối đa **z18** (cho phép thấy rõ chi tiết tên đường nhỏ, số nhà, ngõ ngách).

1. Cài đặt công cụ `pmtiles` CLI trên máy có kết nối internet:
   - **macOS**: `brew install protomaps/tap/go-pmtiles`
   - **Linux/Windows**: Tải file thực thi trực tiếp từ [GitHub Protomaps Releases](https://github.com/protomaps/go-pmtiles/releases)

2. Chạy lệnh trích xuất (Sử dụng HTTP Range Requests, chỉ tải phần dữ liệu nằm trong bbox mà không cần tải cả file build thế giới 110GB):
   ```bash
   pmtiles extract \
     https://build.protomaps.com/20260601.pmtiles \
     danang_hoian.pmtiles \
     --bbox="107.9,15.85,108.45,16.2" \
     --maxzoom=18
   ```

3. Kiểm tra thông tin file bản đồ thu về:
   ```bash
   pmtiles show danang_hoian.pmtiles
   ```
   *Lưu ý: File trích xuất lên tới zoom 18 sẽ nặng khoảng 1.5GB đến 2GB do độ chi tiết dữ liệu cao.*

---

## Bước 2: Tải các Tài nguyên Đi kèm (Fonts, Sprites, Natural Earth)

Chạy script download tài nguyên trên máy có internet:

```bash
cd deploy
chmod +x download_resources.sh
./download_resources.sh
```

Kết quả tải về sẽ nằm trong thư mục `./map-data` với cấu trúc:
- `/fonts/`: Font chữ hiển thị nhãn địa danh trên bản đồ (Noto Sans).
- `/sprites/`: Biểu tượng, icon của bản đồ (bệnh viện, đồn công an, camera...).
- `/ne/`: Ảnh vệ tinh ở mức zoom cực thấp toàn cầu (z0-z6) để tránh lỗi trống bản đồ khi zoom nhỏ hơn z7.

---

## Bước 3: Cấu trúc Thư mục trên Production Server

Hãy copy các thư mục và file cấu hình lên Server theo đúng cấu trúc sau:

```
/var/www/gis-app/
└── dist/                                # Mã nguồn Frontend React (Vite build)
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── ...
    └── favicon.svg

/data/map/
├── tiles/
│   └── danang_hoian.pmtiles             # Bản đồ Đà Nẵng & Hội An (z0-z18) (~1.5GB)
├── styles/
│   ├── positron.json                    # File cấu hình Style Sáng (Relative URLs)
│   └── dark.json                        # File cấu hình Style Tối (Relative URLs)
├── fonts/
│   ├── Noto Sans Regular/
│   ├── Noto Sans Bold/
│   └── Noto Sans Italic/
├── sprites/
│   ├── ofm.json, ofm.png
│   └── ofm@2x.json, ofm@2x.png
└── ne/
    └── ne2sr/
        └── {z}/{x}/{y}.png
```

---

## Bước 4: Cấu hình Nginx & HTTPS

1. Copy file cấu hình Nginx:
   ```bash
   cp nginx-gis.conf /etc/nginx/conf.d/gis-platform.conf
   ```

2. Tạo self-signed certificate hoặc sử dụng certificate từ Internal CA của cơ quan quản lý:
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout /etc/ssl/private/gis-platform.key \
     -out /etc/ssl/certs/gis-platform.crt
   ```

3. Khởi động lại Nginx:
   ```bash
   nginx -t && systemctl reload nginx
   ```

---

## Quy trình Cập nhật Bản đồ (Không Downtime)

Khi cần cập nhật dữ liệu đường xá mới từ OpenStreetMap:

1. Trích xuất file `.pmtiles` mới trên máy có internet như ở Bước 1.
2. Sao chép file `danang_hoian_new.pmtiles` lên server vào thư mục `/data/map/tiles/`.
3. Thay thế file cũ bằng kỹ thuật Atomic Swap:
   ```bash
   cd /data/map/tiles/
   mv danang_hoian.pmtiles danang_hoian_old.pmtiles && mv danang_hoian_new.pmtiles danang_hoian.pmtiles
   ```
4. Kiểm tra xem tile server có phản hồi tốt không:
   ```bash
   curl -I -H "Range: bytes=0-1023" https://localhost/map/tiles/danang_hoian.pmtiles
   # Phản hồi phải trả về HTTP 206 (Partial Content)
   ```
5. Xóa bản backup cũ: `rm danang_hoian_old.pmtiles`

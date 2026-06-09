#!/bin/bash
# download_resources.sh — Chạy 1 lần trên máy có internet để tải tài nguyên map offline

set -e

BASE="https://tiles.openfreemap.org"
OUT="./map-data"

echo "=== ĐANG KHỞI TẠO TẢI TÀI NGUYÊN BẢN ĐỒ OFFLINE ==="
mkdir -p "$OUT/fonts"
mkdir -p "$OUT/sprites"
mkdir -p "$OUT/ne"

# 1. Tải Glyphs (Fonts Noto Sans)
echo "1. Đang tải font Glyphs (Noto Sans)..."
for font in "Noto Sans Regular" "Noto Sans Bold" "Noto Sans Italic"; do
  # Thay khoảng trắng bằng %20 cho URL
  font_url=$(echo "$font" | sed 's/ /%20/g')
  mkdir -p "$OUT/fonts/$font"
  echo "   - Đang tải font: $font"
  for start in $(seq 0 256 65280); do
    end=$((start + 255))
    curl -sf -o "$OUT/fonts/$font/${start}-${end}.pbf" \
      "$BASE/fonts/$font_url/${start}-${end}.pbf" || true
  done
done

# 2. Tải Sprites (Biểu tượng bản đồ)
echo "2. Đang tải Sprite Sheets..."
for ext in "json" "png"; do
  curl -sf -o "$OUT/sprites/ofm.$ext" "$BASE/sprites/ofm_f384/ofm.$ext"
  curl -sf -o "$OUT/sprites/ofm@2x.$ext" "$BASE/sprites/ofm_f384/ofm@2x.$ext"
done

# 3. Tải Natural Earth (z0-6) - Chỉ dùng cho zoom cực thấp khi nhìn toàn cầu
echo "3. Đang tải Natural Earth raster tiles (z0-z6)..."
for z in $(seq 0 6); do
  max_xy=$((2**z - 1))
  echo "   - Zoom level $z..."
  for x in $(seq 0 $max_xy); do
    mkdir -p "$OUT/ne/ne2sr/$z/$x"
    for y in $(seq 0 $max_xy); do
      curl -sf -o "$OUT/ne/ne2sr/$z/$x/$y.png" \
        "$BASE/natural_earth/ne2sr/$z/$x/$y.png" || true
    done
  done
done

echo "✅ Hoàn tất tải tài nguyên offline!"
echo "Tổng dung lượng tải về:"
du -sh "$OUT"

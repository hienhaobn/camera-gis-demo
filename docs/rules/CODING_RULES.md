# 💻 QUY TẮC PHÁT TRIỂN PHẦN MỀM (CODING RULES)

> **Dự án:** GIS Camera Monitoring Dashboard  
> **Phiên bản:** 1.0.0  
> **Cập nhật lần cuối:** 2026-06-02  
> **Tech Stack:** React 19 + TypeScript + Vite + MapLibre GL + TailwindCSS v4

---

## 1. Cấu Trúc Dự Án (Project Structure)

Dự án áp dụng cấu trúc thư mục dạng **Feature-based** (Tổ chức theo tính năng) kết hợp với các thành phần dùng chung (Shared) để tăng tính mô-đun, dễ bảo trì và mở rộng khi số lượng camera và chức năng GIS tăng lên.

```
src/
├── assets/             # Tài nguyên tĩnh (hình ảnh, icons dạng svg, fonts)
├── components/         # Các Component dùng chung toàn hệ thống
│   ├── ui/             # Base UI elements (Button, Card, Input, Modal, Badge...)
│   ├── map/            # Base Map component và các wrapper của MapLibre GL
│   └── layout/         # Layout components (Header, Sidebar, Footer, SplitPane)
├── constants/          # Cấu hình và hằng số toàn dự án (map style, zoom levels...)
├── data/               # Dữ liệu tĩnh hoặc mock data phục vụ phát triển/kiểm thử
├── features/           # Các mô-đun tính năng chính của hệ thống
│   ├── cameras/        # Quản lý camera (markers, panels, list, details)
│   ├── zones/          # Quản lý vùng giám sát (polygons, statistics)
│   └── infrastructure/ # Quản lý hạ tầng (trạm phát, đường truyền, cáp nối)
├── hooks/              # Custom React hooks dùng chung (useLocalStorage, useMapEvents...)
├── services/           # Lớp gọi API, tương tác dữ liệu bên ngoài (offline sync, tile service)
├── stores/             # Quản lý Global State (ví dụ: Zustand store cho UI state)
├── types/              # Định nghĩa các interfaces/types dùng chung của TypeScript
└── utils/              # Các hàm tiện ích dùng chung (định dạng số, tính toán địa lý, color helper)
```

---

## 2. Quy Tắc Đặt Tên (Naming Convention)

### 2.1 Thư mục và Tập tin
- **Thư mục:** Luôn sử dụng `kebab-case` (ví dụ: `map-controls`, `camera-list`).
- **Tập tin React Component:** Luôn sử dụng `PascalCase` (ví dụ: `CameraMarker.tsx`, `MapContainer.tsx`).
- **Tập tin Hooks:** Luôn bắt đầu bằng `use` + `camelCase` (ví dụ: `useMapControl.ts`).
- **Tập tin thông thường (Utils, Constants, Types):** Luôn sử dụng `camelCase` hoặc `kebab-case` (ví dụ: `geoUtils.ts`, `map-style.json`).

### 2.2 Biến, Hàm và Lớp
- **Biến và Hàm:** Luôn sử dụng `camelCase` (ví dụ: `cameraData`, `calculateDistance`).
  - Tên hàm nên bắt đầu bằng động từ hành động: `get...`, `set...`, `fetch...`, `handle...`, `toggle...`.
- **Component & Interfaces/Types:** Luôn sử dụng `PascalCase` (ví dụ: `CameraInfo`, `CameraStatus`).
- **Hằng số (Constants):** Luôn sử dụng `UPPER_SNAKE_CASE` (ví dụ: `DEFAULT_MAP_CENTER`, `MAX_ZOOM_LEVEL`).

---

## 3. Quy Tắc TypeScript (TypeScript Rules)

Dự án cấu hình TypeScript ở chế độ nghiêm ngặt (`strict: true`). Phải đảm bảo an toàn kiểu dữ liệu (type safety) tối đa.

### 3.1 Không sử dụng kiểu `any`
- Tuyệt đối không sử dụng kiểu dữ liệu `any`. 
- Nếu không xác định được kiểu dữ liệu, hãy dùng `unknown` và thực hiện type narrowing hoặc type guards trước khi sử dụng.

### 3.2 Khai báo Type vs Interface
- Sử dụng `interface` khi định nghĩa cấu trúc của một object (cho phép kế thừa và mở rộng).
- Sử dụng `type` cho union types, tuple types, hoặc alias cho primitive types.

```typescript
// ✅ KHUYÊN DÙNG: Dùng interface cho Object Entities
interface Point {
  lat: number;
  lng: number;
}

interface Camera {
  id: string;
  name: string;
  location: Point;
  status: 'online' | 'offline' | 'warning';
}

// ✅ KHUYÊN DÙNG: Dùng type cho union/aliases
type CameraStatusColor = 'green' | 'red' | 'amber';
type CoordinateTuple = [number, number]; // [lng, lat]
```

### 3.3 Tránh Type Assertion (`as`)
Hạn chế tối đa việc sử dụng `as Type` trừ khi thật sự cần thiết (ví dụ: mock dữ liệu trong test hoặc tương tác với thư viện bên thứ ba không có type chính xác). Thay vào đó, hãy sử dụng Type Guards hoặc định nghĩa kiểu ngay từ đầu.

---

## 4. Thực Hành Tốt Nhất trong React (React Best Practices)

Dự án sử dụng **React 19** và khuyến khích viết mã nguồn hiện đại, tối ưu hóa hiệu năng render cho bản đồ lớn.

### 4.1 Functional Components & Hooks
- 100% components viết dạng Functional Components kết hợp với Hooks.
- Tránh viết logic quá phức tạp bên trong component. Tách logic ra thành các custom hooks.

```typescript
// ✅ KHUYÊN DÙNG: Tách logic thành custom hook
// hooks/useCameraFilter.ts
export function useCameraFilter(cameras: Camera[]) {
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  
  const filteredCameras = useMemo(() => {
    if (filter === 'all') return cameras;
    return cameras.filter(c => c.status === filter);
  }, [cameras, filter]);

  return { filter, setFilter, filteredCameras };
}
```

### 4.2 Tối ưu hóa Hiệu Năng (Memoization)
Bản đồ chứa khoảng 200 markers và cập nhật tọa độ/trạng thái có thể gây re-render diện rộng.
- Sử dụng `useMemo` cho các tính toán đắt đỏ (như xử lý mảng camera lớn hoặc tính khoảng cách).
- Sử dụng `useCallback` cho các hàm callback truyền xuống các component con phức tạp.
- Sử dụng `React.memo` cho các components tĩnh hoặc ít thay đổi dữ liệu đầu vào (như các nút chức năng trên bản đồ).

```typescript
// ✅ KHUYÊN DÙNG: Ghi nhớ marker component để tránh re-render không cần thiết
export const CameraMarker = React.memo(({ camera, onClick }: CameraMarkerProps) => {
  return (
    <div 
      className={`w-6 h-6 rounded-full border-2 border-white cursor-pointer ${
        camera.status === 'online' ? 'bg-green-500' : 'bg-red-500'
      }`}
      onClick={() => onClick(camera)}
    />
  );
});
```

---

## 5. Quản Lý Trạng Thái (State Management)

Hệ thống kết hợp nhiều tầng quản lý trạng thái tùy theo vòng đời và phạm vi của dữ liệu:

1. **Local State (`useState`):** Dùng cho trạng thái cục bộ chỉ ảnh hưởng đến chính component đó và không cần chia sẻ rộng rãi (ví dụ: trạng thái đóng/mở của một modal nhỏ, giá trị nhập vào một ô input).
2. **Context API:** Dùng cho các trạng thái cần chia sẻ trong một phạm vi hẹp (ví dụ: `MapContext` để chia sẻ instance của bản đồ cho các nút con điều khiển).
3. **Zustand (Global State):** Dùng cho các dữ liệu cần truy xuất/cập nhật từ nhiều nơi khác nhau không cùng cây phân cấp (ví dụ: danh sách camera đang được chọn, bộ lọc trạng thái toàn cục, danh mục hạ tầng đang bật/tắt).

---

## 6. Định Dạng & CSS (TailwindCSS v4 Conventions)

Dự án sử dụng **TailwindCSS v4** cho giao diện. TailwindCSS v4 giới thiệu cách cấu hình trực tiếp qua file CSS chính và tích hợp rất mạnh mẽ.

### 6.1 Quy tắc Styling
- Không viết ad-hoc styles trong code trừ khi cực kỳ cần thiết. Hãy sử dụng Tailwind utility classes.
- Tránh viết chuỗi class quá dài gây khó đọc. Hãy gom nhóm class theo chức năng (Layout, Spacing, Typography, Colors, Interactive).
- Sử dụng thư viện `clsx` và `tailwind-merge` để xử lý việc nối class động và tránh xung đột class.

```typescript
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cách dùng trong component:
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer',
        variant === 'primary' && 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
        variant === 'secondary' && 'bg-gray-100 hover:bg-gray-200 text-gray-800',
        className
      )}
      {...props}
    />
  );
}
```

### 6.2 Responsive Design
- Ưu tiên tiếp cận thiết kế dạng di động trước (**Mobile-first**), sử dụng các tiền tố kích thước của Tailwind (`md:`, `lg:`, `xl:`) để override styles trên màn hình lớn.
- Ví dụ sidebar: `w-full lg:w-96` (mặc định chiếm toàn màn hình, trên desktop chỉ rộng 384px).

---

## 7. Quy Tắc Git (Git Convention)

### 7.1 Quy tắc đặt tên Nhánh (Branch Naming)
Luôn bắt đầu nhánh bằng loại công việc, theo sau là mã công việc (nếu có) và mô tả ngắn gọn bằng tiếng Anh/Việt không dấu, phân tách bằng dấu gạch ngang `-`.

- Tính năng mới: `feature/CAM-123-add-clustering`
- Sửa lỗi: `bugfix/CAM-456-fix-map-zoom`
- Tối ưu hóa/Tài liệu: `chore/setup-eslint` hoặc `docs/update-readme`

### 7.2 Định dạng Commit (Conventional Commits)
Thông điệp commit phải tuân thủ format: `<type>(<scope>): <subject>`

- **Types:**
  - `feat`: Thêm tính năng mới.
  - `fix`: Sửa lỗi.
  - `docs`: Thay đổi tài liệu hướng dẫn.
  - `style`: Định dạng mã nguồn (khoảng trắng, dấu chấm phẩy, không ảnh hưởng logic).
  - `refactor`: Tái cấu trúc mã nguồn nhưng không đổi chức năng hay sửa lỗi.
  - `perf`: Tối ưu hóa hiệu năng.
  - `test`: Thêm hoặc sửa mã kiểm thử.
  - `chore`: Cập nhật cấu hình build, dependencies...

*Ví dụ commit đúng:*
`feat(map): tích hợp bản đồ vệ tinh ngoại tuyến`
`fix(camera): sửa lỗi lệch tọa độ popup khi zoom mức độ 15`

---

## 8. Quy Trình Đánh Giá Mã Nguồn (Code Review Checklist)

Trước khi gửi Pull Request (PR) hoặc khi review code của thành viên khác, phải kiểm tra các yếu tố sau:

- [ ] **Chức năng:** Code có giải quyết đúng và đủ yêu cầu nghiệp vụ trong User Story không?
- [ ] **TypeScript:** Có bất kỳ cảnh báo kiểu dữ liệu nào không? Có lạm dụng `any` không?
- [ ] **Lỗi Logic:** Đã kiểm tra hết các biên đầu vào (boundary values) và xử lý lỗi chưa?
- [ ] **Hiệu năng:** Có nguy cơ gây re-render thừa hay rò rỉ bộ nhớ (memory leaks) không? Các hàm lắng nghe sự kiện trên Map đã được cleanup trong `useEffect` chưa?
- [ ] **Styling:** Lớp giao diện có đáp ứng đúng chuẩn Responsive của TailwindCSS v4 chưa? Có bị vỡ layout trên tablet/mobile không?
- [ ] **Kiểm thử:** Đã viết đầy đủ unit test cho logic mới chưa? Coverage đạt chuẩn chưa?

---

## 9. Tối Ưu Hiệu Năng (Performance Optimization)

Bản đồ có số lượng camera trung bình lớn (200+), tối ưu hóa hiệu năng là điều kiện kiên quyết để đạt điểm Lighthouse ≥ 90.

### 9.1 Lazy Loading & Code Splitting
- Sử dụng `React.lazy` và `Suspense` để trì hoãn việc tải các component nặng (như Dashboard Charts, hay chính bản đồ) cho đến khi chúng thực sự được hiển thị.

```typescript
import { lazy, Suspense } from 'react';

const GISMap = lazy(() => import('./components/map/GISMap'));

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-900 text-white">Đang tải bản đồ...</div>}>
      <GISMap />
    </Suspense>
  );
}
```

### 9.2 Tối ưu hóa Map & Markers
- **Clustering:** Sử dụng thuật toán clustering (như `supercluster`) khi người dùng zoom out để gom hàng trăm markers thành các nhóm số lượng, tránh render quá nhiều DOM node cùng lúc.
- **Thoát sự kiện lắng nghe (Cleanup):** Khi component Map unmount, bắt buộc phải giải phóng các sự kiện map, gỡ các markers, popups để tránh rò rỉ bộ nhớ.

---

## 10. Thứ Tự Nhập Khẩu (Import Order)

Để giữ code gọn gàng, sạch sẽ, hãy tổ chức import theo thứ tự sau:

1. React core và React hooks (`react`, `useState`, `useEffect`...)
2. Thư viện bên thứ ba bên ngoài (`maplibre-gl`, `lucide-react`, `zustand`...)
3. Components nội bộ dùng chung (`@/components/ui/Button`...)
4. Features và modules cục bộ (`../features/cameras/...`)
5. Hooks, Utils, Constants cục bộ
6. Types/Interfaces
7. Styles (`.css`, `.scss`)

```typescript
// ✅ VÍ DỤ IMPORT ĐÚNG CHUẨN
import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';
import { Camera as CameraIcon } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useCameraStore } from '@/stores/cameraStore';
import { calculateDistance } from '@/utils/geoUtils';
import type { Camera } from '@/types/camera';

import './CameraPanel.css';
```

---

> 📌 **Lưu ý:** Quy tắc phát triển này được thiết lập để đảm bảo chất lượng, tính nhất quán và hiệu năng cho dự án. Mọi thành viên phát triển có trách nhiệm nắm rõ và tuân thủ.

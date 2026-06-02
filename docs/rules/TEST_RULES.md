# 🧪 QUY TẮC KIỂM THỬ (TEST RULES)

> **Dự án:** GIS Camera Monitoring Dashboard  
> **Phiên bản:** 1.0.0  
> **Cập nhật lần cuối:** 2026-06-02  
> **Tech Stack:** React + TypeScript + Vite + MapLibre GL + TailwindCSS v4

---

## 1. Chiến Lược Kiểm Thử

### 1.1 Test Pyramid

```
          ╱╲
         ╱  ╲          E2E Tests (10%)
        ╱ E2E╲         - Critical user flows
       ╱──────╲        - Cross-browser
      ╱        ╲
     ╱Integration╲     Integration Tests (20%)
    ╱──────────────╲    - Component interactions
   ╱                ╲   - Hook + State testing
  ╱   Unit Tests     ╲  Unit Tests (70%)
 ╱────────────────────╲  - Components, Utils, Hooks
╱______________________╲
```

### 1.2 Phạm vi kiểm thử

| Loại test | Tỉ lệ | Công cụ | Trách nhiệm |
|-----------|--------|---------|-------------|
| Unit Test | 70% | Vitest + React Testing Library | Developer |
| Integration Test | 20% | Vitest + RTL | Developer + QA |
| E2E Test | 10% | Playwright | QA |
| Performance Test | Per release | Lighthouse + Custom | QA |
| Visual Regression | Per release | Percy / Chromatic | QA |
| Accessibility Test | Per release | axe-core + Lighthouse | QA |

### 1.3 Chiến lược testing theo module

| Module | Unit | Integration | E2E | Performance |
|--------|------|-------------|-----|-------------|
| Map Component | ✅ | ✅ | ✅ | ✅ |
| Camera Markers | ✅ | ✅ | ✅ | ✅ |
| Clustering | ✅ | ✅ | ❌ | ✅ |
| Layer Switching | ✅ | ✅ | ✅ | ❌ |
| Search/Filter | ✅ | ✅ | ✅ | ❌ |
| Distance Tool | ✅ | ✅ | ✅ | ❌ |
| Zone Management | ✅ | ✅ | ✅ | ❌ |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |
| UI Components | ✅ | ❌ | ❌ | ❌ |
| Utils/Helpers | ✅ | ❌ | ❌ | ❌ |

---

## 2. Quy Trình Kiểm Thử

### 2.1 Testing Lifecycle

```
Phân tích yêu cầu → Lập kế hoạch test → Thiết kế test case → Setup môi trường
        ↓                                                          ↓
   Review AC           ←──── Feedback loop ────→           Thực thi test
        ↓                                                          ↓
   Viết test plan                                          Báo cáo kết quả
                                                                   ↓
                                                            Bug tracking
                                                                   ↓
                                                          Re-test & Close
```

### 2.2 Khi nào chạy test

| Sự kiện | Unit | Integration | E2E | Performance |
|---------|------|-------------|-----|-------------|
| Pre-commit (local) | ✅ | ❌ | ❌ | ❌ |
| Pull Request | ✅ | ✅ | ❌ | ❌ |
| Merge to develop | ✅ | ✅ | ✅ | ❌ |
| Pre-release | ✅ | ✅ | ✅ | ✅ |
| Production deploy | ✅ | ✅ | ✅ (smoke) | ✅ |

---

## 3. Phân Loại Kiểm Thử

### 3.1 Unit Testing

**Công cụ:** Vitest + React Testing Library

**Cấu hình Vitest:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

**Setup file:**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';

// Mock MapLibre GL (không có WebGL trong test environment)
vi.mock('maplibre-gl', () => ({
  Map: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    off: vi.fn(),
    remove: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getSource: vi.fn(),
    getLayer: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    flyTo: vi.fn(),
    fitBounds: vi.fn(),
    resize: vi.fn(),
  })),
  Marker: vi.fn().mockImplementation(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getElement: vi.fn(() => document.createElement('div')),
  })),
  Popup: vi.fn().mockImplementation(() => ({
    setLngLat: vi.fn().mockReturnThis(),
    setHTML: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
  })),
  NavigationControl: vi.fn(),
  default: {},
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

**Ví dụ Unit Test:**

```typescript
// src/components/ui/__tests__/CameraCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CameraCard } from '../CameraCard';

const mockCamera = {
  id: 'CAM-001',
  name: 'Camera Ngã tư Lê Lợi',
  latitude: 10.7769,
  longitude: 106.7009,
  status: 'online' as const,
  type: 'dome' as const,
};

describe('CameraCard', () => {
  it('renders camera information correctly', () => {
    render(<CameraCard camera={mockCamera} />);

    expect(screen.getByText('Camera Ngã tư Lê Lợi')).toBeInTheDocument();
    expect(screen.getByText('CAM-001')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('displays correct status indicator color', () => {
    render(<CameraCard camera={mockCamera} />);

    const statusBadge = screen.getByTestId('status-badge');
    expect(statusBadge).toHaveClass('bg-green-500');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<CameraCard camera={mockCamera} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockCamera);
  });

  it('shows offline status for offline camera', () => {
    const offlineCamera = { ...mockCamera, status: 'offline' as const };
    render(<CameraCard camera={offlineCamera} />);

    const statusBadge = screen.getByTestId('status-badge');
    expect(statusBadge).toHaveClass('bg-red-500');
  });
});
```

**Ví dụ test cho utils:**

```typescript
// src/utils/__tests__/geo.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDistance, isInBounds, formatCoordinate } from '../geo';

describe('calculateDistance', () => {
  it('calculates distance between two points correctly', () => {
    // HCM (10.7769, 106.7009) → Hà Nội (21.0285, 105.8542)
    const distance = calculateDistance(
      { lat: 10.7769, lng: 106.7009 },
      { lat: 21.0285, lng: 105.8542 }
    );

    // Khoảng cách ≈ 1,150 km (sai số ±5%)
    expect(distance).toBeGreaterThan(1090);
    expect(distance).toBeLessThan(1210);
  });

  it('returns 0 for same point', () => {
    const point = { lat: 10.7769, lng: 106.7009 };
    expect(calculateDistance(point, point)).toBe(0);
  });
});

describe('isInBounds', () => {
  it('returns true for point inside bounds', () => {
    const point = { lat: 10.78, lng: 106.70 };
    const bounds = {
      north: 11.0, south: 10.5,
      east: 107.0, west: 106.5,
    };
    expect(isInBounds(point, bounds)).toBe(true);
  });

  it('returns false for point outside bounds', () => {
    const point = { lat: 12.0, lng: 106.70 };
    const bounds = {
      north: 11.0, south: 10.5,
      east: 107.0, west: 106.5,
    };
    expect(isInBounds(point, bounds)).toBe(false);
  });
});
```

### 3.2 Integration Testing

```typescript
// src/features/cameras/__tests__/CameraList.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CameraList } from '../CameraList';
import { CameraProvider } from '../CameraContext';
import { mockCameras } from '@/test/fixtures/cameras';

describe('CameraList Integration', () => {
  it('filters cameras by search term', async () => {
    render(
      <CameraProvider initialCameras={mockCameras}>
        <CameraList />
      </CameraProvider>
    );

    const searchInput = screen.getByPlaceholderText('Tìm kiếm camera...');
    fireEvent.change(searchInput, { target: { value: 'Lê Lợi' } });

    await waitFor(() => {
      expect(screen.getByText('Camera Ngã tư Lê Lợi')).toBeInTheDocument();
      expect(screen.queryByText('Camera Cầu Sài Gòn')).not.toBeInTheDocument();
    });
  });

  it('filters cameras by status', async () => {
    render(
      <CameraProvider initialCameras={mockCameras}>
        <CameraList />
      </CameraProvider>
    );

    const filterButton = screen.getByRole('button', { name: /offline/i });
    fireEvent.click(filterButton);

    await waitFor(() => {
      const cards = screen.getAllByTestId('camera-card');
      cards.forEach(card => {
        expect(card).toHaveTextContent('offline');
      });
    });
  });
});
```

### 3.3 E2E Testing (Playwright)

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('GIS Camera Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Chờ map load xong
    await page.waitForSelector('[data-testid="map-container"]', {
      state: 'visible',
      timeout: 10000,
    });
  });

  test('should load map within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.waitForSelector('.maplibregl-canvas', { state: 'visible' });
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('should display camera markers', async ({ page }) => {
    await page.waitForSelector('[data-testid="camera-marker"]');
    const markers = page.locator('[data-testid="camera-marker"]');

    expect(await markers.count()).toBeGreaterThan(0);
  });

  test('should show camera popup on marker click', async ({ page }) => {
    const marker = page.locator('[data-testid="camera-marker"]').first();
    await marker.click();

    await expect(page.locator('[data-testid="camera-popup"]')).toBeVisible();
    await expect(page.locator('[data-testid="camera-popup"]'))
      .toContainText('CAM-');
  });

  test('should switch map layers', async ({ page }) => {
    const layerButton = page.locator('[data-testid="layer-satellite"]');
    await layerButton.click();

    // Verify layer đã đổi (kiểm tra class hoặc attribute)
    await expect(layerButton).toHaveClass(/active/);
  });

  test('should search cameras', async ({ page }) => {
    const searchInput = page.locator('[data-testid="camera-search"]');
    await searchInput.fill('Lê Lợi');

    await page.waitForTimeout(500); // debounce
    const results = page.locator('[data-testid="search-result"]');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('should measure distance between two points', async ({ page }) => {
    // Click nút đo khoảng cách
    await page.click('[data-testid="measure-tool"]');

    // Click 2 điểm trên bản đồ
    const map = page.locator('[data-testid="map-container"]');
    await map.click({ position: { x: 300, y: 300 } });
    await map.click({ position: { x: 500, y: 400 } });

    // Double-click để kết thúc
    await map.dblclick({ position: { x: 500, y: 400 } });

    // Verify kết quả hiển thị
    const distance = page.locator('[data-testid="distance-result"]');
    await expect(distance).toBeVisible();
    await expect(distance).toContainText('km');
  });
});
```

### 3.4 Performance Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('map renders 200 markers under 1 second', async ({ page }) => {
    await page.goto('/');

    const renderTime = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const start = performance.now();
        // Chờ tất cả markers render
        const observer = new MutationObserver(() => {
          const markers = document.querySelectorAll('[data-testid="camera-marker"]');
          if (markers.length >= 200) {
            observer.disconnect();
            resolve(performance.now() - start);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    });

    expect(renderTime).toBeLessThan(1000);
  });

  test('clustering responds within 500ms', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');

    // Zoom out để trigger clustering
    const startTime = Date.now();
    await page.evaluate(() => {
      // Trigger zoom change
      window.dispatchEvent(new CustomEvent('map-zoom', { detail: { zoom: 8 } }));
    });

    await page.waitForSelector('[data-testid="cluster-marker"]');
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });
});
```

### 3.5 Cross-browser Testing

| Browser | Version | OS | Priority |
|---------|---------|-----|----------|
| Chrome | Latest, Latest-1 | Windows, macOS | 🔴 Critical |
| Firefox | Latest, Latest-1 | Windows, macOS | 🟠 High |
| Safari | Latest | macOS | 🟠 High |
| Edge | Latest | Windows | 🟡 Medium |
| Chrome Mobile | Latest | Android | 🟡 Medium |
| Safari Mobile | Latest | iOS | 🟡 Medium |

### 3.6 Responsive Testing

| Breakpoint | Viewport | Thiết bị |
|-----------|----------|---------|
| Desktop XL | 1920×1080 | Monitor lớn |
| Desktop | 1280×800 | Laptop |
| Tablet Landscape | 1024×768 | iPad Landscape |
| Tablet Portrait | 768×1024 | iPad Portrait |
| Mobile (optional) | 375×812 | iPhone (nếu hỗ trợ) |

---

## 4. Test Case Template

### 4.1 Format chuẩn

```markdown
## Test Case: TC-[XXX]

**Tên:** [Tên test case]
**Module:** [Map / Camera / Zone / Infra / Tool / UI]
**Loại:** [Unit / Integration / E2E / Performance]
**Priority:** [Critical / High / Medium / Low]
**Precondition:** [Điều kiện trước khi test]

### Steps

| # | Hành động | Dữ liệu test | Kết quả mong đợi |
|---|-----------|--------------|-------------------|
| 1 | [Bước 1] | [Data] | [Expected] |
| 2 | [Bước 2] | [Data] | [Expected] |
| 3 | [Bước 3] | [Data] | [Expected] |

### Expected Result
[Tổng kết kết quả mong đợi]

**Postcondition:** [Trạng thái sau khi test]
**Automation Status:** [Manual / Automated / Partial]
**Related Requirement:** [FR-XXX / NFR-XXX]
```

### 4.2 Ví dụ Test Case

```markdown
## Test Case: TC-015

**Tên:** Verify camera marker hiển thị đúng trạng thái
**Module:** Camera
**Loại:** Integration
**Priority:** Critical
**Precondition:** Dashboard đã load, bản đồ hiển thị

### Steps

| # | Hành động | Dữ liệu test | Kết quả mong đợi |
|---|-----------|--------------|-------------------|
| 1 | Load dashboard | 200 cameras (150 online, 30 offline, 20 warning) | Map load trong < 3s |
| 2 | Kiểm tra markers online | Camera status = "online" | Marker màu xanh lá (#22C55E) |
| 3 | Kiểm tra markers offline | Camera status = "offline" | Marker màu đỏ (#EF4444) |
| 4 | Kiểm tra markers warning | Camera status = "warning" | Marker màu vàng (#F59E0B) |
| 5 | Click marker bất kỳ | CAM-001 | Popup hiện: tên, ID, status, vị trí |

### Expected Result
Tất cả 200 markers hiển thị đúng màu theo trạng thái, popup hoạt động.

**Postcondition:** Map vẫn hoạt động bình thường
**Automation Status:** Automated (Vitest + RTL)
**Related Requirement:** FR-003, FR-004
```

---

## 5. Quy Trình Báo Lỗi

### 5.1 Bug Report Template

```markdown
## Bug Report: BUG-[XXX]

**Tiêu đề:** [Mô tả ngắn gọn lỗi]
**Reporter:** [Tên]
**Ngày phát hiện:** [DD/MM/YYYY]
**Severity:** [Blocker / Critical / Major / Minor / Trivial]
**Priority:** [P0 / P1 / P2 / P3]
**Module:** [Map / Camera / Zone / Infra / Tool / UI]
**Browser:** [Chrome 125 / Firefox 126 / Safari 18]
**OS:** [macOS 15 / Windows 11]

### Mô tả
[Mô tả chi tiết lỗi]

### Steps to Reproduce
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

### Expected Result
[Kết quả mong đợi]

### Actual Result
[Kết quả thực tế]

### Evidence
- Screenshot: [link]
- Video: [link]
- Console log: [paste]

### Environment
- URL: [staging/production]
- Browser: [version]
- OS: [version]
- Network: [Online / Offline]
```

### 5.2 Ma trận Severity vs Priority

| | P0 (Fix ngay) | P1 (Sprint này) | P2 (Sprint sau) | P3 (Backlog) |
|--|---------------|-----------------|-----------------|--------------|
| **Blocker** | 🔴 Fix trong 4h | 🔴 Fix trong 1 ngày | - | - |
| **Critical** | 🔴 Fix trong 8h | 🟠 Fix trong Sprint | - | - |
| **Major** | 🟠 Fix trong 1 ngày | 🟡 Sprint này | 🟡 Sprint sau | - |
| **Minor** | - | 🟡 Nếu có thời gian | 🟢 Backlog | 🟢 Backlog |
| **Trivial** | - | - | 🟢 Backlog | ⚪ Won't fix |

### 5.3 Severity Definition

| Severity | Định nghĩa | Ví dụ |
|----------|------------|-------|
| **Blocker** | Không thể sử dụng hệ thống | Map không load, app crash |
| **Critical** | Chức năng chính bị lỗi, không có workaround | Markers không hiển thị, search không hoạt động |
| **Major** | Chức năng bị lỗi nhưng có workaround | Filter không reset, popup hiển thị sai data |
| **Minor** | Lỗi nhỏ, không ảnh hưởng chức năng chính | UI misalignment, typo |
| **Trivial** | Lỗi rất nhỏ, cosmetic | Font size lệch 1px, color shade khác |

### 5.4 Bug Lifecycle

```
New → Assigned → In Progress → Fixed → Verified → Closed
                      │                    │
                      └── Reopened ←───────┘
                                     (nếu chưa fix đúng)
```

---

## 6. Tiêu Chuẩn Chất Lượng

### 6.1 Quality Metrics

| Metric | Target | Đo bằng |
|--------|--------|---------|
| Code Coverage (Lines) | ≥ 80% | Vitest --coverage |
| Code Coverage (Branches) | ≥ 80% | Vitest --coverage |
| Code Coverage (Functions) | ≥ 80% | Vitest --coverage |
| Lighthouse Performance | ≥ 90 | Chrome Lighthouse |
| Lighthouse Accessibility | ≥ 90 | Chrome Lighthouse |
| Lighthouse Best Practices | ≥ 90 | Chrome Lighthouse |
| Lighthouse SEO | ≥ 90 | Chrome Lighthouse |
| Critical Bugs | 0 | Bug tracker |
| Major Bugs | ≤ 3 open | Bug tracker |
| Test Pass Rate | ≥ 95% | CI/CD report |
| E2E Pass Rate | 100% (critical paths) | Playwright report |

### 6.2 Quy tắc coverage

```
src/
├── components/    → Coverage ≥ 85%
├── features/      → Coverage ≥ 80%
├── hooks/         → Coverage ≥ 90%
├── utils/         → Coverage ≥ 95%
├── services/      → Coverage ≥ 80%
├── stores/        → Coverage ≥ 80%
└── types/         → N/A (no logic)
```

---

## 7. Kiểm Thử Đặc Thù GIS

### 7.1 Map Rendering Tests

| Test | Mô tả | Acceptance Criteria |
|------|-------|-------------------|
| Tile Loading | Tiles load đúng cho mọi zoom level | Không có blank tiles |
| Zoom Range | Zoom min (1) đến max (18) | Không crash, render đúng |
| Pan | Di chuyển bản đồ mọi hướng | Smooth, không giật |
| Center | Bản đồ center đúng vị trí Vietnam | 14.0583°N, 108.2772°E |
| Bounds | Giới hạn vùng hiển thị | Không pan ra ngoài Vietnam |

### 7.2 Coordinate Accuracy Tests

```typescript
// Test chính xác tọa độ
describe('Coordinate Accuracy', () => {
  it('converts screen position to lat/lng correctly', () => {
    const screenPoint = { x: 400, y: 300 };
    const lngLat = map.unproject(screenPoint);

    // Sai số cho phép: ±0.0001° (≈ 11m)
    expect(lngLat.lat).toBeCloseTo(expectedLat, 4);
    expect(lngLat.lng).toBeCloseTo(expectedLng, 4);
  });

  it('places marker at correct position', () => {
    const camera = { lat: 10.7769, lng: 106.7009 };
    const markerPosition = getMarkerScreenPosition(camera);
    const reconverted = map.unproject(markerPosition);

    expect(reconverted.lat).toBeCloseTo(camera.lat, 3);
    expect(reconverted.lng).toBeCloseTo(camera.lng, 3);
  });
});
```

### 7.3 Offline Mode Tests

| Test | Steps | Expected |
|------|-------|----------|
| Load offline tiles | Disconnect network → Open app | Map hiển thị từ cache |
| Navigate offline | Disconnect → Pan/Zoom | Tiles cached hiển thị |
| Cache size | Check storage usage | ≤ 500MB cho khu vực 11,000 km² |
| Online → Offline | Sử dụng online → Disconnect | Không crash, notification hiện |
| Offline → Online | Reconnect | Tự động sync, fresh tiles load |
| Stale cache | Cache > 7 ngày | Warning + option refresh |

### 7.4 Clustering Tests

| Test | Mô tả | Expected |
|------|-------|----------|
| Cluster formation | Zoom out (level < 12) | Markers gần nhau gom thành cluster |
| Cluster count | Click cluster | Số hiển thị = tổng cameras bên trong |
| Cluster expand | Zoom in vào cluster | Cluster tách thành individual markers |
| Cluster click | Click vào cluster | Zoom in hoặc hiện danh sách |
| Edge case: 1 camera | Zoom out | Không cluster camera đơn lẻ |
| Performance | 200 cameras, zoom in/out | Cluster/uncluster < 500ms |

### 7.5 Distance Measurement Tests

| Test | Input | Expected Output |
|------|-------|----------------|
| Đo 2 điểm | HCM → Hà Nội | ~1,150 km (±5%) |
| Đo 2 điểm gần | 2 cameras cách 100m | ~0.1 km (±10%) |
| Đo polyline | 3+ điểm | Tổng khoảng cách từng đoạn |
| Đơn vị | < 1km | Hiển thị bằng m |
| Đơn vị | ≥ 1km | Hiển thị bằng km |
| Cancel | Nhấn ESC giữa chừng | Xóa measurement, trở về bình thường |

---

## 8. Regression Testing

### 8.1 Chiến lược
- Regression test chạy **tự động** khi merge vào `develop`
- Regression suite = **tất cả unit + integration tests**
- Critical E2E regression chạy **trước mỗi release**
- Visual regression qua **screenshot comparison** (optional)

### 8.2 Regression Test Suite

| Suite | Số test cases | Thời gian chạy | Khi nào |
|-------|--------------|-----------------|---------|
| Unit Regression | ~200+ | < 30s | Mỗi commit |
| Integration Regression | ~50+ | < 2 phút | Mỗi PR |
| E2E Smoke | 10-15 | < 5 phút | Mỗi deploy staging |
| E2E Full | 30-50 | < 15 phút | Pre-release |
| Performance | 5-10 | < 5 phút | Pre-release |

### 8.3 Khi nào thêm regression test
- ✅ Mỗi bug fix **PHẢI** kèm regression test
- ✅ Mỗi feature mới **PHẢI** có unit test
- ✅ Critical path thay đổi → thêm E2E test

---

## 9. Môi Trường Kiểm Thử

### 9.1 Environments

| Môi trường | URL | Dữ liệu | Mục đích |
|------------|-----|---------|----------|
| Local | localhost:5173 | Mock data | Dev testing |
| CI | GitHub Actions | Mock data | Automated testing |
| Staging | staging.xxx.com | Realistic data | QA testing, UAT |
| Production | app.xxx.com | Real data | Smoke test |

### 9.2 Test Data

```typescript
// src/test/fixtures/cameras.ts
export const mockCameras: Camera[] = [
  {
    id: 'CAM-001',
    name: 'Camera Ngã tư Lê Lợi',
    latitude: 10.7769,
    longitude: 106.7009,
    status: 'online',
    type: 'dome',
  },
  {
    id: 'CAM-002',
    name: 'Camera Cầu Sài Gòn',
    latitude: 10.8012,
    longitude: 106.7345,
    status: 'offline',
    type: 'bullet',
  },
  // ... generate 200 cameras for stress test
];

// Helper to generate large dataset
export function generateCameras(count: number): Camera[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `CAM-${String(i + 1).padStart(3, '0')}`,
    name: `Camera Test ${i + 1}`,
    latitude: 10.5 + Math.random() * 1.0,
    longitude: 106.5 + Math.random() * 0.5,
    status: ['online', 'offline', 'warning'][i % 3] as CameraStatus,
    type: ['dome', 'bullet', 'ptz'][i % 3] as CameraType,
  }));
}
```

---

## 10. Checklist Kiểm Thử Pre-Release

### 10.1 Functional Testing Checklist

- [ ] **Map:** Load bản đồ thành công < 3s
- [ ] **Map:** Zoom in/out hoạt động smooth
- [ ] **Map:** Pan hoạt động smooth
- [ ] **Map:** Layer switching hoạt động (Satellite, Streets, Terrain)
- [ ] **Camera:** 200 markers hiển thị đúng vị trí
- [ ] **Camera:** Markers hiển thị đúng màu theo status
- [ ] **Camera:** Click marker hiện popup đúng thông tin
- [ ] **Camera:** Search camera hoạt động < 500ms
- [ ] **Camera:** Filter theo status hoạt động
- [ ] **Clustering:** Cluster khi zoom out, uncluster khi zoom in
- [ ] **Clustering:** Số lượng trên cluster chính xác
- [ ] **Zone:** Zone polygons hiển thị đúng
- [ ] **Zone:** Hover highlight hoạt động
- [ ] **Tool:** Đo khoảng cách chính xác ±5%
- [ ] **Offline:** Map hiển thị khi offline
- [ ] **Offline:** Notification khi mất kết nối

### 10.2 Non-Functional Testing Checklist

- [ ] **Performance:** Lighthouse Performance ≥ 90
- [ ] **Performance:** FCP < 1.5s
- [ ] **Performance:** LCP < 2.5s
- [ ] **Accessibility:** Lighthouse Accessibility ≥ 90
- [ ] **Cross-browser:** Chrome ✅
- [ ] **Cross-browser:** Firefox ✅
- [ ] **Cross-browser:** Safari ✅
- [ ] **Cross-browser:** Edge ✅
- [ ] **Responsive:** Desktop (1280px+) ✅
- [ ] **Responsive:** Tablet (768px+) ✅
- [ ] **Security:** Không lộ API key/secret trên client
- [ ] **Security:** No XSS vulnerabilities
- [ ] **Code Coverage:** ≥ 80%
- [ ] **Zero Critical Bugs:** Confirmed

---

## 11. Công Cụ Kiểm Thử

| Công cụ | Phiên bản | Mục đích |
|---------|-----------|----------|
| **Vitest** | Latest | Unit & Integration testing |
| **React Testing Library** | Latest | Component testing |
| **Playwright** | Latest | E2E testing |
| **@testing-library/jest-dom** | Latest | Custom DOM matchers |
| **MSW (Mock Service Worker)** | Latest | API mocking |
| **Lighthouse CI** | Latest | Performance auditing |
| **axe-core** | Latest | Accessibility testing |
| **Percy** (optional) | Latest | Visual regression |

---

## 12. Naming Convention

### 12.1 Test Files

```
# Unit test: đặt cạnh file source
src/utils/geo.ts           → src/utils/__tests__/geo.test.ts
src/components/Button.tsx  → src/components/__tests__/Button.test.tsx
src/hooks/useMap.ts        → src/hooks/__tests__/useMap.test.ts

# Integration test:
src/features/cameras/      → src/features/cameras/__tests__/CameraList.integration.test.tsx

# E2E test:
e2e/dashboard.spec.ts
e2e/camera-management.spec.ts
e2e/map-tools.spec.ts
```

### 12.2 Test Case Naming

```typescript
// Pattern: should [expected behavior] when [condition]
describe('CameraMarker', () => {
  it('should render green marker when status is online', () => {});
  it('should render red marker when status is offline', () => {});
  it('should show popup when clicked', () => {});
  it('should not render when coordinates are invalid', () => {});
});

// Pattern: [verb] [noun] [condition]
describe('calculateDistance', () => {
  it('returns distance in km between two valid coordinates', () => {});
  it('returns 0 when both points are the same', () => {});
  it('throws error when coordinates are out of range', () => {});
});
```

### 12.3 Test Data Naming

```typescript
// Prefix: mock, stub, fake, fixture
const mockCamera = { ... };
const mockCameras = [ ... ];
const stubMapInstance = { ... };
const fakeApiResponse = { ... };

// Fixture files
src/test/fixtures/cameras.ts
src/test/fixtures/zones.ts
src/test/fixtures/infrastructure.ts
```

---

## 13. CI/CD Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e-test:
    runs-on: ubuntu-latest
    needs: unit-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    needs: unit-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: './lighthouserc.json'
```

---

> 📌 **Lưu ý:** Tài liệu này được cập nhật liên tục. Mọi thay đổi cần được QA Lead review trước khi áp dụng.

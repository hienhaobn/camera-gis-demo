# 📊 QUY TẮC PHÂN TÍCH NGHIỆP VỤ (BA RULES)

> **Dự án:** GIS Camera Monitoring Dashboard  
> **Phiên bản:** 1.0.0  
> **Cập nhật lần cuối:** 2026-06-02  
> **Tech Stack:** React + TypeScript + Vite + MapLibre GL + TailwindCSS v4

---

## 1. Quy Trình Thu Thập Yêu Cầu

### 1.1 Phương pháp thu thập

| Phương pháp | Khi nào sử dụng | Output |
|-------------|-----------------|--------|
| **Phỏng vấn (Interview)** | Hiểu nghiệp vụ từ stakeholder | Meeting notes, User Stories |
| **Workshop** | Brainstorm, xác định scope | Requirement list, Priority matrix |
| **Quan sát (Observation)** | Hiểu quy trình vận hành camera | Process flow, Pain points |
| **Document Analysis** | Phân tích tài liệu hiện có | Gap analysis |
| **Prototype Review** | Validate UI/UX concept | Feedback log |

### 1.2 Quy trình thu thập

```
Chuẩn bị → Thu thập → Phân tích → Xác nhận → Document → Review & Approve
   │           │          │           │           │           │
   │           │          │           │           │           └─ Stakeholder sign-off
   │           │          │           │           └─ Viết SRS/User Stories
   │           │          │           └─ Xác nhận lại với stakeholder
   │           │          └─ Phân loại, ưu tiên hóa
   │           └─ Interview, Workshop, Observation
   └─ Research domain, chuẩn bị câu hỏi
```

### 1.3 Checklist trước khi thu thập
- [ ] Đã nghiên cứu domain GIS/Camera Monitoring
- [ ] Đã chuẩn bị danh sách câu hỏi
- [ ] Đã xác định stakeholder cần phỏng vấn
- [ ] Đã book lịch meeting
- [ ] Đã chuẩn bị tool ghi chú

---

## 2. Phân Loại Yêu Cầu

### 2.1 Yêu cầu chức năng (Functional Requirements)

| ID | Module | Yêu cầu | Priority |
|----|--------|---------|----------|
| FR-001 | Map | Hiển thị bản đồ OpenStreetMap với zoom/pan | Must |
| FR-002 | Map | Chuyển đổi layer (vệ tinh/đô thị/terrain) | Must |
| FR-003 | Camera | Hiển thị camera markers trên bản đồ | Must |
| FR-004 | Camera | Clustering camera khi zoom out | Must |
| FR-005 | Camera | Click marker để xem thông tin camera | Must |
| FR-006 | Camera | Tìm kiếm camera theo tên/vị trí | Should |
| FR-007 | Camera | Lọc camera theo trạng thái (online/offline) | Should |
| FR-008 | Tool | Đo khoảng cách giữa 2 điểm trên bản đồ | Should |
| FR-009 | Tool | Routing giữa các camera/vị trí | Could |
| FR-010 | Zone | Hiển thị và quản lý vùng giám sát | Should |
| FR-011 | Zone | Highlight zone khi hover/click | Should |
| FR-012 | Infra | Quản lý hạ tầng (trạm, đường, cáp) | Could |
| FR-013 | Offline | Hỗ trợ bản đồ offline | Must |
| FR-014 | UI | Dashboard tổng quan (statistics panel) | Should |
| FR-015 | UI | Responsive design (Desktop + Tablet) | Must |

### 2.2 Yêu cầu phi chức năng (Non-Functional Requirements)

| ID | Loại | Yêu cầu | Metric |
|----|------|---------|--------|
| NFR-001 | Performance | Tải trang < 3 giây | FCP < 1.5s, LCP < 2.5s |
| NFR-002 | Performance | Render 200 markers < 1 giây | Frame rate ≥ 30fps |
| NFR-003 | Performance | Clustering phản hồi < 500ms | Đo trên Chrome DevTools |
| NFR-004 | Scalability | Hỗ trợ đến 1000 cameras | Stress test |
| NFR-005 | Availability | Offline mode khả dụng 100% | Service Worker test |
| NFR-006 | Compatibility | Chrome, Firefox, Safari, Edge | Cross-browser test |
| NFR-007 | Usability | Học sử dụng < 30 phút | User testing |
| NFR-008 | Security | Không lộ API keys trên client | Code review |
| NFR-009 | Accessibility | WCAG 2.1 AA compliance | Lighthouse a11y ≥ 90 |
| NFR-010 | Maintainability | Code coverage ≥ 80% | Vitest coverage |

### 2.3 Phân loại MoSCoW

| Phân loại | Ý nghĩa | Tỉ lệ capacity |
|-----------|---------|-----------------|
| **Must** have | Bắt buộc, không thể thiếu | 60% |
| **Should** have | Quan trọng, nên có | 20% |
| **Could** have | Nếu có thời gian | 15% |
| **Won't** have (this time) | Không làm lần này | 5% (document only) |

---

## 3. Template User Story

### 3.1 Format chuẩn

```markdown
## User Story: [US-XXX] [Tên ngắn gọn]

**As a** [vai trò người dùng],  
**I want** [hành động/tính năng],  
**So that** [lợi ích/giá trị].

### Acceptance Criteria

**AC1:** 
- GIVEN [điều kiện đầu vào]
- WHEN [hành động của user]
- THEN [kết quả mong đợi]

**AC2:**
- GIVEN [điều kiện đầu vào]
- WHEN [hành động của user]  
- THEN [kết quả mong đợi]

### Technical Notes
- [Ghi chú kỹ thuật cho Dev team]

### UI/UX Reference
- [Link wireframe/mockup nếu có]

### Dependencies
- [Các User Story phụ thuộc]

### Story Points: [X]
### Priority: [Must/Should/Could/Won't]
```

### 3.2 Ví dụ User Story

```markdown
## User Story: [US-003] Hiển thị Camera Markers

**As a** nhân viên giám sát,  
**I want** xem tất cả camera trên bản đồ dưới dạng markers,  
**So that** tôi có thể biết vị trí và trạng thái của từng camera.

### Acceptance Criteria

**AC1: Hiển thị markers**
- GIVEN tôi đã đăng nhập và mở Dashboard
- WHEN bản đồ được load xong
- THEN tất cả 200 camera hiển thị dưới dạng markers trên bản đồ

**AC2: Phân biệt trạng thái**
- GIVEN camera markers đang hiển thị trên bản đồ
- WHEN tôi nhìn vào markers
- THEN camera Online hiển thị màu xanh, camera Offline hiển thị màu đỏ, 
  camera Warning hiển thị màu vàng

**AC3: Click xem chi tiết**
- GIVEN markers đang hiển thị trên bản đồ
- WHEN tôi click vào 1 marker
- THEN popup hiện ra với thông tin: tên camera, vị trí, trạng thái, 
  thời gian cập nhật cuối

**AC4: Performance**
- GIVEN 200 cameras được load
- WHEN bản đồ render xong
- THEN thời gian render markers < 1 giây

### Technical Notes
- Sử dụng react-map-gl + maplibre-gl cho rendering
- Icon marker theo trạng thái: online (green), offline (red), warning (amber)
- Sử dụng Supercluster cho clustering khi zoom level < 12

### Dependencies
- US-001: Setup bản đồ cơ bản
- US-002: Dữ liệu camera (mock data)

### Story Points: 5
### Priority: Must
```

### 3.3 Quy tắc viết User Story
- ✅ Mỗi story phải **independent** (không phụ thuộc quá nhiều story khác)
- ✅ Mỗi story phải **testable** (có thể kiểm thử được)
- ✅ Story size: hoàn thành được trong **1 Sprint**
- ✅ Acceptance Criteria viết theo format **GIVEN-WHEN-THEN**
- ❌ KHÔNG viết story quá lớn (> 13 points) → tách thành nhiều story
- ❌ KHÔNG viết story mơ hồ, không đo lường được

---

## 4. Quy Trình Phân Tích Nghiệp Vụ

### 4.1 Workflow

```
1. Nhận yêu cầu từ Stakeholder/PO
        ↓
2. Phân tích & Decompose yêu cầu
        ↓
3. Viết User Stories + Acceptance Criteria
        ↓
4. Review với PO/Stakeholder
        ↓
5. Refine & Update
        ↓
6. Handoff cho Dev Team (Sprint Planning)
        ↓
7. Hỗ trợ Dev trong quá trình phát triển
        ↓
8. Verify Acceptance Criteria khi Done
```

### 4.2 BA Deliverables mỗi Sprint

| Deliverable | Khi nào | Người review |
|-------------|---------|-------------|
| User Stories với AC | Trước Sprint Planning | PO |
| Wireframes/Mockups | Trước Sprint Planning | PO, Designer |
| Data Flow Diagrams | Khi cần | Tech Lead |
| Updated SRS | Cuối Sprint | PM |
| Traceability Matrix | Cuối Sprint | PM, QA |

---

## 5. Tài Liệu Đặc Tả (SRS)

### 5.1 Cấu trúc SRS

```
1. Giới thiệu
   1.1 Mục đích
   1.2 Phạm vi
   1.3 Thuật ngữ
   1.4 Tài liệu tham khảo

2. Mô tả tổng quan hệ thống
   2.1 Góc nhìn sản phẩm
   2.2 Chức năng chính
   2.3 Đặc điểm người dùng
   2.4 Ràng buộc
   2.5 Giả định và phụ thuộc

3. Yêu cầu chức năng
   3.1 Module Bản đồ (Map)
   3.2 Module Camera
   3.3 Module Zone
   3.4 Module Hạ tầng
   3.5 Module Công cụ (Tools)

4. Yêu cầu phi chức năng
   4.1 Performance
   4.2 Security
   4.3 Availability
   4.4 Compatibility

5. Giao diện
   5.1 User Interfaces
   5.2 Hardware Interfaces
   5.3 Software Interfaces

6. Data Dictionary
7. Phụ lục
```

### 5.2 Quy tắc viết SRS
- Sử dụng ngôn ngữ **rõ ràng, không mơ hồ**
- Tránh từ: "có thể", "nên", "tốt nhất là" → dùng "PHẢI", "SẼ"
- Mỗi requirement có **ID duy nhất** (FR-xxx, NFR-xxx)
- Mỗi requirement phải **đo lường được** (measurable)
- Đánh **version** cho mỗi lần cập nhật SRS

---

## 6. Use Case Documentation

### 6.1 Template Use Case

```markdown
## Use Case: UC-[XXX] [Tên Use Case]

**Actor:** [Ai thực hiện]
**Precondition:** [Điều kiện trước]
**Postcondition:** [Kết quả sau]
**Trigger:** [Sự kiện kích hoạt]

### Main Flow (Happy Path)
1. Actor [hành động 1]
2. System [phản hồi 1]
3. Actor [hành động 2]
4. System [phản hồi 2]
...

### Alternative Flows
- **AF1:** [Mô tả flow thay thế]
- **AF2:** [Mô tả flow thay thế]

### Exception Flows
- **EF1:** [Mô tả khi có lỗi]
```

### 6.2 Ví dụ Use Case

```markdown
## Use Case: UC-005 Đo Khoảng Cách Trên Bản Đồ

**Actor:** Nhân viên giám sát
**Precondition:** Dashboard đã load, bản đồ hiển thị
**Postcondition:** Khoảng cách giữa 2+ điểm được hiển thị
**Trigger:** User click nút "Đo khoảng cách"

### Main Flow
1. User click nút "Đo khoảng cách" trên toolbar
2. System chuyển cursor sang chế độ crosshair
3. User click điểm đầu tiên trên bản đồ
4. System đặt marker tại điểm đó
5. User click điểm thứ hai
6. System vẽ đường thẳng giữa 2 điểm, hiển thị khoảng cách (km)
7. User có thể tiếp tục click thêm điểm (polyline)
8. User double-click hoặc nhấn ESC để kết thúc
9. System hiển thị tổng khoảng cách

### Alternative Flows
- **AF1:** User click phải chuột → Undo điểm cuối
- **AF2:** User nhấn nút "Clear" → Xóa tất cả measurements

### Exception Flows
- **EF1:** User click ngoài bản đồ → Bỏ qua, không tạo điểm
```

---

## 7. Wireframe & Mockup Standards

### 7.1 Quy tắc
- Wireframe tạo bằng **Figma** hoặc **Excalidraw**
- Mỗi màn hình có **annotation** giải thích tương tác
- Đánh số version cho wireframe: `v1.0`, `v1.1`...
- Export dưới dạng **PNG/PDF** kèm link Figma
- Mỗi wireframe PHẢI có:
  - Tên màn hình
  - Responsive variants (Desktop, Tablet)
  - Trạng thái (default, hover, active, error, loading, empty)
  - Luồng navigation

### 7.2 Layout chính của Dashboard

```
┌────────────────────────────────────────────────────┐
│  Header (Logo, Search, User Menu)                  │
├──────────┬─────────────────────────────────────────┤
│          │                                         │
│  Sidebar │          Map Area                       │
│  - Layers│     (MapLibre GL Canvas)                │
│  - Camera│                                         │
│    List  │     ┌──────────┐                        │
│  - Zones │     │ Toolbar  │                        │
│  - Infra │     │ (zoom,   │                        │
│          │     │  measure,│                        │
│          │     │  layers) │                        │
│          │     └──────────┘                        │
│          │                                         │
│          │          ┌─────────────────┐             │
│          │          │ Camera Popup    │             │
│          │          │ (on click)      │             │
│          │          └─────────────────┘             │
│          │                                         │
├──────────┴─────────────────────────────────────────┤
│  Status Bar (Stats, Connection Status, Zoom Level) │
└────────────────────────────────────────────────────┘
```

---

## 8. Data Dictionary

### 8.1 Entity: Camera

| Field | Type | Required | Mô tả | Ví dụ |
|-------|------|----------|-------|-------|
| `id` | string | ✅ | Mã camera duy nhất | "CAM-001" |
| `name` | string | ✅ | Tên camera | "Camera Ngã tư Lê Lợi" |
| `latitude` | number | ✅ | Vĩ độ (WGS84) | 10.7769 |
| `longitude` | number | ✅ | Kinh độ (WGS84) | 106.7009 |
| `status` | enum | ✅ | Trạng thái | "online" \| "offline" \| "warning" |
| `type` | enum | ✅ | Loại camera | "dome" \| "bullet" \| "ptz" |
| `zone_id` | string | ❌ | Mã vùng giám sát | "ZONE-01" |
| `resolution` | string | ❌ | Độ phân giải | "1080p" \| "4K" |
| `ip_address` | string | ❌ | Địa chỉ IP | "192.168.1.100" |
| `installed_date` | date | ❌ | Ngày lắp đặt | "2025-01-15" |
| `last_maintenance` | date | ❌ | Bảo trì lần cuối | "2026-03-20" |
| `last_online` | datetime | ❌ | Lần cuối online | "2026-06-01T08:30:00Z" |
| `description` | string | ❌ | Mô tả | "Giám sát ngã tư..." |

### 8.2 Entity: Zone

| Field | Type | Required | Mô tả | Ví dụ |
|-------|------|----------|-------|-------|
| `id` | string | ✅ | Mã zone duy nhất | "ZONE-01" |
| `name` | string | ✅ | Tên vùng | "Quận 1" |
| `type` | enum | ✅ | Loại vùng | "district" \| "ward" \| "custom" |
| `color` | string | ✅ | Màu hiển thị | "#FF5733" |
| `coordinates` | GeoJSON | ✅ | Polygon coordinates | [[lng, lat], ...] |
| `camera_count` | number | ❌ | Số camera trong zone | 25 |
| `priority` | enum | ❌ | Mức ưu tiên | "high" \| "medium" \| "low" |
| `description` | string | ❌ | Mô tả | "Khu vực trung tâm..." |

### 8.3 Entity: Infrastructure

| Field | Type | Required | Mô tả | Ví dụ |
|-------|------|----------|-------|-------|
| `id` | string | ✅ | Mã hạ tầng | "INFRA-001" |
| `name` | string | ✅ | Tên hạ tầng | "Trạm phát A1" |
| `type` | enum | ✅ | Loại | "station" \| "cable" \| "router" \| "pole" |
| `latitude` | number | ✅ | Vĩ độ | 10.7800 |
| `longitude` | number | ✅ | Kinh độ | 106.7050 |
| `status` | enum | ✅ | Trạng thái | "active" \| "inactive" \| "maintenance" |
| `connected_cameras` | string[] | ❌ | Danh sách camera kết nối | ["CAM-001", "CAM-002"] |
| `capacity` | number | ❌ | Công suất | 50 |

### 8.4 Entity: MapLayer

| Field | Type | Required | Mô tả | Ví dụ |
|-------|------|----------|-------|-------|
| `id` | string | ✅ | Mã layer | "satellite" |
| `name` | string | ✅ | Tên hiển thị | "Vệ tinh" |
| `type` | enum | ✅ | Loại | "raster" \| "vector" |
| `url` | string | ✅ | Tile URL | "https://..." |
| `visible` | boolean | ✅ | Đang hiển thị | true |
| `opacity` | number | ❌ | Độ trong suốt (0-1) | 0.8 |
| `minZoom` | number | ❌ | Zoom tối thiểu | 1 |
| `maxZoom` | number | ❌ | Zoom tối đa | 18 |

---

## 9. Quy Trình Thay Đổi Yêu Cầu

### 9.1 Workflow

```
Stakeholder yêu cầu thay đổi
        ↓
BA ghi nhận & phân tích impact
        ↓
BA tạo Change Request (CR)
        ↓
Impact Assessment (scope, timeline, cost)
        ↓
PM + PO Review CR
        ↓
  ┌─── Approved ───┐
  │                 │
  ↓           Rejected/Deferred
Cập nhật SRS,        ↓
User Stories,    Thông báo
Backlog         stakeholder
  ↓
Thông báo team
```

### 9.2 Quy tắc thay đổi
- Mọi thay đổi requirement **PHẢI** qua BA
- BA **PHẢI** đánh giá impact trước khi trình PM
- Thay đổi **Must-have** requirement cần **PO approval**
- Thay đổi ảnh hưởng > 3 story points cần **PM + PO approval**
- Lưu **lịch sử** tất cả thay đổi (version control)

---

## 10. Tiêu Chuẩn Nghiệm Thu

### 10.1 Checklist nghiệm thu từng User Story

- [ ] Tất cả Acceptance Criteria đã pass
- [ ] Edge cases đã được xử lý
- [ ] Error states đã có UI phù hợp
- [ ] Empty states đã có UI phù hợp
- [ ] Loading states đã có UI phù hợp
- [ ] Responsive trên các breakpoint (Desktop ≥ 1280px, Tablet ≥ 768px)
- [ ] Performance đạt yêu cầu NFR
- [ ] Accessibility đạt yêu cầu

### 10.2 Checklist nghiệm thu module

| Module | Tiêu chí nghiệm thu chính |
|--------|--------------------------|
| **Map** | Load < 3s, zoom/pan mượt ≥ 30fps, layer switch < 1s |
| **Camera** | 200 markers hiển thị đúng, click popup hoạt động, search < 500ms |
| **Clustering** | Cluster/uncluster mượt, số lượng chính xác, animation smooth |
| **Offline** | Map tiles khả dụng offline, no crash, clear indicator |
| **Tools** | Đo khoảng cách chính xác ±1%, routing hiển thị đúng |
| **Zone** | Polygon render đúng, hover highlight, click info panel |

---

## 11. Ma Trận Truy Vết Yêu Cầu (RTM)

### 11.1 Template

| Req ID | User Story | Test Case | Status | Sprint |
|--------|-----------|-----------|--------|--------|
| FR-001 | US-001 | TC-001, TC-002 | ✅ Done | Sprint 1 |
| FR-002 | US-004 | TC-010 | 🔄 In Progress | Sprint 2 |
| FR-003 | US-003 | TC-005, TC-006, TC-007 | ⬜ Not Started | Sprint 1 |
| NFR-001 | - | TC-PERF-001 | ⬜ Not Started | Sprint 3 |

### 11.2 Quy tắc RTM
- Mỗi Requirement **PHẢI** map với ít nhất 1 User Story
- Mỗi User Story **PHẢI** map với ít nhất 1 Test Case
- RTM được cập nhật **mỗi Sprint**
- BA chịu trách nhiệm maintain RTM
- QA sử dụng RTM để verify test coverage

---

## 12. Glossary

| Thuật ngữ | Viết tắt | Định nghĩa |
|-----------|----------|------------|
| GIS | - | Geographic Information System - Hệ thống thông tin địa lý |
| Camera Marker | - | Biểu tượng đại diện camera trên bản đồ |
| Clustering | - | Gom nhóm các markers gần nhau thành 1 cluster khi zoom out |
| Tile | - | Ô bản đồ hình vuông (256x256 hoặc 512x512 px) |
| Layer | - | Lớp hiển thị trên bản đồ (satellite, terrain, streets...) |
| Zone | - | Vùng giám sát được đánh dấu trên bản đồ (polygon) |
| Offline Mode | - | Chế độ sử dụng khi không có kết nối internet |
| Routing | - | Tìm đường đi giữa 2 điểm trên bản đồ |
| WGS84 | - | Hệ tọa độ địa lý toàn cầu (World Geodetic System 1984) |
| GeoJSON | - | Format JSON cho dữ liệu địa lý |
| MapLibre GL | - | Thư viện mã nguồn mở render bản đồ vector |
| Supercluster | - | Thư viện clustering cho bản đồ |
| Service Worker | SW | Web API cho phép caching và offline functionality |
| POI | - | Point of Interest - Điểm quan tâm trên bản đồ |
| FCP | - | First Contentful Paint - Metric hiệu năng web |
| LCP | - | Largest Contentful Paint - Metric hiệu năng web |
| SRS | - | Software Requirements Specification - Đặc tả yêu cầu phần mềm |
| RTM | - | Requirements Traceability Matrix - Ma trận truy vết yêu cầu |
| UAT | - | User Acceptance Testing - Kiểm thử nghiệm thu người dùng |
| CR | - | Change Request - Yêu cầu thay đổi |
| AC | - | Acceptance Criteria - Tiêu chí chấp nhận |
| DoD | - | Definition of Done - Định nghĩa hoàn thành |

---

> 📌 **Lưu ý:** Tài liệu này được cập nhật liên tục. Mọi thay đổi cần được BA Lead review và PO approve trước khi áp dụng.

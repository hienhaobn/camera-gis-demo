# 📋 QUY TẮC QUẢN LÝ DỰ ÁN (PM RULES)

> **Dự án:** GIS Camera Monitoring Dashboard  
> **Phiên bản:** 1.0.0  
> **Cập nhật lần cuối:** 2026-06-02  
> **Tech Stack:** React + TypeScript + Vite + MapLibre GL + TailwindCSS v4

---

## 1. Tổng Quan Dự Án

### 1.1 Mô tả dự án
Xây dựng hệ thống Dashboard GIS giám sát camera trên nền tảng Web, quản lý khoảng **200 camera** trải rộng trên diện tích **11.000 km²** tại Việt Nam. Hệ thống hỗ trợ bản đồ offline, clustering, đo khoảng cách, routing và quản lý hạ tầng.

### 1.2 Mục tiêu dự án

| # | Mục tiêu | KPI |
|---|----------|-----|
| 1 | Hiển thị bản đồ GIS thời gian thực | Tải bản đồ < 3s, render 200 markers < 1s |
| 2 | Hỗ trợ offline | 100% tile bản đồ khả dụng khi mất mạng |
| 3 | Quản lý camera hiệu quả | CRUD camera, tìm kiếm, lọc < 500ms |
| 4 | Demo cho khách hàng | UI/UX chất lượng cao, responsive |
| 5 | Hiệu năng cao | Lighthouse score ≥ 90 |

### 1.3 Phạm vi dự án

**Trong phạm vi (In-Scope):**
- Dashboard bản đồ GIS với OpenStreetMap
- Quản lý và hiển thị camera trên bản đồ
- Layer switching (vệ tinh/đô thị)
- Đo khoảng cách & routing
- Clustering camera
- Quản lý zone và hạ tầng
- Chế độ offline
- Responsive design (Desktop + Tablet)

**Ngoài phạm vi (Out-of-Scope):**
- Stream video trực tiếp từ camera
- Mobile native app
- AI/ML phân tích hình ảnh
- Backend API server (chỉ mock data)

---

## 2. Quy Trình Quản Lý Dự Án

### 2.1 Phương pháp luận: Agile Scrum

```
Sprint Planning → Daily Standup → Development → Sprint Review → Retrospective
     (Thứ 2)     (Hàng ngày)    (2 tuần)      (Thứ 6 cuối)   (Thứ 6 cuối)
```

### 2.2 Sprint Planning

| Hạng mục | Chi tiết |
|----------|----------|
| **Thời gian Sprint** | 2 tuần (10 ngày làm việc) |
| **Sprint Planning** | Thứ 2 đầu Sprint, 2-3 tiếng |
| **Sprint Goal** | Mỗi Sprint phải có 1 mục tiêu rõ ràng |
| **Velocity** | Theo dõi và cập nhật sau mỗi Sprint |
| **Capacity** | Tính theo giờ thực tế có thể làm việc |

### 2.3 Ceremonies

| Ceremony | Tần suất | Thời lượng | Người tham gia |
|----------|----------|------------|----------------|
| Daily Standup | Hàng ngày 9:00 AM | 15 phút | Dev team, Scrum Master |
| Sprint Planning | Đầu Sprint | 2-3 giờ | Cả team |
| Sprint Review | Cuối Sprint | 1-2 giờ | Cả team + Stakeholders |
| Retrospective | Cuối Sprint | 1 giờ | Dev team |
| Backlog Grooming | Giữa Sprint | 1 giờ | PO, BA, Tech Lead |

### 2.4 Daily Standup Format
Mỗi thành viên trả lời 3 câu hỏi:
1. **Hôm qua** đã làm gì?
2. **Hôm nay** sẽ làm gì?
3. Có **blocker** nào không?

---

## 3. Quản Lý Phạm Vi

### 3.1 Quy trình Change Request (CR)

```
Yêu cầu thay đổi → Đánh giá tác động → PM Review → Stakeholder Approval → Cập nhật Backlog
```

### 3.2 Template Change Request

| Trường | Mô tả |
|--------|-------|
| CR ID | CR-[YYYY]-[NNN] |
| Người yêu cầu | Tên, vai trò |
| Ngày yêu cầu | DD/MM/YYYY |
| Mô tả thay đổi | Chi tiết yêu cầu |
| Lý do | Tại sao cần thay đổi |
| Tác động phạm vi | High / Medium / Low |
| Tác động tiến độ | Số ngày ảnh hưởng |
| Tác động chi phí | Ước tính |
| Ưu tiên | Critical / High / Medium / Low |
| Trạng thái | Pending / Approved / Rejected / Deferred |

### 3.3 Quy tắc phạm vi
- ❌ **KHÔNG** thêm tính năng mới giữa Sprint mà không qua CR
- ❌ **KHÔNG** thay đổi requirement đã được approved mà không thông báo PM
- ✅ Bug fix có thể xử lý ngay nếu severity = Critical/Blocker
- ✅ Technical debt được phân bổ 15-20% capacity mỗi Sprint

---

## 4. Quản Lý Tiến Độ

### 4.1 Milestones

| Phase | Milestone | Deliverable | Deadline |
|-------|-----------|-------------|----------|
| **Phase 1** | Foundation | Bản đồ cơ bản + Camera markers | Sprint 1-2 |
| **Phase 2** | Core Features | Clustering, Layer switching, Search | Sprint 3-4 |
| **Phase 3** | Advanced | Đo khoảng cách, Routing, Zone mgmt | Sprint 5-6 |
| **Phase 4** | Offline & Polish | Offline mode, UI polish, Performance | Sprint 7-8 |
| **Phase 5** | UAT & Release | Testing, Bug fix, Demo client | Sprint 9-10 |

### 4.2 Definition of Done (DoD)
Một task được coi là **Done** khi thỏa mãn TẤT CẢ điều kiện:

- [ ] Code đã được review và approved (≥ 1 reviewer)
- [ ] Unit tests đã viết và pass (coverage ≥ 80%)
- [ ] Không có linting errors
- [ ] UI đã test trên Chrome, Firefox, Safari
- [ ] Responsive đã test trên Desktop và Tablet
- [ ] Documentation đã cập nhật (nếu cần)
- [ ] Đã deploy lên staging thành công
- [ ] QA đã verify và approve

### 4.3 Story Points Estimation

| Points | Effort | Ví dụ |
|--------|--------|-------|
| 1 | Vài giờ | Fix UI nhỏ, thêm icon |
| 2 | Nửa ngày | Component đơn giản, fix bug |
| 3 | 1 ngày | Feature nhỏ, API integration |
| 5 | 2-3 ngày | Feature trung bình (clustering) |
| 8 | 3-5 ngày | Feature phức tạp (offline mode) |
| 13 | 1 tuần+ | Epic lớn → cần tách nhỏ |

---

## 5. Quản Lý Rủi Ro

### 5.1 Ma trận rủi ro

| ID | Rủi ro | Xác suất | Tác động | Mức độ | Giải pháp |
|----|--------|----------|----------|--------|-----------|
| R01 | Dữ liệu bản đồ offline quá lớn | Cao | Cao | 🔴 Critical | Optimize tile, chỉ cache khu vực cần thiết |
| R02 | Performance kém khi render 200+ markers | Trung bình | Cao | 🟠 High | Sử dụng Supercluster cho clustering |
| R03 | Browser compatibility issues | Trung bình | Trung bình | 🟡 Medium | Cross-browser testing từ Sprint 1 |
| R04 | Thay đổi yêu cầu liên tục | Cao | Trung bình | 🟠 High | Quy trình CR chặt chẽ, freeze scope cuối phase |
| R05 | Mất kết nối khi demo | Trung bình | Cao | 🟠 High | Service Worker + offline fallback |
| R06 | Tile server không ổn định | Thấp | Cao | 🟡 Medium | Self-host tile server backup |
| R07 | Key members nghỉ đột xuất | Thấp | Trung bình | 🟡 Medium | Knowledge sharing, pair programming |
| R08 | Dữ liệu camera không chính xác | Trung bình | Trung bình | 🟡 Medium | Validation layer + manual review |

### 5.2 Theo dõi rủi ro
- Review rủi ro **mỗi Sprint** trong Sprint Planning
- Cập nhật ma trận rủi ro khi phát sinh rủi ro mới
- Escalate rủi ro 🔴 Critical lên Stakeholder ngay lập tức

---

## 6. Quản Lý Stakeholder

### 6.1 Ma trận stakeholder

| Stakeholder | Vai trò | Mức quan tâm | Mức ảnh hưởng | Chiến lược |
|-------------|---------|--------------|---------------|------------|
| Product Owner | Quyết định tính năng | Cao | Cao | Manage Closely |
| Client (Khách hàng) | Sử dụng sản phẩm | Cao | Cao | Manage Closely |
| Dev Team | Phát triển | Cao | Trung bình | Keep Informed |
| QA Team | Kiểm thử | Trung bình | Trung bình | Keep Informed |
| UI/UX Designer | Thiết kế | Trung bình | Thấp | Keep Satisfied |

### 6.2 Kế hoạch truyền thông

| Đối tượng | Nội dung | Tần suất | Kênh |
|-----------|----------|----------|------|
| Client | Sprint Review, Demo | 2 tuần/lần | Meeting + Email |
| PO | Tiến độ, Blockers | Hàng ngày | Slack/Teams |
| Dev Team | Daily Standup | Hàng ngày | Meeting |
| Management | Báo cáo tổng hợp | Hàng tháng | Email + Slides |

---

## 7. Quy Trình Báo Cáo

### 7.1 Báo cáo hàng ngày (Daily Report)
- Cập nhật trên Jira/Trello board
- Standup notes ghi lại trên Confluence/Notion

### 7.2 Báo cáo tuần (Weekly Report)

```markdown
## Weekly Report - Sprint [X] - Tuần [Y]
### Tiến độ
- Planned: [X] story points
- Completed: [Y] story points  
- Velocity: [Z]%

### Highlights
- [Thành tựu đáng chú ý]

### Risks & Issues
- [Rủi ro/vấn đề phát sinh]

### Next Week
- [Kế hoạch tuần sau]
```

### 7.3 Báo cáo Sprint (Sprint Report)
- Burndown chart
- Velocity chart
- Sprint goal achievement
- Demo video/screenshots
- Retrospective actions

### 7.4 Báo cáo tháng (Monthly Report)
- Tổng quan tiến độ dự án (% hoàn thành)
- Budget status
- Risk status update
- Key decisions log
- Upcoming milestones

---

## 8. Tiêu Chuẩn Chất Lượng

### 8.1 Tiêu chuẩn kỹ thuật

| Tiêu chí | Target | Công cụ đo |
|----------|--------|-----------|
| Code Coverage | ≥ 80% | Vitest + Istanbul |
| Lighthouse Performance | ≥ 90 | Chrome Lighthouse |
| Lighthouse Accessibility | ≥ 90 | Chrome Lighthouse |
| Lighthouse Best Practices | ≥ 90 | Chrome Lighthouse |
| Bundle Size | < 500KB (gzipped) | Vite build analyzer |
| First Contentful Paint | < 1.5s | Lighthouse |
| Map Load Time | < 3s | Custom metrics |
| Zero Critical Bugs | 0 | Bug tracker |

### 8.2 Acceptance Criteria
Mỗi User Story PHẢI có Acceptance Criteria theo format:

```
GIVEN [điều kiện]
WHEN [hành động]
THEN [kết quả mong đợi]
```

---

## 9. Quy Trình Release

### 9.1 Versioning (Semantic Versioning)

```
MAJOR.MINOR.PATCH
  │      │     └── Bug fixes, patches (1.0.1)
  │      └──────── New features, backward compatible (1.1.0)
  └─────────────── Breaking changes (2.0.0)
```

### 9.2 Release Checklist

- [ ] Tất cả User Stories trong Sprint đã Done
- [ ] Regression test pass
- [ ] Performance test pass (Lighthouse ≥ 90)
- [ ] Cross-browser test pass (Chrome, Firefox, Safari)
- [ ] Security scan pass
- [ ] Release notes đã viết
- [ ] Staging deploy thành công
- [ ] PO/Client sign-off
- [ ] Tag version trên Git
- [ ] Production deploy
- [ ] Smoke test trên production
- [ ] Thông báo stakeholders

### 9.3 Branching Strategy

```
main (production)
  └── develop (staging)
        ├── feature/CAM-123-add-clustering
        ├── feature/CAM-456-offline-mode
        └── bugfix/CAM-789-marker-position
```

### 9.4 Release Environments

| Môi trường | Mục đích | Deploy |
|------------|----------|--------|
| Development | Dev testing | Auto (push to develop) |
| Staging | QA & UAT | Manual trigger |
| Production | Live | Manual, sau approval |

---

## 10. Công Cụ Quản Lý

### 10.1 Công cụ bắt buộc

| Công cụ | Mục đích | Link |
|---------|----------|------|
| **Jira / Linear** | Task tracking, Sprint board | - |
| **Confluence / Notion** | Documentation | - |
| **Git (GitHub)** | Source control | - |
| **Slack / Teams** | Communication | - |
| **Figma** | UI/UX Design | - |
| **Vite Dev Server** | Local development | `npm run dev` |

### 10.2 Task Workflow trên Board

```
Backlog → To Do → In Progress → Code Review → QA → Done
```

### 10.3 Task Naming Convention

```
[TYPE]-[ID]: [Mô tả ngắn gọn]

Ví dụ:
FEAT-001: Hiển thị camera markers trên bản đồ
BUG-042: Fix marker position sai khi zoom
TASK-015: Setup offline tile caching
SPIKE-003: Research clustering algorithm
```

### 10.4 Labels

| Label | Màu | Mô tả |
|-------|-----|-------|
| `priority:critical` | 🔴 Đỏ | Blocker, cần fix ngay |
| `priority:high` | 🟠 Cam | Quan trọng, fix trong Sprint hiện tại |
| `priority:medium` | 🟡 Vàng | Quan trọng, có thể defer |
| `priority:low` | 🟢 Xanh | Nice-to-have |
| `type:feature` | 🔵 Xanh dương | Tính năng mới |
| `type:bug` | 🔴 Đỏ | Lỗi |
| `type:tech-debt` | ⚫ Đen | Technical debt |
| `type:spike` | 🟣 Tím | Research/Investigation |

---

## 11. Quy Tắc Họp

### 11.1 Nguyên tắc chung
- Mọi cuộc họp PHẢI có **agenda** gửi trước ≥ 1 giờ
- Ghi **meeting notes** và chia sẻ trong 24 giờ
- Mọi **quyết định** phải được document
- Tôn trọng thời gian: bắt đầu đúng giờ, kết thúc đúng giờ
- Nếu có thể giải quyết qua message → **KHÔNG** cần họp

### 11.2 Decision Log

| # | Ngày | Quyết định | Người quyết định | Context |
|---|------|-----------|-------------------|---------|
| 1 | DD/MM | Sử dụng MapLibre GL thay Google Maps | PM + Tech Lead | Cost, Offline support |
| 2 | DD/MM | TailwindCSS v4 cho styling | Tech Lead | Team familiarity |

---

> 📌 **Lưu ý:** Tài liệu này được cập nhật liên tục. Mọi thay đổi cần được PM review và approve trước khi áp dụng.

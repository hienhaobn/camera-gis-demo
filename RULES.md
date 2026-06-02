# 📖 HƯỚNG DẪN VÀ QUY TẮC DỰ ÁN (PROJECT RULES & GUIDELINES)

Chào mừng bạn đến với dự án **GIS Camera Monitoring Dashboard**!  
Để đảm bảo chất lượng phát triển, quy trình vận hành và kiểm thử trơn tru, dự án đã thiết lập các bộ quy tắc chuẩn hóa cho từng vai trò trong đội ngũ phát triển.

Vui lòng đọc kỹ hướng dẫn dành riêng cho vai trò của bạn dưới đây:

---

## 🗂️ Mục Lục Các Quy Tắc

### 1. [📋 Quy tắc Quản lý Dự án (PM Rules)](file:///Users/hienhao/Code/Home/Project/camera-map-demo/docs/rules/PM_RULES.md)
*Dành cho Project Manager & Scrum Master*
- **Nội dung chính:** Phương pháp Agile Scrum, quy trình Sprint Planning (2 tuần), quản lý phạm vi thay đổi (Change Request), ma trận quản lý rủi ro (đặc biệt là dữ liệu bản đồ offline), cơ chế báo cáo tiến độ và quy trình release sản phẩm.

### 2. [📊 Quy tắc Phân tích Nghiệp vụ (BA Rules)](file:///Users/hienhao/Code/Home/Project/camera-map-demo/docs/rules/BA_RULES.md)
*Dành cho Business Analyst & Product Owner*
- **Nội dung chính:** Quy trình thu thập yêu cầu (Functional & Non-Functional), template chuẩn User Story kèm Acceptance Criteria dạng Given-When-Then, tài liệu đặc tả SRS, Use Cases mẫu và từ điển dữ liệu (Entities: Camera, Zone, Infrastructure).

### 3. [🧪 Quy tắc Kiểm thử (Test Rules)](file:///Users/hienhao/Code/Home/Project/camera-map-demo/docs/rules/TEST_RULES.md)
*Dành cho QA, QC & Software Development Engineers in Test (SDET)*
- **Nội dung chính:** Kim tự tháp kiểm thử (Unit, Integration, E2E với Playwright), template báo cáo lỗi, chỉ số đo lường chất lượng (Coverage ≥ 80%), quy trình kiểm thử đặc thù hệ thống bản đồ (GIS rendering, clustering, offline mode, đo khoảng cách).

### 4. [💻 Quy tắc Phát triển Phần mềm (Coding Rules)](file:///Users/hienhao/Code/Home/Project/camera-map-demo/docs/rules/CODING_RULES.md)
*Dành cho Frontend Developers & Tech Lead*
- **Nội dung chính:** Cấu trúc thư mục dạng Feature-based, quy định đặt tên (Naming Conventions), tiêu chuẩn code TypeScript (strict mode) & React 19, tối ưu hiệu năng render bản đồ, quản lý state (Zustand), quy định định dạng CSS (TailwindCSS v4) và quy tắc Git/Conventional Commits.

---

## 🛠️ Công Cụ Bắt Buộc Sử Dụng

- **Quản lý Task:** Jira / Linear (Sử dụng luồng: `Backlog` ➔ `To Do` ➔ `In Progress` ➔ `Code Review` ➔ `QA` ➔ `Done`)
- **Quản lý Tri thức:** Confluence / Notion
- **Quản lý Mã nguồn:** GitHub (Yêu cầu viết commit theo chuẩn **Conventional Commits**)
- **Môi trường chạy thử:** Staging Server & Cloud Sandbox

---

> 📌 **Lưu ý quan trọng:** Các tài liệu quy tắc này là tài sản chung của dự án và được cập nhật liên tục qua các buổi họp cải tiến quy trình (Retrospective). Hãy đảm bảo bạn luôn cập nhật phiên bản mới nhất trước khi bắt đầu công việc.

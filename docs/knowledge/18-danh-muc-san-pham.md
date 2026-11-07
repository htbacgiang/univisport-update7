# 18-danh-muc-san-pham.md

> Tra cứu nhanh mã sản phẩm. Khi cần chi tiết, tra theo mã SP hoặc slug trong univisport_db_products.json, không đọc toàn bộ file.

## 1. Danh mục sản phẩm thể thao [FACT – DB 59 sản phẩm]

| Danh mục | Số mẫu | Mã sản phẩm |
|---|---|---|
| Đồng phục Gym | 19 | AG1, AG2, AG3, AG4, AG5, AG7, AG11, AG16, AG19, AGPL12, AGPL15, AGPL17; dài tay: AG1-DT, AG2-DT, AG7-DT, AG11-DT, AG15-DT, AG19-DT, AG22-DT. Website có thêm AG18 |
| Yoga – Pilates | 17 | A001, A004, A005, A006, A007, A008, A3007, A4013, A4014, A11, A12, A15, ACT1, ACT7, APL1, JUMP13, BDCV |
| Pickleball | 14 | APL01–APL12, APL15, APL16 |
| Golf – Tennis | 5 | ACT8, ACT9, ACT10, APL2, GQS1 |
| Áo gió | 4 | AGBG01, AGBG01A, AGBG02, GAG1-2-3 |

## 2. Giá

- Trang web hiển thị "Giá tham khảo: Liên hệ".
- [NỘI BỘ] Giá niêm yết trong DB: Gym/Pickleball 360.000đ, Yoga/Golf 599.000đ, áo gió 499.000đ. Trang giới thiệu ghi "chỉ từ 99.000đ" cho sản phẩm trung cao cấp.
- Quy tắc: không đưa giá vào bài SEO trừ khi task yêu cầu rõ.

## 3. Quy tắc dùng dữ liệu sản phẩm

- Trường "material" trống ở 57/59 sản phẩm → không suy chất liệu từ mô tả sản phẩm; lấy từ 05-chat-lieu-vai.md.
- Mô tả sản phẩm cũ còn chứa claim chưa kiểm chứng (spandex 20–25%, 300 lần giặt, UPF 40+, khô 15 phút). Không trích các câu đó.
- Không tạo Product schema có aggregateRating từ số sao trong DB khi chưa xác nhận đó là đánh giá thật.
- Lỗi slug cần biết (không tự sửa): APL01 → ao-polo-pickleball-univi-aplapl01; AGBG01A → dong-phuc-ao-gio-1-lop-agbg02; AGPL12 có tên hiển thị "APL12".

## 4. UNI POWERZIP [FACT – cần đối chiếu]

- Dòng polo thể thao có khóa kéo ở cổ, viền tương phản ở cổ và cổ tay, có bản raglan phối màu; form thể thao ôm vừa. Slogan dòng: HIỆU SUẤT – TINH TẾ – ĐA DẠNG.
- Đối tượng: phòng Gym, Fitness Center, CLB, đội nhóm, doanh nghiệp.
- Chất liệu: UNI SUPERCOOL (Polyamide).
- 12 màu cơ bản: đen, xanh lá cây, xanh than, xám, đỏ, hồng, trắng, xanh dương, tím, cam, xanh ngọc, xanh cổ vịt.
- [CẦN XÁC MINH] "Độ giãn dưới 3%", "không phai, không nhiễm màu", "kháng khuẩn, chống UV", "miễn phí giao hàng toàn quốc", "nhận đơn từ 10 áo".


---

## Chi tiết từng sản phẩm

Mỗi mã sản phẩm có một file riêng trong thư mục `knowledge/san-pham/` (ví dụ `san-pham/AG1.md`), gồm: thông tin cơ bản, meta description, bảng màu, nội dung mô tả, FAQ. Claim chưa kiểm chứng đã được gắn [CẦN XÁC MINH].


---

## Tư liệu gốc: UNI POWERZIP

> Nguồn: `uni-powerzip.md`. Phần tổng hợp phía trên file có hiệu lực cao hơn. Dòng gắn [CẦN XÁC MINH] không được dùng trong bài khi chưa xác nhận.

### **UNI POWERZIP **
Dòng đồng phục thể thao cao cấp của **Đồng Phục Univi** (dongphucunivi.com). Slogan dòng:  **HIỆU SUẤT – TINH TẾ – ĐA DẠNG** Nguồn: nội dung gốc + 7 ảnh sản phẩm (06/2026).
#### **1. Tổng quan & định vị**
UNI POWERZIP là dòng đồng phục thể thao hướng đến sự **cân bằng giữa hiệu suất vận động, trải nghiệm mặc và giá trị thẩm mỹ**.
Thiết kế dành riêng cho **phòng Gym, Fitness Center, câu lạc bộ và đội nhóm thể thao**, mang lại cảm giác thoải mái tối đa để người mặc tự tin chinh phục mọi bài tập — từ động tác cơ bản đến buổi luyện tập cường độ cao.
**Câu định vị 1 dòng (dùng làm kết bài/CTA):**
UNI POWERZIP không chỉ là một mẫu đồng phục thể thao, mà còn là giải pháp giúp các phòng Gym, đội nhóm và doanh nghiệp xây dựng hình ảnh chuyên nghiệp, nâng cao trải nghiệm người mặc và tạo dấu ấn thương hiệu bền vững trong từng hoạt động.
#### **2. Công nghệ UNI QUICK-DRY — Khô nhanh, thoáng khí**
- Ứng dụng công nghệ Quick-Dry giúp **thấm hút và thoát ẩm nhanh chóng**, hạn chế cảm giác ẩm bết và bí nóng khi vận động liên tục.
- Duy trì cảm giác **khô thoáng, dễ chịu** trong suốt quá trình sử dụng — dù tập trong phòng, tổ chức sự kiện thể thao hay hoạt động ngoài trời.
- Ngăn tạo độ ẩm, không để lại cảm giác bết dính ngay cả với bài tập cường độ cao.
#### **3. Chất liệu UNI SUPERCOOL — Siêu mát, siêu nhẹ**
Thành phần chính: **sợi Polyamide**. Ưu điểm vượt trội: [CẦN XÁC MINH]
- Bề mặt vải **mềm mịn, chạm mát**, tạo cảm giác dễ chịu khi mặc
- **Thấm hút mồ hôi tốt**, hỗ trợ duy trì sự khô thoáng khi vận động
- **Co giãn linh hoạt** theo từng chuyển động cơ thể, giữ form xuất sắc
- **Chống tia UV** +  **kháng khuẩn**, phù hợp môi trường tập luyện thường xuyên [CẦN XÁC MINH]
#### **4. Thiết kế & nhận diện sản phẩm (theo bộ ảnh)**
- **Kiểu cổ:** Polo có  **khóa kéo (zip)** ở cổ — đặc trưng nhận diện của dòng POWERZIP.
- **Phối màu:** Đường viền trắng tương phản ở cổ áo và cổ tay; có bản raglan phối màu khỏe khoắn (VD: trắng phối xanh dương).
- **Form dáng:** Thể thao hiện đại,  **chuẩn Gym**, ôm vừa người tôn dáng; bó tay vừa vặn.
- **Cam kết độ bền (ảnh sản phẩm):**
- Không bai nhão — độ giãn **dưới 3%** [CẦN XÁC MINH]
- **Không phai màu, không nhiễm màu** khi giặt [CẦN XÁC MINH]
- **Thông điệp thiết kế:** Đường phối màu khỏe khoắn + form thể thao hiện đại → dễ phù hợp nhiều phong cách thương hiệu, tạo hình ảnh đội ngũ đồng bộ, năng động, chuyên nghiệp.
##### **Bảng màu đa dạng (1 mẫu — hàng chục màu tùy chọn)**
| | |
|-|-|
| **Màu** | **Màu** |
| Đen | Xanh Lá Cây |
| Xanh than | Xám đạm |
| Đỏ | Hồng |
| Trắng | Xanh Dương |
| Tím | Cam |
| Xanh Ngọc | Xanh Cổ Vịt |
#### **5. Giá trị thật – Dịch vụ thật (USP)**
Là đơn vị **sản xuất trực tiếp**, Univi chủ động toàn bộ quy trình từ nghiên cứu → thiết kế → hoàn thiện sản phẩm → tối ưu chi phí, đảm bảo chất lượng đồng đều và tiến độ nhanh chóng.
- ✅ Thiết kế theo yêu cầu, **nhận đơn từ 10 áo**
- ✅ Tư vấn & lên concept **miễn phí** theo nhận diện thương hiệu
- ✅ **Miễn phí giao hàng toàn quốc**
- ✅ Cam kết tiến độ sản xuất **nhanh, đúng hẹn**
#### **6. Bảng tra nhanh cho codex**
| | |
|-|-|
| **Trường** | **Giá trị** |
| Tên dòng | UNI POWERZIP |
| Slogan | HIỆU SUẤT – TINH TẾ – ĐA DẠNG |
| Đối tượng | Phòng Gym, Fitness Center, CLB, đội nhóm thể thao, doanh nghiệp |
| Công nghệ | UNI QUICK-DRY (khô nhanh, thoát ẩm) |
| Chất liệu | UNI SUPERCOOL — sợi Polyamide |
| Đặc tính vải | Mát, nhẹ, mềm mịn, co giãn, kháng khuẩn, chống UV [CẦN XÁC MINH] |
| Nhận diện | Cổ polo có khóa kéo (zip), viền tương phản, form chuẩn Gym |
| Độ bền | Không bai nhão (<3%), không phai, không nhiễm màu [CẦN XÁC MINH] |
| Số màu | 12 màu cơ bản (1 mẫu nhiều màu tùy chọn) |
| MOQ | Từ 10 áo |
| Dịch vụ | Thiết kế + concept miễn phí, freeship toàn quốc, đúng tiến độ |
-

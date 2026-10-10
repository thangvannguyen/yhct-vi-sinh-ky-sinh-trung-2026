# Vi Sinh – Ký Sinh Trùng 10-2026

Web **học tập** và **ôn tập trắc nghiệm** môn Vi Sinh – Ký Sinh Trùng (YHCT 2026). Dựng bằng React 19, Vite 7 và Tailwind CSS v4; deploy lên GitHub Pages.

- **Học tập** (`/learn`): lý thuyết lấy từ tài liệu, sắp xếp lại theo một khung thống nhất. Có mục lục dính, nhớ vị trí đọc, đánh dấu đã học, chỉnh cỡ chữ và tìm kiếm không dấu.
- **Trắc nghiệm**: ôn tuần tự, kiểm tra thử (trộn câu và phương án), ôn câu sai. Mỗi câu có giải thích và nút **"Xem lý thuyết →"** mở đúng mục trong bài học.
- **Nội dung hiện có:** 18 bài và 83 câu tự lượng giá, tất cả đều lấy từ tài liệu, không soạn thêm.
  - Phần Ký sinh trùng: giun tròn, sán lá, sán dải, đơn bào, vi nấm.
  - Phần Vi sinh: virus.
- **Câu điền khuyết** ("……") được chuyển thành trắc nghiệm: phương án là đáp án của các câu điền khuyết trong cùng bài, thứ tự trộn cố định. Xem `convert_fills()` trong `build_questions.py`.

## Chạy

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # ra thư mục dist/
```

## Cấu trúc

```
docs/source/*.docx            tài liệu gốc
data/lessons.meta.json        danh mục bài: thứ tự, phần, nhóm, tiêu đề, file nguồn
data/docx_text.py             đọc .docx, dựng lại nhãn 1./A. của danh sách tự đánh số
data/extract_text.py          → data/lecture_text/<id>.txt (tư liệu viết bài, gitignored)
data/parse_docx.py            → data/questions.base.json (tách câu hỏi + đáp án, tự kiểm tra)
data/overrides.json           sửa tay câu hỏi (chính tả, ghi chú lỗi tài liệu…)
data/explanations/<id>.json   giải thích + mẹo + mục lý thuyết liên quan
data/build_questions.py       → data/questions.json (file web import)
data/review_needed.md         ghi chép mọi chỗ sửa so với tài liệu gốc
content/lessons/<id>.md       nội dung trang Học tập
content/image-credits/<id>.json  nguồn + giấy phép của hình minh họa
public/images/lessons/<id>/   hình minh họa
data/fetch_images.py          tải hình từ Wikimedia Commons
```

## Thêm tài liệu mới

1. Chép file `.docx` vào `docs/source/`.
2. Thêm một dòng vào `data/lessons.meta.json`, gồm:
   - `id`: dạng slug, không đổi về sau;
   - `group`, `title`, `short`, `icon`, `source`;
   - `expectedQuestions`: số câu hỏi trong tài liệu, 0 nếu không có.

   Muốn thêm phần hoặc nhóm mới thì thêm vào `parts` / `groups`.
3. Chạy hai script:
   ```bash
   python3 -m pip install python-docx   # lần đầu
   python3 data/extract_text.py <id>
   python3 data/parse_docx.py           # báo lỗi nếu số câu / đáp án không khớp
   ```
4. Viết `content/lessons/<id>.md` và `data/explanations/<id>.json`.
5. Chạy `python3 data/build_questions.py`. Script kiểm tra mọi `section` trong phần giải thích có tồn tại trong bài học. Web tự nhận bài mới, không cần sửa code.
6. (Tùy chọn) `npm run downloads` để tạo lại file PDF/Word ở trang "Toàn bộ câu hỏi" (3 bản: không đáp án, có đáp án, có đáp án và giải thích) khi xem trên máy. Khi deploy, GitHub Actions tự chạy bước này nên file tải về luôn khớp câu hỏi mới; thư mục `public/downloads/` không đưa vào git.

## Quy ước viết bài học (Markdown)

- **Tiêu đề mục:** `## 2. Chu trình phát triển {#chu-trinh}`. Phần `{#id}` là neo để câu hỏi trỏ tới.
  - Các id chuẩn: `muc-tieu`, `hinh-the`, `chu-trinh`, `dich-te`, `lam-sang`, `chan-doan`, `dieu-tri`, `du-phong`, `tom-tat`.
- **Hộp ghi chú:** dòng đầu của blockquote là `> [!KEY]` (ý chính), `> [!TIP]` (mẹo nhớ), `> [!WARN]` (dễ nhầm) hoặc `> [!NOTE]` (ghi chú). Tiêu đề tự đặt viết ngay sau, trên cùng dòng.
- **Bảng:** dùng bảng GFM, nên dùng cho mọi nội dung so sánh.
- **Hình minh họa:** `![chú thích](giun-dua/chu-trinh.jpg)`.
  - Một ảnh đứng riêng một đoạn sẽ hiện thành khung lớn. Nhiều ảnh trên cùng một dòng hiện thành lưới, hợp để so sánh (ví dụ các loại trứng).
  - Bấm vào ảnh để phóng to.
  - Tải ảnh bằng `python3 data/fetch_images.py <lessonId> <tên>=File:<tên trên Wikimedia Commons>`. Script tự ghi tác giả và giấy phép vào `content/image-credits/<lessonId>.json`, và trang bài hiện thông tin này dưới ảnh.
  - Chỉ dùng ảnh Public domain hoặc CC (phần lớn ảnh CDC trên Commons), không lấy ảnh có bản quyền từ Google.
- **Sơ đồ chu trình:** khối ` ```cycle `.
  - `@ tiêu đề`
  - mỗi dòng là một bước; có thể gắn nơi diễn ra bằng `[Ruột non] …`
  - `-> nhãn mũi tên`
  - `~> dòng khép vòng`
- **Nguyên tắc biên tập:**
  - Giữ đúng số liệu, liều thuốc và thuật ngữ của tài liệu.
  - Viết đầy đủ chữ viết tắt.
  - Không thêm kiến thức ngoài tài liệu.
  - Chỗ tài liệu có vẻ sai thì ghi chú rõ trong bài.

## Lưu ý

- **localStorage dùng tiền tố `vskst_`.** Các web môn khác (Sinh Học Di Truyền dùng `shdt_`, Hóa Sinh dùng `hs_`) cùng chạy trên `thangvannguyen.github.io`; dùng chung tiền tố sẽ làm tiến độ đè lên nhau.
- **Google Analytics:** `G-J68XQS7BW0`, khai báo trong `index.html`. `Layout.jsx` gửi `page_view` mỗi lần đổi trang.
- **Deploy:** push lên `main` → GitHub Actions (`.github/workflows/deploy.yml`) build và đăng lên GitHub Pages.

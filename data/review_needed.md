# Ghi chép sửa đổi so với tài liệu gốc

Mọi chỗ sửa câu hỏi nằm trong `data/overrides.json`, **không** sửa tay `questions.base.json`.

## Sửa trình bày (không đổi nội dung, không gắn nhãn)
Lỗi chính tả, chữ viết tắt trong câu hỏi/phương án được viết đầy đủ:
- giun-dua-2 "nấu chính" → "nấu chín"; giun-dua-4 "BCTT" → "bạch cầu toan tính", "Charcot Leydenly" → "Charcot-Leyden".
- giun-kim-1 viết thường "Tá Tràng…"; giun-kim-3, giun-toc-5, giun-moc-1 "Trưc/ngăn" → "Trực/ngắn", "KCTG/kỷ chủ" → "ký chủ trung gian".
- giun-toc-3 "tim" → "tìm"; giun-moc-2 bỏ viết tắt (K, đc, VS, GD), "Tăng liệu" → "Tăng liều".
- giun-chi-2 "phủ voi … giun chi W, bancrofti" → "phù voi … giun chỉ W. bancrofti".
- san-la-nho-gan-5 "nễm" → "nhiễm"; san-la-ruot-3 "cảu" → "của".
- san-dai-bo-1 "Kỷ chủ" → "Ký chủ"; san-dai-bo-2 "bỏ/dài heo" → "bò/dải heo".
- sot-ret-5 "chuẩn đoán" → "chẩn đoán"; sot-ret-6 "cyto-ahderence" → "cyto-adherence".
- Câu điền khuyết: thêm chỗ trống "……" vào câu hỏi.

## Có gắn nhãn trên web
| Câu | Nhãn | Lý do |
|---|---|---|
| san-la-nho-gan-4 | gốc trùng nhãn | Hai phương án cùng ghi "A." do lỗi danh sách tự động. Gán lại A–D theo thứ tự; đáp án gốc "4-C" = "Tìm trứng trong phân". |
| trichomonas-1 | lỗi tài liệu gốc | Phương án B "Giao hợp" có vẻ chép nhầm từ câu 2; giữ nguyên chữ, đáp án D không đổi. |
| giun-moc-4, giun-moc-5, san-dai-bo-3, san-dai-bo-4 | phương án bổ sung | Câu điền khuyết chuyển trắc nghiệm, bài chỉ có 2 đáp án điền khuyết → thêm 2 phương án sai mỗi câu (`extraOptions`): giun-moc-4 "Sa trực tràng", "Tắc ruột"; giun-moc-5 "Manh tràng", "Dạ dày"; san-dai-bo-3 "Ấu trùng", "Nang ấu trùng"; san-dai-bo-4 "30 nhánh", "40 nhánh" (chọn số lớn hơn vì "hơn 7/9 nhánh" cũng đúng về mặt chữ). Đáp án đúng không đổi. |

## Đánh số lại
- san-la-lon-gan: câu hỏi trong tài liệu đánh số 4–8 (nối tiếp danh sách tự động của phần lý thuyết), đáp án đánh 1–5 → web đánh lại 1–5 theo thứ tự.

## Lý thuyết (content/lessons) — chỗ tài liệu gốc có vẻ sai
- sot-ret: phân liệt gan "30-710 µm" → ghi 30 – 70 µm; số mảnh trùng *P. falciparum* "50.000-30.000" → 30.000 – 50.000; vùng sốt rét lưu hành vừa "30%" → 3,00% (để tổng = 100%); câu về tuổi hồng cầu bị lặp tên loài → giữ ý chắc chắn, có hộp cảnh báo. Mỗi chỗ đều có ghi chú ngay trong bài.
- san-dai-heo: kích thước nang ấu trùng "dài # 5 mm, rộng # 8 – 10 mm" (rộng > dài, có thể đảo số) → giữ nguyên, có ghi chú; câu dịch tễ "Đông Nam Á (Thái Lan, VN heo nên ở đó K nhiễm…" bị cắt → ghi chú; tỷ lệ nam/nữ 68,2% và 32,8% (tổng 101%) → ghi chú; liều niclosamide trẻ 2 – 6 tuổi bị bỏ trống trong tài liệu → ghi rõ "tài liệu bỏ trống".
- trichomonas: "tồn tại từ & chục phút", "chỉ sống đc & giây" → ghi "vài chục phút", "vài giây" kèm ghi chú.
- virus-dai: "560C / 3 phút" (mất ký hiệu độ khi chép) → ghi 56°C trong 3 phút. Câu "CĐ … ở các ĐV ngi bị dại cắn người cắn người" → viết lại "động vật nghi bị dại đã cắn người".
- virus-viem-gan: "2,25x106 dalton" → 2,25 × 10⁶ dalton (mất chỉ số trên); "Lamuvidine" giữ nguyên cách viết, có ghi chú tên thường gặp là lamivudine; câu vaccine viêm gan B "đã làm tinh khiết và tiêu diệt HIV" khó hiểu — giữ nguyên, có ghi chú; "Hình 2. Thành phần kháng nguyên trong các thử nghiệm c/đ HCV" được nhắc nhưng tài liệu không kèm hình — có ghi chú trong bài.
- san-la-phoi: tài liệu ghi "Sìn Hổ" → ghi Sìn Hồ (Lai Châu). Đánh số mục trong tài liệu nhảy (1, 2 rồi 5, 6, 7, 8) → đánh số lại.
- san-la-lon-gan: bảng 3 mức lưu hành ghi cả mức 1 – 10% và > 10% là "vùng lưu hành nặng" → mức 1 – 10% ghi là "vừa" (có chú thích *). Mốc "20 – 25°C, 6 – 7 tuần" không rõ giai đoạn → hộp ghi chú. "C.FF" → hiểu là "chẩn đoán"; "F. gignatica" → F. gigantica.
- san-la-nho-gan: tiêu đề "Sán trưởng thành Fasciola spp." chép nhầm từ bài sán lá lớn → hộp ghi chú; "Melaniodes tuberculate" → Melanoides tuberculata.
- san-la-ruot: "Năm 19843" (có thể 1843) → hộp ghi chú; "KW Golddard" → K.W. Goddard; câu "K có thể hình nón" không rõ nghĩa → lược bỏ; kích thước metacercaria "3,9 – 2,1 mm" giữ nguyên như tài liệu.
- giun-kim: liều ivermectine "200-400 mg/kg chia 2 liều" chênh hơn nghìn lần so với "50 – 200 ug/kg" → giữ số liệu, ghi chú nhiều khả năng là µg/kg.
- giun-chi: phôi *B. malayi* "dài #200-23µm" → ghi 200 – 230 µm kèm ghi chú; câu "nhiễm 1 trong 1 loại giun chỉ" → viết lại "một trong các loài *W. bancrofti*, *B. malayi*, *B. timori*".
- balantidium: "Năm 1957 Malmsten" trước "Năm 1863 Stein" → mốc 1957 không hợp lý, có thể là 1857 (ghi chú trong bài, phần đại cương không ghi năm của Malmsten).
- cryptococcus: liều amphotericin B "0.5-10mg/kg/ngày" giữ nguyên kèm cảnh báo, nhiều khả năng là 0,5 – 1,0 mg/kg/ngày; các hình H 1.6-41/43/44 được tham chiếu nhưng không có trong tài liệu.
- nam-ngoai-da: sửa tên loài gõ sai (T. rubram/rubrium, E. floccostum, T. Micrdigitale, T. verrucostum, T. schoenleili, M. canic, "M. cookie" → M. cookei, "M. manum" → M. nanum); M. persicolor nằm ở cả nhóm ưa thú và ưa đất (giữ nguyên); T. rubrum ghi 2 lần trong nhóm ưa người; trùng mục "4.1"; Bảng 45.4 cột trống, Bảng 45.7–45.8 dàn lại theo loài; câu DTM "tăng độ pH của mt 8" bị lỗi chữ.

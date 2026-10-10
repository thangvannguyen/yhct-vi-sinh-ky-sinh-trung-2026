import { cx } from './ui.jsx'

// Icon vẽ riêng cho các bài giun — bộ emoji chỉ có một con giun chung (🪱) nên
// không phân biệt được các loài. Mỗi hình nhấn vào đặc điểm hình thể nhận dạng
// trong tài liệu. Thân giun = nét dày (viền tối vẽ dưới, thân sáng vẽ trên).

const BODY = '#f6b9a6'
const BODY_WHITE = '#fbf8f1'
const EDGE = '#9c4632'
const EDGE_GREY = '#5f584d'

/** Một đoạn thân giun: viền + thân + vệt sáng. */
function Worm({ d, w, body = BODY, edge = EDGE, shine = true }) {
  return (
    <>
      <path d={d} fill="none" stroke={edge} strokeWidth={w + 4.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={body} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {shine && w > 6 && (
        <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth={w * 0.22} strokeLinecap="round" transform="translate(-1 -1.4)" />
      )}
    </>
  )
}


/** Hình khối có viền tối — dùng cho thân sán, đơn bào, virus. */
function Shape({ d, fill, edge, w = 3, ...rest }) {
  return <path d={d} fill={fill} stroke={edge} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" {...rest} />
}

/** Sán lá: thân dẹt hình lá, đĩa hút miệng + đĩa hút bụng. */
function Fluke({ d, fill, edge, oral, ventral, r = 2.6 }) {
  return (
    <>
      <Shape d={d} fill={fill} edge={edge} />
      <circle cx={oral[0]} cy={oral[1]} r={r} fill="none" stroke={edge} strokeWidth="2.2" />
      <circle cx={ventral[0]} cy={ventral[1]} r={r} fill="none" stroke={edge} strokeWidth="2.2" />
    </>
  )
}

/** Con virus: lõi tròn + gai bề mặt. */
function Virion({ cx, cy, r, fill, edge, spikes = 8 }) {
  const out = []
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2
    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r
    const x2 = cx + Math.cos(a) * (r + 5), y2 = cy + Math.sin(a) * (r + 5)
    out.push(<line key={'l' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={edge} strokeWidth="2.4" strokeLinecap="round" />)
    out.push(<circle key={'c' + i} cx={x2} cy={y2} r="2.3" fill={fill} stroke={edge} strokeWidth="1.8" />)
  }
  return (
    <>
      {out}
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={edge} strokeWidth="3" />
    </>
  )
}

/** Dải sán: chuỗi đốt từ đầu sán (scolex) kéo dài ra. */
function Tape({ fill, edge }) {
  const segs = []
  // các đốt to dần về phía đuôi, xếp theo đường chéo cong
  const pts = [[18, 19, 6.5], [24, 25, 7.5], [30.5, 31.5, 8.5], [37.5, 38.5, 9.5], [45, 46, 10.5], [53, 54, 11.5]]
  pts.forEach(([x, y, s], i) =>
    segs.push(
      <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s * 0.9} rx="1.6" fill={fill} stroke={edge} strokeWidth="2.2" transform={`rotate(45 ${x} ${y})`} />
    )
  )
  return segs
}

const ICONS = {
  // Giun đũa: to nhất, thân hình ống dài như chiếc đũa.
  'giun-dua': (
    <>
      <Worm d="M8 52 C 4 34, 22 26, 31 33 S 52 46, 56 24 C 58 13, 50 7, 42 10" w={11} />
      <circle cx="42.5" cy="10.8" r="1.8" fill={EDGE} />
    </>
  ),
  // Giun kim: nhỏ, màu trắng, đuôi giun cái thon dài và nhọn như cây kim.
  'giun-kim': (
    <>
      <path
        d="M33 23 L61 36 L33 35.5 Z"
        fill={BODY_WHITE}
        stroke={EDGE_GREY}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <Worm d="M7 40 C 12 28, 24 27, 35 29" w={12} body={BODY_WHITE} edge={EDGE_GREY} />
      <circle cx="8.6" cy="38.2" r="1.8" fill={EDGE_GREY} />
    </>
  ),
  // Giun tóc: phần đầu mảnh như sợi tóc, phần đuôi phình to cuộn lại — như roi da.
  'giun-toc': (
    <>
      <path d="M33 37 C 40 24, 52 32, 56 18 C 59 8, 49 3, 44 9" fill="none" stroke={EDGE} strokeWidth="4" strokeLinecap="round" />
      <Worm d="M34 38 C 34 52, 20 58, 11 50 C 4 43, 10 33, 19 36" w={12} />
    </>
  ),
  // Giun móc: đầu cong gập như cái móc, miệng có răng; hút máu gây thiếu máu.
  'giun-moc': (
    <>
      <Worm d="M10 55 C 12 41, 28 41, 32 30 C 36 18, 30 9, 21 11" w={11} />
      <g fill="#5c1d12">
        <path d="M18.6 6.4 L15.6 11 L20.2 10.4 Z" />
        <path d="M18.6 16 L15.6 11.6 L20.2 12.2 Z" />
      </g>
      <path d="M50 28 C 50 28, 59 39, 59 45 A 9 9 0 0 1 41 45 C 41 39, 50 28, 50 28 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
      <path d="M45.5 44 A 4.4 4.4 0 0 0 49 49" fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // Giun chỉ: mảnh như sợi chỉ, đực cái cuộn rối vào nhau trong hệ bạch huyết.
  'giun-chi': (
    <Worm
      d="M5 46 C 5 22, 27 20, 27 34 C 27 48, 10 48, 14 34 C 18 20, 42 18, 44 34 C 46 50, 27 52, 31 38 C 35 24, 59 24, 59 46"
      w={4.5}
      body={BODY_WHITE}
      edge={EDGE_GREY}
      shine={false}
    />
  ),
  // Sán lá phổi: sán màu nâu đỏ, trông như hạt cà phê; lây do ăn cua chưa chín.
  'san-la-phoi': (
    <>
      <Shape d="M24 5 C 40 5, 46 22, 42 36 C 38 50, 20 52, 13 40 C 6 27, 10 5, 24 5 Z" fill="#c2603f" edge="#6b2516" />
      <path d="M25 10 C 20 20, 32 26, 26 36 C 23 41, 24 45, 26 47" fill="none" stroke="#f2b39a" strokeWidth="2.6" strokeLinecap="round" />
      <g>
        <Shape d="M44 50 m -10 0 a 10 7.5 0 1 0 20 0 a 10 7.5 0 1 0 -20 0" fill="#f97316" edge="#9a3412" w={2.6} />
        <Shape d="M36 44 C 31 40, 33 34, 37 35 L 36.5 39 L 39.5 37.5 C 40 41, 38.5 43, 36 44 Z" fill="#f97316" edge="#9a3412" w={2.2} />
        <Shape d="M52 44 C 57 40, 55 34, 51 35 L 51.5 39 L 48.5 37.5 C 48 41, 49.5 43, 52 44 Z" fill="#f97316" edge="#9a3412" w={2.2} />
        <circle cx="40.5" cy="48" r="1.4" fill="#431407" />
        <circle cx="47.5" cy="48" r="1.4" fill="#431407" />
      </g>
    </>
  ),
  // Sán lá lớn ở gan: sán to hình chiếc lá, ruột phân nhánh; lây qua rau thủy sinh.
  'san-la-lon-gan': (
    <>
      <Fluke d="M26 4 C 42 8, 46 28, 40 44 C 36 54, 18 54, 14 44 C 8 28, 12 8, 26 4 Z" fill="#eebcaa" edge="#8c4636" oral={[26, 11]} ventral={[26, 21]} />
      <path d="M26 25 L 26 46 M 26 30 L 19 35 M 26 30 L 33 35 M 26 37 L 19 42 M 26 37 L 33 42" fill="none" stroke="#b86a55" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M50 62 C 50 52, 48 46, 44 40" fill="none" stroke="#15803d" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="44" cy="40" r="5" fill="#4ade80" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="54" cy="45" r="5" fill="#4ade80" stroke="#15803d" strokeWidth="2.2" />
      <circle cx="49" cy="53" r="5" fill="#4ade80" stroke="#15803d" strokeWidth="2.2" />
    </>
  ),
  // Sán lá nhỏ ở gan: sán nhỏ hình lá; lây do ăn gỏi cá nước ngọt.
  'san-la-nho-gan': (
    <>
      <Fluke d="M44 4 C 54 7, 56 20, 52 30 C 49 37, 39 37, 36 30 C 32 20, 34 7, 44 4 Z" fill="#e9a58f" edge="#8c4636" oral={[44, 10]} ventral={[44, 19]} r={2.2} />
      <Shape d="M6 50 C 14 38, 34 36, 42 48 C 34 60, 14 60, 6 50 Z" fill="#7dd3fc" edge="#075985" />
      <Shape d="M42 48 L 55 39 L 52.5 48 L 55 57 Z" fill="#7dd3fc" edge="#075985" w={2.6} />
      <circle cx="14" cy="47.5" r="1.8" fill="#082f49" />
      <path d="M22 42 C 25 46, 25 51, 22 55" fill="none" stroke="#075985" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // Sán lá ruột lớn: sán lá to nhất ở người; lây qua cây thủy sinh (rau muống, ngó sen, súng…).
  'san-la-ruot': (
    <>
      <Fluke d="M28 3 C 46 6, 50 26, 44 42 C 40 52, 18 52, 13 42 C 6 26, 10 6, 28 3 Z" fill="#d6b49c" edge="#6f4a33" oral={[28, 10]} ventral={[28, 18]} r={2.4} />
      <path d="M22 24 C 26 28, 22 34, 26 38 M 34 24 C 30 28, 34 34, 30 38" fill="none" stroke="#9a7257" strokeWidth="1.8" strokeLinecap="round" />
      <Shape d="M47 62 A 13 9 0 1 1 61 55 L 49 54 Z" fill="#4ade80" edge="#15803d" w={2.6} />
      <path d="M49 54 L 41 51" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  // Sán dải bò: dải sán gồm nhiều đốt (đốm như bò sữa), đầu không có móc.
  'san-dai-bo': (
    <>
      <Tape fill="#fbf8f1" edge="#4b453c" />
      <g fill="#1f1b16">
        <circle cx="29" cy="30" r="1.8" />
        <circle cx="38.5" cy="37" r="2.2" />
        <circle cx="45" cy="47.5" r="2.6" />
        <circle cx="54.5" cy="53" r="2.4" />
      </g>
      <circle cx="12" cy="12" r="6.5" fill="#fbf8f1" stroke="#4b453c" strokeWidth="2.6" />
      <g fill="none" stroke="#4b453c" strokeWidth="1.6">
        <circle cx="9.6" cy="10.4" r="1.6" />
        <circle cx="14.4" cy="10.4" r="1.6" />
        <circle cx="12" cy="14.4" r="1.6" />
      </g>
    </>
  ),
  // Sán dải heo: dải sán màu hồng, đầu có chủy với vòng móc.
  'san-dai-heo': (
    <>
      <Tape fill="#f9c4c8" edge="#9d3b48" />
      <g stroke="#9d3b48" strokeWidth="2.2" strokeLinecap="round">
        <line x1="12" y1="3" x2="12" y2="6.5" />
        <line x1="5.4" y1="5.6" x2="7.8" y2="8" />
        <line x1="18.6" y1="5.6" x2="16.2" y2="8" />
        <line x1="2.8" y1="12" x2="6.2" y2="12" />
        <line x1="21.2" y1="12" x2="17.8" y2="12" />
      </g>
      <circle cx="12" cy="13" r="6.5" fill="#f9c4c8" stroke="#9d3b48" strokeWidth="2.6" />
      <circle cx="10" cy="13" r="1.3" fill="#9d3b48" />
      <circle cx="14" cy="13" r="1.3" fill="#9d3b48" />
      <Shape d="M50 52 m -9 0 a 9 7 0 1 0 18 0 a 9 7 0 1 0 -18 0" fill="#f9a8b4" edge="#9d3b48" w={2.6} />
      <ellipse cx="46.5" cy="52" rx="1.8" ry="2.6" fill="#9d3b48" />
      <ellipse cx="53.5" cy="52" rx="1.8" ry="2.6" fill="#9d3b48" />
    </>
  ),
  // Trichomonas: trùng roi hình quả lê, 4 roi phía trước, màng lượn sóng, trục sống nhô ra ở đuôi.
  trichomonas: (
    <>
      <path d="M26 20 C 20 12, 14 12, 8 6 M 29 18 C 26 10, 22 6, 18 2 M 34 18 C 36 10, 40 6, 44 3 M 37 20 C 42 14, 48 13, 55 9" fill="none" stroke="#0f766e" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M32 52 L 33 62" stroke="#0f766e" strokeWidth="2.6" strokeLinecap="round" />
      <Shape d="M32 17 C 44 17, 48 30, 44 40 C 41 48, 36 53, 32 53 C 28 53, 23 48, 20 40 C 16 30, 20 17, 32 17 Z" fill="#99f6e4" edge="#0f766e" />
      <path d="M44 24 C 49 28, 45 32, 49 36 C 52 40, 47 44, 50 48" fill="none" stroke="#0f766e" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="31" cy="27" rx="5" ry="6.5" fill="#5eead4" stroke="#0f766e" strokeWidth="2.2" />
      <path d="M31 33 L 32 50" stroke="#0f766e" strokeWidth="1.8" strokeDasharray="2 2.4" />
    </>
  ),
  // Sốt rét: ký sinh trùng thể nhẫn trong hồng cầu + giao bào hình chuối.
  'sot-ret': (
    <>
      <circle cx="44" cy="20" r="15" fill="#fca5a5" stroke="#991b1b" strokeWidth="3" />
      <path d="M36 22 C 40 14, 48 13, 53 18 C 49 18, 42 19, 36 22 Z" fill="#7e22ce" stroke="#581c87" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="24" cy="40" r="19" fill="#f87171" stroke="#991b1b" strokeWidth="3" />
      <circle cx="24" cy="40" r="10" fill="#fca5a5" />
      <circle cx="24" cy="40" r="6.5" fill="none" stroke="#7e22ce" strokeWidth="2.6" />
      <circle cx="29.4" cy="36.6" r="2.4" fill="#581c87" />
    </>
  ),
  // Virus dại: hình viên đạn, có gai glycoprotein trên vỏ.
  'virus-dai': (
    <g transform="rotate(-35 32 32)">
      <g stroke="#4c1d95" strokeWidth="2.2" strokeLinecap="round">
        {[16, 22, 28, 34, 40].map((x) => (
          <g key={x}>
            <line x1={x} y1="21" x2={x} y2="16" />
            <line x1={x} y1="43" x2={x} y2="48" />
          </g>
        ))}
        <line x1="47" y1="23" x2="51" y2="19" />
        <line x1="47" y1="41" x2="51" y2="45" />
        <line x1="51.5" y1="32" x2="57" y2="32" />
      </g>
      <Shape d="M10 21 L 40 21 C 48 21, 52 26, 52 32 C 52 38, 48 43, 40 43 L 10 43 Z" fill="#c4b5fd" edge="#4c1d95" />
      <path d="M14 26 C 18 38, 22 26, 26 38 C 30 26, 34 38, 38 26 C 41 34, 44 30, 46 32" fill="none" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  // Virus viêm gan: lá gan + hạt virus.
  'virus-viem-gan': (
    <>
      <Shape d="M6 26 C 6 14, 24 10, 40 12 C 54 14, 60 20, 56 28 C 52 36, 40 40, 30 46 C 22 51, 14 50, 10 42 C 7 37, 6 32, 6 26 Z" fill="#c2603f" edge="#6b2516" />
      <path d="M33 13 C 30 22, 30 30, 33 40" fill="none" stroke="#6b2516" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 22 C 16 18, 22 16, 26 16" fill="none" stroke="#f2b39a" strokeWidth="2.4" strokeLinecap="round" />
      <Virion cx={47} cy={46} r={7.5} fill="#fde047" edge="#854d0e" spikes={8} />
    </>
  ),

  // ---- Icon chế độ học (trang chủ, nút) — cùng phong cách với icon bài ----
  // Học tập: quyển sách mở.
  'hoc-tap': (
    <>
      <Shape d="M32 14 C 24 8, 12 8, 5 11 L 5 52 C 12 49, 24 49, 32 55 C 40 49, 52 49, 59 52 L 59 11 C 52 8, 40 8, 32 14 Z" fill="#3b82f6" edge="#1e3a8a" />
      <Shape d="M32 16 C 25 11, 15 11, 9 13 L 9 47 C 15 45, 25 45, 32 50 Z" fill="#ffffff" edge="#1e3a8a" w={2.6} />
      <Shape d="M32 16 C 39 11, 49 11, 55 13 L 55 47 C 49 45, 39 45, 32 50 Z" fill="#ffffff" edge="#1e3a8a" w={2.6} />
      <g stroke="#93c5fd" strokeWidth="2.4" strokeLinecap="round">
        <line x1="14" y1="21" x2="27" y2="22" />
        <line x1="14" y1="28" x2="27" y2="29" />
        <line x1="14" y1="35" x2="24" y2="35.6" />
        <line x1="37" y1="22" x2="50" y2="21" />
        <line x1="37" y1="29" x2="50" y2="28" />
        <line x1="37" y1="35.6" x2="47" y2="35" />
      </g>
    </>
  ),
  // Kiểm tra thử: bảng kẹp giấy có danh sách đánh dấu đúng + bút chì.
  'kiem-tra': (
    <>
      <Shape d="M10 9 L 46 9 Q 50 9, 50 13 L 50 57 Q 50 61, 46 61 L 10 61 Q 6 61, 6 57 L 6 13 Q 6 9, 10 9 Z" fill="#d6a46c" edge="#78461f" />
      <Shape d="M12 15 L 44 15 L 44 55 L 12 55 Z" fill="#ffffff" edge="#78461f" w={2.4} />
      <Shape d="M19 5 L 37 5 L 37 13 L 19 13 Z" fill="#94a3b8" edge="#334155" w={2.4} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 24 L 19 27 L 24 21" stroke="#16a34a" strokeWidth="2.8" />
        <path d="M16 35 L 19 38 L 24 32" stroke="#16a34a" strokeWidth="2.8" />
        <path d="M16.5 43.5 L 22.5 49.5 M 22.5 43.5 L 16.5 49.5" stroke="#dc2626" strokeWidth="2.8" />
        <g stroke="#cbd5e1" strokeWidth="2.4">
          <line x1="28" y1="24" x2="39" y2="24" />
          <line x1="28" y1="35" x2="39" y2="35" />
          <line x1="28" y1="46.5" x2="36" y2="46.5" />
        </g>
      </g>
      <g transform="translate(-5 3) rotate(35 50 38)">
        <Shape d="M46 18 L 54 18 L 54 50 L 50 57 L 46 50 Z" fill="#facc15" edge="#854d0e" w={2.4} />
        <path d="M46 50 L 54 50" stroke="#854d0e" strokeWidth="2" />
        <Shape d="M46 18 L 54 18 L 54 23 L 46 23 Z" fill="#f472b6" edge="#854d0e" w={2.2} />
      </g>
    </>
  ),
  // Ôn tuần tự: chồng thẻ câu hỏi, lật lần lượt.
  'on-tuan-tu': (
    <>
      <Shape d="M16 6 L 50 6 Q 54 6, 54 10 L 54 40 Q 54 44, 50 44 L 16 44 Q 12 44, 12 40 L 12 10 Q 12 6, 16 6 Z" fill="#bfdbfe" edge="#1e3a8a" w={2.6} />
      <Shape d="M10 14 L 44 14 Q 48 14, 48 18 L 48 50 Q 48 54, 44 54 L 10 54 Q 6 54, 6 50 L 6 18 Q 6 14, 10 14 Z" fill="#ffffff" edge="#1e3a8a" />
      <path d="M20 27 C 20 21, 34 21, 34 27 C 34 32, 27 32, 27 37" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="27" cy="44" r="2.2" fill="#2563eb" />
      <path d="M36 57 L 55 57 M 49 51 L 55 57 L 49 63" fill="none" stroke="#14532d" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 57 L 55 57 M 49 51 L 55 57 L 49 63" fill="none" stroke="#4ade80" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Ôn câu sai: vòng mũi tên ôn lại quanh dấu sai.
  'on-cau-sai': (
    <>
      <path d="M44.9 16.7 A 20 20 0 1 0 50.8 38.8" fill="none" stroke="#1e3a8a" strokeWidth="8" strokeLinecap="round" />
      <path d="M44.9 16.7 A 20 20 0 1 0 50.8 38.8" fill="none" stroke="#60a5fa" strokeWidth="3.8" strokeLinecap="round" />
      <Shape d="M53.5 31 L 57.5 45 L 44.5 41 Z" fill="#60a5fa" edge="#1e3a8a" w={2.6} />
      <circle cx="32" cy="32" r="11" fill="#fecaca" stroke="#991b1b" strokeWidth="2.8" />
      <path d="M27.5 27.5 L 36.5 36.5 M 36.5 27.5 L 27.5 36.5" stroke="#dc2626" strokeWidth="3.2" strokeLinecap="round" />
    </>
  ),

  // Chúc mừng (thay 🎉): pháo giấy hình nón bắn hoa giấy.
  'chuc-mung': (
    <>
      <Shape d="M6 58 L 20 22 L 42 44 Z" fill="#facc15" edge="#854d0e" />
      <path d="M11.5 44 L 26 52 M 15.5 33.5 L 34 48" stroke="#ef4444" strokeWidth="3.2" strokeLinecap="round" />
      <Shape d="M20 22 C 26 19, 40 33, 42 44 C 36 44, 22 30, 20 22 Z" fill="#fde68a" edge="#854d0e" w={2.6} />
      <g strokeLinecap="round" strokeWidth="3.4" fill="none">
        <path d="M30 14 C 32 9, 28 6, 31 2" stroke="#3b82f6" />
        <path d="M46 26 C 51 24, 54 28, 59 26" stroke="#ec4899" />
        <path d="M40 16 L 46 8" stroke="#22c55e" />
      </g>
      <circle cx="52" cy="14" r="3" fill="#a855f7" />
      <circle cx="56" cy="40" r="2.6" fill="#f97316" />
      <circle cx="22" cy="8" r="2.4" fill="#22c55e" />
      <Shape d="M47 46 l 2 4 l 4.4 0.6 l -3.2 3 l 0.8 4.4 l -4 -2.1 l -4 2.1 l 0.8 -4.4 l -3.2 -3 l 4.4 -0.6 Z" fill="#3b82f6" edge="#1e3a8a" w={1.8} />
    </>
  ),
  // Khá (thay 👍): huy chương có dải ruy băng.
  'khen': (
    <>
      <Shape d="M18 4 L 30 4 L 36 24 L 26 28 Z" fill="#3b82f6" edge="#1e3a8a" w={2.6} />
      <Shape d="M46 4 L 34 4 L 28 24 L 38 28 Z" fill="#60a5fa" edge="#1e3a8a" w={2.6} />
      <circle cx="32" cy="40" r="17" fill="#fbbf24" stroke="#92400e" strokeWidth="3" />
      <circle cx="32" cy="40" r="11.5" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
      <path d="M32 31.5 l 2.6 5.3 l 5.8 0.8 l -4.2 4.1 l 1 5.8 l -5.2 -2.7 l -5.2 2.7 l 1 -5.8 l -4.2 -4.1 l 5.8 -0.8 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="1.8" strokeLinejoin="round" />
    </>
  ),

  // Balantidium coli: trùng lông hình bầu dục, lông tơ phủ quanh thân, nhân lớn hình hạt đậu.
  balantidium: (
    <>
      <g stroke="#92400e" strokeWidth="2.2" strokeLinecap="round">
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2
          const rx = 20, ry = 23.5
          const x1 = 32 + Math.cos(a) * rx, y1 = 33 + Math.sin(a) * ry
          const x2 = 32 + Math.cos(a) * (rx + 5), y2 = 33 + Math.sin(a) * (ry + 5)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>
      <ellipse cx="32" cy="33" rx="20" ry="23.5" fill="#fde68a" stroke="#92400e" strokeWidth="3" />
      <path d="M26 11.5 C 28 18, 36 18, 38 11.5" fill="#fef3c7" stroke="#92400e" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 28 C 22 20, 40 20, 41 29 C 42 36, 39 44, 31 43 C 26 42, 30 36, 26 34 C 23 33, 22 31, 22 28 Z" fill="#a78bfa" stroke="#4c1d95" strokeWidth="2.4" />
      <circle cx="27.5" cy="38.5" r="2.6" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="1.6" />
      <circle cx="40" cy="48" r="3" fill="#fef3c7" stroke="#92400e" strokeWidth="1.8" />
    </>
  ),
  // Cryptococcus: nhuộm mực Tàu — tế bào hạt men nằm trong nang dày sáng trên nền đen.
  cryptococcus: (
    <>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#1f2937" stroke="#0f172a" strokeWidth="3" />
      <circle cx="24" cy="26" r="13" fill="#f8fafc" />
      <circle cx="24" cy="26" r="6.5" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="2" />
      <circle cx="29.5" cy="21" r="3" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="1.6" />
      <circle cx="43" cy="43" r="11" fill="#f8fafc" />
      <circle cx="43" cy="43" r="5.5" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="2" />
      <circle cx="47" cy="17" r="6" fill="#f8fafc" />
      <circle cx="47" cy="17" r="2.8" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="1.6" />
    </>
  ),
  // Vi nấm ngoài da: sang thương hình vòng (bờ đỏ, giữa lành) + bào tử đính lớn hình thoi có vách ngăn.
  'nam-ngoai-da': (
    <>
      <rect x="3" y="3" width="50" height="50" rx="13" fill="#fcd9bd" stroke="#b45309" strokeWidth="2.6" />
      <circle cx="26" cy="26" r="15" fill="#fde8d7" stroke="#dc2626" strokeWidth="5" strokeDasharray="5 2.2" />
      <circle cx="26" cy="26" r="15" fill="none" stroke="#991b1b" strokeWidth="1.4" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-4 0)">
        <path d="M34 60 C 40 52, 44 48, 52 44 M 44 49 C 46 42, 46 38, 44 33 M 52 44 C 56 38, 60 36, 62 30 M 49 46 L 60 52" stroke="#14532d" strokeWidth="6" />
        <path d="M34 60 C 40 52, 44 48, 52 44 M 44 49 C 46 42, 46 38, 44 33 M 52 44 C 56 38, 60 36, 62 30 M 49 46 L 60 52" stroke="#4ade80" strokeWidth="2.6" />
      </g>
      <g fill="#14532d" transform="translate(-4 0)">
        <circle cx="38.5" cy="55.5" r="1.3" />
        <circle cx="45.4" cy="40.5" r="1.3" />
        <circle cx="57.5" cy="38.5" r="1.3" />
      </g>
    </>
  ),
  // Phần Vi sinh: một hạt virus.
  virus: <Virion cx={32} cy={32} r={14} fill="#93c5fd" edge="#1e3a8a" spikes={8} />,
}

/**
 * Icon của một bài: "svg:<tên>" → hình vẽ trong ICONS, còn lại là emoji.
 * Kích thước theo cỡ chữ (1em) nên đặt thẳng vào chỗ trước đây là emoji.
 */
export default function LessonIcon({ icon, className }) {
  if (typeof icon === 'string' && icon.startsWith('svg:')) {
    const art = ICONS[icon.slice(4)]
    if (art) {
      return (
        <svg
          viewBox="0 0 64 64"
          width="1.45em"
          height="1.45em"
          aria-hidden
          className={cx('inline-block flex-shrink-0 align-[-0.35em]', className)}
        >
          {art}
        </svg>
      )
    }
  }
  return <span className={className}>{icon}</span>
}

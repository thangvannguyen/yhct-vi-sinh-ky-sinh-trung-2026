/**
 * Sơ đồ chu trình phát triển, viết trong Markdown bằng khối ```cycle:
 *
 *   @ Tiêu đề sơ đồ                 (tuỳ chọn)
 *   Giun trưởng thành ở ruột non    ← một bước
 *   -> theo phân ra ngoài           ← nhãn trên mũi tên tới bước kế tiếp
 *   Trứng ở đất ẩm
 *   ~> nuốt phải → quay lại bước 1  ← dòng cuối: mũi tên khép vòng
 *
 * Bước có thể ghi "[Người] ..." để gắn nhãn nơi diễn ra (ký chủ / ngoại cảnh).
 * Dạng dọc, đọc từ trên xuống — dễ đọc trên điện thoại hơn sơ đồ vòng tròn.
 */
/**
 * Mũi tên dọc nằm đúng giữa cột số thứ tự (rộng 28px, cùng cột với vòng số).
 * Thân mũi tên là một vạch kéo dài theo chiều cao của nhãn bên cạnh — không dùng
 * ký tự "↓" vì vị trí của ký tự lệch theo font.
 */
function Arrow() {
  return (
    <span className="flex w-[28px] flex-shrink-0 flex-col items-center py-0.5" aria-hidden>
      <span className="min-h-[14px] w-[2px] flex-1 rounded-full bg-primary" />
      <svg width="12" height="7" viewBox="0 0 12 7" className="-mt-[1px] text-primary">
        <path d="M1 1 L6 6 L11 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export default function CycleDiagram({ source }) {
  let title = null
  let loop = null
  const steps = []
  let pendingArrow = null
  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('@')) title = line.slice(1).trim()
    else if (line.startsWith('~>')) loop = line.slice(2).trim()
    else if (line.startsWith('->')) pendingArrow = line.slice(2).trim()
    else {
      const m = line.match(/^\[([^\]]+)\]\s*(.*)$/)
      steps.push({ place: m ? m[1] : null, text: m ? m[2] : line, arrow: pendingArrow })
      pendingArrow = null
    }
  }

  return (
    <figure className="my-6 rounded-[16px] border border-border bg-surface-2 px-4 py-4 sm:px-5">
      {title && (
        <figcaption className="mb-3 flex items-center gap-1.5 text-[0.8em] font-bold uppercase tracking-[0.03em] text-primary">
          <span>🔄</span> {title}
        </figcaption>
      )}
      <ol className="!m-0 !list-none !p-0">
        {steps.map((s, i) => (
          <li key={i} className="!m-0">
            {i > 0 && (
              <div className="flex items-stretch gap-2.5">
                <Arrow />
                {s.arrow && (
                  <span className="self-center py-1.5 text-[0.84em] italic leading-snug text-text-muted">{s.arrow}</span>
                )}
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <span className="mt-[2px] flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-full bg-primary text-[0.78em] font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 rounded-[11px] border border-border bg-surface px-3 py-2 text-[0.94em] leading-snug">
                {s.place && (
                  <span className="mr-1.5 inline-block rounded-full bg-primary-soft px-2 py-[1px] text-[0.78em] font-bold text-primary-dark">
                    {s.place}
                  </span>
                )}
                {s.text}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {loop && (
        <div className="mt-2 flex items-center gap-2.5 text-[0.86em] font-semibold text-primary">
          <span className="flex w-[28px] flex-shrink-0 justify-center text-[1.3em] leading-none" aria-hidden>
            ↺
          </span>
          <span>{loop}</span>
        </div>
      )}
    </figure>
  )
}

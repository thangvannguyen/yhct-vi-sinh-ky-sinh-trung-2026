import { useState } from 'react'
import { cx } from './ui.jsx'

/**
 * Hai biểu đồ của trang chủ. Vẽ bằng SVG/div thuần — không thêm thư viện biểu đồ
 * nào, vì cả hai hình đều đơn giản và bundle đang là thứ tải về trước khi học được.
 *
 * Màu lấy từ --chart-1 / --chart-2 chứ KHÔNG dùng lại success/danger: cặp xanh lá +
 * đỏ chỉ đạt ΔE 5,0 dưới mắt người mù màu đỏ-lục. Xem chú thích trong index.css.
 */

/** Khung thẻ chung cho cả hai biểu đồ: nhãn ở trên, số lớn, rồi phần hình. */
function ChartCard({ label, value, hint, children }) {
  return (
    <div className="flex flex-col rounded-card border border-border bg-surface p-4 shadow-soft-sm">
      <div className="mb-0.5 text-[0.78rem] font-semibold text-text-muted">{label}</div>
      <div className="mb-3 flex items-baseline gap-1.5">
        <span className="text-[1.45rem] font-extrabold leading-none tracking-[-0.02em] text-text">
          {value}
        </span>
        {hint && <span className="text-[0.78rem] text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

/** Chú giải: ô màu mang danh tính, chữ luôn dùng màu chữ thường. */
function LegendItem({ color, name, count }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]" style={{ background: color }} />
      <span className="text-text-muted">{name}</span>
      <span className="font-semibold text-text">{count}</span>
    </span>
  )
}

function Tooltip({ x, children }) {
  return (
    <div
      className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[0.76rem] shadow-float"
      style={{ left: `${x}%` }}
    >
      {children}
    </div>
  )
}

/**
 * Tiến độ ôn tập — thanh xếp chồng ngang (part-to-whole trên tổng đã biết).
 * Phần "chưa học" là nền của thanh chứ không phải một lớp dữ liệu, nên nó mang
 * màu viền nhạt thay vì một màu riêng.
 */
export function ProgressMeter({ mastered, review, total }) {
  const [hover, setHover] = useState(null)
  const unseen = Math.max(0, total - mastered - review)
  const studied = mastered + review
  const pct = (n) => (total ? (n / total) * 100 : 0)

  const segments = [
    { key: 'mastered', name: 'Đã thuộc', count: mastered, color: 'var(--chart-1)',
      desc: 'câu trả lời đúng ở lần gần nhất' },
    { key: 'review', name: 'Cần ôn', count: review, color: 'var(--chart-2)',
      desc: 'câu trả lời sai ở lần gần nhất' },
  ].filter((s) => s.count > 0)

  return (
    <ChartCard
      label="Tiến độ ôn tập"
      value={`${studied}/${total}`}
      hint={`câu · ${Math.round(pct(studied))}%`}
    >
      {/* giãn ra chiếm hết chỗ trống: thanh nằm giữa, chú giải tụt xuống đáy thẻ,
          nhờ vậy thẻ này cao bằng thẻ biểu đồ điểm bên cạnh mà không hở một mảng trống */}
      <div className="relative flex flex-1 flex-col justify-center">
        {hover && (
          <Tooltip x={hover.x}>
            <span className="font-semibold">{hover.name}</span>
            <span className="text-text-muted">
              {' '}— {hover.count} câu ({Math.round(pct(hover.count))}%)
            </span>
          </Tooltip>
        )}
        {/* vùng chạm cao hơn thanh để dễ rê chuột/chạm trên điện thoại */}
        <div className="-my-2 py-2">
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-border">
            {segments.map((s, i) => (
              <div
                key={s.key}
                onMouseEnter={() =>
                  setHover({ ...s, x: Math.min(92, Math.max(8, pct(
                    segments.slice(0, i).reduce((a, b) => a + b.count, 0) + s.count / 2))) })
                }
                onMouseLeave={() => setHover(null)}
                className={cx('h-full', i > 0 && 'ml-[2px]')}
                style={{ width: `calc(${pct(s.count)}% - ${i > 0 ? 2 : 0}px)`, background: s.color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.76rem]">
        <LegendItem color="var(--chart-1)" name="Đã thuộc" count={mastered} />
        <LegendItem color="var(--chart-2)" name="Cần ôn" count={review} />
        <LegendItem color="var(--border)" name="Chưa học" count={unseen} />
      </div>
    </ChartCard>
  )
}

/**
 * Điểm các lần kiểm tra — đường theo thời gian, một chuỗi duy nhất nên không cần
 * chú giải (tiêu đề đã nói rõ đang vẽ gì).
 */
export function ScoreTrend({ history, accuracy }) {
  const [hover, setHover] = useState(null)
  // history lưu mới-nhất-trước; đảo lại cho đúng trục thời gian, lấy 12 lần gần đây
  const data = history.slice(0, 12).reverse()

  if (!data.length) {
    return (
      <ChartCard label="Điểm các lần kiểm tra" value="—" hint="chưa có lần nào">
        <p className="m-0 flex-1 text-[0.8rem] leading-relaxed text-text-muted">
          Làm thử một bài kiểm tra, điểm từng lần sẽ được vẽ lại ở đây để bạn theo dõi
          mình tiến bộ tới đâu.
        </p>
      </ChartCard>
    )
  }

  // Lề phải đủ cho bán kính chấm (4,5) cộng vành 2px, nếu không chấm đầu/cuối bị cắt ở mép.
  const W = 320, H = 96, PAD_X = 9, PAD_T = 10, PAD_B = 8
  const n = data.length
  const x = (i) => (n === 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (n - 1))
  const y = (p) => PAD_T + ((100 - p) * (H - PAD_T - PAD_B)) / 100
  const pts = data.map((d, i) => [x(i), y(d.percent)])
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
  const area = `${line} L${pts[n - 1][0].toFixed(1)} ${H - PAD_B} L${pts[0][0].toFixed(1)} ${H - PAD_B} Z`
  const last = data[n - 1]

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    let best = 0
    pts.forEach(([px], i) => { if (Math.abs(px - vx) < Math.abs(pts[best][0] - vx)) best = i })
    setHover(best)
  }

  return (
    <ChartCard
      label="Điểm các lần kiểm tra"
      value={`${last.percent}%`}
      hint={`lần gần nhất · ${accuracy}% chính xác chung`}
    >
      <div className="relative flex-1">
        {hover !== null && (
          <Tooltip x={(pts[hover][0] / W) * 100}>
            <span className="font-semibold">{data[hover].percent}%</span>
            <span className="text-text-muted">
              {' '}— {data[hover].correct}/{data[hover].total} câu
            </span>
          </Tooltip>
        )}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 'auto' }}
          role="img"
          aria-label={`Điểm ${n} lần kiểm tra gần nhất, lần gần nhất ${last.percent}%`}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          {/* lưới mốc 0 / 50 / 100% — mảnh, liền nét, lùi về sau */}
          {[0, 50, 100].map((p) => (
            <line key={p} x1="0" x2={W} y1={y(p)} y2={y(p)}
              stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill="var(--chart-1)" opacity="0.1" />
          <path d={line} fill="none" stroke="var(--chart-1)" strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {pts.map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={i === hover || i === n - 1 ? 4.5 : 3}
              fill="var(--chart-1)" stroke="var(--surface)" strokeWidth="2"
              vectorEffect="non-scaling-stroke" />
          ))}
          {hover !== null && (
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD_T} y2={H - PAD_B}
              stroke="var(--border-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
        <div className="mt-1 flex justify-between text-[0.7rem] text-text-muted">
          <span>{n === 1 ? 'Lần duy nhất' : `${n} lần gần nhất`}</span>
          <span>0–100%</span>
        </div>
      </div>

      {/* Bảng số liệu cho trình đọc màn hình — biểu đồ không phải kênh duy nhất. */}
      <table className="sr-only">
        <caption>Điểm các lần kiểm tra gần nhất</caption>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">Lần {i + 1}</th>
              <td>{d.percent}% ({d.correct}/{d.total} câu)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  )
}

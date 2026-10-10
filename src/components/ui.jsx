import { useRef } from 'react'
import { Link } from 'react-router-dom'

function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

const BTN_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-[13px] px-[18px] py-[11px] text-[0.95rem] font-semibold cursor-pointer transition-[background,border-color,filter,transform] duration-150 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none'

const BTN_VARIANTS = {
  default:
    'border border-border bg-surface text-text hover:bg-primary-soft hover:border-border-strong',
  primary:
    'bg-primary-grad text-white border border-transparent shadow-primary hover:brightness-105',
  ghost: 'bg-transparent border border-transparent text-text hover:bg-primary-soft',
}

export function Button({ variant = 'default', block, className, as, to, ...props }) {
  const cls = cx(BTN_BASE, BTN_VARIANTS[variant], block && 'w-full', className)
  if (to) return <Link to={to} className={cls} {...props} />
  const Comp = as || 'button'
  return <Comp className={cls} {...props} />
}

export function Container({ wide, className, ...props }) {
  return (
    <div
      className={cx('mx-auto', wide ? 'max-w-[1080px]' : 'max-w-[820px]', className)}
      {...props}
    />
  )
}

export function Card({ className, as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={cx(
        'bg-surface border border-border rounded-card shadow-soft p-5',
        className
      )}
      {...props}
    />
  )
}

export function SectionTitle({ children, className }) {
  return (
    <h2
      className={cx(
        'text-[0.85rem] font-bold uppercase tracking-[0.04em] text-text-muted mt-7 mb-3 first:mt-0',
        className
      )}
    >
      {children}
    </h2>
  )
}

export function Pill({ children, className }) {
  return (
    <span
      className={cx(
        'inline-block px-2.5 py-[3px] rounded-full text-[0.75rem] font-bold bg-primary-soft text-primary-dark',
        className
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ percent, className }) {
  return (
    <div className={cx('h-2 rounded-full bg-border overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-primary-grad transition-[width] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export function BackLink({ to, onClick, children = '← Quay lại' }) {
  const cls =
    'inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-text-muted hover:text-primary mb-4 cursor-pointer bg-transparent border-0 p-0'
  if (to) return <Link to={to} className={cls}>{children}</Link>
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

export { cx }

/**
 * Thanh điều hướng dính đáy màn hình. Trên điện thoại, câu hỏi dài + 5 đáp án +
 * phần giải thích thường vượt quá một màn, nên nút "Câu sau" nếu nằm cuối trang
 * sẽ buộc người học cuộn xuống sau mỗi câu. Dính đáy thì luôn với tới được.
 *
 * Dùng `sticky` chứ không `fixed`: nó vẫn nằm trong luồng tài liệu nên không cần
 * chừa padding giả ở dưới, và trên màn hình rộng nó tự nằm ở cuối nội dung.
 */
export function StickyBar({ children, className }) {
  return (
    <div
      className={cx(
        'sticky bottom-0 z-20 -mx-3 mt-4 border-t border-border px-3 pt-3 backdrop-blur-md backdrop-saturate-150 sm:-mx-[18px] sm:px-[18px]',
        className
      )}
      style={{
        background: 'color-mix(in srgb, var(--bg) 85%, transparent)',
        // chừa chỗ cho thanh home indicator của iPhone
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Vuốt ngang để sang câu trước / câu sau — thao tác tự nhiên nhất trên điện thoại.
 * Bỏ qua khi người dùng đang cuộn dọc hoặc khi vuốt quá ngắn.
 */
export function useSwipe(onLeft, onRight) {
  const start = useRef(null)
  return {
    onTouchStart: (e) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      start.current = null
      // phải đi ngang rõ rệt và ngang nhiều hơn dọc, nếu không là đang cuộn trang
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
      dx < 0 ? onLeft?.() : onRight?.()
    },
  }
}

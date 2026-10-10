import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/store.jsx'
import { cx } from './ui.jsx'
import { chapterShortOf } from '../lib/data.js'

const SITE_NAME = 'Vi Sinh – Ký Sinh Trùng 10-2026'

function ModeToggle() {
  const { mode, setMode } = useApp()
  const opts = [
    { id: 'simple', label: 'Đơn giản' },
    { id: 'full', label: 'Đầy đủ' },
  ]
  const other = mode === 'simple' ? 'full' : 'simple'
  return (
    <>
      {/* Điện thoại: một nút đổi qua lại. Hai ô "Đơn giản / Đầy đủ" chiếm mất
          khoảng 90px — đúng phần chỗ cần để hiện tên môn trên thanh đầu trang. */}
      <button
        onClick={() => setMode(other)}
        title={`Đang ở chế độ ${mode === 'simple' ? 'Đơn giản' : 'Đầy đủ'} — bấm để đổi`}
        aria-label="Đổi chế độ hiển thị"
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-border bg-surface text-text-muted transition-colors hover:bg-primary-soft cursor-pointer min-[470px]:hidden"
      >
        {mode === 'simple' ? (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    <div
      role="tablist"
      aria-label="Chế độ hiển thị"
      className="hidden gap-0.5 rounded-[11px] border border-border bg-bg p-[3px] min-[470px]:flex"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={mode === o.id}
          onClick={() => setMode(o.id)}
          className={cx(
            'rounded-lg px-3 py-[7px] text-[0.8rem] font-semibold transition-colors cursor-pointer',
            mode === o.id
              ? 'bg-surface text-primary shadow-soft-sm'
              : 'text-text-muted hover:text-text'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
    </>
  )
}

function ExplainToggle() {
  const { autoExplain, toggleAutoExplain } = useApp()
  return (
    <button
      onClick={toggleAutoExplain}
      aria-pressed={autoExplain}
      title={
        autoExplain
          ? 'Đang tự hiện giải thích & mẹo sau khi trả lời — bấm để tắt'
          : 'Không tự hiện giải thích — bấm để bật'
      }
      aria-label="Bật/tắt tự hiện giải thích"
      className={cx(
        'flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border text-base transition-colors cursor-pointer',
        autoExplain
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-border bg-surface text-text-muted opacity-60 hover:opacity-100 hover:bg-primary-soft'
      )}
    >
      💡
    </button>
  )
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useApp()
  return (
    <button
      onClick={toggleTheme}
      title="Đổi giao diện sáng/tối"
      aria-label="Đổi giao diện"
      className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] border border-border bg-surface text-base transition-colors hover:bg-primary-soft hover:border-border-strong cursor-pointer"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

function ScrollTopButton() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.pageYOffset > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className={cx(
        'fixed right-5 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-10 flex h-[46px] w-[46px] items-center justify-center rounded-full border-0 bg-primary-grad text-white shadow-primary cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95 max-[470px]:right-3',
        show ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-3.5 scale-90'
      )}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V6M6 12l6-6 6 6" />
      </svg>
    </button>
  )
}

const PAGE_TITLES = [
  { test: (p) => p === '/', title: 'Trang chủ' },
  { test: (p) => p.startsWith('/review-wrong'), title: 'Ôn tập câu sai' },
  { test: (p) => p.startsWith('/quiz-setup'), title: 'Thiết lập ôn tập' },
  { test: (p) => p.startsWith('/quiz-result'), title: 'Kết quả' },
  { test: (p) => p.startsWith('/quiz'), title: 'Làm bài' },
  { test: (p) => p === '/learn', title: 'Học tập' },
]

function pageTitleFor(pathname) {
  const learnMatch = pathname.match(/^\/learn\/([^/]+)/)
  if (learnMatch) {
    const name = chapterShortOf(decodeURIComponent(learnMatch[1]))
    return name ? `Bài học — ${name}` : 'Học tập'
  }
  const studyMatch = pathname.match(/^\/study\/([^/]+)/)
  if (studyMatch) {
    const chapterId = decodeURIComponent(studyMatch[1])
    const chapterName = chapterId === 'all' ? 'Ôn tuần tự' : chapterShortOf(chapterId)
    return chapterName ? `Ôn câu hỏi — ${chapterName}` : 'Ôn câu hỏi'
  }
  return PAGE_TITLES.find((r) => r.test(pathname))?.title || SITE_NAME
}

export default function Layout() {
  const { pathname } = useLocation()
  // Nút "Đơn giản/Đầy đủ" và 💡 chỉ có tác dụng với phần câu hỏi — ẩn khi đọc bài
  // để thanh đầu trang gọn hơn trên điện thoại.
  const onLearn = pathname.startsWith('/learn')

  // Scroll to top on route change so a new page never starts mid-scroll.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Update the document title and send a page_view to GA4 on every route change
  // (client-side routing doesn't reload the page, so GA can't detect navigation
  // on its own). gtag chỉ tồn tại khi đã dán Measurement ID vào index.html.
  useEffect(() => {
    const title = `${pageTitleFor(pathname)} — ${SITE_NAME}`
    document.title = title
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_path: pathname,
        page_location: window.location.href,
      })
    }
  }, [pathname])

  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border px-5 py-[13px] backdrop-blur-md backdrop-saturate-150 max-[470px]:px-3 max-[470px]:py-2.5"
        style={{
          background: 'color-mix(in srgb, var(--surface) 78%, transparent)',
          paddingTop: 'max(13px, env(safe-area-inset-top, 0px))',
        }}
      >
        <Link to="/" className="inline-flex min-w-0 items-center gap-2.5 whitespace-nowrap font-extrabold text-[0.98rem] tracking-[-0.01em] text-text no-underline sm:text-[1.05rem]">
          <span
            className="h-[30px] w-[30px] flex-shrink-0 rounded-[9px] bg-center bg-cover max-[470px]:h-[27px] max-[470px]:w-[27px]"
            style={{ backgroundImage: 'url(./favicon.svg)', boxShadow: '0 3px 8px -3px rgba(37,99,235,0.55)' }}
          />
          <span className="truncate">Vi Sinh – KST</span>
          <span className="text-primary max-[470px]:hidden"> 10-2026</span>
        </Link>
        <div className="flex items-center gap-2.5 max-[470px]:gap-1.5">
          {!onLearn && <ModeToggle />}
          {!onLearn && <ExplainToggle />}
          <ThemeToggle />
        </div>
      </header>

      <main className="px-3 pt-5 pb-10 sm:px-[18px] sm:pt-6 sm:pb-16">
        <Outlet />
      </main>

      <ScrollTopButton />
    </>
  )
}

import { memo, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { lessonImage, parseHeading } from '../lib/lessons.js'
import { cx } from './ui.jsx'
import CycleDiagram from './CycleDiagram.jsx'
import LessonIcon from './LessonIcon.jsx'

function textOf(node) {
  if (!node) return ''
  if (node.type === 'text' || node.type === 'inlineCode') return node.value
  return (node.children || []).map(textOf).join('')
}

/**
 * remark plugin:
 *  - heading "Tiêu đề {#id}" → <h2 id="id">Tiêu đề</h2> (id tự sinh nếu thiếu),
 *    cùng quy tắc với lessonOutline() nên mục lục và liên kết luôn khớp.
 *  - blockquote mở đầu bằng [!KEY] / [!TIP] / [!WARN] / [!NOTE] → hộp ghi chú.
 */
function remarkLesson() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'heading' && node.depth <= 3) {
        const last = node.children[node.children.length - 1]
        const { id } = parseHeading(textOf(node))
        if (last && last.type === 'text') last.value = last.value.replace(/\s*\{#[a-z0-9-]+\}\s*$/, '')
        node.data = { ...(node.data || {}), hProperties: { id } }
      }
      if (node.type === 'blockquote') {
        const para = node.children[0]
        const first = para && para.type === 'paragraph' ? para.children[0] : null
        const m = first && first.type === 'text' && first.value.match(/^\[!(KEY|TIP|WARN|NOTE)\][ \t]*([^\n]*)\n?/)
        if (m) {
          first.value = first.value.slice(m[0].length)
          if (!first.value) para.children.shift()
          if (!para.children.length) node.children.shift()
          node.data = {
            ...(node.data || {}),
            hProperties: { 'data-callout': m[1].toLowerCase(), 'data-title': m[2].trim() },
          }
        }
      }
      ;(node.children || []).forEach(walk)
    }
    walk(tree)
  }
}

const CALLOUT = {
  key: { icon: 'svg:ghim', title: 'Ý chính cần nhớ', box: 'border-primary bg-primary-soft', head: 'text-primary-dark' },
  tip: { icon: 'svg:nao', title: 'Mẹo ghi nhớ', box: 'border-warning bg-warning-soft', head: 'text-warning' },
  warn: { icon: 'svg:canh-bao', title: 'Dễ nhầm', box: 'border-danger bg-danger-soft', head: 'text-danger' },
  note: { icon: 'svg:thong-tin', title: 'Ghi chú', box: 'border-border-strong bg-surface-2', head: 'text-text-muted' },
}

function Blockquote({ node, children, ...props }) {
  const kind = props['data-callout']
  if (!kind) {
    return (
      <blockquote className="my-4 border-l-4 border-border-strong pl-4 text-text-muted">{children}</blockquote>
    )
  }
  const c = CALLOUT[kind]
  return (
    <aside className={cx('my-5 rounded-[14px] border-[1.5px] px-4 py-3 [&>p]:my-1.5 [&>ul]:my-1.5', c.box)}>
      <div className={cx('mb-1 flex items-center gap-1.5 text-[0.78em] font-bold uppercase tracking-[0.03em]', c.head)}>
        <LessonIcon icon={c.icon} className="text-[1.05em]" /> {props['data-title'] || c.title}
      </div>
      {children}
    </aside>
  )
}

function Pre({ node, children }) {
  const code = node?.children?.[0]
  const cls = code?.properties?.className || []
  if (cls.includes('language-cycle')) {
    return <CycleDiagram source={textOf(code).replace(/\n$/, '')} />
  }
  return <pre className="my-4 overflow-x-auto rounded-[12px] bg-surface-2 p-4 text-[0.88em]">{children}</pre>
}

function Table({ node, ...props }) {
  return (
    <div className="table-wrap sh-scroll">
      <table {...props} />
    </div>
  )
}

/** Ảnh phóng to toàn màn hình — bấm nền hoặc Esc để đóng. */
function Lightbox({ url, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-3 sm:p-8"
    >
      <img src={url} alt={alt} className="max-h-full max-w-full rounded-[10px] object-contain" />
      <button
        type="button"
        aria-label="Đóng"
        className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/15 text-[1.2rem] text-white"
      >
        ✕
      </button>
    </div>
  )
}

/**
 * Hình minh họa: ![chú thích](giun-dua/chu-trinh.jpg). Chú thích lấy từ alt,
 * nguồn + giấy phép lấy từ content/image-credits. Bấm ảnh để phóng to.
 */
function LessonFigure({ src, alt, tile }) {
  const [open, setOpen] = useState(false)
  const { url, credit } = lessonImage(src)
  return (
    <figure className="m-0 flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-zoom-in items-center justify-center border-0 bg-white p-0"
        title="Bấm để phóng to"
      >
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className={tile ? 'aspect-[4/3] w-full object-cover' : 'max-h-[620px] w-full object-contain'}
        />
      </button>
      <figcaption className="flex flex-1 flex-col gap-1 px-3.5 py-2.5 text-[0.84em] leading-snug">
        {alt && <span className="text-text">{alt}</span>}
        {credit && (
          <span className="text-[0.86em] text-text-muted">
            Ảnh: {credit.artist} · {credit.license} ·{' '}
            <a href={credit.page} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">
              Wikimedia Commons
            </a>
          </span>
        )}
      </figcaption>
      {open && <Lightbox url={url} alt={alt} onClose={() => setOpen(false)} />}
    </figure>
  )
}

/**
 * Đoạn văn chỉ chứa ảnh → khối hình (1 ảnh) hoặc lưới hình (nhiều ảnh đặt liền
 * nhau trên cùng một dòng Markdown, ví dụ so sánh các loại trứng).
 */
function Paragraph({ node, children, ...props }) {
  const kids = (node?.children || []).filter((c) => !(c.type === 'text' && !c.value.trim()))
  if (kids.length && kids.every((c) => c.tagName === 'img')) {
    const tile = kids.length > 1
    const figs = kids.map((c, i) => (
      <LessonFigure key={i} src={c.properties.src} alt={c.properties.alt} tile={tile} />
    ))
    if (!tile) return <div className="my-5">{figs}</div>
    return <div className="my-5 grid gap-3 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3">{figs}</div>
  }
  return <p {...props}>{children}</p>
}

const COMPONENTS = { blockquote: Blockquote, pre: Pre, table: Table, p: Paragraph }

/** Nội dung Markdown của một bài học. */
function LessonContent({ markdown, className, style }) {
  return (
    <div className={cx('lesson', className)} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkLesson]} components={COMPONENTS}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default memo(LessonContent)

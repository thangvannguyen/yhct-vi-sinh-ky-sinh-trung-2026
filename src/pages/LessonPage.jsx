import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LESSONS, groupById, lessonById } from '../lib/data.js'
import { LESSON_MD, lessonOutline } from '../lib/lessons.js'
import {
  getLearnProgress,
  getStoredFontStep,
  getStoredReaderMode,
  setLastLesson,
  setLastSection,
  setLessonRead,
  setStoredFontStep,
  setStoredReaderMode,
} from '../lib/storage.js'
import { BackLink, Button, Container, cx } from '../components/ui.jsx'
import LessonContent from '../components/LessonContent.jsx'
import LessonIcon from '../components/LessonIcon.jsx'

const FONT_SCALES = [0.92, 1, 1.08, 1.17, 1.28]
const HEADER_OFFSET = 76

function scrollToSection(id, { flash = false, smooth = true } = {}) {
  const el = document.getElementById(id)
  if (!el) return false
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
  if (flash) {
    el.classList.remove('section-flash')
    void el.offsetWidth // restart animation
    el.classList.add('section-flash')
  }
  return true
}

/** Thanh tiến độ đọc mảnh ở đỉnh màn hình. */
function ReadingProgress({ targetRef }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = targetRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight + HEADER_OFFSET
      const done = HEADER_OFFSET - r.top
      setPct(Math.max(0, Math.min(100, total > 0 ? (done / total) * 100 : 100)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [targetRef])
  return (
    <div className="fixed inset-x-0 top-0 z-40 h-[3px]" aria-hidden>
      <div className="h-full bg-primary-grad transition-[width] duration-150" style={{ width: `${pct}%` }} />
    </div>
  )
}

function TocList({ toc, activeId, onPick }) {
  return (
    <nav aria-label="Mục lục bài học">
      <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
        {toc.map((h) => {
          const childActive = h.children.some((c) => c.id === activeId)
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onPick(h.id)}
                className={cx(
                  'w-full cursor-pointer rounded-[9px] border-0 px-2.5 py-1.5 text-left text-[0.86rem] leading-snug transition-colors',
                  h.id === activeId || childActive
                    ? 'bg-primary-soft font-bold text-primary-dark'
                    : 'bg-transparent text-text hover:bg-surface-2'
                )}
              >
                {h.text}
              </button>
              {h.children.length > 0 && (h.id === activeId || childActive) && (
                <ol className="m-0 mb-1 ml-3 list-none border-l border-border p-0 pl-2">
                  {h.children.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onPick(c.id)}
                        className={cx(
                          'w-full cursor-pointer rounded-[7px] border-0 bg-transparent px-2 py-1 text-left text-[0.8rem] leading-snug',
                          c.id === activeId ? 'font-bold text-primary' : 'text-text-muted hover:text-text'
                        )}
                      >
                        {c.text}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function FontControls({ step, setStep }) {
  const btn =
    'flex h-[34px] min-w-[38px] items-center justify-center rounded-[10px] border border-border bg-surface px-2 text-[0.85rem] font-bold cursor-pointer transition-colors hover:bg-primary-soft disabled:opacity-40 disabled:cursor-not-allowed'
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Cỡ chữ">
      <button type="button" className={btn} disabled={step === 0} onClick={() => setStep(step - 1)} aria-label="Giảm cỡ chữ">
        A−
      </button>
      <button
        type="button"
        className={btn}
        disabled={step === FONT_SCALES.length - 1}
        onClick={() => setStep(step + 1)}
        aria-label="Tăng cỡ chữ"
      >
        A+
      </button>
    </div>
  )
}

/** Chọn cách hiển thị bài: Web (mặc định) hoặc trang giấy A4 như tài liệu Word. */
function ReaderModeToggle({ mode, setMode }) {
  const opts = [
    { id: 'web', label: 'Web' },
    { id: 'paper', label: 'Giấy A4' },
  ]
  return (
    <div role="tablist" aria-label="Chế độ đọc" className="flex gap-0.5 rounded-[11px] border border-border bg-bg p-[3px]">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={mode === o.id}
          onClick={() => setMode(o.id)}
          className={cx(
            'h-[28px] cursor-pointer rounded-lg px-2.5 text-[0.78rem] font-semibold transition-colors',
            mode === o.id ? 'bg-surface text-primary shadow-soft-sm' : 'text-text-muted hover:text-text'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function LessonPage() {
  const { lessonId, sectionId } = useParams()
  const lesson = lessonById(lessonId)
  const md = LESSON_MD[lessonId]
  const { toc } = useMemo(() => lessonOutline(lessonId), [lessonId])

  const [fontStep, setFontStepState] = useState(() => getStoredFontStep())
  const [readerMode, setReaderModeState] = useState(() => getStoredReaderMode())
  const [read, setRead] = useState(() => Boolean(getLearnProgress()[lessonId]?.read))
  const [activeId, setActiveId] = useState(null)
  const [tocOpen, setTocOpen] = useState(false)
  const [resumeId] = useState(() => getLearnProgress()[lessonId]?.lastSection || null)
  const contentRef = useRef(null)

  const setFontStep = (s) => {
    setFontStepState(s)
    setStoredFontStep(s)
  }
  const setReaderMode = (m) => {
    setReaderModeState(m)
    setStoredReaderMode(m)
  }
  const paper = readerMode === 'paper'

  useEffect(() => {
    setRead(Boolean(getLearnProgress()[lessonId]?.read))
    setTocOpen(false)
    if (lesson) setLastLesson(lessonId)
  }, [lessonId, lesson])

  // Mở thẳng tới một mục (từ nút "Xem lý thuyết" của câu hỏi, hoặc từ tìm kiếm).
  useEffect(() => {
    if (!sectionId) return
    // đợi nội dung render xong
    const t = setTimeout(() => scrollToSection(sectionId, { flash: true, smooth: false }), 60)
    return () => clearTimeout(t)
  }, [lessonId, sectionId])

  // Theo dõi mục đang đọc để tô sáng mục lục và nhớ vị trí đọc.
  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const heads = Array.from(root.querySelectorAll('h2[id], h3[id]'))
    if (!heads.length) return
    const onScroll = () => {
      let current = heads[0].id
      for (const h of heads) {
        if (h.getBoundingClientRect().top - HEADER_OFFSET - 24 <= 0) current = h.id
        else break
      }
      setActiveId(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [lessonId, md])

  useEffect(() => {
    if (!activeId) return
    const t = setTimeout(() => setLastSection(lessonId, activeId), 800)
    return () => clearTimeout(t)
  }, [activeId, lessonId])

  const pick = useCallback((id) => {
    setTocOpen(false)
    scrollToSection(id, { flash: true })
  }, [])

  if (!lesson) return <Navigate to="/learn" replace />

  const idx = LESSONS.findIndex((l) => l.id === lessonId)
  const prev = LESSONS.slice(0, idx).reverse().find((l) => LESSON_MD[l.id])
  const next = LESSONS.slice(idx + 1).find((l) => LESSON_MD[l.id])
  const group = groupById(lesson.group)
  const nQ = lesson.questions.length
  const resumeTitle =
    !sectionId && resumeId && resumeId !== toc[0]?.id
      ? toc.flatMap((h) => [h, ...h.children]).find((h) => h.id === resumeId)?.text
      : null

  if (!md) {
    return (
      <Container>
        <BackLink to="/learn">← Mục lục học tập</BackLink>
        <div className="rounded-card border border-border bg-surface p-8 text-center shadow-soft">
          <div className="mb-2 text-[2.2rem]"><LessonIcon icon={lesson.icon} /></div>
          <h1 className="m-0 mb-2 text-[1.2rem] font-extrabold">{lesson.title}</h1>
          <p className="m-0 text-text-muted">Nội dung bài này đang được soạn lại từ tài liệu.</p>
          {nQ > 0 && (
            <Button variant="primary" className="mt-5" to={`/study/${lesson.id}/0`}>
              Làm {nQ} câu hỏi của bài
            </Button>
          )}
        </div>
      </Container>
    )
  }

  return (
    <Container wide>
      <ReadingProgress targetRef={contentRef} />
      <BackLink to="/learn">← Mục lục học tập</BackLink>

      <div className="min-[1000px]:grid min-[1000px]:grid-cols-[230px_minmax(0,1fr)] min-[1000px]:gap-7">
        {/* Mục lục: thanh bên trên màn hình rộng */}
        <aside className="hidden min-[1000px]:block">
          <div className="sh-scroll sticky top-[78px] max-h-[calc(100vh-96px)] overflow-y-auto rounded-[14px] border border-border bg-surface p-2.5 shadow-soft-sm">
            <div className="mb-1.5 px-2.5 pt-1 text-[0.68rem] font-bold uppercase tracking-[0.04em] text-text-muted">
              Mục lục
            </div>
            <TocList toc={toc} activeId={activeId} onPick={pick} />
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-4 rounded-card border border-border bg-surface px-5 py-5 shadow-soft sm:px-7">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.74rem] font-bold uppercase tracking-[0.03em] text-primary">
              <span>Bài {lesson.num}</span>
              <span className="text-text-muted">·</span>
              <span>{group?.title}</span>
            </div>
            <h1 className="m-0 flex items-start gap-2.5 text-[1.45rem] font-extrabold leading-tight tracking-[-0.01em] sm:text-[1.7rem]">
              <LessonIcon icon={lesson.icon} className="mt-[0.1em]" />
              <span>{lesson.title}</span>
            </h1>
            {lesson.latin && <div className="mt-1.5 text-[0.95rem] italic text-text-muted">{lesson.latin}</div>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLessonRead(lessonId, !read)
                  setRead(!read)
                }}
                className={cx(
                  'inline-flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[10px] border-[1.5px] px-3 text-[0.82rem] font-bold transition-colors',
                  read
                    ? 'border-success bg-success-soft text-success'
                    : 'border-border bg-surface text-text hover:border-success hover:text-success'
                )}
              >
                {read ? '✔ Đã học' : '○ Đánh dấu đã học'}
              </button>
              {nQ > 0 && (
                <Link
                  to={`/study/${lesson.id}/0`}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-[0.82rem] font-bold text-primary hover:bg-primary-soft"
                >
                  <LessonIcon icon="svg:kiem-tra" /> {nQ} câu hỏi
                </Link>
              )}
              <div className="ml-auto flex items-center gap-2">
                <ReaderModeToggle mode={readerMode} setMode={setReaderMode} />
                <FontControls step={fontStep} setStep={setFontStep} />
              </div>
            </div>
          </header>

          {/* Mục lục: nút dính trên điện thoại / màn hình hẹp */}
          <div className="sticky top-[62px] z-20 mb-3 min-[1000px]:hidden">
            <button
              type="button"
              onClick={() => setTocOpen((o) => !o)}
              aria-expanded={tocOpen}
              className="flex w-full cursor-pointer items-center gap-2 rounded-[12px] border border-border px-3.5 py-2.5 text-left text-[0.86rem] shadow-soft-sm backdrop-blur-md"
              style={{ background: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}
            >
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.04em] text-text-muted">Mục lục</span>
              <span className="min-w-0 flex-1 truncate font-semibold">
                {toc.flatMap((h) => [h, ...h.children]).find((h) => h.id === activeId)?.text || toc[0]?.text}
              </span>
              <span className={cx('text-text-muted transition-transform', tocOpen && 'rotate-180')}>▾</span>
            </button>
            {tocOpen && (
              <div className="sh-scroll absolute inset-x-0 mt-1.5 max-h-[65vh] overflow-y-auto rounded-[14px] border border-border bg-surface p-2.5 shadow-float">
                <TocList toc={toc} activeId={activeId} onPick={pick} />
              </div>
            )}
          </div>

          {resumeTitle && (
            <button
              type="button"
              onClick={() => scrollToSection(resumeId, { flash: true })}
              className="mb-3 flex w-full cursor-pointer items-center gap-2 rounded-[12px] border border-dashed border-primary bg-primary-soft px-3.5 py-2.5 text-left text-[0.86rem] font-semibold text-primary-dark"
            >
              ↪ Đọc tiếp từ: <span className="truncate">{resumeTitle}</span>
            </button>
          )}

          {paper ? (
            // Chế độ giấy A4: một trang giấy trắng rộng 210 mm, chữ Times, căn đều
            // hai bên, đầu trang có tiêu đề in hoa giống tài liệu Word gốc.
            <div className="paper-desk">
              <article ref={contentRef} className="paper-sheet">
                <div className="paper-title">
                  <div className="paper-title__main">{lesson.title}</div>
                  {lesson.latin && <div className="paper-title__latin">({lesson.latin})</div>}
                </div>
                <LessonContent
                  markdown={md}
                  className="lesson--paper"
                  style={{ '--reader-scale': FONT_SCALES[fontStep] }}
                />
              </article>
            </div>
          ) : (
            <article
              ref={contentRef}
              className="rounded-card border border-border bg-surface px-5 py-6 shadow-soft sm:px-8 sm:py-8"
            >
              <LessonContent markdown={md} style={{ '--reader-scale': FONT_SCALES[fontStep] }} />
            </article>
          )}

          <div className="mt-5 flex flex-col gap-3">
            {!read && (
              <Button
                block
                onClick={() => {
                  setLessonRead(lessonId, true)
                  setRead(true)
                }}
              >
                ✔ Mình đã học xong bài này
              </Button>
            )}
            {nQ > 0 && (
              <Button variant="primary" block to={`/study/${lesson.id}/0`}>
                <LessonIcon icon="svg:kiem-tra" /> Làm {nQ} câu hỏi tự lượng giá của bài
              </Button>
            )}
            <div className="grid grid-cols-2 gap-3">
              {prev ? (
                <Link
                  to={`/learn/${prev.id}`}
                  className="rounded-[14px] border border-border bg-surface px-3.5 py-3 shadow-soft-sm hover:border-border-strong"
                >
                  <div className="text-[0.72rem] font-bold uppercase text-text-muted">← Bài trước</div>
                  <div className="truncate text-[0.9rem] font-semibold">
                    <LessonIcon icon={prev.icon} /> {prev.short}
                  </div>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={`/learn/${next.id}`}
                  className="rounded-[14px] border border-border bg-surface px-3.5 py-3 text-right shadow-soft-sm hover:border-border-strong"
                >
                  <div className="text-[0.72rem] font-bold uppercase text-text-muted">Bài sau →</div>
                  <div className="truncate text-[0.9rem] font-semibold">
                    <LessonIcon icon={next.icon} /> {next.short}
                  </div>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

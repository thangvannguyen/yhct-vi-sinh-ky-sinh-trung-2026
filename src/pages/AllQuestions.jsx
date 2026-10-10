import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS, LESSON_TREE, TOTAL_QUESTIONS, letterFor, optionLabel } from '../lib/data.js'
import { hasLessonContent } from '../lib/lessons.js'
import { BackLink, Container, SectionTitle, cx } from '../components/ui.jsx'
import LessonIcon from '../components/LessonIcon.jsx'

// File do scripts/build_downloads.mjs sinh lúc build (public/downloads/).
const fileUrl = (withAnswers, ext) =>
  `${import.meta.env.BASE_URL}downloads/vskst-cau-hoi${withAnswers ? '-dap-an' : ''}.${ext}`

// Đánh số liên tục 1…N theo thứ tự bài, giống file tải về.
const NUMBER = {}
let n = 0
LESSON_TREE.forEach(({ groups }) =>
  groups.forEach(({ lessons }) => lessons.forEach((l) => l.questions.forEach((q) => (NUMBER[q.id] = ++n))))
)

function DownloadButton({ href, label, sub }) {
  return (
    <a
      href={href}
      download
      className="flex flex-1 items-center gap-2.5 rounded-[13px] border border-border bg-surface px-3.5 py-2.5 font-semibold text-text no-underline transition-[border-color,background] duration-150 hover:border-primary hover:bg-primary-soft"
    >
      <LessonIcon icon="svg:tai-ve" className="text-[1.1rem]" />
      <span className="min-w-0">
        <span className="block text-[0.95rem]">{label}</span>
        <span className="block text-[0.74rem] font-normal text-text-muted">{sub}</span>
      </span>
    </a>
  )
}

function QuestionBlock({ q, showAnswers }) {
  const ref = q.lessonRef
  return (
    <div className="border-b border-border py-3.5 last:border-b-0">
      <p className="m-0 mb-2 leading-snug">
        <strong>Câu {NUMBER[q.id]}.</strong> {q.text}
      </p>
      <ol className="m-0 list-none space-y-1 p-0 pl-3">
        {q.options.map((o, i) => {
          const ok = showAnswers && i === q.correctIndex
          return (
            <li key={i} className={cx('leading-snug', ok && 'font-bold text-success')}>
              <span className={cx('font-semibold', ok ? 'text-success' : 'text-text-muted')}>{letterFor(i)}.</span>{' '}
              {optionLabel(o)}
              {ok && ' ✓'}
            </li>
          )
        })}
      </ol>
      {showAnswers && (q.explain || q.tip) && (
        <div className="mt-2.5 ml-3 rounded-[10px] border-l-[3px] border-success bg-success-soft px-3 py-2 text-[0.88rem] leading-snug">
          {q.explain && <p className="m-0">{q.explain}</p>}
          {q.tip && (
            <p className="m-0 mt-1 text-warning">
              <strong>Mẹo nhớ:</strong> {q.tip}
            </p>
          )}
          {ref && hasLessonContent(ref.lessonId) && (
            <Link
              to={`/learn/${ref.lessonId}${ref.sectionId ? '/' + ref.sectionId : ''}`}
              className="mt-1.5 inline-block text-[0.82rem] font-semibold text-primary"
            >
              Xem lý thuyết ›
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/** Toàn bộ câu hỏi trên một trang + tải bản PDF / Word để học offline, in ra giấy. */
export default function AllQuestions() {
  const [showAnswers, setShowAnswers] = useState(false)
  const variant = showAnswers ? 'có đáp án và giải thích' : 'chỉ câu hỏi, đáp án ở cuối'

  return (
    <Container>
      <BackLink to="/">← Trang chủ</BackLink>
      <h1 className="m-0 mb-1 text-[1.5rem] font-extrabold tracking-[-0.02em]">Toàn bộ câu hỏi</h1>
      <p className="m-0 text-[0.92rem] text-text-muted">
        {TOTAL_QUESTIONS} câu · {CHAPTERS.length} bài — xem trên một trang hoặc tải về để học offline, in ra giấy.
      </p>

      <div className="mt-4 rounded-card border border-border bg-surface p-4 shadow-soft">
        <div className="mb-3 inline-flex rounded-[12px] border border-border bg-surface-2 p-1" role="tablist">
          {[
            [false, 'Chỉ câu hỏi'],
            [true, 'Có đáp án'],
          ].map(([val, label]) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={showAnswers === val}
              onClick={() => setShowAnswers(val)}
              className={cx(
                'cursor-pointer rounded-[9px] border-0 px-3.5 py-1.5 text-[0.88rem] font-semibold transition-colors duration-150',
                showAnswers === val ? 'bg-primary text-white shadow-soft-sm' : 'bg-transparent text-text-muted hover:text-text'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 min-[520px]:flex-row">
          <DownloadButton href={fileUrl(showAnswers, 'pdf')} label="Tải PDF" sub={variant} />
          <DownloadButton href={fileUrl(showAnswers, 'docx')} label="Tải Word (.docx)" sub={variant} />
        </div>
      </div>

      {LESSON_TREE.map(({ part, groups }, pi) => {
        const lessons = groups.flatMap((g) => g.lessons).filter((l) => l.questions.length)
        if (!lessons.length) return null
        return (
          <div key={part.id}>
            <SectionTitle className="!mt-7">
              <LessonIcon icon={part.icon} className="mr-1" />Phần {pi + 1} · {part.title}
            </SectionTitle>
            {lessons.map((l) => (
              <section key={l.id} className="mb-4 rounded-card border border-border bg-surface px-4 py-2 shadow-soft-sm">
                <h3 className="m-0 flex items-center gap-2 border-b border-border py-2.5 text-[1rem] font-bold">
                  <LessonIcon icon={l.icon} />
                  <span>
                    <span className="text-text-muted">Bài {l.num} · </span>
                    {l.title}
                  </span>
                </h3>
                {l.questions.map((q) => (
                  <QuestionBlock key={q.id} q={q} showAnswers={showAnswers} />
                ))}
              </section>
            ))}
          </div>
        )
      })}
    </Container>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAPTERS, LESSON_TREE, TOTAL_QUESTIONS, letterFor, optionLabel } from '../lib/data.js'
import { hasLessonContent } from '../lib/lessons.js'
import { BackLink, Container, SectionTitle, cx } from '../components/ui.jsx'
import LessonIcon from '../components/LessonIcon.jsx'
import { PriorityStar } from '../components/Question.jsx'
import { useApp } from '../lib/store.jsx'

// Đồng bộ với MODES ở scripts/build_downloads.mjs (sinh file lúc build vào public/downloads/).
const MODES = [
  { id: 'none', suffix: '', tab: 'Không đáp án', sub: 'không đáp án' },
  { id: 'answers', suffix: '-dap-an', tab: 'Có đáp án', sub: 'có đáp án' },
  { id: 'explain', suffix: '-giai-thich', tab: 'Có giải thích', sub: 'có đáp án và giải thích' },
]
// Bộ "-cau-sao" chỉ gồm câu ★ — đồng bộ với collect() ở scripts/build_downloads.mjs.
const fileUrl = (mode, ext, allQuestions) =>
  `${import.meta.env.BASE_URL}downloads/vskst-cau-hoi${allQuestions ? '' : '-cau-sao'}${mode.suffix}.${ext}`

const PRIORITY_COUNT = CHAPTERS.reduce((s, l) => s + l.questions.filter((q) => q.priority).length, 0)

/** Câu hiển thị theo phạm vi (tất cả / chỉ câu ★), đánh số liên tục 1…N theo thứ tự bài, giống file tải về. */
function scopedTree(allQuestions) {
  let n = 0
  return LESSON_TREE.map(({ part, groups }) => ({
    part,
    lessons: groups
      .flatMap((g) => g.lessons)
      .map((lesson) => ({
        lesson,
        questions: lesson.questions.filter((q) => allQuestions || q.priority).map((q) => ({ q, num: ++n })),
      }))
      .filter((l) => l.questions.length),
  }))
}

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

function QuestionBlock({ q, num, showAnswers, showExplain }) {
  const ref = q.lessonRef
  return (
    <div className="border-b border-border py-3.5 last:border-b-0">
      <p className="m-0 mb-2 leading-snug">
        <strong>Câu {num}.</strong> {q.text}
        <PriorityStar question={q} />
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
      {showExplain && (q.explain || q.tip) && (
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
  const { allQuestions } = useApp()
  const tree = scopedTree(allQuestions)
  const total = tree.reduce((s, p) => s + p.lessons.reduce((t, l) => t + l.questions.length, 0), 0)
  const lessonCount = tree.reduce((s, p) => s + p.lessons.length, 0)
  const [modeId, setModeId] = useState('none')
  const mode = MODES.find((m) => m.id === modeId)
  const showAnswers = modeId !== 'none'
  const showExplain = modeId === 'explain'

  return (
    <Container>
      <BackLink to="/">← Trang chủ</BackLink>
      <h1 className="m-0 mb-1 text-[1.5rem] font-extrabold tracking-[-0.02em]">Toàn bộ câu hỏi</h1>
      <p className="m-0 text-[0.92rem] text-text-muted">
        {total} câu · {lessonCount} bài — xem trên một trang hoặc tải về để học offline, in ra giấy.{' '}
        {allQuestions ? (
          <>
            Câu có dấu <span className="font-bold text-warning">★</span> là câu bắt buộc học ({PRIORITY_COUNT} câu),
            chắc chắn có trong bài kiểm tra.
          </>
        ) : (
          <>
            Đang ở chế độ <strong className="text-warning">chỉ câu ★</strong> — bật lại "Tất cả câu" ở thẻ Tiến độ ôn
            tập trên trang chủ để xem và tải đủ cả {TOTAL_QUESTIONS} câu.
          </>
        )}
      </p>

      <div className="mt-4 rounded-card border border-border bg-surface p-4 shadow-soft">
        <div className="mb-3 flex w-full rounded-[12px] border border-border bg-surface-2 p-1" role="tablist">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={modeId === m.id}
              onClick={() => setModeId(m.id)}
              className={cx(
                'flex-1 cursor-pointer whitespace-nowrap rounded-[9px] border-0 px-2.5 py-1.5 text-[0.84rem] font-semibold transition-colors duration-150',
                modeId === m.id ? 'bg-primary text-white shadow-soft-sm' : 'bg-transparent text-text-muted hover:text-text'
              )}
            >
              {m.tab}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 min-[520px]:flex-row">
          <DownloadButton href={fileUrl(mode, 'pdf', allQuestions)} label="Tải PDF" sub={allQuestions ? mode.sub : `${mode.sub} · chỉ câu ★`} />
          <DownloadButton href={fileUrl(mode, 'docx', allQuestions)} label="Tải Word (.docx)" sub={allQuestions ? mode.sub : `${mode.sub} · chỉ câu ★`} />
        </div>
      </div>

      {tree.map(({ part, lessons }, pi) =>
        lessons.length ? (
          <div key={part.id}>
            <SectionTitle className="!mt-7">
              <LessonIcon icon={part.icon} className="mr-1" />Phần {pi + 1} · {part.title}
            </SectionTitle>
            {lessons.map(({ lesson: l, questions }) => (
              <section key={l.id} className="mb-4 rounded-card border border-border bg-surface px-4 py-2 shadow-soft-sm">
                <h3 className="m-0 flex items-center gap-2 border-b border-border py-2.5 text-[1rem] font-bold">
                  <LessonIcon icon={l.icon} />
                  <span>
                    <span className="text-text-muted">Bài {l.num} · </span>
                    {l.title}
                  </span>
                </h3>
                {questions.map(({ q, num }) => (
                  <QuestionBlock key={q.id} q={q} num={num} showAnswers={showAnswers} showExplain={showExplain} />
                ))}
              </section>
            ))}
          </div>
        ) : null
      )}
    </Container>
  )
}

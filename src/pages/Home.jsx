import { Link } from 'react-router-dom'
import { LESSONS, LESSON_TREE, TOTAL_QUESTIONS, lessonById, scopedIds } from '../lib/data.js'
import { useApp } from '../lib/store.jsx'
import { hasLessonContent } from '../lib/lessons.js'
import { getHistory, getLastLesson, getLearnProgress, getProgress } from '../lib/storage.js'
import { Card, Container, Pill, ProgressBar, SectionTitle, cx } from '../components/ui.jsx'
import { ProgressMeter, ScoreTrend } from '../components/charts.jsx'
import LessonIcon from '../components/LessonIcon.jsx'

function ModeCard({ to, emoji, title, desc, featured }) {
  return (
    <Link
      to={to}
      className={cx(
        'group flex items-center gap-[15px] rounded-card border bg-surface p-5 shadow-soft transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:shadow-float',
        featured ? 'border-primary' : 'border-border hover:border-border-strong'
      )}
    >
      <div
        className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-[14px] border border-border text-[1.7rem]"
        style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 60%, var(--surface)))' }}
      >
        <LessonIcon icon={emoji} />
      </div>
      <div className="min-w-0">
        <h3 className="m-0 mb-[3px] text-[1.05rem] font-bold">{title}</h3>
        <p className="m-0 text-[0.85rem] leading-snug text-text-muted">{desc}</p>
      </div>
      <div className="ml-auto text-[1.2rem] text-text-muted transition-[transform,color] duration-150 group-hover:translate-x-[3px] group-hover:text-primary">
        ›
      </div>
    </Link>
  )
}

/** Một dòng bài trong danh sách theo bài: đọc lý thuyết + tiến độ câu hỏi. */
function LessonProgressRow({ lesson, read, progress, allQuestions }) {
  const ids = scopedIds(lesson.id, allQuestions)
  const hasAny = lesson.questions.length > 0
  const done = ids.filter((id) => progress[id]).length
  const pct = ids.length ? Math.round((done / ids.length) * 100) : 0
  const ready = hasLessonContent(lesson.id)
  return (
    <div className="flex items-center gap-3 rounded-[13px] border border-border bg-surface px-3.5 py-3 shadow-soft-sm">
      <div
        className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] border border-border text-[1.35rem]"
        style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 55%, var(--surface)))' }}
      >
        <LessonIcon icon={lesson.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[7px] flex items-center gap-1.5 text-[0.93rem] font-semibold">
          <span className="truncate">
            <span className="text-text-muted">Bài {lesson.num} · </span>
            {lesson.short}
          </span>
          {read && <span className="flex-shrink-0 text-[0.8rem] text-success" title="Đã học">✔</span>}
        </div>
        {ids.length ? (
          <ProgressBar percent={pct} />
        ) : (
          <div className="text-[0.76rem] text-text-muted">{hasAny ? 'Không có câu ★' : 'Chưa có câu hỏi'}</div>
        )}
      </div>
      <div className="flex flex-shrink-0 gap-1.5">
        {ids.length > 0 && (
          <Link
            to={`/study/${lesson.id}/0`}
            title="Ôn câu hỏi"
            className="flex h-[36px] items-center rounded-[10px] border border-border bg-surface px-2.5 text-[0.8rem] font-bold text-primary hover:border-primary hover:bg-primary-soft"
          >
            <LessonIcon icon="svg:kiem-tra" className="text-[0.9rem]" />
            <span className="ml-1">{done}/{ids.length}</span>
          </Link>
        )}
        {ready && (
          <Link
            to={`/learn/${lesson.id}`}
            title="Đọc lý thuyết"
            className="flex h-[36px] items-center rounded-[10px] border border-border bg-surface px-2.5 text-[0.8rem] font-bold text-text hover:border-primary hover:bg-primary-soft"
          >
            <LessonIcon icon="svg:hoc-tap" className="text-[0.9rem]" />
            <span className="ml-1 max-[420px]:hidden">Học</span>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const { allQuestions, toggleAllQuestions } = useApp()
  const progress = getProgress()
  const learn = getLearnProgress()
  // Mọi số liệu câu hỏi trên trang chủ theo phạm vi của công tắc ở thẻ tiến độ.
  const scopeIds = scopedIds('all', allQuestions)
  const answeredIds = scopeIds.filter((id) => progress[id])

  let totalCorrect = 0
  let totalAttempts = 0
  answeredIds.forEach((id) => {
    totalCorrect += progress[id].correct
    totalAttempts += progress[id].correct + progress[id].wrong
  })
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0
  const wrongCount = answeredIds.filter((id) => progress[id].lastResult === 'wrong').length
  const masteredCount = answeredIds.filter((id) => progress[id].lastResult === 'correct').length

  const history = getHistory()
  const lastQuiz = history[0]
  const readCount = LESSONS.filter((l) => learn[l.id]?.read).length
  const lastLesson = lessonById(getLastLesson())
  const showResume = lastLesson && hasLessonContent(lastLesson.id) && !learn[lastLesson.id]?.read

  return (
    <Container>
      <div className="pt-3.5 pb-1.5 text-center">
        <div
          className="mx-auto mb-3.5 h-[58px] w-[58px] rounded-[17px] bg-center bg-cover"
          style={{ backgroundImage: 'url(./favicon.svg)', boxShadow: '0 10px 26px -8px rgba(37,99,235,0.55)' }}
        />
        <h1 className="m-0 mb-1.5 text-[1.7rem] font-extrabold tracking-[-0.02em]">Vi Sinh – Ký Sinh Trùng</h1>
        <p className="m-0 text-[0.95rem] text-text-muted">
          {LESSONS.length} bài học · {TOTAL_QUESTIONS} câu hỏi tự lượng giá
        </p>
      </div>

      {showResume && (
        <Link
          to={`/learn/${lastLesson.id}`}
          className="mt-5 flex items-center gap-3 rounded-[14px] border border-dashed border-primary bg-primary-soft px-4 py-3 text-primary-dark"
        >
          <LessonIcon icon={lastLesson.icon} className="text-[1.3rem]" />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.72rem] font-bold uppercase tracking-[0.03em]">Đọc tiếp</span>
            <span className="block truncate font-semibold">{lastLesson.title}</span>
          </span>
          <span className="text-[1.2rem]">›</span>
        </Link>
      )}

      <div className="mt-5 grid gap-3 min-[640px]:grid-cols-2">
        <ModeCard
          featured
          to="/learn"
          emoji="svg:hoc-tap"
          title="Học tập"
          desc={`Lý thuyết đã sắp xếp lại, dễ đọc · đã học ${readCount}/${LESSONS.length} bài`}
        />
        <ModeCard
          featured
          to="/quiz-setup"
          emoji="svg:kiem-tra"
          title="Kiểm tra thử"
          desc="Làm bài trắc nghiệm có chấm điểm, chọn số câu và bài"
        />
      </div>

      <div className="mt-[22px] mb-1 grid gap-3 min-[560px]:grid-cols-2">
        <ProgressMeter
          mastered={masteredCount}
          review={wrongCount}
          total={scopeIds.length}
          allQuestions={allQuestions}
          onToggleScope={toggleAllQuestions}
        />
        <ScoreTrend history={history} accuracy={accuracy} />
      </div>

      <SectionTitle>Ôn câu hỏi</SectionTitle>
      <div className="grid gap-3">
        <ModeCard
          to="/study/all/0"
          emoji="svg:on-tuan-tu"
          title="Ôn tuần tự"
          desc={
            allQuestions
              ? `Lần lượt toàn bộ ${scopeIds.length} câu, kèm giải thích và liên kết tới lý thuyết`
              : `Lần lượt ${scopeIds.length} câu ★ bắt buộc, kèm giải thích và liên kết tới lý thuyết`
          }
        />
        <ModeCard
          to="/review-wrong/0"
          emoji="svg:on-cau-sai"
          title="Ôn tập câu sai"
          desc={
            wrongCount
              ? `Xem lại ${wrongCount} câu bạn đã từng trả lời sai`
              : 'Chưa có câu nào sai — cứ học rồi quay lại đây'
          }
        />
        <ModeCard
          to="/questions"
          emoji="svg:tai-ve"
          title="Toàn bộ câu hỏi"
          desc={
            allQuestions
              ? `Xem cả ${scopeIds.length} câu trên một trang · tải về dạng PDF hoặc Word`
              : `Xem ${scopeIds.length} câu ★ trên một trang · tải về dạng PDF hoặc Word`
          }
        />
      </div>

      {lastQuiz && (
        <>
          <SectionTitle>Lần kiểm tra gần nhất</SectionTitle>
          <Card className="flex items-center justify-between gap-3">
            <div>
              <strong>
                {lastQuiz.correct}/{lastQuiz.total}
              </strong>{' '}
              câu đúng <Pill>{lastQuiz.percent}%</Pill>
            </div>
            <div className="text-right text-[0.82rem] text-text-muted">{lastQuiz.scope}</div>
          </Card>
        </>
      )}

      {LESSON_TREE.map(({ part, groups }, pi) => (
        <div key={part.id}>
          <SectionTitle className="!mt-7">
            <LessonIcon icon={part.icon} className="mr-1" />Phần {pi + 1} · {part.title}
          </SectionTitle>
          {groups.map(({ group, lessons }) => (
            <div key={group.id} className="mb-3">
              <div className="mb-1.5 pl-1 text-[0.78rem] font-semibold text-text-muted">{group.title}</div>
              <div className="flex flex-col gap-2">
                {lessons.map((l) => (
                  <LessonProgressRow
                    key={l.id}
                    lesson={l}
                    read={learn[l.id]?.read}
                    progress={progress}
                    allQuestions={allQuestions}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </Container>
  )
}

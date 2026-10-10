import { Navigate } from 'react-router-dom'
import { QUESTION_INDEX, letterFor, optionLabel } from '../lib/data.js'
import { useApp } from '../lib/store.jsx'
import { Button, Card, Container, SectionTitle, cx } from '../components/ui.jsx'
import LessonIcon from '../components/LessonIcon.jsx'
import { AnswerBadge, AnswerNote, DocOption, ExplanationReveal } from '../components/Question.jsx'

function scoreTone(percent) {
  if (percent >= 80) return { color: 'var(--success)', emoji: 'svg:chuc-mung' }
  if (percent >= 50) return { color: 'var(--primary)', emoji: 'svg:khen' }
  return { color: 'var(--danger)', emoji: 'svg:hoc-tap' }
}

export default function QuizResult() {
  const { quiz, autoExplain, mode } = useApp()
  if (!quiz || !quiz.result) return <Navigate to="/" replace />

  const r = quiz.result
  const tone = scoreTone(r.percent)

  return (
    <Container>
      <Card className="py-6 text-center">
        <div className="mb-1 text-[2rem]">
          <LessonIcon icon={tone.emoji} />
        </div>
        <div className="text-[3rem] font-extrabold leading-none" style={{ color: tone.color }}>
          {r.correct}/{r.total}
        </div>
        <div className="mt-1.5 text-[0.95rem] text-text-muted">
          {r.percent}% chính xác · {quiz.scope}
        </div>
      </Card>

      <div className="my-4 flex gap-2.5">
        <Button className="flex-1" to="/">
          Về trang chủ
        </Button>
        <Button variant="primary" className="flex-1" to="/quiz-setup">
          Làm bài mới
        </Button>
      </div>

      <SectionTitle>Chi tiết</SectionTitle>
      <div className="flex flex-col gap-3">
        {quiz.items.map((item, i) => {
          const { question: q, chapterShort } = QUESTION_INDEX[item.qid]
          const isCorrect = item.picked !== null && item.picked === item.correctDisplayIndex
          return (
            <Card key={item.qid} className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-[0.72rem] font-bold uppercase text-primary">
                    {chapterShort}
                  </span>
                  <AnswerBadge question={q} />
                </span>
                <span
                  className={cx(
                    'rounded-full px-2.5 py-0.5 text-[0.72rem] font-bold whitespace-nowrap',
                    item.picked === null
                      ? 'bg-warning-soft text-warning'
                      : isCorrect
                        ? 'bg-success-soft text-success'
                        : 'bg-danger-soft text-danger'
                  )}
                >
                  {item.picked === null ? 'Chưa trả lời' : isCorrect ? '✔ Đúng' : '✘ Sai'}
                </span>
              </div>
              <div className="mb-2.5 font-semibold leading-relaxed">
                {i + 1}. {q.text}
              </div>
              {mode === 'full' ? (
                <div className="flex flex-col gap-1">
                  {item.displayOptions.map((opt, oi) => {
                    let state = 'idle'
                    if (oi === item.correctDisplayIndex) state = 'correct'
                    else if (oi === item.picked) state = 'incorrect'
                    return <DocOption key={oi} index={oi} option={opt} state={state} disabled />
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 text-[0.9rem]">
                  {item.picked !== null && (
                    <div className={isCorrect ? 'text-success' : 'text-danger'}>
                      Bạn chọn: {letterFor(item.picked)}. {optionLabel(item.displayOptions[item.picked])}
                    </div>
                  )}
                  {!isCorrect && (
                    <div className="text-success">
                      Đáp án đúng: {letterFor(item.correctDisplayIndex)}.{' '}
                      {optionLabel(item.displayOptions[item.correctDisplayIndex])}
                    </div>
                  )}
                </div>
              )}
              <AnswerNote question={q} />
              <ExplanationReveal question={q} autoShow={autoExplain} />
            </Card>
          )
        })}
      </div>
    </Container>
  )
}

import { useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { QUESTION_INDEX } from '../lib/data.js'
import { pushHistory, recordAnswer } from '../lib/storage.js'
import { useApp } from '../lib/store.jsx'
import { BackLink, Button, Card, Container, ProgressBar, StickyBar, useSwipe } from '../components/ui.jsx'
import QuizNav from '../components/QuizNav.jsx'
import { ChapterTag, DocOption, SimpleOption } from '../components/Question.jsx'

function useFinishQuiz() {
  const { quiz, setQuiz } = useApp()
  const navigate = useNavigate()
  return function finish() {
    let correct = 0
    quiz.items.forEach((item) => {
      const isCorrect = item.picked !== null && item.picked === item.correctDisplayIndex
      if (isCorrect) correct++
      recordAnswer(item.qid, isCorrect)
    })
    const total = quiz.items.length
    const percent = Math.round((correct / total) * 100)
    pushHistory({
      date: new Date().toISOString(),
      scope: quiz.scope,
      total,
      correct,
      percent,
    })
    setQuiz({ ...quiz, result: { correct, total, percent } })
    navigate('/quiz-result')
  }
}

function ExitButton() {
  const { setQuiz } = useApp()
  const navigate = useNavigate()
  return (
    <BackLink
      onClick={() => {
        if (confirm('Thoát bài kiểm tra hiện tại? Kết quả sẽ không được lưu.')) {
          setQuiz(null)
          navigate('/')
        }
      }}
    >
      ← Thoát bài (không lưu)
    </BackLink>
  )
}

function QuizPlaySimple() {
  const { quiz, setQuiz } = useApp()
  const finish = useFinishQuiz()
  const i = quiz.currentIndex
  const item = quiz.items[i]
  const { question: q, chapterShort } = QUESTION_INDEX[item.qid]
  const total = quiz.items.length
  const isLast = i === total - 1
  const answeredCount = quiz.items.filter((it) => it.picked !== null).length

  function goto(idx) {
    setQuiz({ ...quiz, currentIndex: idx })
  }
  function pick(oi) {
    const items = quiz.items.map((it, idx) => (idx === i ? { ...it, picked: oi } : it))
    setQuiz({ ...quiz, items })
  }

  const navItems = quiz.items.map((it, idx) => ({
    state: it.picked !== null ? 'answered' : 'idle',
    current: idx === i,
  }))
  const swipe = useSwipe(
    () => (isLast ? null : goto(i + 1)),
    () => (i === 0 ? null : goto(i - 1))
  )

  return (
    <Container wide>
      <ExitButton />
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar percent={Math.round(((i + 1) / total) * 100)} className="flex-1" />
        <div className="whitespace-nowrap text-[0.85rem] font-bold text-text-muted">
          {i + 1}/{total}
        </div>
      </div>

      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:gap-[22px]">
        <QuizNav items={navItems} onJump={goto} />

        <div className="min-w-0 flex-1">
          <Card className="mb-[18px] px-4 py-5 sm:px-[22px] sm:py-[22px]" {...swipe}>
            <ChapterTag>{chapterShort}</ChapterTag>
            <div className="mb-4 text-[1.05rem] font-semibold leading-relaxed">{q.text}</div>
            <div className="flex flex-col gap-2.5">
              {item.displayOptions.map((opt, oi) => (
                <SimpleOption
                  key={oi}
                  index={oi}
                  option={opt}
                  state={item.picked === oi ? 'selected' : 'idle'}
                  onClick={() => pick(oi)}
                />
              ))}
            </div>
          </Card>

          <StickyBar>
            <div className="flex items-center gap-2.5">
              <Button
                className="flex-1 px-3"
                disabled={i === 0}
                onClick={() => goto(i - 1)}
                aria-label="Câu trước"
              >
                ← <span className="max-[380px]:hidden">Câu trước</span>
              </Button>
              {isLast ? (
                <Button variant="primary" className="flex-[1.4] px-3" onClick={finish}>
                  Nộp bài
                </Button>
              ) : (
                <Button variant="primary" className="flex-[1.4] px-3" onClick={() => goto(i + 1)}>
                  Câu sau →
                </Button>
              )}
            </div>
            {!isLast && (
              <div className="mt-1.5 text-center">
                <Button
                  variant="ghost"
                  className="!py-1.5 text-[0.82rem]"
                  onClick={() => {
                    if (confirm(`Nộp bài với ${answeredCount}/${total} câu đã trả lời?`)) finish()
                  }}
                >
                  Nộp bài sớm ({answeredCount}/{total})
                </Button>
              </div>
            )}
          </StickyBar>
        </div>
      </div>
    </Container>
  )
}

function QuizPlayFull() {
  const { quiz, setQuiz } = useApp()
  const finish = useFinishQuiz()
  const blockRefs = useRef({})
  const total = quiz.items.length
  const answeredCount = quiz.items.filter((it) => it.picked !== null).length

  function pick(index, oi) {
    const items = quiz.items.map((it, idx) => (idx === index ? { ...it, picked: oi } : it))
    setQuiz({ ...quiz, items })
  }
  function jumpTo(idx) {
    const el = blockRefs.current[idx]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function submit() {
    const unanswered = total - answeredCount
    if (unanswered > 0 && !confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`)) return
    finish()
  }

  const navItems = quiz.items.map((it) => ({
    state: it.picked !== null ? 'answered' : 'idle',
  }))

  return (
    <Container wide>
      <ExitButton />
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar percent={Math.round((answeredCount / total) * 100)} className="flex-1" />
        <div className="whitespace-nowrap text-[0.85rem] font-bold text-text-muted">
          {answeredCount}/{total}
        </div>
      </div>

      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:gap-[22px]">
        <QuizNav items={navItems} onJump={jumpTo} />

        <div className="min-w-0 flex-1">
          <div className="rounded-card border border-border bg-surface p-7 shadow-soft font-serif max-[470px]:px-5 max-[470px]:py-6">
            {quiz.items.map((item, i) => {
              const { question: q, chapterShort } = QUESTION_INDEX[item.qid]
              const last = i === total - 1
              return (
                <div
                  key={item.qid}
                  ref={(el) => (blockRefs.current[i] = el)}
                  className={`scroll-mt-[84px] ${last ? '' : 'mb-[22px] border-b border-dashed border-border pb-5'}`}
                >
                  <div className="mb-1.5 font-sans text-[0.72rem] font-bold uppercase text-primary">
                    {chapterShort}
                  </div>
                  <div className="mb-2.5 text-[1.04rem] font-bold leading-relaxed">
                    Câu {i + 1}: {q.text}
                  </div>
                  <div className="flex flex-col gap-[7px]">
                    {item.displayOptions.map((opt, oi) => (
                      <DocOption
                        key={oi}
                        index={oi}
                        option={opt}
                        state={item.picked === oi ? 'selected' : 'idle'}
                        onClick={() => pick(i, oi)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <Button variant="primary" block className="mt-[18px]" onClick={submit}>
            Nộp bài ({answeredCount}/{total} câu đã trả lời)
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default function QuizPlay() {
  const { quiz, mode } = useApp()
  if (!quiz) return <Navigate to="/quiz-setup" replace />
  return mode === 'full' ? <QuizPlayFull /> : <QuizPlaySimple />
}

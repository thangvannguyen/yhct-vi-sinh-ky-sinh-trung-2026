import { useEffect, useRef, useState } from 'react'
import { QUESTION_INDEX, isGraded } from '../lib/data.js'
import { recordAnswer } from '../lib/storage.js'
import { useApp } from '../lib/store.jsx'
import { BackLink, Button, Card, Container, ProgressBar, StickyBar, useSwipe } from './ui.jsx'
import {
  AnswerBadge,
  AnswerNote,
  ChapterTag,
  ExplanationReveal,
  QuestionNote,
  SimpleOption,
} from './Question.jsx'

/**
 * One-question-at-a-time study/review view (the "simple" display mode) — đây là
 * màn hình người học ở lại lâu nhất, và đa số là trên điện thoại, nên nó được tối
 * ưu cho một tay: điều hướng dính đáy, vuốt ngang để chuyển câu.
 */
export default function BrowsableQuestions({ ids, index, title, backTo, onIndexChange, topSlot }) {
  const { autoExplain } = useApp()
  const empty = ids.length === 0
  const clamped = empty ? 0 : Math.min(Math.max(index, 0), ids.length - 1)
  const qid = empty ? null : ids[clamped]
  const entry = qid ? QUESTION_INDEX[qid] : null
  const q = entry?.question
  const chapterShort = entry?.chapterShort
  const graded = q ? isGraded(q) : false

  const [picked, setPicked] = useState(null)
  const feedbackRef = useRef(null)

  // Reset the revealed answer whenever we move to a different question.
  useEffect(() => {
    setPicked(null)
  }, [qid])

  const isLast = clamped === ids.length - 1
  const go = (i) => onIndexChange(i)
  const swipe = useSwipe(
    () => (isLast ? null : go(clamped + 1)),
    () => (clamped === 0 ? null : go(clamped - 1))
  )

  if (empty) {
    return (
      <Container>
        <BackLink to={backTo} />
        {topSlot}
        <Card className="px-5 py-[30px] text-center text-text-muted">
          Không tìm thấy câu hỏi nào khớp với từ khóa.
        </Card>
      </Container>
    )
  }

  const answered = picked !== null
  const revealExplanation = answered || !graded

  function choose(i) {
    if (answered || !graded) return
    setPicked(i)
    recordAnswer(qid, i === q.correctIndex)
    // Kéo phần giải thích vào tầm nhìn nếu nó đang nằm dưới màn hình — trên điện
    // thoại nó gần như luôn bị khuất sau 4 đáp án.
    requestAnimationFrame(() => {
      const el = feedbackRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top > window.innerHeight - 120) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function optionState(i) {
    if (!answered) return 'idle'
    if (i === q.correctIndex) return 'correct'
    if (i === picked) return 'incorrect'
    return 'idle'
  }

  return (
    <Container>
      <BackLink to={backTo} />
      {topSlot}

      <div className="mb-3 flex items-center gap-3">
        <ProgressBar percent={Math.round(((clamped + 1) / ids.length) * 100)} className="flex-1" />
        <div className="whitespace-nowrap text-[0.85rem] font-bold text-text-muted">
          {clamped + 1}/{ids.length}
        </div>
      </div>

      <Card className="px-4 py-5 sm:px-[22px] sm:py-[22px]" {...swipe}>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <ChapterTag className="!mb-0">{title ? title : chapterShort}</ChapterTag>
          <AnswerBadge question={q} />
        </div>
        <div className="mb-4 text-[1.05rem] font-semibold leading-relaxed">{q.text}</div>

        <QuestionNote question={q} />

        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => (
            <SimpleOption
              key={i}
              index={i}
              option={opt}
              state={optionState(i)}
              disabled={answered || !graded}
              onClick={() => choose(i)}
            />
          ))}
        </div>

        <div ref={feedbackRef} className="scroll-mt-20">
          {revealExplanation && <AnswerNote question={q} />}
          {revealExplanation && <ExplanationReveal question={q} autoShow={autoExplain} />}
        </div>
      </Card>

      <StickyBar>
        <div className="flex items-center gap-2.5">
          <Button
            className="flex-1 px-3"
            disabled={clamped === 0}
            onClick={() => go(clamped - 1)}
            aria-label="Câu trước"
          >
            ← <span className="max-[380px]:hidden">Câu trước</span>
          </Button>
          <Button
            variant="primary"
            className="flex-[1.4] px-3"
            onClick={() => (isLast ? onIndexChange('done') : go(clamped + 1))}
          >
            {isLast ? 'Hoàn thành' : <>Câu sau →</>}
          </Button>
        </div>
      </StickyBar>
    </Container>
  )
}

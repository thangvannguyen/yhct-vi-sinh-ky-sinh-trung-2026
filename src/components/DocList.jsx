import { useEffect, useMemo, useRef, useState } from 'react'
import { QUESTION_INDEX, isGraded } from '../lib/data.js'
import { recordAnswer } from '../lib/storage.js'
import { useApp } from '../lib/store.jsx'
import { BackLink, Container, cx } from './ui.jsx'
import QuizNav from './QuizNav.jsx'
import LessonIcon from './LessonIcon.jsx'
import { AnswerBadge, AnswerNote, DocOption, ExplanationReveal, QuestionNote, PriorityStar } from './Question.jsx'

/**
 * Paper-style list of every question in `ids` (the "full" display mode).
 * Answers are graded inline; a sticky navigator jumps between questions.
 */
export default function DocList({
  ids,
  backTo,
  pageTitle,
  pageIcon,
  showChapterLabels,
  tabs,
  onShuffle,
  scrollToId,
}) {
  const { autoExplain } = useApp()
  const [answers, setAnswers] = useState({}) // qid -> picked index
  const [highlightId, setHighlightId] = useState(null)
  const blockRefs = useRef({})

  // Jump to (and briefly highlight) a specific question, e.g. arriving from search.
  useEffect(() => {
    if (!scrollToId) return
    const i = ids.indexOf(scrollToId)
    if (i === -1) return
    const el = blockRefs.current[i]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlightId(scrollToId)
    const t = setTimeout(() => setHighlightId(null), 2200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToId])

  const stats = useMemo(() => {
    let correct = 0
    let wrong = 0
    Object.entries(answers).forEach(([qid, picked]) => {
      if (picked === QUESTION_INDEX[qid].question.correctIndex) correct++
      else wrong++
    })
    return { correct, wrong }
  }, [answers])

  function choose(qid, i) {
    if (answers[qid] !== undefined) return
    const isCorrect = i === QUESTION_INDEX[qid].question.correctIndex
    recordAnswer(qid, isCorrect)
    setAnswers((a) => ({ ...a, [qid]: i }))
  }

  function jumpTo(i) {
    const el = blockRefs.current[i]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (ids.length === 0) {
    return (
      <Container wide>
        <BackLink to={backTo} />
        {tabs}
        <div className="rounded-card border border-border bg-surface p-7 text-center text-text-muted shadow-soft">
          Không tìm thấy câu hỏi nào khớp với từ khóa.
        </div>
      </Container>
    )
  }

  const navItems = ids.map((qid) => {
    const picked = answers[qid]
    if (picked === undefined) return { state: 'idle' }
    return {
      state: picked === QUESTION_INDEX[qid].question.correctIndex ? 'correct' : 'incorrect',
    }
  })

  const navFooter = onShuffle ? (
    <>
      <button
        type="button"
        onClick={onShuffle}
        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-[9px] border-[1.5px] border-primary bg-primary-soft px-3 py-2.5 text-[0.85rem] font-bold text-primary-dark transition-colors hover:bg-primary hover:text-white min-[720px]:mt-3 cursor-pointer"
      >
        <LessonIcon icon="svg:tron" /> Trộn câu hỏi
      </button>
      <div className="flex justify-center gap-3 text-[0.72rem] text-text-muted">
        <span className="text-success">✔ Đúng {stats.correct}</span>
        <span className="text-danger">✘ Sai {stats.wrong}</span>
      </div>
    </>
  ) : null

  return (
    <Container wide>
      <BackLink to={backTo} />
      {tabs}

      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:gap-[22px]">
        <QuizNav items={navItems} onJump={jumpTo} footer={navFooter} />

        <div className="min-w-0 flex-1">
          <div className="rounded-card border border-border bg-surface p-7 shadow-soft font-serif max-[470px]:px-5 max-[470px]:py-6">
            {pageTitle && (
              <div className="mb-[22px] text-center text-[1.08rem] font-bold uppercase tracking-[0.02em]">
                {pageIcon && (
                  <>
                    <LessonIcon icon={pageIcon} />{' '}
                  </>
                )}
                {pageTitle}
              </div>
            )}

            {ids.map((qid, i) => {
              const { question: q, chapterShort } = QUESTION_INDEX[qid]
              const graded = isGraded(q)
              const picked = answers[qid]
              const answered = picked !== undefined
              const last = i === ids.length - 1
              return (
                <div
                  key={qid}
                  ref={(el) => (blockRefs.current[i] = el)}
                  className={cx(
                    'scroll-mt-[84px] rounded-[9px] transition-[background-color,box-shadow] duration-500',
                    last ? '' : 'mb-[22px] border-b border-dashed border-border pb-5',
                    highlightId === qid && 'bg-primary-soft ring-2 ring-inset ring-primary'
                  )}
                >
                  {showChapterLabels && (
                    <div className="mb-1.5 font-sans text-[0.72rem] font-bold uppercase text-primary">
                      {chapterShort}
                    </div>
                  )}
                  <div className="mb-2.5 text-[1.04rem] font-bold leading-relaxed">
                    Câu {i + 1}: {q.text}<PriorityStar question={q} /> <AnswerBadge question={q} className="align-middle" />
                  </div>
                  <div className="flex flex-col gap-[7px]">
                    {q.options.map((opt, oi) => {
                      let state = 'idle'
                      if (answered) {
                        if (oi === q.correctIndex) state = 'correct'
                        else if (oi === picked) state = 'incorrect'
                      }
                      return (
                        <DocOption
                          key={oi}
                          index={oi}
                          option={opt}
                          state={state}
                          disabled={answered || !graded}
                          onClick={() => choose(qid, oi)}
                        />
                      )
                    })}
                  </div>
                  <QuestionNote question={q} className="mt-3 font-sans" />
                  {(answered || !graded) && (
                    <div className="font-sans">
                      <AnswerNote question={q} />
                      <ExplanationReveal question={q} autoShow={autoExplain} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Container>
  )
}

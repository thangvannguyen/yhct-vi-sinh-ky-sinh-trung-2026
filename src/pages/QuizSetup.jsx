import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QUESTION_INDEX,
  chapterById,
  getEligibleIds,
  scopedChapters,
  shuffle,
} from '../lib/data.js'
import { useApp } from '../lib/store.jsx'
import { BackLink, Button, Container, cx } from '../components/ui.jsx'
import LessonIcon from '../components/LessonIcon.jsx'

export default function QuizSetup() {
  const navigate = useNavigate()
  const { setQuiz, allQuestions } = useApp()
  const chapters = scopedChapters(allQuestions)
  const allChapterIds = chapters.map((c) => c.id)

  const [selected, setSelected] = useState(allChapterIds)
  const [count, setCount] = useState(20)

  const eligible = getEligibleIds(selected, allQuestions)
  const max = Math.max(1, eligible.length)
  const clampedCount = Math.min(count, max)

  function toggleChapter(cid) {
    setSelected((cur) => {
      if (cur.includes(cid)) {
        return cur.length > 1 ? cur.filter((c) => c !== cid) : cur
      }
      return [...cur, cid]
    })
  }

  function start() {
    const pool = getEligibleIds(selected, allQuestions)
    const picked = shuffle(pool).slice(0, clampedCount)
    const scope =
      (selected.length === chapters.length
        ? 'Tất cả các bài'
        : selected.map((cid) => (chapterById(cid) || {}).short).join(', ')) + (allQuestions ? '' : ' · chỉ câu ★')

    const items = picked.map((qid) => {
      const q = QUESTION_INDEX[qid].question
      const order = shuffle(q.options.map((_, i) => i))
      return {
        qid,
        displayOptions: order.map((origI) => q.options[origI]),
        correctDisplayIndex: order.indexOf(q.correctIndex),
        picked: null,
      }
    })

    setQuiz({ scope, items, currentIndex: 0, result: null })
    navigate('/quiz')
  }

  const allActive = selected.length === chapters.length

  return (
    <Container>
      <BackLink to="/" />
      <h1 className="mb-4 text-[1.25rem] font-extrabold">Thiết lập bài kiểm tra</h1>
      {!allQuestions && (
        <p className="-mt-2 mb-4 text-[0.85rem] text-text-muted">
          Đang ở chế độ <strong className="text-warning">chỉ câu ★</strong> — bật lại "Tất cả câu" ở thẻ Tiến độ ôn tập
          trên trang chủ để làm bài với mọi câu.
        </p>
      )}

      <div className="mb-5">
        <span className="mb-2.5 block text-[0.9rem] font-bold">Bài</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelected(allChapterIds)}
            className={cx(
              'rounded-full border-[1.5px] px-3.5 py-2 text-[0.85rem] cursor-pointer',
              allActive
                ? 'border-primary bg-primary-soft font-bold text-primary-dark'
                : 'border-border bg-surface text-text'
            )}
          >
            Tất cả
          </button>
          {chapters.map((ch) => {
            const active = selected.includes(ch.id)
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => toggleChapter(ch.id)}
                className={cx(
                  'rounded-full border-[1.5px] px-3.5 py-2 text-[0.85rem] cursor-pointer',
                  active
                    ? 'border-primary bg-primary-soft font-bold text-primary-dark'
                    : 'border-border bg-surface text-text'
                )}
              >
                <LessonIcon icon={ch.icon} className="mr-1" />
                Bài {ch.num} · {ch.short}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-5">
        <span className="mb-2.5 block text-[0.9rem] font-bold">
          Số câu hỏi (tối đa {eligible.length})
        </span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1"
            max={max}
            value={clampedCount}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            className="flex-1"
          />
          <span className="min-w-[34px] text-center text-[1.05rem] font-extrabold text-primary">
            {clampedCount}
          </span>
        </div>
      </div>

      <Button variant="primary" block disabled={eligible.length === 0} onClick={start}>
        Bắt đầu làm bài
      </Button>
    </Container>
  )
}

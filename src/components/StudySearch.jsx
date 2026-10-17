import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QUESTION_INDEX,
  scopedIds,
  chapterIcon,
  optionLabel,
} from '../lib/data.js'
import { useApp } from '../lib/store.jsx'
import { cx } from './ui.jsx'
import LessonIcon from './LessonIcon.jsx'
import { PriorityStar } from './Question.jsx'

const MAX_DROPDOWN_RESULTS = 30

function searchIds(ids, query, limit = Infinity) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const out = []
  for (const id of ids) {
    const { question, chapterId, chapterShort } = QUESTION_INDEX[id]
    const textMatch = question.text.toLowerCase().includes(q)
    const optMatch =
      !textMatch && question.options.some((o) => optionLabel(o).toLowerCase().includes(q))
    if (textMatch || optMatch) {
      out.push({ id, chapterId, chapterShort, question, matchedIn: textMatch ? 'question' : 'answer' })
      if (out.length >= limit) break
    }
  }
  return out
}

/**
 * Search bar for the study pages — matches question text and answer options.
 *
 * Scope "Bài này": filters the question list below directly (via
 * `onScopeFilterChange`), no dropdown.
 * Scope "Tất cả": shows a dropdown of matches across every chapter; picking
 * one jumps straight to that question in its chapter.
 */
export default function StudySearch({ chapterId, onScopeFilterChange }) {
  const navigate = useNavigate()
  const { allQuestions } = useApp()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState(chapterId === 'all' ? 'all' : 'chapter')
  const [open, setOpen] = useState(false)

  const isChapterScope = scope === 'chapter' && chapterId !== 'all'

  const chapterResults = useMemo(
    () => (isChapterScope ? searchIds(scopedIds(chapterId, allQuestions), query) : []),
    [isChapterScope, chapterId, query, allQuestions]
  )
  const allResults = useMemo(
    () => (!isChapterScope ? searchIds(scopedIds('all', allQuestions), query, MAX_DROPDOWN_RESULTS) : []),
    [isChapterScope, query, allQuestions]
  )

  useEffect(() => {
    if (!onScopeFilterChange) return
    if (isChapterScope && query.trim().length >= 2) {
      onScopeFilterChange(chapterResults.map((r) => r.id))
    } else {
      onScopeFilterChange(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChapterScope, chapterResults, query])

  const showDropdown = !isChapterScope && open && query.trim().length >= 2

  function goTo(result) {
    const list = scopedIds(result.chapterId, allQuestions)
    const idx = Math.max(list.indexOf(result.id), 0)
    setQuery('')
    setOpen(false)
    navigate(`/study/${result.chapterId}/${idx}`)
  }

  return (
    <div className="relative mb-3.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Tìm câu hỏi hoặc đáp án..."
            className="w-full rounded-[11px] border border-border bg-surface px-3.5 py-2.5 text-[0.88rem] text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text"
              aria-label="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
        {/* Nút phạm vi chỉ hiện khi đã gõ — trên điện thoại nó chiếm mất 1/3 chiều
            ngang của hàng tìm kiếm trong khi phần lớn thời gian không dùng tới. */}
        {chapterId !== 'all' && query.trim().length >= 2 && (
          <div className="flex flex-shrink-0 rounded-[11px] border border-border bg-surface p-0.5 text-[0.76rem] font-semibold">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setScope('chapter')}
              className={cx(
                'rounded-[8px] px-2.5 py-2 cursor-pointer whitespace-nowrap',
                scope === 'chapter' ? 'bg-primary text-white' : 'text-text-muted'
              )}
            >
              Bài này
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setScope('all')}
              className={cx(
                'rounded-[8px] px-2.5 py-2 cursor-pointer whitespace-nowrap',
                scope === 'all' ? 'bg-primary text-white' : 'text-text-muted'
              )}
            >
              Tất cả
            </button>
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-20 mt-1.5 max-h-[420px] w-full overflow-y-auto rounded-[13px] border border-border bg-surface shadow-soft">
          {allResults.length === 0 ? (
            <div className="px-4 py-3.5 text-[0.85rem] text-text-muted">
              Không tìm thấy câu hỏi nào phù hợp.
            </div>
          ) : (
            allResults.map((r) => (
              <button
                key={r.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goTo(r)}
                className="block w-full cursor-pointer border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-primary-soft"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[0.7rem] font-bold uppercase text-primary">
                  <LessonIcon icon={chapterIcon(r.chapterId)} />
                  {r.chapterShort}
                  {r.matchedIn === 'answer' && (
                    <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[0.65rem] font-bold normal-case text-warning">
                      khớp đáp án
                    </span>
                  )}
                </div>
                <div className="line-clamp-2 text-[0.86rem] leading-snug text-text">
                  {r.question.text}<PriorityStar question={r.question} />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

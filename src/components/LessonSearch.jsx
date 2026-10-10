import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LESSONS, chapterIcon, chapterShortOf } from '../lib/data.js'
import { fold, searchLessons } from '../lib/lessons.js'
import LessonIcon from './LessonIcon.jsx'

const ALL_LESSON_IDS = LESSONS.map((l) => l.id)

/** Tô đậm đoạn khớp (so khớp không dấu nên phải tính vị trí trên chuỗi đã fold). */
function Highlight({ text, query }) {
  const i = fold(text).indexOf(fold(query))
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[4px] bg-warning-soft px-0.5 text-text">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  )
}

/**
 * Tìm kiếm toàn văn trong các bài học — gõ không dấu cũng được. Chọn một kết
 * quả để mở đúng mục trong bài.
 */
export default function LessonSearch({ lessonIds = ALL_LESSON_IDS, placeholder }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const results = useMemo(() => searchLessons(query, lessonIds, 30), [query, lessonIds])
  const show = open && query.trim().length >= 2

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">🔎</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder || 'Tìm trong bài học… (vd: praziquantel, gỏi cá, Graham)'}
          className="w-full rounded-[13px] border border-border bg-surface py-3 pl-10 pr-3.5 text-[0.92rem] text-text shadow-soft-sm placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </div>
      {show && (
        <div className="sh-scroll absolute z-20 mt-1.5 max-h-[60vh] w-full overflow-y-auto rounded-[13px] border border-border bg-surface shadow-float">
          {results.length === 0 ? (
            <div className="px-4 py-3.5 text-[0.86rem] text-text-muted">Không tìm thấy nội dung phù hợp.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.lessonId}-${r.sectionId}-${i}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                  navigate(`/learn/${r.lessonId}${r.sectionId ? `/${r.sectionId}` : ''}`)
                }}
                className="block w-full cursor-pointer border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-primary-soft"
              >
                <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[0.72rem] font-bold uppercase text-primary">
                  <LessonIcon icon={chapterIcon(r.lessonId)} />
                  {chapterShortOf(r.lessonId)}
                  {r.sectionTitle && <span className="normal-case text-text-muted">› {r.sectionTitle}</span>}
                </div>
                <div className="line-clamp-2 text-[0.85rem] leading-snug text-text">
                  <Highlight text={r.snippet} query={r.query} />
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

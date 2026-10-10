import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ALL_IDS,
  CHAPTERS,
  CHAPTER_QUESTIONS,
  chapterById,
  chapterShortOf,
  shuffle,
} from '../lib/data.js'
import { useApp } from '../lib/store.jsx'
import { cx } from '../components/ui.jsx'
import BrowsableQuestions from '../components/BrowsableQuestions.jsx'
import DocList from '../components/DocList.jsx'
import StudySearch from '../components/StudySearch.jsx'
import { hasLessonContent } from '../lib/lessons.js'
import LessonIcon from '../components/LessonIcon.jsx'

/** Lối tắt từ phần câu hỏi sang bài lý thuyết tương ứng. */
function TheoryShortcut({ chapterId }) {
  if (chapterId === 'all' || !hasLessonContent(chapterId)) return null
  return (
    <Link
      to={`/learn/${chapterId}`}
      className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[0.8rem] font-semibold text-primary hover:border-primary hover:bg-primary-soft"
    >
      <LessonIcon icon="svg:hoc-tap" /> Đọc lý thuyết bài {chapterShortOf(chapterId)}
    </Link>
  )
}

// The tab strip remounts fresh on every chapter switch (its scrollLeft
// resets to 0), which hides the tab that was just clicked if it sat further
// along the row. Persist the scroll position outside the component (it
// remounts) so the strip reopens exactly where it was left, not recentred.
let savedChapterTabsScroll = 0

function ChapterTabs({ activeId, onPick }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollLeft = savedChapterTabsScroll
  }, [])

  return (
    <div
      ref={containerRef}
      onScroll={(e) => {
        savedChapterTabsScroll = e.currentTarget.scrollLeft
      }}
      className="sh-scroll mb-1.5 flex gap-2 overflow-x-auto border-b border-border pb-3.5 pt-1"
    >
      {CHAPTERS.map((ch) => (
        <button
          key={ch.id}
          type="button"
          // Prevent the browser's default click-to-focus behaviour, which
          // auto-scrolls a partially visible button fully into view — that
          // would fight the "keep the scroll position as-is" goal above.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(ch.id)}
          className={cx(
            'flex-shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-2 text-[0.82rem] font-semibold cursor-pointer',
            ch.id === activeId
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-surface text-text-muted hover:border-border-strong'
          )}
        >
          <LessonIcon icon={ch.icon} className="mr-1.5" />
          Bài {ch.num} · {ch.short}
        </button>
      ))}
    </div>
  )
}

function StudyFull({ chapterId, index }) {
  const navigate = useNavigate()
  const chapter = chapterById(chapterId)
  const [order, setOrder] = useState(null)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [filteredIds, setFilteredIds] = useState(null)

  // Reset any shuffle/search filter when switching chapters.
  useEffect(() => {
    setOrder(null)
    setShuffleKey(0)
    setFilteredIds(null)
  }, [chapterId])

  if (!chapter) return <Navigate to={`/study/${CHAPTERS[0].id}/0`} replace />

  const baseIds = order || CHAPTER_QUESTIONS[chapterId]
  const ids = filteredIds !== null ? filteredIds : baseIds
  // Only jump/highlight for a specific (non-zero) index — plain chapter-tab
  // navigation always targets index 0, which is already at the top.
  const jumpIndex = parseInt(index, 10)
  const scrollToId =
    Number.isInteger(jumpIndex) && jumpIndex > 0 ? CHAPTER_QUESTIONS[chapterId][jumpIndex] : null

  return (
    <DocList
      key={`${chapterId}-${shuffleKey}`}
      ids={ids}
      backTo="/"
      pageTitle={`Bài ${chapter.num} — ${chapter.title}`}
      pageIcon={chapter.icon}
      scrollToId={scrollToId}
      tabs={
        <>
          <StudySearch chapterId={chapterId} onScopeFilterChange={setFilteredIds} />
          <TheoryShortcut chapterId={chapterId} />
          <ChapterTabs activeId={chapterId} onPick={(cid) => navigate(`/study/${cid}/0`)} />
        </>
      }
      onShuffle={() => {
        setOrder(shuffle(CHAPTER_QUESTIONS[chapterId]))
        setShuffleKey((k) => k + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    />
  )
}

export default function Study() {
  const { chapterId, index } = useParams()
  const navigate = useNavigate()
  const { mode } = useApp()
  const [filteredIds, setFilteredIds] = useState(null)
  const [filterIndex, setFilterIndex] = useState(0)

  // Reset the search filter whenever the chapter or display mode changes.
  useEffect(() => {
    setFilteredIds(null)
    setFilterIndex(0)
  }, [chapterId, mode])

  if (mode === 'full') {
    if (chapterId === 'all') return <Navigate to={`/study/${CHAPTERS[0].id}/0`} replace />
    return <StudyFull chapterId={chapterId} index={index} />
  }

  const baseIds = chapterId === 'all' ? ALL_IDS : CHAPTER_QUESTIONS[chapterId] || []
  if (!baseIds.length) return <Navigate to="/" replace />

  const ids = filteredIds !== null ? filteredIds : baseIds

  function handleFilterChange(nextIds) {
    setFilteredIds(nextIds)
    setFilterIndex(0)
  }

  return (
    <BrowsableQuestions
      ids={ids}
      index={filteredIds !== null ? filterIndex : parseInt(index, 10) || 0}
      title={chapterId === 'all' ? null : chapterShortOf(chapterId)}
      backTo="/"
      onIndexChange={(i) => {
        if (filteredIds !== null) {
          if (i === 'done') {
            setFilteredIds(null)
            navigate('/')
          } else {
            setFilterIndex(i)
          }
          return
        }
        i === 'done' ? navigate('/') : navigate(`/study/${chapterId}/${i}`)
      }}
      topSlot={
        <>
          <StudySearch chapterId={chapterId} onScopeFilterChange={handleFilterChange} />
          <TheoryShortcut chapterId={chapterId} />
        </>
      }
    />
  )
}

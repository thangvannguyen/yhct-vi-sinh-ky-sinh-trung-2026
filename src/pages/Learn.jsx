import { Link } from 'react-router-dom'
import { LESSONS, LESSON_TREE } from '../lib/data.js'
import { hasLessonContent } from '../lib/lessons.js'
import { getLearnProgress } from '../lib/storage.js'
import { BackLink, Container, ProgressBar, SectionTitle, cx } from '../components/ui.jsx'
import LessonSearch from '../components/LessonSearch.jsx'
import LessonIcon from '../components/LessonIcon.jsx'

export function LessonRow({ lesson, read }) {
  const ready = hasLessonContent(lesson.id)
  const n = lesson.questions.length
  const inner = (
    <>
      <div
        className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-[12px] border border-border text-[1.35rem]"
        style={{ background: 'linear-gradient(135deg, var(--primary-soft), color-mix(in srgb, var(--primary-soft) 55%, var(--surface)))' }}
      >
        <LessonIcon icon={lesson.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.95rem] font-semibold leading-snug">
          <span className="text-text-muted">Bài {lesson.num} · </span>
          {lesson.short}
        </div>
        <div className="mt-0.5 truncate text-[0.78rem] italic text-text-muted">{lesson.latin}</div>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1 text-[0.72rem] font-semibold">
        {!ready ? (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-text-muted">đang soạn</span>
        ) : read ? (
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-success">✔ đã học</span>
        ) : (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-dark">chưa học</span>
        )}
        <span className="text-text-muted">{n ? `${n} câu hỏi` : 'chưa có câu hỏi'}</span>
      </div>
    </>
  )
  const cls =
    'flex items-center gap-3 rounded-[14px] border border-border bg-surface px-3.5 py-3 shadow-soft-sm transition-[transform,border-color,box-shadow] duration-150'
  if (!ready) return <div className={cx(cls, 'opacity-60')}>{inner}</div>
  return (
    <Link to={`/learn/${lesson.id}`} className={cx(cls, 'hover:translate-x-[3px] hover:border-border-strong hover:shadow-soft')}>
      {inner}
    </Link>
  )
}

/** Mục lục trang Học tập: Phần → Nhóm → Bài. */
export default function Learn() {
  const learn = getLearnProgress()
  const readCount = LESSONS.filter((l) => learn[l.id]?.read).length
  const pct = LESSONS.length ? Math.round((readCount / LESSONS.length) * 100) : 0

  return (
    <Container>
      <BackLink to="/" />
      <h1 className="m-0 mb-1 text-[1.5rem] font-extrabold tracking-[-0.01em]">
        <LessonIcon icon="svg:hoc-tap" className="mr-1.5" />
        Học tập
      </h1>
      <p className="m-0 mb-4 text-[0.92rem] text-text-muted">
        Lý thuyết từ tài liệu, đã sắp xếp lại theo một khung thống nhất: hình thể → chu trình → dịch
        tễ → lâm sàng → chẩn đoán → điều trị → dự phòng.
      </p>

      <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-border bg-surface px-4 py-3 shadow-soft-sm">
        <div className="text-[0.85rem] font-semibold whitespace-nowrap">
          Đã học {readCount}/{LESSONS.length} bài
        </div>
        <ProgressBar percent={pct} className="flex-1" />
      </div>

      <LessonSearch />

      {LESSON_TREE.map(({ part, groups }, pi) => (
        <section key={part.id} className="mt-7">
          <h2 className="m-0 mb-1 flex items-center gap-2 text-[1.15rem] font-extrabold">
            <LessonIcon icon={part.icon} /> Phần {pi + 1} · {part.title}
          </h2>
          {groups.map(({ group, lessons }) => (
            <div key={group.id}>
              <SectionTitle className="!mt-4">{group.title}</SectionTitle>
              <div className="flex flex-col gap-2">
                {lessons.map((l) => (
                  <LessonRow key={l.id} lesson={l} read={learn[l.id]?.read} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </Container>
  )
}

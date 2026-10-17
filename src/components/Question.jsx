import { Link } from 'react-router-dom'
import { imageSrc, isDropped, isGraded, letterFor, optionLabel } from '../lib/data.js'
import { cx } from './ui.jsx'
import LessonIcon from './LessonIcon.jsx'

export function ChapterTag({ children, className }) {
  return (
    <div
      className={cx(
        'text-[0.76rem] font-bold uppercase tracking-[0.02em] text-primary mb-2.5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function NoteBox({ children }) {
  return (
    <div className="mb-3.5 rounded-[13px] border border-warning bg-warning-soft px-3.5 py-3 text-[0.85rem] text-warning">
      {children}
    </div>
  )
}

const UNVERIFIED_NOTE = (
  <>
    <LessonIcon icon="svg:canh-bao" /> Đáp án của câu này chưa được xác nhận trong tài liệu gốc — xem{' '}
    <code>data/review_needed.md</code>.
  </>
)

const DROPPED_NOTE = (
  <>
    <LessonIcon icon="svg:canh-bao" /> Đề gốc đã đánh dấu <strong>bỏ</strong> câu này — chỉ để tham khảo, không chấm
    điểm và không xuất hiện trong bài kiểm tra.
  </>
)

/**
 * Cảnh báo cho câu không chấm điểm được. Trả về null nếu câu bình thường, nên
 * có thể đặt thẳng vào JSX mà không cần kiểm tra trước.
 */
export function QuestionNote({ question, className }) {
  if (isGraded(question)) return null
  return (
    <div className={className}>
      <NoteBox>{isDropped(question) ? DROPPED_NOTE : UNVERIFIED_NOTE}</NoteBox>
    </div>
  )
}

/**
 * Dấu ★ sau câu hỏi thuộc bộ "35 câu hỏi có đáp án" — câu bắt buộc học, chắc
 * chắn có trong bài kiểm tra. Không hiện gì với câu thường.
 */
export function PriorityStar({ question }) {
  if (!question.priority) return null
  return (
    <span className="ml-1 font-sans text-warning" title="Câu bắt buộc học — chắc chắn có trong bài kiểm tra">
      ★
    </span>
  )
}

/** Chuyển **đoạn in đậm** trong chuỗi thành <strong>. */
function richText(s) {
  return String(s)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    )
}

const BADGE_LABEL = {
  corrected: '≠ đáp án gốc',
  missing: 'đáp án bổ sung',
  ambiguous: 'gốc tô 2 đáp án',
  typo: 'lỗi tài liệu gốc',
  relabeled: 'gốc trùng nhãn',
  extended: 'phương án bổ sung',
}

/**
 * Nhãn nhỏ gắn vào câu hỏi để người học biết đáp án của câu này không giống
 * hệt tài liệu gốc — hiện ngay từ trước khi trả lời, nhưng không lộ đáp án nào.
 */
export function AnswerBadge({ question, className }) {
  const note = question.answerNote
  if (!note) return null
  return (
    <span
      className={cx(
        'inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-[2px] font-sans text-[0.68rem] font-bold whitespace-nowrap',
        note.kind === 'corrected'
          ? 'border-warning bg-warning-soft text-warning'
          : 'border-border bg-surface-2 text-text-muted',
        className
      )}
      title={note.title}
    >
      {BADGE_LABEL[note.kind]}
    </span>
  )
}

/**
 * Hộp ghi chú nói rõ đáp án của câu này đến từ đâu: đã sửa khác tài liệu gốc,
 * hay tài liệu gốc không tô / tô nhiều đáp án.
 *
 * Luôn hiện cùng lúc với đáp án đúng (sau khi trả lời) và KHÔNG chịu ảnh hưởng
 * của nút 💡 — đây là thông tin về độ tin cậy của đáp án, không phải phần giải
 * thích có thể tắt đi.
 */
export function AnswerNote({ question, className }) {
  const note = question.answerNote
  if (!note) return null
  const corrected = note.kind === 'corrected'
  return (
    <div
      className={cx(
        'animate-fade-up mt-3.5 rounded-[13px] border-[1.5px] px-4 py-3.5 font-sans',
        corrected ? 'border-warning bg-warning-soft' : 'border-border bg-surface-2',
        className
      )}
    >
      <div
        className={cx(
          'mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.03em]',
          corrected ? 'text-warning' : 'text-text-muted'
        )}
      >
        {corrected ? <span>✎</span> : <LessonIcon icon="svg:thong-tin" />} {note.title}
      </div>
      <p className="m-0 text-[0.88rem] leading-relaxed text-text">{richText(note.body)}</p>
    </div>
  )
}

/**
 * A single option in the card ("simple") layout. `state` drives the colours:
 * 'idle' | 'selected' | 'correct' | 'incorrect'.
 */
export function SimpleOption({ index, option, state = 'idle', disabled, onClick }) {
  const box = {
    idle: 'border-border bg-surface hover:border-primary hover:bg-primary-soft',
    selected: 'border-primary bg-primary-soft',
    correct: 'border-success bg-success-soft',
    incorrect: 'border-danger bg-danger-soft',
  }[state]
  const letter = {
    idle: 'border-border bg-bg text-text-muted',
    selected: 'border-primary bg-surface text-primary',
    correct: 'border-success bg-success text-white',
    incorrect: 'border-danger bg-danger text-white',
  }[state]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'flex items-start gap-3 text-left w-full px-[15px] py-[13px] rounded-[13px] border-[1.5px] text-[0.95rem] leading-normal text-text transition-[border-color,background] duration-100 cursor-pointer disabled:cursor-default',
        box
      )}
    >
      <span
        className={cx(
          'flex-shrink-0 w-[26px] h-[26px] mt-[1px] rounded-full border-[1.5px] flex items-center justify-center text-[0.78rem] font-bold',
          letter
        )}
      >
        {letterFor(index)}
      </span>
      <span className="pt-0.5">{optionLabel(option)}</span>
    </button>
  )
}

/**
 * A single option in the document ("full") layout — a compact text line.
 */
export function DocOption({ index, option, state = 'idle', disabled, onClick }) {
  const cls = {
    idle: 'text-text hover:bg-primary-soft',
    selected: 'bg-primary-soft text-primary-dark font-bold',
    correct: 'text-success font-bold',
    incorrect: 'text-danger line-through',
  }[state]
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'flex gap-1.5 text-left w-full text-[1rem] leading-relaxed px-[7px] py-1 -mx-[7px] rounded-md border-0 bg-transparent cursor-pointer disabled:cursor-default font-[inherit]',
        cls
      )}
    >
      <span className="font-bold flex-shrink-0">{letterFor(index)}.</span>
      <span>{optionLabel(option)}</span>
    </button>
  )
}

/**
 * Explanation + memory-tip panel, shown after an answer is revealed.
 * Data may carry either, both, or neither field.
 */
export function Explanation({ question, className }) {
  const explain = question.explain && String(question.explain).trim()
  const tip = question.tip && String(question.tip).trim()
  if (!explain && !tip) return <TheoryLink question={question} className={cx('mt-3.5', className)} />
  const imgSrc = imageSrc(question.image)
  return (
    <div className={cx('animate-fade-up mt-3.5 flex flex-col gap-2.5', className)}>
      {explain && (
        <div className="rounded-[13px] border border-border bg-surface-2 px-4 py-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.03em] text-primary">
            <LessonIcon icon="svg:y-tuong" /> Giải thích
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <p className="m-0 flex-1 whitespace-pre-line text-[0.9rem] leading-relaxed text-text">
              {explain}
            </p>
            {imgSrc && (
              <img
                src={imgSrc}
                alt="hình minh họa giải thích"
                className="max-w-full rounded-[9px] sm:w-[220px] sm:flex-shrink-0 max-h-[50dvh]"
              />
            )}
          </div>
        </div>
      )}
      {tip && (
        <div className="rounded-[13px] border border-warning bg-warning-soft px-4 py-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[0.78rem] font-bold uppercase tracking-[0.03em] text-warning">
            <LessonIcon icon="svg:nao" /> Mẹo ghi nhớ
          </div>
          <p className="m-0 whitespace-pre-line text-[0.9rem] leading-relaxed text-text">
            {tip}
          </p>
        </div>
      )}
      <TheoryLink question={question} />
    </div>
  )
}

/** Liên kết từ câu hỏi tới đúng mục lý thuyết trong trang Học tập. */
export function TheoryLink({ question, className }) {
  const ref = question.lessonRef
  if (!ref) return null
  return (
    <Link
      to={`/learn/${ref.lessonId}/${ref.sectionId}`}
      className={cx(
        'inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-surface px-3 py-1.5 font-sans text-[0.8rem] font-semibold text-primary transition-colors hover:border-primary hover:bg-primary-soft',
        className
      )}
    >
      <LessonIcon icon="svg:hoc-tap" /> Xem lý thuyết →
    </Link>
  )
}

/**
 * Explanation gated by the "auto-show" setting. When the setting is on it
 * reveals the explanation + tip; when off it renders nothing at all.
 */
export function ExplanationReveal({ question, autoShow = true, className }) {
  // Tắt 💡 chỉ ẩn phần giải thích; đường dẫn tới lý thuyết vẫn giữ.
  if (!autoShow) return <TheoryLink question={question} className={cx('mt-3.5', className)} />
  return <Explanation question={question} className={className} />
}

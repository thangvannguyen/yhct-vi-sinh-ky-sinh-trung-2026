import { cx } from './ui.jsx'

const ITEM_STATE = {
  idle: 'bg-bg border-border text-text-muted hover:border-primary',
  answered: 'bg-primary border-primary text-white',
  correct: 'bg-success border-success text-white',
  incorrect: 'bg-danger border-danger text-white',
}

/**
 * Sticky question navigator. On mobile it is a horizontal scrolling strip;
 * from 720px it becomes a sticky sidebar grid.
 *
 * `items` is an array of { state, current } where state is a key of ITEM_STATE.
 */
export default function QuizNav({ items, onJump, footer }) {
  return (
    <div className="rounded-[13px] border border-border bg-surface p-2.5 flex flex-col gap-2 min-[720px]:sticky min-[720px]:top-[78px] min-[720px]:w-[210px] min-[720px]:flex-shrink-0 min-[720px]:self-start min-[720px]:p-3.5 min-[720px]:max-h-[calc(100vh-96px)] min-[720px]:overflow-y-auto">
      <div className="text-[0.68rem] font-bold uppercase tracking-[0.03em] text-text-muted min-[720px]:mb-2.5">
        Danh sách câu hỏi
      </div>
      <div className="sh-scroll flex gap-1.5 overflow-x-auto py-0.5 min-[720px]:grid min-[720px]:grid-cols-[repeat(auto-fill,minmax(34px,1fr))] min-[720px]:overflow-x-visible">
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            className={cx(
              'flex-[0_0_30px] w-[30px] h-[30px] rounded-lg border text-[0.75rem] font-bold cursor-pointer min-[720px]:w-auto min-[720px]:h-auto min-[720px]:flex-initial min-[720px]:aspect-square min-[720px]:text-[0.82rem]',
              ITEM_STATE[it.state] || ITEM_STATE.idle,
              it.current && 'ring-2 ring-warning border-warning'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {footer}
    </div>
  )
}

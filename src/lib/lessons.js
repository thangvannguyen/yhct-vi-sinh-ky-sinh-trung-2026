// Nội dung trang Học tập: mỗi bài là content/lessons/<lessonId>.md, được Vite
// gom vào bundle lúc build (không cần fetch) — thêm file .md là web tự nhận.
//
// Quy ước Markdown (xem README):
//   ## Tiêu đề mục {#section-id}   → id cố định để câu hỏi trỏ tới ("Xem lý thuyết")
//   > [!KEY] Tiêu đề              → hộp Ý chính   ([!TIP] mẹo nhớ, [!WARN] dễ nhầm, [!NOTE] ghi chú)
//   ```cycle                      → sơ đồ chu trình (xem components/CycleDiagram.jsx)

const files = import.meta.glob('../../content/lessons/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** lessonId -> nội dung Markdown thô */
export const LESSON_MD = {}
for (const [path, raw] of Object.entries(files)) {
  const id = path.split('/').pop().replace(/\.md$/, '')
  LESSON_MD[id] = raw
}

export function hasLessonContent(id) {
  return Boolean(LESSON_MD[id])
}

const HEADING_ID = /\s*\{#([a-z0-9-]+)\}\s*$/

/** "Chu trình phát triển" -> "chu-trinh-phat-trien" (bỏ dấu tiếng Việt). */
export function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Tách "Tiêu đề {#id}" -> { text, id }; id tự sinh nếu không ghi. */
export function parseHeading(raw) {
  const m = raw.match(HEADING_ID)
  const text = raw.replace(HEADING_ID, '').trim()
  return { text, id: m ? m[1] : slugify(text) }
}

/** Bỏ cú pháp Markdown để hiển thị/tìm kiếm văn bản thuần. */
export function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, (block) =>
      block
        .split('\n')
        .slice(1, -1)
        .map((l) => l.replace(/^(@|->|~>)\s*/, ''))
        .join(' · ')
    )
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^>\s*\[!\w+\]\s*/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(HEADING_ID, '')
    .replace(/\{#[a-z0-9-]+\}/g, '')
    .replace(/\|/g, ' ')
    .replace(/^\s*[-:| ]{3,}\s*$/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const outlineCache = {}

/**
 * Mục lục của bài: [{ id, text, level, children: [...] }] (cấp 2 chứa cấp 3),
 * kèm `sections` phẳng có văn bản thuần dùng cho tìm kiếm.
 */
export function lessonOutline(lessonId) {
  if (outlineCache[lessonId]) return outlineCache[lessonId]
  const md = LESSON_MD[lessonId] || ''
  const toc = []
  const sections = []
  let current = { id: null, text: '', level: 1, body: [] }
  let inFence = false
  for (const line of md.split('\n')) {
    if (/^```/.test(line)) inFence = !inFence
    const m = !inFence && line.match(/^(#{2,3})\s+(.*)$/)
    if (m) {
      sections.push(current)
      const { text, id } = parseHeading(m[2])
      const level = m[1].length
      current = { id, text, level, body: [] }
      if (level === 2) toc.push({ id, text, level, children: [] })
      else if (toc.length) toc[toc.length - 1].children.push({ id, text, level })
      else toc.push({ id, text, level, children: [] })
    } else {
      current.body.push(line)
    }
  }
  sections.push(current)
  const flat = sections
    .filter((s) => s.id || s.body.join('').trim())
    .map((s) => ({ id: s.id, title: s.text, text: stripMarkdown(s.body.join('\n')) }))
  const result = { toc, sections: flat }
  outlineCache[lessonId] = result
  return result
}

/** Chuẩn hoá để so khớp không phân biệt dấu/hoa thường. */
export function fold(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function snippetAround(text, index, len) {
  const start = Math.max(0, index - 60)
  const end = Math.min(text.length, index + len + 90)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

/**
 * Tìm trong toàn bộ bài học. Khớp không dấu ("giun moc" tìm được "giun móc").
 * Trả về [{ lessonId, sectionId, sectionTitle, snippet, matchStart, matchLength }].
 */
export function searchLessons(query, lessonIds, limit = 40) {
  const q = fold(query.trim())
  if (q.length < 2) return []
  const out = []
  for (const lessonId of lessonIds) {
    if (!LESSON_MD[lessonId]) continue
    for (const s of lessonOutline(lessonId).sections) {
      const hay = fold(s.title + ' — ' + s.text)
      const i = hay.indexOf(q)
      if (i === -1) continue
      const full = s.title + ' — ' + s.text
      const snippet = snippetAround(full, i, q.length)
      out.push({ lessonId, sectionId: s.id, sectionTitle: s.title, snippet, query: query.trim() })
      if (out.length >= limit) return out
    }
  }
  return out
}

// ---- hình minh họa ------------------------------------------------------------
// Ảnh nằm ở public/images/lessons/<lessonId>/<file>; Markdown viết
// ![chú thích](<lessonId>/<file>). Nguồn + giấy phép từng ảnh ghi trong
// content/image-credits/<lessonId>.json (bắt buộc với ảnh CC BY / CC BY-SA).
const creditFiles = import.meta.glob('../../content/image-credits/*.json', {
  import: 'default',
  eager: true,
})
const IMAGE_CREDITS = {}
for (const [path, data] of Object.entries(creditFiles)) {
  IMAGE_CREDITS[path.split('/').pop().replace(/\.json$/, '')] = data
}

/** "giun-dua/chu-trinh.jpg" -> { url, credit } (credit có thể null). */
export function lessonImage(src) {
  if (/^https?:\/\//i.test(src)) return { url: src, credit: null }
  const clean = src.replace(/^\.?\/?/, '')
  const [lessonId, file] = clean.split('/')
  return {
    url: import.meta.env.BASE_URL + 'images/lessons/' + clean,
    credit: IMAGE_CREDITS[lessonId]?.[file] || null,
  }
}

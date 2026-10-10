// Persistence layer.
//
// Tiền tố khoá phải là `vskst_` (KHÔNG dùng `shdt_`/`hs_` như web Sinh Học Di
// Truyền / Hóa Sinh): các site cùng chạy trên origin thangvannguyen.github.io nên
// dùng chung localStorage — trùng khoá là tiến trình của các môn đè lên nhau.
export const PROGRESS_KEY = 'vskst_progress_v1'
export const HISTORY_KEY = 'vskst_quiz_history_v1'
export const THEME_KEY = 'vskst_theme_v1'
export const MODE_KEY = 'vskst_view_mode_v1'
export const EXPLAIN_KEY = 'vskst_auto_explain_v1'
export const LEARN_KEY = 'vskst_learn_v1'
export const FONT_KEY = 'vskst_reader_font_v1'

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

// ---- progress: qid -> { correct, wrong, lastResult } -----------------------
export function getProgress() {
  return readJSON(PROGRESS_KEY, {})
}

export function recordAnswer(qid, isCorrect) {
  const p = getProgress()
  const entry = p[qid] || { correct: 0, wrong: 0 }
  if (isCorrect) entry.correct++
  else entry.wrong++
  entry.lastResult = isCorrect ? 'correct' : 'wrong'
  p[qid] = entry
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  return p
}

// ---- quiz history (most recent first, capped) ------------------------------
export function getHistory() {
  return readJSON(HISTORY_KEY, [])
}

export function pushHistory(entry) {
  let h = getHistory()
  h.unshift(entry)
  if (h.length > 30) h = h.slice(0, 30)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h))
}

// ---- theme -----------------------------------------------------------------
export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch {
    return null
  }
}
export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

// ---- view mode: 'simple' | 'full' ------------------------------------------
export function getStoredMode() {
  try {
    return localStorage.getItem(MODE_KEY) || 'simple'
  } catch {
    return 'simple'
  }
}
export function setStoredMode(mode) {
  localStorage.setItem(MODE_KEY, mode)
}

// ---- auto-show explanation + tip after answering (default: on) --------------
export function getStoredAutoExplain() {
  try {
    const v = localStorage.getItem(EXPLAIN_KEY)
    return v === null ? true : v === '1'
  } catch {
    return true
  }
}
export function setStoredAutoExplain(on) {
  localStorage.setItem(EXPLAIN_KEY, on ? '1' : '0')
}

// ---- trang Học tập: lessonId -> { read: bool, lastSection: string|null } ----
export function getLearnProgress() {
  return readJSON(LEARN_KEY, {})
}

function saveLearn(p) {
  try {
    localStorage.setItem(LEARN_KEY, JSON.stringify(p))
  } catch {
    /* bộ nhớ bị chặn (tab ẩn danh) — bỏ qua */
  }
  return p
}

export function setLessonRead(lessonId, read) {
  const p = getLearnProgress()
  p[lessonId] = { ...(p[lessonId] || {}), read }
  return saveLearn(p)
}

export function setLastSection(lessonId, sectionId) {
  const p = getLearnProgress()
  if (p[lessonId]?.lastSection === sectionId) return p
  p[lessonId] = { ...(p[lessonId] || {}), lastSection: sectionId }
  return saveLearn(p)
}

// ---- cỡ chữ khi đọc bài: bậc 0..4, mặc định 1 --------------------------------
export function getStoredFontStep() {
  try {
    const v = parseInt(localStorage.getItem(FONT_KEY), 10)
    return Number.isInteger(v) && v >= 0 && v <= 4 ? v : 1
  } catch {
    return 1
  }
}
export function setStoredFontStep(step) {
  try {
    localStorage.setItem(FONT_KEY, String(step))
  } catch {
    /* ignore */
  }
}

// ---- bài học mở gần nhất (thẻ "Đọc tiếp" ở trang chủ) ------------------------
export const LAST_LESSON_KEY = 'vskst_last_lesson_v1'
export function getLastLesson() {
  try {
    return localStorage.getItem(LAST_LESSON_KEY)
  } catch {
    return null
  }
}
export function setLastLesson(lessonId) {
  try {
    localStorage.setItem(LAST_LESSON_KEY, lessonId)
  } catch {
    /* ignore */
  }
}

// ---- chế độ đọc bài học: 'web' (mặc định) | 'paper' (trang giấy A4) ----------
// Áp dụng cho mọi bài, nhớ cho các lần mở sau.
export const READER_MODE_KEY = 'vskst_reader_mode_v1'
export function getStoredReaderMode() {
  try {
    return localStorage.getItem(READER_MODE_KEY) === 'paper' ? 'paper' : 'web'
  } catch {
    return 'web'
  }
}
export function setStoredReaderMode(mode) {
  try {
    localStorage.setItem(READER_MODE_KEY, mode)
  } catch {
    /* ignore */
  }
}

// Sinh file tải về cho trang "Toàn bộ câu hỏi": PDF và Word, mỗi loại 3 bản —
// không đáp án / có đáp án / có đáp án và giải thích (xem MODES).
//
//   npm run downloads        → public/downloads/vskst-cau-hoi{,-dap-an,-giai-thich}.{pdf,docx}
//
// PDF được Chrome in từ HTML (puppeteer-core, dùng Chrome có sẵn trên máy hoặc
// CHROME_PATH). GitHub Actions chạy script này trước `vite build` nên file tải về
// luôn khớp data/questions.json; thư mục public/downloads không đưa vào git.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  TextRun,
} from 'docx'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const OUT = path.join(ROOT, 'public', 'downloads')
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'))

const TITLE = 'Vi Sinh – Ký Sinh Trùng'

// Đồng bộ với MODES ở src/pages/AllQuestions.jsx.
const MODES = [
  { id: 'none', suffix: '', label: 'Bản không đáp án' },
  { id: 'answers', suffix: '-dap-an', label: 'Bản có đáp án' },
  { id: 'explain', suffix: '-giai-thich', label: 'Bản có đáp án và giải thích' },
]
const SITE = 'thangvannguyen.github.io/yhct-vi-sinh-ky-sinh-trung-2026'

// ---- dữ liệu chung ----------------------------------------------------------
const letter = (i) => String.fromCharCode(65 + i)
const optionLabel = (o) => String(o).replace(/^[A-Za-z]\.\s*/, '')

let n = 0
const parts = data.parts
  .map((part) => ({
    part,
    lessons: data.lessons
      .filter((l) => l.part === part.id && l.questions.length)
      .map((l) => ({
        lesson: l,
        questions: l.questions.map((q) => ({
          q,
          num: ++n,
          correct: q.options.indexOf(q.correct),
        })),
      })),
  }))
  .filter((p) => p.lessons.length)
const TOTAL = n
const LESSON_COUNT = parts.reduce((s, p) => s + p.lessons.length, 0)

// Ghi chú phương án bổ sung (câu điền khuyết chuyển thành trắc nghiệm).
const noteText = (q) => (q.answerNote?.body || '').replace(/\*\*/g, '')

// ---- PDF ---------------------------------------------------------------------
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')

function html(mode) {
  const withAnswers = mode.id !== 'none'
  const withExplain = mode.id === 'explain'
  const body = parts
    .map(
      ({ part, lessons }, pi) => `
      <h2 class="part">Phần ${pi + 1} · ${esc(part.title)}</h2>
      ${lessons
        .map(
          ({ lesson, questions }) => `
        <section class="lesson">
          <h3>Bài ${lesson.num} · ${esc(lesson.title)}${lesson.latin ? ` <span class="latin">${esc(lesson.latin)}</span>` : ''}</h3>
          ${questions
            .map(
              ({ q, num, correct }) => `
            <div class="q">
              <p class="stem"><b>Câu ${num}.</b> ${md(q.text)}</p>
              <ol class="opts">
                ${q.options
                  .map(
                    (o, i) =>
                      `<li class="${withAnswers && i === correct ? 'ok' : ''}"><span class="L">${letter(i)}.</span> ${md(optionLabel(o))}${withAnswers && i === correct ? ' <span class="tick">✓</span>' : ''}</li>`
                  )
                  .join('')}
              </ol>
              ${
                withExplain
                  ? `<div class="ans">
                      <p><b>Đáp án: ${letter(correct)}</b>${q.explain ? ` — ${md(q.explain)}` : ''}</p>
                      ${q.tip ? `<p class="tip"><b>Mẹo nhớ:</b> ${md(q.tip)}</p>` : ''}
                      ${q.answerNote ? `<p class="note"><b>${esc(q.answerNote.title)}:</b> ${md(q.answerNote.body)}</p>` : ''}
                    </div>`
                  : ''
              }
            </div>`
            )
            .join('')}
        </section>`
        )
        .join('')}`
    )
    .join('')

  return `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 16mm 15mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif; font-size: 10.2pt; line-height: 1.45; color: #111; margin: 0; }
  header { border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 14px; }
  header h1 { font-size: 19pt; margin: 0 0 2px; letter-spacing: -0.01em; }
  header p { margin: 0; color: #555; font-size: 9.5pt; }
  h2.part { font-size: 13pt; color: #1e3a8a; margin: 18px 0 6px; padding: 4px 0; border-bottom: 1px solid #c7d2fe; break-after: avoid; }
  h3 { font-size: 11.2pt; margin: 14px 0 6px; break-after: avoid; }
  .latin { font-weight: 400; font-style: italic; color: #555; font-size: 10pt; }
  .q { break-inside: avoid; margin: 0 0 9px; }
  .stem { margin: 0 0 3px; }
  .opts { list-style: none; margin: 0; padding: 0 0 0 16px; }
  .opts li { margin: 1px 0; }
  .opts .L { font-weight: 600; color: #444; }
  .opts li.ok { font-weight: 700; color: #15803d; }
  .opts li.ok .L { color: #15803d; }
  .ans { margin: 4px 0 0 16px; padding: 5px 9px; background: #f0fdf4; border-left: 3px solid #16a34a; border-radius: 3px; font-size: 9.4pt; }
  .ans p { margin: 1px 0; }
  .ans .tip { color: #92400e; }
  .ans .note { color: #555; }
</style></head><body>
  <header>
    <h1>${TITLE} · Câu hỏi trắc nghiệm</h1>
    <p>${TOTAL} câu · ${LESSON_COUNT} bài · ${mode.label} · ${SITE}</p>
  </header>
  ${body}
</body></html>`
}

const footerTemplate = `<div style="width:100%;font-family:Arial,sans-serif;font-size:8px;color:#777;padding:0 15mm;display:flex;justify-content:space-between">
  <span>${TITLE} · Câu hỏi trắc nghiệm</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ]
  const found = candidates.find((p) => p && fs.existsSync(p))
  if (!found) throw new Error('Không tìm thấy Chrome — đặt biến CHROME_PATH')
  return found
}

async function buildPdfs() {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: 'new', args: ['--no-sandbox'] })
  try {
    for (const mode of MODES) {
      const page = await browser.newPage()
      await page.setContent(html(mode), { waitUntil: 'networkidle0' })
      await page.evaluate(() => document.fonts.ready)
      const file = path.join(OUT, `vskst-cau-hoi${mode.suffix}.pdf`)
      await page.pdf({
        path: file,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate,
        margin: { top: '16mm', bottom: '18mm', left: '15mm', right: '15mm' },
      })
      await page.close()
      console.log(path.relative(ROOT, file), Math.round(fs.statSync(file).size / 1024), 'KB')
    }
  } finally {
    await browser.close()
  }
}

// ---- Word --------------------------------------------------------------------
const FONT = 'Times New Roman'
const run = (text, opts = {}) => new TextRun({ text, font: FONT, ...opts })

// "**đậm**" → các TextRun đậm / thường.
function runs(s, opts = {}) {
  return String(s ?? '')
    .split(/(\*\*.+?\*\*)/g)
    .filter(Boolean)
    .map((t) => (t.startsWith('**') ? run(t.slice(2, -2), { ...opts, bold: true }) : run(t, opts)))
}

function docxFile(mode) {
  const withAnswers = mode.id !== 'none'
  const withExplain = mode.id === 'explain'
  const children = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [run(`${TITLE} · Câu hỏi trắc nghiệm`, { size: 36, bold: true })] }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        run(
          `${TOTAL} câu · ${LESSON_COUNT} bài · ${mode.label} · ${SITE}`,
          { size: 20, color: '555555' }
        ),
      ],
    }),
  ]

  parts.forEach(({ part, lessons }, pi) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        children: [run(`Phần ${pi + 1} · ${part.title}`, { size: 30, bold: true, color: '1E3A8A' })],
      })
    )
    lessons.forEach(({ lesson, questions }) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          keepNext: true,
          spacing: { before: 280, after: 100 },
          children: [
            run(`Bài ${lesson.num} · ${lesson.title}`, { size: 26, bold: true, color: '111111' }),
            ...(lesson.latin ? [run(`  ${lesson.latin}`, { size: 22, italics: true, color: '555555' })] : []),
          ],
        })
      )
      questions.forEach(({ q, num, correct }) => {
        children.push(
          new Paragraph({
            keepNext: true,
            spacing: { before: 140, after: 40 },
            children: [run(`Câu ${num}. `, { bold: true, size: 24 }), ...runs(q.text, { size: 24 })],
          })
        )
        q.options.forEach((o, i) => {
          const ok = withAnswers && i === correct
          children.push(
            new Paragraph({
              keepNext: withExplain || i < q.options.length - 1,
              indent: { left: 400 },
              spacing: { after: 20 },
              children: [
                run(`${letter(i)}. `, { bold: true, size: 24, color: ok ? '15803D' : '444444' }),
                ...runs(optionLabel(o), { size: 24, bold: ok, color: ok ? '15803D' : undefined }),
                ...(ok ? [run('  ✓', { bold: true, size: 24, color: '15803D' })] : []),
              ],
            })
          )
        })
        if (withExplain) {
          const box = { indent: { left: 400 }, shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' }, spacing: { after: 20 } }
          children.push(
            new Paragraph({
              ...box,
              spacing: { before: 60, after: 20 },
              children: [run(`Đáp án: ${letter(correct)}`, { bold: true, size: 22 }), ...(q.explain ? [run(' — ', { size: 22 }), ...runs(q.explain, { size: 22 })] : [])],
            })
          )
          if (q.tip) children.push(new Paragraph({ ...box, children: [run('Mẹo nhớ: ', { bold: true, size: 22, color: '92400E' }), ...runs(q.tip, { size: 22, color: '92400E' })] }))
          if (q.answerNote)
            children.push(new Paragraph({ ...box, children: [run(`${q.answerNote.title}: `, { bold: true, size: 20, color: '555555' }), run(noteText(q), { size: 20, color: '555555' })] }))
        }
      })
    })
  })

  return new Document({
    creator: SITE,
    title: `${TITLE} · Câu hỏi trắc nghiệm`,
    styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [run(`${TITLE} · Trang `, { size: 18, color: '777777' }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: '777777' })],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })
}

async function buildDocx() {
  for (const mode of MODES) {
    const file = path.join(OUT, `vskst-cau-hoi${mode.suffix}.docx`)
    fs.writeFileSync(file, await Packer.toBuffer(docxFile(mode)))
    console.log(path.relative(ROOT, file), Math.round(fs.statSync(file).size / 1024), 'KB')
  }
}

fs.mkdirSync(OUT, { recursive: true })
await buildDocx()
await buildPdfs()

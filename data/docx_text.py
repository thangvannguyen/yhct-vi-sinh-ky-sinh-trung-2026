"""Đọc .docx thành danh sách dòng, giữ lại nhãn của danh sách tự đánh số.

Word lưu nhãn "1.", "A.", "a)" của danh sách tự động trong numbering.xml chứ
không nằm trong text, nên trích xuất thường (textutil, python-docx .text) sẽ mất
hết — câu hỏi "1." và phương án "A." biến thành "•". Module này dựng lại nhãn
bằng cách đếm theo numId/ilvl, đúng như Word hiển thị.

Dùng chung cho parse_docx.py (tách câu hỏi) và extract_text.py (xuất text
làm tư liệu viết bài học).
"""
import re
import unicodedata

from docx import Document
from docx.oxml.ns import qn

# OCR đôi khi nhận chữ Latin thành chữ Cyrillic trông giống hệt ("С. Нео").
CYRILLIC_TO_LATIN = str.maketrans({
    'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'К': 'K', 'М': 'M',
    'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X', 'а': 'a', 'с': 'c', 'е': 'e',
    'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'і': 'i',
})


def clean(s):
    s = unicodedata.normalize('NFC', s).translate(CYRILLIC_TO_LATIN)
    s = s.replace(' ', ' ').replace('​', '')
    return s


def _roman(n):
    vals = [(1000, 'm'), (900, 'cm'), (500, 'd'), (400, 'cd'), (100, 'c'), (90, 'xc'),
            (50, 'l'), (40, 'xl'), (10, 'x'), (9, 'ix'), (5, 'v'), (4, 'iv'), (1, 'i')]
    out = ''
    for v, r in vals:
        while n >= v:
            out += r
            n -= v
    return out


def _fmt(n, numfmt):
    if numfmt == 'decimal':
        return str(n)
    if numfmt == 'upperLetter':
        return chr(64 + n) if 1 <= n <= 26 else str(n)
    if numfmt == 'lowerLetter':
        return chr(96 + n) if 1 <= n <= 26 else str(n)
    if numfmt == 'upperRoman':
        return _roman(n).upper()
    if numfmt == 'lowerRoman':
        return _roman(n)
    return None  # bullet / none


class Numbering:
    """Đếm nhãn danh sách theo numbering.xml."""

    def __init__(self, doc):
        self.levels = {}  # numId -> {ilvl: (numFmt, lvlText, start)}
        self.abstract_of = {}
        self.counters = {}  # abstractNumId -> [count per level]
        try:
            root = doc.part.numbering_part.element
        except (KeyError, NotImplementedError):
            return
        abstracts = {}
        for an in root.findall(qn('w:abstractNum')):
            aid = an.get(qn('w:abstractNumId'))
            lv = {}
            for l in an.findall(qn('w:lvl')):
                ilvl = int(l.get(qn('w:ilvl')))
                f = l.find(qn('w:numFmt'))
                t = l.find(qn('w:lvlText'))
                st = l.find(qn('w:start'))
                lv[ilvl] = (
                    f.get(qn('w:val')) if f is not None else 'decimal',
                    t.get(qn('w:val')) if t is not None else '',
                    int(st.get(qn('w:val'))) if st is not None else 1,
                )
            abstracts[aid] = lv
        for num in root.findall(qn('w:num')):
            nid = num.get(qn('w:numId'))
            aid = num.find(qn('w:abstractNumId')).get(qn('w:val'))
            self.abstract_of[nid] = aid
            self.levels[nid] = abstracts.get(aid, {})

    def label(self, num_id, ilvl):
        lv = self.levels.get(num_id)
        if not lv or ilvl not in lv:
            return None
        aid = self.abstract_of[num_id]
        cnt = self.counters.setdefault(aid, [0] * 10)
        cnt[ilvl] = cnt[ilvl] + 1 if cnt[ilvl] else lv[ilvl][2]
        for deeper in range(ilvl + 1, 10):
            cnt[deeper] = 0
        numfmt, text, _ = lv[ilvl]
        if _fmt(1, numfmt) is None:
            return '•'

        def sub(m):
            k = int(m.group(1)) - 1
            f = lv.get(k, ('decimal', '', 1))[0]
            return _fmt(cnt[k] or lv.get(k, ('', '', 1))[2], f) or ''

        return re.sub(r'%(\d)', sub, text)


def _num_props(p, styles_numpr):
    ppr = p._p.pPr
    numpr = ppr.numPr if ppr is not None else None
    if numpr is None:
        sid = ppr.pStyle.val if ppr is not None and ppr.pStyle is not None else None
        numpr = styles_numpr.get(sid)
    if numpr is None or numpr.numId is None:
        return None
    nid = str(numpr.numId.val)
    if nid == '0':
        return None
    ilvl = numpr.ilvl.val if numpr.ilvl is not None else 0
    return nid, int(ilvl)


def _is_bold(p):
    runs = [r for r in p.runs if r.text.strip()]
    return bool(runs) and all(r.bold for r in runs)


def read_lines(path):
    """Trả về list dict: {kind:'p', text, label, ilvl, bold} hoặc {kind:'table', rows}."""
    doc = Document(path)
    numbering = Numbering(doc)
    styles_numpr = {}
    for st in doc.styles.element.findall(qn('w:style')):
        ppr = st.find(qn('w:pPr'))
        if ppr is not None and ppr.find(qn('w:numPr')) is not None:
            styles_numpr[st.get(qn('w:styleId'))] = ppr.numPr

    out = []
    from docx.table import Table
    from docx.text.paragraph import Paragraph

    for child in doc.element.body.iterchildren():
        if child.tag == qn('w:p'):
            p = Paragraph(child, doc)
            text = clean(p.text)
            np_ = _num_props(p, styles_numpr)
            label, ilvl = None, None
            if np_:
                ilvl = np_[1]
                # Word bỏ qua đoạn rỗng khi đánh số, nhưng vẫn tăng bộ đếm nếu đoạn
                # rỗng mang numPr — đúng như Word hiển thị.
                label = numbering.label(*np_)
            if not text.strip() and not label:
                continue
            out.append({'kind': 'p', 'text': text, 'label': label, 'ilvl': ilvl,
                        'bold': _is_bold(p)})
        elif child.tag == qn('w:tbl'):
            t = Table(child, doc)
            rows = []
            for r in t.rows:
                cells = []
                for c in r.cells:
                    cells.append(clean(c.text).strip())
                rows.append(cells)
            out.append({'kind': 'table', 'rows': rows})
    return out


def render_line(item):
    if item['kind'] == 'table':
        lines = ['[BẢNG]']
        for r in item['rows']:
            lines.append('| ' + ' | '.join(c.replace('\n', ' / ') for c in r) + ' |')
        lines.append('[/BẢNG]')
        return '\n'.join(lines)
    indent = '    ' * (item['ilvl'] or 0)
    lab = (item['label'] + ' ') if item['label'] else ''
    b = '**' if item['bold'] else ''
    return f"{indent}{lab}{b}{item['text'].strip()}{b}"

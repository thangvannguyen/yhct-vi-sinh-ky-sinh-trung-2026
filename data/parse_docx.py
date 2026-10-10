"""Tách câu hỏi "CÂU HỎI TỰ LƯỢNG GIÁ" + dòng "ĐÁP ÁN" của từng bài → questions.base.json.

    python3 -m pip install python-docx
    python3 data/parse_docx.py

Tài liệu gốc trình bày câu hỏi rất không đồng nhất, script xử lý các kiểu:
  * Danh sách tự đánh số của Word (nhãn 1./A. nằm trong numbering.xml) — dựng
    lại bằng docx_text.py.
  * Phương án gõ tay, 2–4 phương án trên một dòng, cách nhau bằng tab hoặc chỉ
    một dấu cách, đôi khi theo thứ tự cột (A/C rồi B/D) → gom theo chữ cái.
  * Số câu không bắt đầu từ 1 (bài sán lá lớn đánh 4–8) → đánh số lại theo
    thứ tự xuất hiện, khớp với đáp án 1, 2, 3...
  * Đáp án dạng "1-B, 2-A", "1 – C", "3: Trứng", hoặc mỗi đáp án một dòng
    kèm lời giải thích ("1 – D: Nang ấu trùng...").
  * Câu điền khuyết (không có phương án) → type "fill".

Script tự kiểm tra và thoát với mã lỗi khác 0 nếu: số câu khác
`expectedQuestions` trong lessons.meta.json, câu trắc nghiệm không đủ 4 phương
án, đáp án không phải A–D, hoặc câu không có đáp án.
"""
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_text import read_lines  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
META = json.load(open(os.path.join(DATA, 'lessons.meta.json'), encoding='utf-8'))

LETTERS = 'ABCDE'
# Ranh giới phương án trong một dòng: "A." "B ." "D Nghịch" (thiếu dấu chấm nhưng
# chữ sau viết hoa). Chỉ nhận A–D ở giữa dòng để "E. vermicularis" không bị cắt.
OPT_START = re.compile(r'^\s*([A-E])\s*\.\s*|^\s*([A-E])\s+(?=[A-ZÀ-Ỹ])')
OPT_INNER = re.compile(r'\s([A-D])\s*\.\s*(?=\S)|\s([A-D])\s+(?=[A-ZĐÀ-Ỹ][^\s,.]*\s)')
STEM = re.compile(r'^\s*(\d+)\s*[\.\)]\s*')


def norm(s):
    s = unicodedata.normalize('NFC', s).replace('**', '')
    return re.sub(r'\s+', ' ', s).strip()


def squash(s):
    return re.sub(r'\s+', '', norm(s)).upper()


def is_section_start(text):
    return 'CÂUHỎITỰLƯỢNGGIÁ' in squash(text)


def is_answer_header(text):
    t = squash(text)
    return t.startswith('ĐÁPÁN') or t.startswith('ĐẤPÁN')


def split_options(line):
    """'A. x \tC. y' -> [('A','x'), ('C','y')]. Trả về [] nếu dòng không phải phương án."""
    m = OPT_START.match(line)
    if not m:
        return []
    cuts = [(m.start(), m.end(), m.group(1) or m.group(2))]
    pos = m.end()
    while True:
        m2 = OPT_INNER.search(line, pos)
        if not m2:
            break
        letter = m2.group(1) or m2.group(2)
        # chữ cái phải tăng dần trong cùng một dòng — tránh cắt nhầm "A và B đúng"
        if letter <= cuts[-1][2]:
            pos = m2.end()
            continue
        cuts.append((m2.start(), m2.end(), letter))
        pos = m2.end()
    out = []
    for i, (s, e, letter) in enumerate(cuts):
        end = cuts[i + 1][0] if i + 1 < len(cuts) else len(line)
        out.append((letter, norm(line[e:end]).rstrip(';').strip()))
    return out


def parse_key(text):
    """'1-B, 2-A, 3: Trứng' -> {1: 'B', 2: 'A', 3: 'Trứng'}; giữ phần giải thích nếu có."""
    t = norm(text)
    t = re.sub(r'^Đ[ÁẤ]P\s*ÁN\s*:?\s*', '', t, flags=re.I)
    parts = re.split(r'(?:^|[,.;]\s*|\s)(?=\d+\s*[-–:]\s*\S)', t)
    key = {}
    for p in parts:
        m = re.match(r'\s*(\d+)\s*[-–:]\s*(.+?)\s*[,.;]?\s*$', p)
        if m:
            key[int(m.group(1))] = m.group(2).strip()
    return key


def parse_lesson(lesson):
    path = os.path.join(ROOT, 'docs', 'source', lesson['source'])
    items = [x for x in read_lines(path) if x['kind'] == 'p']
    start = next((i for i, x in enumerate(items) if is_section_start(x['text'])), None)
    if start is None:
        return [], {}, []

    questions, warnings = [], []
    key_text = []
    in_key = False
    for x in items[start + 1:]:
        label = x['label'] if x['label'] and x['label'] != '•' else ''
        raw = (label + ' ' + x['text']) if label else x['text']
        line = raw.replace('**', '')
        if in_key or is_answer_header(line):
            in_key = True
            key_text.append(line)
            continue
        if not norm(line):
            continue
        m = STEM.match(line)
        if m and not split_options(line):
            questions.append({'srcNum': int(m.group(1)), 'text': norm(line[m.end():]),
                              'options': []})
            continue
        opts = split_options(line)
        if opts and questions:
            questions[-1]['options'].extend(o for o in opts if o[1])
            continue
        if questions and not questions[-1]['options']:
            questions[-1]['text'] = norm(questions[-1]['text'] + ' ' + line)
        else:
            warnings.append(f'bỏ qua dòng: {norm(line)!r}')

    # Gom đáp án: mỗi dòng có thể là "1-B, 2-A..." hoặc "1 – D: giải thích".
    key, key_explain = {}, {}
    for kl in key_text:
        t = norm(re.sub(r'^\s*Đ[ÁẤ]P\s*ÁN\s*:?', '', kl, flags=re.I))
        m = re.match(r'^(\d+)\s*[-–]\s*([A-E])\s*:\s*(.+)$', t)
        if m:
            key[int(m.group(1))] = m.group(2)
            key_explain[int(m.group(1))] = m.group(3).strip()
        else:
            key.update(parse_key(t))
    return questions, (key, key_explain), warnings


def main():
    problems = []
    out = {'lessons': []}
    total = 0
    for lesson in META['lessons']:
        qs, keys, warnings = parse_lesson(lesson)
        key, key_explain = keys if keys else ({}, {})
        built = []
        for i, q in enumerate(qs, start=1):
            letters = [l for l, _ in q['options']]
            relabeled = False
            if len(set(letters)) != len(letters):
                # Tài liệu đánh trùng chữ cái (vd. hai phương án "A.") — gán lại
                # theo thứ tự xuất hiện, ghi chú để review.
                relabeled = True
                q['options'] = [(LETTERS[k], t) for k, (_, t) in enumerate(q['options'])]
            opts = sorted(q['options'], key=lambda o: o[0])
            entry = {
                'num': i,
                'type': 'mcq' if opts else 'fill',
                'text': q['text'],
                'options': [f'{l}. {t}' for l, t in opts],
                'answer': key.get(i),
            }
            if i in key_explain:
                entry['sourceExplain'] = key_explain[i]
            if relabeled:
                entry['relabeled'] = True
            if q['srcNum'] != i:
                entry['srcNum'] = q['srcNum']
            tag = f"{lesson['id']} câu {i}"
            if entry['answer'] is None:
                problems.append(f'{tag}: không có đáp án')
            if entry['type'] == 'mcq':
                if [o[0] for o in opts] != list('ABCD'):
                    problems.append(f'{tag}: phương án {[o[0] for o in opts]} (cần A–D)')
                if entry['answer'] and entry['answer'] not in 'ABCD':
                    problems.append(f'{tag}: đáp án {entry["answer"]!r} không phải A–D')
            built.append(entry)
        if len(built) != lesson['expectedQuestions']:
            problems.append(f"{lesson['id']}: {len(built)} câu, mong đợi {lesson['expectedQuestions']}")
        extra = set(key) - set(range(1, len(built) + 1))
        if extra:
            problems.append(f"{lesson['id']}: đáp án thừa cho câu {sorted(extra)}")
        for w in warnings:
            print(f"  ⚠ {lesson['id']}: {w}")
        n_mcq = sum(1 for b in built if b['type'] == 'mcq')
        print(f"{lesson['id']:16} {len(built):3} câu ({n_mcq} trắc nghiệm, {len(built) - n_mcq} điền khuyết)")
        total += len(built)
        out['lessons'].append({'id': lesson['id'], 'questions': built})

    path = os.path.join(DATA, 'questions.base.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f'\nTổng: {total} câu → {os.path.relpath(path, ROOT)}')
    if problems:
        print('\nLỖI:')
        for p in problems:
            print('  ✘', p)
        sys.exit(1)


if __name__ == '__main__':
    main()

"""Xuất text của từng bài (docs/source/*.docx) ra data/lecture_text/<id>.txt.

Text giữ nhãn danh sách tự đánh số và bảng — làm tư liệu để viết lại bài học
(content/lessons/<id>.md) và giải thích câu hỏi. Thư mục đầu ra được gitignore.

    python3 data/extract_text.py            # tất cả các bài
    python3 data/extract_text.py giun-dua   # một bài
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx_text import read_lines, render_line  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META = json.load(open(os.path.join(ROOT, 'data', 'lessons.meta.json'), encoding='utf-8'))
OUT = os.path.join(ROOT, 'data', 'lecture_text')


def main():
    only = set(sys.argv[1:])
    os.makedirs(OUT, exist_ok=True)
    for les in META['lessons']:
        if only and les['id'] not in only:
            continue
        src = os.path.join(ROOT, 'docs', 'source', les['source'])
        lines = read_lines(src)
        path = os.path.join(OUT, les['id'] + '.txt')
        with open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(render_line(x) for x in lines) + '\n')
        print(f"{les['id']:16} {len(lines):4} dòng → {os.path.relpath(path, ROOT)}")


if __name__ == '__main__':
    main()

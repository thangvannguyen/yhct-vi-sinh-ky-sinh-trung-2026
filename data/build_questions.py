"""Ghép lessons.meta.json + questions.base.json + overrides.json + explanations/*.json
→ data/questions.json (file duy nhất web import).

    python3 data/build_questions.py

Schema đầu ra:
  { parts, groups, lessons: [ { id, num, part, group, title, latin, short, icon,
      questions: [ { id, type, text, options, correct, answerText, explain, tip,
                     image, flag, answerNote, lessonRef } ] } ] }

  * `correct` là text của phương án đúng (giống web Sinh Học Di Truyền).
  * Câu điền khuyết được chuyển thành trắc nghiệm (`fromFill: true`): phương án
    là đáp án của các câu điền khuyết cùng bài — xem convert_fills().
  * `lessonRef` = { lessonId, sectionId } — nút "Xem lý thuyết" trỏ tới heading
    `{#sectionId}` trong content/lessons/<lessonId>.md.

Kiểm tra: override trỏ tới id không tồn tại, explanation thừa/thiếu, sectionId
không có trong file bài học. Lỗi → thoát mã khác 0; thiếu giải thích chỉ cảnh báo.
"""
import json
import os
import random
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')
LESSON_DIR = os.path.join(ROOT, 'content', 'lessons')


def load(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding='utf-8') as f:
        return json.load(f)


NOTE_TITLES = {
    'corrected': 'Đáp án đã sửa so với tài liệu gốc',
    'typo': 'Lỗi trong tài liệu gốc',
    'relabeled': 'Tài liệu gốc đánh nhãn phương án bị trùng',
    'extended': 'Phương án bổ sung',
}


def section_ids(lesson_id):
    path = os.path.join(LESSON_DIR, lesson_id + '.md')
    if not os.path.exists(path):
        return None
    text = open(path, encoding='utf-8').read()
    return set(re.findall(r'\{#([a-z0-9-]+)\}', text))


def convert_fills(lid, questions, errors):
    """Câu điền khuyết → trắc nghiệm: phương án là đáp án của các câu điền khuyết
    trong cùng bài (đều lấy từ khóa đáp án của tài liệu, không soạn thêm).

    Thứ tự phương án được trộn cố định theo id câu — nếu giữ thứ tự tài liệu thì
    câu 1 luôn là A, câu 2 luôn là B… lộ đáp án ở chế độ ôn tuần tự.
    """
    fills = [q for q in questions if q['type'] == 'fill']
    if not fills:
        return
    pool = []
    for q in fills:
        if q['answerText'] not in pool:
            pool.append(q['answerText'])
    if len(pool) < 2:
        errors.append(f'{lid}: chỉ có {len(pool)} đáp án điền khuyết, không đủ làm phương án')
        return
    for q in fills:
        rng = random.Random(q['id'])
        # Bài chỉ có 2 câu điền khuyết → thêm phương án nhiễu riêng từng câu
        # (overrides.json: extraOptions) cho đủ 4 lựa chọn.
        order = pool + [t for t in q.pop('_extra', []) if t not in pool]
        rng.shuffle(order)
        q['options'] = [f'{"ABCDE"[i]}. {t}' for i, t in enumerate(order)]
        q['correct'] = q['options'][order.index(q['answerText'])]
        q['type'] = 'mcq'
        q['fromFill'] = True


def main():
    meta = load(os.path.join(DATA, 'lessons.meta.json'))
    base = load(os.path.join(DATA, 'questions.base.json'))
    overrides = {k: v for k, v in load(os.path.join(DATA, 'overrides.json'), {}).items()
                 if not k.startswith('_')}
    base_by_lesson = {l['id']: l['questions'] for l in base['lessons']}

    errors, warnings = [], []
    seen_ids = set()
    lessons_out = []

    for num, les in enumerate(meta['lessons'], start=1):
        lid = les['id']
        expl = {k: v for k, v in load(os.path.join(DATA, 'explanations', lid + '.json'), {}).items()
                if not k.startswith('_')}
        sections = section_ids(lid)
        if sections is None:
            warnings.append(f'{lid}: chưa có content/lessons/{lid}.md')
        questions = []
        for bq in base_by_lesson.get(lid, []):
            qid = f'{lid}-{bq["num"]}'
            seen_ids.add(qid)
            ov = overrides.get(qid, {})
            options = list(bq['options'])
            for idx, txt in (ov.get('options') or {}).items():
                options[int(idx)] = txt
            answer = ov.get('answer', bq['answer'])
            q = {
                'id': qid,
                'type': bq['type'],
                'text': ov.get('text', bq['text']),
                'options': options,
                'correct': None,
                'answerText': None,
                'explain': None,
                'tip': None,
                'image': None,
                'flag': None,
                'answerNote': None,
                'lessonRef': None,
            }
            if bq['type'] == 'mcq':
                q['correct'] = options['ABCD'.index(answer)]
            else:
                q['answerText'] = ov.get('answerText', answer)
                if ov.get('extraOptions'):
                    q['_extra'] = ov['extraOptions']

            if ov.get('noteKind'):
                kind = ov['noteKind']
                q['answerNote'] = {
                    'kind': kind,
                    'title': NOTE_TITLES[kind],
                    'body': ov.get('noteWhy', ''),
                    'sourceAnswer': bq['answer'],
                }
            elif bq.get('relabeled'):
                errors.append(f'{qid}: phương án bị gán lại nhãn nhưng chưa có ghi chú trong overrides.json')
            if ov.get('answer') and ov['answer'] != bq['answer'] and ov.get('noteKind') != 'corrected':
                errors.append(f'{qid}: đổi đáp án mà không có noteKind "corrected"')

            e = expl.pop(qid, None)
            if e:
                q['explain'] = e.get('explain')
                q['tip'] = e.get('tip')
                if e.get('section'):
                    q['lessonRef'] = {'lessonId': lid, 'sectionId': e['section']}
                    if sections is not None and e['section'] not in sections:
                        errors.append(f'{qid}: section "{e["section"]}" không có trong {lid}.md')
            # Đáp án của tài liệu có kèm lời giải thích (bài sán lá ruột lớn) —
            # ưu tiên nội dung tài liệu.
            if bq.get('sourceExplain') and not q['explain']:
                q['explain'] = bq['sourceExplain']
            if not q['explain']:
                warnings.append(f'{qid}: chưa có giải thích')
            questions.append(q)
        convert_fills(lid, questions, errors)
        for stale in expl:
            errors.append(f'explanations/{lid}.json: id "{stale}" không tồn tại')

        lessons_out.append({
            'id': lid,
            'num': num,
            'part': next(g['part'] for g in meta['groups'] if g['id'] == les['group']),
            'group': les['group'],
            'title': les['title'],
            'latin': les.get('latin'),
            'short': les['short'],
            'icon': les['icon'],
            'questions': questions,
        })

    for oid in overrides:
        if oid not in seen_ids:
            errors.append(f'overrides.json: id "{oid}" không tồn tại')

    out = {'parts': meta['parts'], 'groups': meta['groups'], 'lessons': lessons_out}
    path = os.path.join(DATA, 'questions.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')

    total = sum(len(l['questions']) for l in lessons_out)
    print(f'{len(lessons_out)} bài, {total} câu → {os.path.relpath(path, ROOT)}')
    for w in warnings:
        print('  ⚠', w)
    if errors:
        print('\nLỖI:')
        for e in errors:
            print('  ✘', e)
        sys.exit(1)


if __name__ == '__main__':
    main()

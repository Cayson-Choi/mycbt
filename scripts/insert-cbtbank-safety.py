"""산업안전산업기사 cbtbank 14개 시험 DB 입력.

- 카테고리: 산업안전산업기사 (id=14)
- 5과목 × 20문제 = 100문제
- 회차는 시행월로 추정
- minTier: 년도별 (2025+:PREMIUM, 2023-24:GOLD, 2021-22:SILVER, 2019-20:BRONZE, ~2018:FREE)
"""
import json
import sys
import psycopg2
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent
DB_URL = next(
    l.split('=', 1)[1].strip().strip('"')
    for l in (ROOT / '.env.local').read_text(encoding='utf-8').splitlines()
    if l.startswith('DATABASE_URL=')
)

CATEGORY_ID = 14  # 산업안전산업기사

SUBJECTS = [
    ('산업재해 예방 및 안전보건교육', 1, 20),
    ('인간공학 및 위험성 평가·관리', 2, 20),
    ('기계·기구 및 설비 안전 관리', 3, 20),
    ('전기 및 화학설비 안전 관리', 4, 20),
    ('건설공사 안전 관리', 5, 20),
]

# (date, code, year, round)
EXAMS = [
    ('2016-03-06', 'kv20160306', 2016, 1),
    ('2016-05-08', 'kv20160508', 2016, 2),
    ('2016-08-21', 'kv20160821', 2016, 3),
    ('2017-03-05', 'kv20170305', 2017, 1),
    ('2017-05-07', 'kv20170507', 2017, 2),
    ('2017-08-26', 'kv20170826', 2017, 3),
    ('2018-03-04', 'kv20180304', 2018, 1),
    ('2018-04-28', 'kv20180428', 2018, 2),
    ('2018-08-19', 'kv20180819', 2018, 3),
    ('2019-03-03', 'kv20190303', 2019, 1),
    ('2019-04-27', 'kv20190427', 2019, 2),
    ('2019-08-04', 'kv20190804', 2019, 3),
    ('2020-06-06', 'kv20200606', 2020, 1),  # 1·2회 통합
    ('2020-08-22', 'kv20200822', 2020, 3),
]


def tier_for(year: int) -> str:
    if year >= 2025: return 'PREMIUM'
    if year >= 2023: return 'GOLD'
    if year >= 2021: return 'SILVER'
    if year >= 2019: return 'BRONZE'
    return 'FREE'


def code_for(year: int, rnd: int, num: int) -> str:
    return f'산업안전산업기사-필기-{year}-{rnd}-{num}'


def insert_exam(cur, year: int, rnd: int) -> tuple[int, bool]:
    name = f'산업안전산업기사 {year}년 {rnd}회'
    cur.execute("""
        SELECT id FROM exams
        WHERE category_id=%s AND year=%s AND round=%s AND exam_type='WRITTEN'
    """, (CATEGORY_ID, year, rnd))
    if (row := cur.fetchone()):
        return row[0], False
    tier = tier_for(year)
    cur.execute("""
        INSERT INTO exams
        (category_id, name, year, round, exam_mode, exam_type, duration_minutes,
         min_tier, is_published, sort_order, created_at, updated_at)
        VALUES (%s, %s, %s, %s, 'PRACTICE', 'WRITTEN', 150,
                %s::"UserTier", true, %s, NOW(), NOW())
        RETURNING id
    """, (CATEGORY_ID, name, year, rnd, tier, rnd))
    return cur.fetchone()[0], True


def insert_subjects(cur, exam_id: int) -> dict[int, int]:
    ids: dict[int, int] = {}
    for name, order_no, qpa in SUBJECTS:
        cur.execute("""
            INSERT INTO subjects (exam_id, name, order_no, questions_per_attempt)
            VALUES (%s, %s, %s, %s) RETURNING id
        """, (exam_id, name, order_no, qpa))
        ids[order_no] = cur.fetchone()[0]
    return ids


def insert_questions(cur, exam_id: int, subj_ids: dict[int, int],
                     year: int, rnd: int, questions: list) -> None:
    for q in questions:
        num = q['num']
        # 1-20 → 과목1, 21-40 → 과목2 ...
        order_no = (num - 1) // 20 + 1
        subj_id = subj_ids[order_no]
        choices = q['choices']
        if len(choices) != 4:
            choices = (choices + ['', '', '', ''])[:4]
        cur.execute("""
            INSERT INTO questions
            (question_code, exam_id, subject_id, question_type, question_text,
             choice_1, choice_2, choice_3, choice_4, answer, points, explanation,
             is_active, created_at, updated_at)
            VALUES (%s, %s, %s, 'MULTIPLE_CHOICE', %s,
                    %s, %s, %s, %s, %s, 1, %s,
                    true, NOW(), NOW())
        """, (
            code_for(year, rnd, num), exam_id, subj_id, q['q'],
            choices[0], choices[1], choices[2], choices[3],
            q['answer'] or 0, q.get('explanation'),
        ))


def main():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()
    summary = []

    try:
        for date_label, code, year, rnd in EXAMS:
            json_path = ROOT / 'data' / 'cbtbank' / f'{code}.json'
            data = json.loads(json_path.read_text(encoding='utf-8'))
            qs = data['questions']
            assert len(qs) == 100, f'{code}: {len(qs)} questions'

            exam_id, created = insert_exam(cur, year, rnd)
            if not created:
                summary.append(f'⊘ {year}년 {rnd}회 (이미 존재) 스킵')
                continue

            subj_ids = insert_subjects(cur, exam_id)
            insert_questions(cur, exam_id, subj_ids, year, rnd, qs)
            conn.commit()
            tier = tier_for(year)
            summary.append(f'✓ {year}년 {rnd}회 (id={exam_id}, {tier}): 100문제')
            print(summary[-1])
    except Exception as e:
        conn.rollback()
        print(f'❌ 오류: {e}')
        raise
    finally:
        cur.close()
        conn.close()

    print('\n=== 요약 ===')
    for line in summary:
        print(line)


if __name__ == '__main__':
    main()

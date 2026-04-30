"""전기기능사 JSON (data/func-final/) → DB 일괄 입력.

각 시험은 60문제 (1-20 전기이론 / 21-40 전기기기 / 41-60 전기설비) 가정.
이미지는 별도 처리 (image_url 일단 NULL).
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
import json
import argparse
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
load_dotenv('.env.local')

DATA_DIR = Path('data/func-final')
CATEGORY_NAME = '전기기능사'
SUBJECTS = ['전기이론', '전기기기', '전기설비']

DB_HOST = os.getenv('DATABASE_PGHOST_UNPOOLED') or os.getenv('DATABASE_PGHOST')
conn = psycopg2.connect(
    host=DB_HOST, dbname=os.getenv('DATABASE_PGDATABASE', 'neondb'),
    user=os.getenv('DATABASE_PGUSER', 'neondb_owner'),
    password=os.getenv('DATABASE_PGPASSWORD'), sslmode='require',
)
cur = conn.cursor()


def get_or_create_exam(year: int, rnd: int, duration: int, min_tier: str):
    cur.execute("SELECT id FROM exam_categories WHERE name = %s", (CATEGORY_NAME,))
    cat_id = cur.fetchone()[0]

    cur.execute("""
        SELECT id FROM exams
        WHERE category_id = %s AND year = %s AND round = %s AND exam_type = 'WRITTEN'
    """, (cat_id, year, rnd))
    row = cur.fetchone()
    if row:
        # 기존 시험 — min_tier·duration 업데이트
        cur.execute(
            "UPDATE exams SET duration_minutes = %s, min_tier = %s, updated_at = NOW() WHERE id = %s",
            (duration, min_tier, row[0])
        )
        conn.commit()
        return row[0], False

    name = f'{CATEGORY_NAME} {year}년 {rnd}회'
    cur.execute("""
        INSERT INTO exams (category_id, name, year, round, exam_mode, exam_type,
                           duration_minutes, is_published, sort_order, min_tier,
                           created_at, updated_at)
        VALUES (%s, %s, %s, %s, 'PRACTICE', 'WRITTEN', %s, true, 0, %s, NOW(), NOW())
        RETURNING id
    """, (cat_id, name, year, rnd, duration, min_tier))
    exam_id = cur.fetchone()[0]
    for i, subj in enumerate(SUBJECTS):
        cur.execute(
            "INSERT INTO subjects (exam_id, name, questions_per_attempt, order_no) VALUES (%s, %s, 20, %s)",
            (exam_id, subj, i + 1)
        )
    conn.commit()
    return exam_id, True


def get_subject_id(exam_id: int, name: str) -> int:
    cur.execute("SELECT id FROM subjects WHERE exam_id = %s AND name = %s", (exam_id, name))
    row = cur.fetchone()
    return row[0] if row else None


def subject_for(n: int) -> str:
    if n <= 20:
        return '전기이론'
    if n <= 40:
        return '전기기기'
    return '전기설비'


def insert_exam(json_path: Path, replace: bool = False):
    data = json.loads(json_path.read_text(encoding='utf-8'))
    year = data['year']
    rnd = data['round']
    duration = data.get('duration_minutes', 60)
    min_tier = data.get('min_tier', 'FREE')
    questions = data['questions']

    print(f"\n=== {year}년 {rnd}회 (총 {len(questions)}문제) ===")

    exam_id, created = get_or_create_exam(year, rnd, duration, min_tier)
    print(f"  Exam id={exam_id} ({'신규' if created else '기존'})")

    if replace:
        cur.execute("DELETE FROM questions WHERE exam_id = %s", (exam_id,))
        conn.commit()
        print(f"  기존 문제 삭제됨")

    inserted = skipped = 0
    for q in questions:
        n = q['n']
        ans = q['a']
        if ans not in (0, 1, 2, 3, 4):
            print(f"  SKIP Q{n}: invalid answer={ans}")
            skipped += 1
            continue

        sid = get_subject_id(exam_id, subject_for(n))
        if not sid:
            print(f"  SKIP Q{n}: no subject")
            skipped += 1
            continue

        code = f"전기기능사-필기-{year}-{rnd}-{n}"
        cur.execute("SELECT id FROM questions WHERE question_code = %s", (code,))
        if cur.fetchone():
            skipped += 1
            continue

        cur.execute("""
            INSERT INTO questions (question_code, exam_id, subject_id, question_type,
                question_text, choice_1, choice_2, choice_3, choice_4,
                answer, points, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, 'MULTIPLE_CHOICE', %s, %s, %s, %s, %s, %s, 1, true, NOW(), NOW())
        """, (code, exam_id, sid, q['q'],
              q['c1'], q['c2'], q['c3'], q['c4'], ans))
        inserted += 1

    conn.commit()
    print(f"  결과: {inserted}개 입력, {skipped}개 스킵")
    return inserted, skipped


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--year', type=int, help='특정 년도만 입력')
    parser.add_argument('--round', type=int, help='특정 회차만 입력')
    parser.add_argument('--replace', action='store_true', help='기존 문제 삭제 후 재입력')
    args = parser.parse_args()

    files = sorted(DATA_DIR.glob('*.json'))
    if args.year:
        files = [f for f in files if f.stem.startswith(f'{args.year}-')]
    if args.round:
        files = [f for f in files if f.stem.endswith(f'-{args.round}')]

    if not files:
        print("처리할 파일 없음")
        return

    total_ins = total_skip = 0
    for f in files:
        ins, sk = insert_exam(f, replace=args.replace)
        total_ins += ins
        total_skip += sk

    # 현황 출력
    cur.execute("""
        SELECT e.year, e.round, COUNT(q.id)
        FROM exams e LEFT JOIN questions q ON q.exam_id = e.id
        WHERE e.category_id = (SELECT id FROM exam_categories WHERE name = '전기기능사')
        GROUP BY e.id, e.year, e.round ORDER BY e.year DESC, e.round
    """)
    print("\n=== 전기기능사 현황 ===")
    for r in cur.fetchall():
        print(f"  {r[0]}년 {r[1]}회: {r[2]}문제")

    print(f"\n=== 작업 결과 ===")
    print(f"  입력: {total_ins}개")
    print(f"  스킵: {total_skip}개")


if __name__ == '__main__':
    try:
        main()
    finally:
        cur.close()
        conn.close()

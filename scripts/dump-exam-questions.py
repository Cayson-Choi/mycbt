"""특정 전기기능사 시험의 모든 문제를 JSON으로 덤프."""
import sys, io, os, json, argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import psycopg2
from dotenv import load_dotenv
load_dotenv('.env.local')

p = argparse.ArgumentParser()
p.add_argument('--year', type=int, required=True)
p.add_argument('--round', type=int, required=True)
p.add_argument('--out', required=True)
args = p.parse_args()

conn = psycopg2.connect(
    host=os.getenv('DATABASE_PGHOST_UNPOOLED') or os.getenv('DATABASE_PGHOST'),
    dbname=os.getenv('DATABASE_PGDATABASE','neondb'),
    user=os.getenv('DATABASE_PGUSER','neondb_owner'),
    password=os.getenv('DATABASE_PGPASSWORD'), sslmode='require')
cur = conn.cursor()
cur.execute("""
    SELECT q.question_code, q.question_text, q.choice_1, q.choice_2, q.choice_3, q.choice_4,
           q.answer, q.image_url
    FROM questions q
    JOIN exams e ON q.exam_id = e.id
    WHERE e.year = %s AND e.round = %s
      AND e.category_id = (SELECT id FROM exam_categories WHERE name = '전기기능사')
    ORDER BY CAST(SUBSTRING(q.question_code FROM '\\d+$') AS INT)
""", (args.year, args.round))

questions = []
for r in cur.fetchall():
    code, q, c1, c2, c3, c4, a, img = r
    n = int(code.split('-')[-1])
    questions.append({
        'n': n, 'q': q, 'c1': c1, 'c2': c2, 'c3': c3, 'c4': c4,
        'a': a, 'img': bool(img)
    })

with open(args.out, 'w', encoding='utf-8') as f:
    json.dump({'year': args.year, 'round': args.round, 'questions': questions}, f, ensure_ascii=False, indent=2)
print(f"Dumped {len(questions)} questions to {args.out}")
cur.close(); conn.close()

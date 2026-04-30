import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import psycopg2
from dotenv import load_dotenv
load_dotenv('.env.local')
conn = psycopg2.connect(
    host=os.getenv('DATABASE_PGHOST_UNPOOLED') or os.getenv('DATABASE_PGHOST'),
    dbname=os.getenv('DATABASE_PGDATABASE','neondb'),
    user=os.getenv('DATABASE_PGUSER','neondb_owner'),
    password=os.getenv('DATABASE_PGPASSWORD'), sslmode='require')
cur = conn.cursor()
cur.execute("""
    SELECT q.question_code, q.question_text, q.choice_1, q.choice_2, q.choice_3, q.choice_4,
           q.answer, q.image_url, s.name
    FROM questions q
    JOIN subjects s ON q.subject_id = s.id
    JOIN exams e ON q.exam_id = e.id
    WHERE e.year = 2023 AND e.round = 1
      AND e.category_id = (SELECT id FROM exam_categories WHERE name = '전기기능사')
    ORDER BY CAST(SUBSTRING(q.question_code FROM '\d+$') AS INT)
""")
for r in cur.fetchall():
    code, q, c1, c2, c3, c4, a, img, subj = r
    n = code.split('-')[-1]
    print(f"[Q{n}] [{subj}] [정답:{a}]" + (f" [IMG]" if img else ""))
    print(f"  Q: {q[:120]}")
    print(f"  ① {c1[:50]}")
    print(f"  ② {c2[:50]}")
    print(f"  ③ {c3[:50]}")
    print(f"  ④ {c4[:50]}")
    print()
cur.close(); conn.close()

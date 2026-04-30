"""소방설비산업기사(전기) 과정평가형 2024-4 questionCode 일괄 정렬.

기존: 객관식 1~27 / 단답형 S1~S10 / 필답형 E1-1 ~ E4-2
신규: 객관식 1~27 / 단답형 28~37 / 필답형 38~45 (연속 단순 숫자)
"""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import psycopg2
from dotenv import load_dotenv
load_dotenv('.env.local')

PREFIX = '소방전기과정평가형-필기-2024-4'

# 단답형: S1 → 28, S2 → 29, ..., S10 → 37
SA_MAP = {f'{PREFIX}-S{i}': f'{PREFIX}-{27 + i}' for i in range(1, 11)}

# 필답형: 순서대로 38 ~ 45
ESSAY_ORDER = ['E1-1', 'E1-2', 'E2-1', 'E2-2', 'E3-1', 'E3-2', 'E4-1', 'E4-2']
ESSAY_MAP = {f'{PREFIX}-{label}': f'{PREFIX}-{38 + i}' for i, label in enumerate(ESSAY_ORDER)}

conn = psycopg2.connect(
    host=os.getenv('DATABASE_PGHOST_UNPOOLED') or os.getenv('DATABASE_PGHOST'),
    dbname=os.getenv('DATABASE_PGDATABASE','neondb'),
    user=os.getenv('DATABASE_PGUSER','neondb_owner'),
    password=os.getenv('DATABASE_PGPASSWORD'), sslmode='require',
)
cur = conn.cursor()

ok = 0
for old, new in {**SA_MAP, **ESSAY_MAP}.items():
    cur.execute("UPDATE questions SET question_code = %s, updated_at = NOW() WHERE question_code = %s RETURNING id",
                (new, old))
    row = cur.fetchone()
    if row:
        print(f"  ✓ {old} → {new}")
        ok += 1
    else:
        print(f"  ❌ {old} (없음)")

conn.commit()
print(f"\n변경: {ok}개")
cur.close(); conn.close()

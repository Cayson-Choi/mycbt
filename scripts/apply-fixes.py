"""검증 에이전트가 출력한 fixes JSON을 DB에 적용.

fixes JSON 형식:
[
  {"code": "전기기능사-필기-2016-1-3", "field": "q", "value": "..."},
  {"code": "...", "field": "c1", "value": "..."},
  {"code": "...", "field": "a", "value": 3},
  ...
]
"""
import sys, io, os, json, argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import psycopg2
from dotenv import load_dotenv
load_dotenv('.env.local')

p = argparse.ArgumentParser()
p.add_argument('--fixes', required=True)
args = p.parse_args()

FIELD_COL = {'q': 'question_text', 'c1': 'choice_1', 'c2': 'choice_2',
             'c3': 'choice_3', 'c4': 'choice_4', 'a': 'answer'}

raw = json.loads(open(args.fixes, encoding='utf-8').read())
# 다양한 출력 형식 수용
if isinstance(raw, dict):
    fixes = raw.get('fixes', [])
    year = raw.get('year')
    rnd = raw.get('round')
else:
    fixes = raw
    year = rnd = None

# 'n' + 'pdf' 형식 → 'code' + 'value' 변환
import re as _re
m = _re.search(r'(\d{4})-(\d+)', args.fixes)
if m:
    year = year or int(m.group(1))
    rnd = rnd or int(m.group(2))

for f in fixes:
    if 'code' not in f and 'n' in f and year and rnd:
        f['code'] = f"전기기능사-필기-{year}-{rnd}-{f['n']}"
    if 'value' not in f:
        f['value'] = f.get('pdf') or f.get('correct') or f.get('expected')

conn = psycopg2.connect(
    host=os.getenv('DATABASE_PGHOST_UNPOOLED') or os.getenv('DATABASE_PGHOST'),
    dbname=os.getenv('DATABASE_PGDATABASE','neondb'),
    user=os.getenv('DATABASE_PGUSER','neondb_owner'),
    password=os.getenv('DATABASE_PGPASSWORD'), sslmode='require')
cur = conn.cursor()

ok = miss = 0
for f in fixes:
    col = FIELD_COL.get(f['field'])
    if not col:
        print(f"  ⚠️ {f['code']}: unknown field {f['field']}")
        continue
    cur.execute(f"UPDATE questions SET {col} = %s, updated_at = NOW() WHERE question_code = %s RETURNING id",
                (f['value'], f['code']))
    row = cur.fetchone()
    if row:
        print(f"  ✓ {f['code']} {f['field']}")
        ok += 1
    else:
        print(f"  ❌ {f['code']} not found")
        miss += 1

conn.commit()
print(f"\n적용: {ok}개, 실패: {miss}개")
cur.close(); conn.close()

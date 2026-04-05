"""Update questions table with OCR results from progress file"""
import json, sys, psycopg2
sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
PROGRESS_FILE = 'data/ocr-progress.json'

with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
    progress = json.load(f)

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

updated = 0
invalid = 0
skipped = 0

for code, val in progress.items():
    if code.startswith('_'):
        continue
    if not isinstance(val, dict):
        continue

    if val.get('invalid'):
        # Mark as inactive with reason text
        cur.execute("""
            UPDATE questions SET
                question_text = %s,
                is_active = false,
                updated_at = NOW()
            WHERE question_code = %s
        """, (val.get('reason', '규정 개정으로 성립되지 않는 문제'), code))
        invalid += 1
        continue

    qt = val.get('question_text', '')
    c1 = val.get('choice_1', '')
    c2 = val.get('choice_2', '')
    c3 = val.get('choice_3', '')
    c4 = val.get('choice_4', '')

    if not qt:
        skipped += 1
        continue

    cur.execute("""
        UPDATE questions SET
            question_text = %s,
            choice_1 = %s,
            choice_2 = %s,
            choice_3 = %s,
            choice_4 = %s,
            updated_at = NOW()
        WHERE question_code = %s
    """, (qt, c1, c2, c3, c4, code))
    updated += 1

conn.commit()

# Verify
cur.execute("SELECT COUNT(*) FROM questions WHERE question_code LIKE 'ELEC-E-%%' AND question_text != '' AND question_text IS NOT NULL")
filled = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM questions WHERE question_code LIKE 'ELEC-E-%%' AND is_active = false")
inactive = cur.fetchone()[0]

print(f'업데이트: {updated}개')
print(f'무효처리: {invalid}개')
print(f'스킵: {skipped}개')
print(f'DB 텍스트 채워진 문제: {filled}/1500')
print(f'DB 비활성 문제: {inactive}')

cur.close()
conn.close()

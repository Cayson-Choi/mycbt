"""Replace \\frac with \\dfrac in all choice columns for larger display."""
import psycopg2, sys, re
sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""SELECT id, question_code, choice_1, choice_2, choice_3, choice_4
    FROM questions WHERE question_code LIKE 'ELEC-E-%%' """)

updated = 0
for qid, code, c1, c2, c3, c4 in cur.fetchall():
    changes = {}
    for i, c in enumerate([c1, c2, c3, c4], 1):
        if not c:
            continue
        # Replace \frac with \dfrac, but skip if already \dfrac
        new_c = re.sub(r'(?<!d)\\frac', r'\\dfrac', c)
        if new_c != c:
            changes[f'choice_{i}'] = new_c

    if changes:
        sets = ', '.join(f'{k} = %s' for k in changes)
        vals = list(changes.values()) + [qid]
        cur.execute(f"UPDATE questions SET {sets}, updated_at = NOW() WHERE id = %s", vals)
        updated += 1
        print(f'{code}: {list(changes.keys())}')

conn.commit()
print(f'\n총 {updated}개 문제 수정')
conn.close()

"""2023년 1회 Q22, Q23, Q24 PDF 기준 수정."""
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

FIXES = [
    {
        'code': '전기기능사-필기-2023-1-22',
        'q': '직류 발전기의 정류를 개선하는 방법 중 틀린 것은?',
        'c1': '코일의 자기 인덕턴스가 원인이므로 접촉 저항이 작은 브러시를 사용한다.',
        'c2': '보극을 설치하여 리액턴스 전압을 감소시킨다.',
        'c3': '보극 권선은 전기자 권선과 직렬로 접속한다.',
        'c4': '브러시를 전기적 중성축을 지나서 회전 방향으로 약간 이동시킨다.',
        'a': 1,
    },
    {
        'code': '전기기능사-필기-2023-1-23',
        'q': '발전기를 정격 전압 220[V]로 운전하다가 무부하로 운전하였더니, 단자 전압이 253[V]가 되었다. 이 발전기의 전압 변동률은 몇 [%]인가?',
        'c1': '15',
        'c2': '25',
        'c3': '35',
        'c4': '45',
        'a': 1,
    },
    {
        'code': '전기기능사-필기-2023-1-24',
        'q': '다음 중 정속도 전동기에 속하는 것은?',
        'c1': '유도 전동기',
        'c2': '직권 전동기',
        'c3': '교류 정류자 전동기',
        'c4': '분권 전동기',
        'a': 4,
    },
]

for f in FIXES:
    cur.execute("""
        UPDATE questions
        SET question_text = %s, choice_1 = %s, choice_2 = %s, choice_3 = %s, choice_4 = %s,
            answer = %s, updated_at = NOW()
        WHERE question_code = %s
        RETURNING id
    """, (f['q'], f['c1'], f['c2'], f['c3'], f['c4'], f['a'], f['code']))
    row = cur.fetchone()
    if row:
        print(f"  ✓ {f['code']} 수정 (id={row[0]}, 정답={f['a']})")
    else:
        print(f"  ❌ {f['code']} 없음")
conn.commit()
cur.close(); conn.close()
print("\n완료")

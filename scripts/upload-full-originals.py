"""Upload FULL original images to Cloudinary without any cropping."""
import os, sys, json, psycopg2
import cloudinary
import cloudinary.uploader

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
cloudinary.config(cloud_name='dwulm3bd0', api_key='225368121665588', api_secret='P1HI0k-tz5-guQFTr5Zw6UVVgWg')

DL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'diagram-originals')

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT id, question_code FROM questions
    WHERE question_text LIKE '%%[그림]%%' AND question_code LIKE 'ELEC-E-%%'
""")
questions = cur.fetchall()
print(f"[그림] 문제: {len(questions)}개")

uploaded = 0
for qid, code in questions:
    fpath = os.path.join(DL_DIR, f"{code}.png")
    if not os.path.exists(fpath):
        print(f"  {code}: 파일 없음")
        continue

    try:
        result = cloudinary.uploader.upload(
            fpath,
            public_id=f"electric-jjang/questions/{code}_q",
            overwrite=True,
            resource_type="image"
        )
        cur.execute("UPDATE questions SET image_url = %s, updated_at = NOW() WHERE id = %s",
                    (result['secure_url'], qid))
        uploaded += 1
        if uploaded % 20 == 0:
            conn.commit()
            print(f"  [{uploaded}/{len(questions)}] OK")
    except Exception as e:
        print(f"  {code}: {e}")

conn.commit()
print(f"\n완료: {uploaded}개 업로드")
conn.close()

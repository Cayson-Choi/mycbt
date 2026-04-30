"""2023년 1회 Q20 회로도 크롭 + Cloudinary 업로드 + DB 업데이트."""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import os
from pathlib import Path
from PIL import Image
import cloudinary
import cloudinary.uploader
import psycopg2
from dotenv import load_dotenv
load_dotenv('.env.local')

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'dwulm3bd0'),
    api_key=os.getenv('CLOUDINARY_API_KEY', '225368121665588'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', 'P1HI0k-tz5-guQFTr5Zw6UVVgWg'),
)

DB_HOST = os.getenv('DATABASE_PGHOST_UNPOOLED') or os.getenv('DATABASE_PGHOST')
conn = psycopg2.connect(
    host=DB_HOST, dbname=os.getenv('DATABASE_PGDATABASE', 'neondb'),
    user=os.getenv('DATABASE_PGUSER', 'neondb_owner'),
    password=os.getenv('DATABASE_PGPASSWORD'), sslmode='require',
)
cur = conn.cursor()

# Page 6 (1190x1682), Q20 회로도 위치 (시각 검증)
PAGE_PATH = Path('data/func-pages/2023-1/page-06.png')
CROP_BOX = (200, 1030, 990, 1240)  # left, top, right, bottom

# 1. 크롭
img = Image.open(PAGE_PATH)
print(f"원본: {img.size}")
cropped = img.crop(CROP_BOX)
print(f"크롭: {cropped.size}")

# 임시 저장
out_dir = Path('data/func-crops')
out_dir.mkdir(parents=True, exist_ok=True)
out_path = out_dir / '2023-1-Q20.png'
cropped.save(out_path)
print(f"저장: {out_path}")

# 2. Cloudinary 업로드
public_id = 'electric-jjang/questions/전기기능사-필기-2023-1-20_q'
result = cloudinary.uploader.upload(
    str(out_path),
    public_id=public_id,
    overwrite=True,
)
url = result['secure_url']
print(f"Cloudinary URL: {url}")

# 3. DB 업데이트
cur.execute("""
    UPDATE questions SET image_url = %s, updated_at = NOW()
    WHERE question_code = %s
    RETURNING id
""", (url, '전기기능사-필기-2023-1-20'))
row = cur.fetchone()
conn.commit()
if row:
    print(f"DB 업데이트 완료: question id={row[0]}")
else:
    print("WARN: DB에 해당 question_code 없음")

cur.close()
conn.close()

"""
Re-crop all diagram images with proper trimming:
1. Apply crop_y to remove text
2. Trim whitespace from all 4 sides (find content bounding box)
3. Add uniform padding around content
4. Upload to Cloudinary
"""
import os, sys, io, json, psycopg2
import cloudinary, cloudinary.uploader
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
cloudinary.config(cloud_name='dwulm3bd0', api_key='225368121665588', api_secret='P1HI0k-tz5-guQFTr5Zw6UVVgWg')

DL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'diagram-originals')

# Load crop_y from precise-crop-upload.py
CROP_Y = {
"ELEC-E-CC-006": 42, "ELEC-E-CC-008": 46, "ELEC-E-CC-010": 24, "ELEC-E-CC-012": 88,
"ELEC-E-CC-014": 62, "ELEC-E-CC-017": 26, "ELEC-E-CC-019": 0, "ELEC-E-CC-021": 20,
"ELEC-E-CC-024": 54, "ELEC-E-CC-025": 54, "ELEC-E-CC-036": 55, "ELEC-E-CC-043": 44,
"ELEC-E-CC-049": 44, "ELEC-E-CC-053": 22, "ELEC-E-CC-056": 22, "ELEC-E-CC-057": 58,
"ELEC-E-CC-058": 50, "ELEC-E-CC-059": 28, "ELEC-E-CC-068": 75, "ELEC-E-CC-070": 30,
"ELEC-E-CC-075": 85, "ELEC-E-CC-077": 48, "ELEC-E-CC-078": 58, "ELEC-E-CC-082": 0,
"ELEC-E-CC-085": 28, "ELEC-E-CC-089": 28, "ELEC-E-CC-090": 55, "ELEC-E-CC-092": 28,
"ELEC-E-CC-094": 72, "ELEC-E-CC-096": 52, "ELEC-E-CC-106": 32, "ELEC-E-CC-107": 52,
"ELEC-E-CC-108": 30, "ELEC-E-CC-124": 30, "ELEC-E-CC-126": 38, "ELEC-E-CC-128": 38,
"ELEC-E-CC-135": 28, "ELEC-E-CC-137": 55, "ELEC-E-CC-139": 0, "ELEC-E-CC-142": 50,
"ELEC-E-CC-146": 38, "ELEC-E-CC-149": 50, "ELEC-E-CC-152": 75, "ELEC-E-CC-154": 48,
"ELEC-E-CC-156": 55, "ELEC-E-CC-159": 50, "ELEC-E-CC-165": 48, "ELEC-E-CC-166": 35,
"ELEC-E-CC-172": 185, "ELEC-E-CC-174": 67, "ELEC-E-CC-177": 22, "ELEC-E-CC-180": 20,
"ELEC-E-CC-184": 47, "ELEC-E-CC-186": 126, "ELEC-E-CC-189": 99, "ELEC-E-CC-190": 45,
"ELEC-E-CC-192": 134, "ELEC-E-CC-195": 60, "ELEC-E-CC-196": 126, "ELEC-E-CC-197": 23,
"ELEC-E-CC-202": 63, "ELEC-E-CC-207": 20, "ELEC-E-CC-208": 85, "ELEC-E-CC-210": 21,
"ELEC-E-CC-211": 30, "ELEC-E-CC-212": 65, "ELEC-E-CC-214": 30, "ELEC-E-CC-215": 55,
"ELEC-E-CC-217": 55, "ELEC-E-CC-222": 30, "ELEC-E-CC-225": 30, "ELEC-E-CC-229": 30,
"ELEC-E-CC-235": 30, "ELEC-E-CC-239": 60, "ELEC-E-CC-240": 48, "ELEC-E-CC-243": 35,
"ELEC-E-CC-245": 100, "ELEC-E-CC-246": 35, "ELEC-E-CC-247": 30, "ELEC-E-CC-249": 30,
"ELEC-E-CC-253": 136, "ELEC-E-CC-255": 96, "ELEC-E-CC-257": 96, "ELEC-E-CC-259": 60,
"ELEC-E-CC-261": 50, "ELEC-E-CC-269": 62, "ELEC-E-CC-271": 28, "ELEC-E-CC-274": 62,
"ELEC-E-CC-275": 68, "ELEC-E-CC-277": 100, "ELEC-E-CC-279": 114, "ELEC-E-CC-281": 150,
"ELEC-E-CC-288": 38, "ELEC-E-CC-289": 100, "ELEC-E-CC-290": 32, "ELEC-E-CC-294": 48,
"ELEC-E-CC-295": 35, "ELEC-E-CC-361": 85, "ELEC-E-CC-362": 50, "ELEC-E-CC-363": 75,
"ELEC-E-CC-368": 80, "ELEC-E-CC-370": 85, "ELEC-E-CC-374": 130, "ELEC-E-CC-376": 48,
"ELEC-E-CC-377": 48,
"ELEC-E-EL-043": 50, "ELEC-E-EL-162": 48,
"ELEC-E-EM-001": 0, "ELEC-E-EM-018": 0, "ELEC-E-EM-025": 55, "ELEC-E-EM-066": 72,
"ELEC-E-EM-072": 148,
"ELEC-E-EM-081": 120, "ELEC-E-EM-113": 145, "ELEC-E-EM-131": 95, "ELEC-E-EM-135": 0,
"ELEC-E-EM-138": 0, "ELEC-E-EM-143": 155, "ELEC-E-EM-150": 65, "ELEC-E-EM-182": 55,
"ELEC-E-EM-186": 95, "ELEC-E-EM-190": 0, "ELEC-E-EM-193": 90, "ELEC-E-EM-225": 95,
"ELEC-E-EM-227": 135, "ELEC-E-EM-231": 0, "ELEC-E-EM-233": 60, "ELEC-E-EM-237": 110,
"ELEC-E-EM-257": 130, "ELEC-E-EM-259": 90, "ELEC-E-EM-264": 100, "ELEC-E-EM-270": 180,
"ELEC-E-EM-273": 115, "ELEC-E-EM-275": 115, "ELEC-E-EM-285": 100, "ELEC-E-EM-286": 90,
"ELEC-E-EM-297": 120, "ELEC-E-EM-298": 95,
"ELEC-E-EM-301": 125, "ELEC-E-EM-320": 185,
"ELEC-E-XX-011": 130, "ELEC-E-XX-016": 80, "ELEC-E-XX-020": 60, "ELEC-E-XX-072": 65,
"ELEC-E-XX-085": 22, "ELEC-E-XX-157": 130, "ELEC-E-XX-172": 188, "ELEC-E-XX-188": 95,
"ELEC-E-XX-229": 58, "ELEC-E-XX-235": 62, "ELEC-E-XX-285": 110, "ELEC-E-XX-318": 25,
"ELEC-E-XX-345": 108, "ELEC-E-XX-362": 110, "ELEC-E-XX-409": 108, "ELEC-E-XX-505": 138,
"ELEC-E-XX-537": 208, "ELEC-E-XX-570": 82, "ELEC-E-XX-571": 100,
}

PADDING = 10  # uniform padding in pixels


def crop_and_trim(image_path, crop_y):
    """Crop at crop_y, then trim whitespace from all 4 sides with uniform padding."""
    img = Image.open(image_path).convert('RGB')
    w, h = img.size

    # Step 1: crop_y to remove text (add extra margin to avoid text remnants)
    effective_crop = crop_y + 20 if crop_y > 0 else 0
    if effective_crop > 0 and effective_crop < h - 10:
        img = img.crop((0, effective_crop, w, h))

    # Step 2: find content bounding box (non-white pixels)
    gray = np.array(img.convert('L'))
    # threshold: anything darker than 240 is "content"
    mask = gray < 240
    rows_with_content = np.any(mask, axis=1)
    cols_with_content = np.any(mask, axis=0)

    if not np.any(rows_with_content):
        return img  # all white, return as-is

    top = np.argmax(rows_with_content)
    bottom = len(rows_with_content) - np.argmax(rows_with_content[::-1])
    left = np.argmax(cols_with_content)
    right = len(cols_with_content) - np.argmax(cols_with_content[::-1])

    # Step 3: add uniform padding
    ch, cw = img.size[1], img.size[0]
    top = max(0, top - PADDING)
    bottom = min(ch, bottom + PADDING)
    left = max(0, left - PADDING)
    right = min(cw, right + PADDING)

    trimmed = img.crop((left, top, right, bottom))

    # Sanity check
    tw, th = trimmed.size
    if tw < 20 or th < 20:
        return img

    return trimmed


conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT id, question_code FROM questions
    WHERE question_text LIKE '%%[그림]%%' AND question_code LIKE 'ELEC-E-%%'
""")
questions = cur.fetchall()
print(f"[그림] 문제: {len(questions)}개")

uploaded = 0
failed = 0
for qid, code in questions:
    fpath = os.path.join(DL_DIR, f"{code}.png")
    if not os.path.exists(fpath):
        failed += 1
        continue

    crop_y = CROP_Y.get(code, 0)

    try:
        result_img = crop_and_trim(fpath, crop_y)
        buf = io.BytesIO()
        result_img.save(buf, format='PNG')
        buf.seek(0)

        result = cloudinary.uploader.upload(
            buf,
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
        failed += 1

conn.commit()
print(f"\n완료: {uploaded}개 업로드, {failed}개 실패")
conn.close()

"""
Fix diagram images: crop ONLY the diagram part (remove text), keep RGB, upload to Cloudinary.
"""
import os, sys, requests, time, json, io
import psycopg2
import cloudinary
import cloudinary.uploader
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
cloudinary.config(cloud_name='dwulm3bd0', api_key='225368121665588', api_secret='P1HI0k-tz5-guQFTr5Zw6UVVgWg')

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DOWNLOAD_DIR = os.path.join(BASE, 'data', 'diagram-originals')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def crop_diagram_only(image_path):
    """
    Crop ONLY the diagram portion from a question image.
    Keep original RGB colors. Use grayscale only for analysis.

    Strategy:
    - Korean text lines are dense horizontal bands (many dark pixels per row)
    - Diagrams have sparser lines
    - Find the last row of "dense text" then crop everything below it
    """
    img_rgb = Image.open(image_path).convert('RGB')
    img_gray = img_rgb.convert('L')
    pixels = np.array(img_gray)
    h, w = pixels.shape

    # Count dark pixels per row (threshold: pixel < 180 is "ink")
    ink_per_row = np.sum(pixels < 180, axis=1)

    # A "text row" has many scattered small dark regions (Korean characters)
    # Typically > 3% of width has ink for text
    text_threshold = w * 0.03

    # Find content regions
    has_content = ink_per_row > (w * 0.003)  # Any visible content
    is_text_row = ink_per_row > text_threshold  # Dense enough to be text

    # Scan from top: find where text block ends
    # Text block = consecutive rows (allowing small gaps) with text-density
    last_text_row = 0
    in_text = False
    gap_count = 0

    for i in range(h):
        if is_text_row[i]:
            in_text = True
            last_text_row = i
            gap_count = 0
        elif in_text:
            gap_count += 1
            # Allow gaps of up to 8 rows within text (line spacing)
            if gap_count > 12:
                # Text block ended
                break

    if last_text_row == 0:
        # No text found - return full image
        return img_rgb

    # Diagram starts after text block + some padding
    diagram_top = last_text_row + 5

    # Find diagram bottom (last row with any content)
    diagram_bottom = h
    for i in range(h - 1, diagram_top, -1):
        if has_content[i]:
            diagram_bottom = min(h, i + 5)
            break

    # Verify there's actually content in the diagram region
    diagram_region = pixels[diagram_top:diagram_bottom, :]
    if diagram_region.size == 0 or np.sum(diagram_region < 180) < 50:
        # No significant diagram content found
        return img_rgb

    # Also trim left/right whitespace
    col_ink = np.sum(pixels[diagram_top:diagram_bottom, :] < 180, axis=0)
    left = 0
    right = w
    for i in range(w):
        if col_ink[i] > 0:
            left = max(0, i - 5)
            break
    for i in range(w - 1, 0, -1):
        if col_ink[i] > 0:
            right = min(w, i + 5)
            break

    cropped = img_rgb.crop((left, diagram_top, right, diagram_bottom))

    # Sanity check: cropped image should be reasonable size
    cw, ch = cropped.size
    if ch < 20 or cw < 20:
        return img_rgb  # Too small, return full

    return cropped


# === Load source data ===
DATA_FILE = os.path.join(BASE, 'data', 'electric-engineer-questions.json')
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    exam_data = json.load(f)

code_to_url = {}
code_to_choice_urls = {}
for exam in exam_data:
    for subj in exam['subjects']:
        for q in subj['questions']:
            code_to_url[q['question_code']] = q.get('image_url', '')
            code_to_choice_urls[q['question_code']] = [
                q.get('choice_1_image', ''),
                q.get('choice_2_image', ''),
                q.get('choice_3_image', ''),
                q.get('choice_4_image', ''),
            ]

# 2025-2 URLs
Q2025_FILE = os.path.join(BASE, 'data', '2025-2-questions.json')
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

if os.path.exists(Q2025_FILE):
    with open(Q2025_FILE, 'r', encoding='utf-8') as f:
        q2025 = json.load(f)
    cur.execute("SELECT question_code FROM questions WHERE exam_id = (SELECT id FROM exams WHERE name LIKE '%%2025%%2%%' AND name LIKE '%%전기기사%%' LIMIT 1)")
    for (code,) in cur.fetchall():
        num = int(code.split('-')[-1]) - 300
        for hq in q2025:
            if hq['num'] == num:
                code_to_url[code] = hq.get('q_img', '')
                code_to_choice_urls[code] = hq.get('c_imgs', ['','','',''])
                break

# Get [그림] questions
cur.execute("""
    SELECT id, question_code FROM questions
    WHERE question_text LIKE '%%[그림]%%' AND question_code LIKE 'ELEC-E-%%'
""")
diagram_questions = cur.fetchall()
print(f"[그림] 문제: {len(diagram_questions)}개")

# Get [그림] choice questions
cur.execute("""
    SELECT id, question_code, choice_1, choice_2, choice_3, choice_4
    FROM questions
    WHERE (choice_1 LIKE '%%[그림]%%' OR choice_2 LIKE '%%[그림]%%'
        OR choice_3 LIKE '%%[그림]%%' OR choice_4 LIKE '%%[그림]%%')
    AND question_code LIKE 'ELEC-E-%%'
""")
choice_diagram_qs = cur.fetchall()
print(f"[그림] 보기: {len(choice_diagram_qs)}개")

# Process question diagrams
uploaded = 0
failed = 0
for qid, code in diagram_questions:
    orig_url = code_to_url.get(code, '')
    if not orig_url:
        failed += 1
        continue

    fname = f"{code}.png"
    fpath = os.path.join(DOWNLOAD_DIR, fname)
    if not os.path.exists(fpath):
        try:
            r = requests.get(orig_url, timeout=20)
            if r.status_code != 200:
                print(f"  {code}: HTTP {r.status_code}")
                failed += 1
                continue
            with open(fpath, 'wb') as f:
                f.write(r.content)
        except Exception as e:
            print(f"  {code}: 다운로드 실패 - {e}")
            failed += 1
            continue

    try:
        diagram = crop_diagram_only(fpath)
        buf = io.BytesIO()
        diagram.save(buf, format='PNG')
        buf.seek(0)

        result = cloudinary.uploader.upload(
            buf,
            public_id=f"electric-jjang/questions/{code}_q",
            overwrite=True,
            resource_type="image"
        )
        cloud_url = result['secure_url']
        cur.execute("UPDATE questions SET image_url = %s, updated_at = NOW() WHERE id = %s",
                    (cloud_url, qid))
        uploaded += 1
        if uploaded % 10 == 0:
            conn.commit()
            print(f"  [{uploaded}/{len(diagram_questions)}] {code} OK")
    except Exception as e:
        print(f"  {code}: 실패 - {e}")
        failed += 1
        time.sleep(1)

conn.commit()
print(f"\n문제 이미지: {uploaded}개 업로드, {failed}개 실패")

# Process choice diagrams (no cropping needed - choice images are usually just the diagram)
choice_uploaded = 0
for qid, code, c1, c2, c3, c4 in choice_diagram_qs:
    choice_urls = code_to_choice_urls.get(code, ['','','',''])
    for i, (ctext, curl) in enumerate(zip([c1,c2,c3,c4], choice_urls), 1):
        if '[그림]' not in (ctext or ''):
            continue
        if not curl:
            continue

        fname = f"{code}_c{i}.png"
        fpath = os.path.join(DOWNLOAD_DIR, fname)
        if not os.path.exists(fpath):
            try:
                r = requests.get(curl, timeout=20)
                if r.status_code != 200:
                    continue
                with open(fpath, 'wb') as f:
                    f.write(r.content)
            except:
                continue

        try:
            result = cloudinary.uploader.upload(
                fpath,
                public_id=f"electric-jjang/questions/{code}_c{i}",
                overwrite=True,
                resource_type="image"
            )
            col = f"choice_{i}_image"
            cur.execute(f"UPDATE questions SET {col} = %s, updated_at = NOW() WHERE id = %s",
                        (result['secure_url'], qid))
            choice_uploaded += 1
        except Exception as e:
            print(f"  {code} c{i}: 실패 - {e}")

conn.commit()
print(f"보기 이미지: {choice_uploaded}개 업로드")

# Summary
cur.execute("SELECT COUNT(*) FROM questions WHERE image_url LIKE '%%cloudinary%%' AND question_code LIKE 'ELEC-E-%%'")
print(f"\nCloudinary 이미지: {cur.fetchone()[0]}개")
conn.close()

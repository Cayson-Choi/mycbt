"""
Fix diagram images v2:
- Better text/diagram boundary detection using transition counting
- Korean text rows have MANY white<->dark transitions (characters are small)
- Diagram rows have FEW transitions (lines, shapes)
- Also: restore invalid EL questions
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


def crop_diagram_v2(image_path):
    """
    Improved diagram cropping using transition counting.
    Korean text has many transitions per row (30+), diagrams have fewer (<15).
    """
    img_rgb = Image.open(image_path).convert('RGB')
    img_gray = np.array(img_rgb.convert('L'))
    h, w = img_gray.shape

    # Binary: True = dark pixel (ink)
    binary = (img_gray < 180).astype(np.int8)

    # Count transitions (white->dark + dark->white) per row
    transitions = np.sum(np.abs(np.diff(binary, axis=1)), axis=1)

    # Also count ink pixels per row
    ink_per_row = np.sum(binary, axis=1)

    # A "text row" has many transitions (>= 16) AND some ink
    # A "diagram row" has fewer transitions but may still have ink
    TEXT_TRANSITION_THRESHOLD = 16
    MIN_INK = w * 0.002  # at least some content

    is_text_row = (transitions >= TEXT_TRANSITION_THRESHOLD) & (ink_per_row > MIN_INK)
    has_content = ink_per_row > MIN_INK

    # Find the last text row, allowing small gaps (line spacing)
    last_text_row = 0
    in_text = False
    gap = 0
    for i in range(h):
        if is_text_row[i]:
            in_text = True
            last_text_row = i
            gap = 0
        elif in_text:
            gap += 1
            if gap > 20:
                break

    # Also scan backwards from bottom to find last text row in case text appears in middle
    # Sometimes a question has text -> diagram -> more text (rare)
    # We want the boundary between the LAST text section before the diagram

    # Safety: if last_text_row is near the bottom (>80%), the whole image might be text
    if last_text_row > h * 0.85:
        # Check if there's any non-text content region
        # If not, return full image
        non_text_content = has_content & ~is_text_row
        if np.sum(non_text_content) < 50:
            return img_rgb  # All text, no diagram

    # Crop point: a few pixels below the last text row
    crop_top = min(last_text_row + 8, h - 1)

    # Find the bottom of diagram content
    crop_bottom = h
    for i in range(h - 1, crop_top, -1):
        if has_content[i]:
            crop_bottom = min(h, i + 5)
            break

    # Verify diagram region has meaningful content
    diagram_region = binary[crop_top:crop_bottom, :]
    if diagram_region.size == 0 or np.sum(diagram_region) < 30:
        return img_rgb  # No meaningful diagram

    # Trim horizontal whitespace
    col_ink = np.sum(diagram_region, axis=0)
    left = 0
    right = w
    for i in range(w):
        if col_ink[i] > 0:
            left = max(0, i - 3)
            break
    for i in range(w - 1, 0, -1):
        if col_ink[i] > 0:
            right = min(w, i + 3)
            break

    cropped = img_rgb.crop((left, crop_top, right, crop_bottom))
    cw, ch = cropped.size
    if ch < 15 or cw < 15:
        return img_rgb

    return cropped


def upload_image(image, public_id):
    """Upload PIL Image to Cloudinary, return URL"""
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    buf.seek(0)
    result = cloudinary.uploader.upload(buf, public_id=public_id, overwrite=True, resource_type="image")
    return result['secure_url']


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
                q.get(f'choice_{i}_image', '') for i in range(1, 5)
            ]

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

# === Part 1: Restore invalid EL questions (set is_active = true) ===
print("=== 전기설비기술기준 무효 문제 복원 ===")
cur.execute("""
    SELECT id, question_code, question_text FROM questions
    WHERE is_active = false AND question_code LIKE 'ELEC-E-%%'
""")
invalid_qs = cur.fetchall()
print(f"비활성 문제: {len(invalid_qs)}개")

# Load OCR progress for the previously-invalid questions
PROGRESS_FILE = os.path.join(BASE, 'data', 'ocr-progress.json')
with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
    progress = json.load(f)

restored = 0
still_invalid = []
for qid, code, qtext in invalid_qs:
    p = progress.get(code, {})
    if p.get('invalid'):
        # Check if we have the original question image - we can try to OCR later
        # For now, mark as active with a note
        orig_url = code_to_url.get(code, '')
        if orig_url:
            # Try to get OCR from the image
            # For now just set active with placeholder text
            cur.execute("""
                UPDATE questions SET
                    question_text = '(규정 개정 문제) ' || COALESCE(NULLIF(question_text, ''), %s),
                    is_active = true,
                    updated_at = NOW()
                WHERE id = %s
            """, (p.get('reason', ''), qid))
            restored += 1
            still_invalid.append(code)
        else:
            cur.execute("UPDATE questions SET is_active = true, updated_at = NOW() WHERE id = %s", (qid,))
            restored += 1
            still_invalid.append(code)
    else:
        # Was marked invalid but has OCR data (like EM-292)
        cur.execute("UPDATE questions SET is_active = true, updated_at = NOW() WHERE id = %s", (qid,))
        restored += 1

conn.commit()
print(f"복원: {restored}개")
print(f"규정 개정 문제 목록:")
for code in still_invalid:
    print(f"  {code}")

# === Part 2: Re-upload ALL [그림] images with fixed cropping ===
print("\n=== [그림] 이미지 재업로드 (크롭 개선) ===")
cur.execute("""
    SELECT id, question_code FROM questions
    WHERE question_text LIKE '%%[그림]%%' AND question_code LIKE 'ELEC-E-%%'
""")
diagram_questions = cur.fetchall()
print(f"[그림] 문제: {len(diagram_questions)}개")

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
                failed += 1
                continue
            with open(fpath, 'wb') as f:
                f.write(r.content)
        except:
            failed += 1
            continue

    try:
        diagram = crop_diagram_v2(fpath)
        cloud_url = upload_image(diagram, f"electric-jjang/questions/{code}_q")
        cur.execute("UPDATE questions SET image_url = %s, updated_at = NOW() WHERE id = %s",
                    (cloud_url, qid))
        uploaded += 1
        if uploaded % 20 == 0:
            conn.commit()
            print(f"  [{uploaded}/{len(diagram_questions)}] OK")
    except Exception as e:
        print(f"  {code}: 실패 - {e}")
        failed += 1
        time.sleep(1)

conn.commit()
print(f"문제 이미지: {uploaded}개 업로드, {failed}개 실패")

# Choice [그림] images (re-upload as-is, no cropping)
cur.execute("""
    SELECT id, question_code, choice_1, choice_2, choice_3, choice_4
    FROM questions
    WHERE (choice_1 LIKE '%%[그림]%%' OR choice_2 LIKE '%%[그림]%%'
        OR choice_3 LIKE '%%[그림]%%' OR choice_4 LIKE '%%[그림]%%')
    AND question_code LIKE 'ELEC-E-%%'
""")
choice_qs = cur.fetchall()
choice_uploaded = 0
for qid, code, c1, c2, c3, c4 in choice_qs:
    curl_list = code_to_choice_urls.get(code, ['','','',''])
    for i, (ct, curl) in enumerate(zip([c1,c2,c3,c4], curl_list), 1):
        if '[그림]' not in (ct or '') or not curl:
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
            img = Image.open(fpath).convert('RGB')
            cloud_url = upload_image(img, f"electric-jjang/questions/{code}_c{i}")
            cur.execute(f"UPDATE questions SET choice_{i}_image = %s, updated_at = NOW() WHERE id = %s",
                        (cloud_url, qid))
            choice_uploaded += 1
        except Exception as e:
            print(f"  {code} c{i}: 실패 - {e}")

conn.commit()
print(f"보기 이미지: {choice_uploaded}개")

# Final
cur.execute("SELECT COUNT(*) FROM questions WHERE image_url LIKE '%%cloudinary%%' AND question_code LIKE 'ELEC-E-%%'")
print(f"\nCloudinary 이미지: {cur.fetchone()[0]}개")
cur.execute("SELECT COUNT(*) FROM questions WHERE is_active = false AND question_code LIKE 'ELEC-E-%%'")
print(f"비활성: {cur.fetchone()[0]}개")
conn.close()

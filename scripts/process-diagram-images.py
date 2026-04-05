"""
Process all question images:
1. Find questions with [그림] in text
2. Download original image from engineerlab
3. Auto-crop diagram portion (below text)
4. Upload to Cloudinary
5. Update DB: set Cloudinary URL for [그림] questions, clear URLs for text-only questions
"""
import os, sys, json, requests, time, io
import psycopg2
import cloudinary
import cloudinary.uploader
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

cloudinary.config(
    cloud_name='dwulm3bd0',
    api_key='225368121665588',
    api_secret='P1HI0k-tz5-guQFTr5Zw6UVVgWg'
)

DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'diagram-images')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_image(url, filepath):
    """Download image from URL"""
    if os.path.exists(filepath):
        return True
    try:
        r = requests.get(url, timeout=20)
        if r.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(r.content)
            return True
        return False
    except:
        return False

def crop_diagram(image_path):
    """
    Auto-crop diagram from question image.
    Strategy: Find the gap between text (top) and diagram (bottom).
    Text rows have many small dark pixels spread across width.
    After text ends, there's a whitespace gap, then diagram starts.
    We crop from the diagram start to the bottom.
    """
    img = Image.open(image_path).convert('L')  # Grayscale
    pixels = np.array(img)
    h, w = pixels.shape

    # Calculate ink density per row (pixels darker than threshold)
    threshold = 200
    row_ink = np.sum(pixels < threshold, axis=1)

    # Find rows with content (ink > 1% of width)
    min_ink = w * 0.005
    has_content = row_ink > min_ink

    # Find the first significant whitespace gap after initial content
    # Strategy: Look for a gap of 5+ consecutive blank rows after content has started
    content_started = False
    gap_start = -1
    gap_length = 0
    text_end = -1
    diagram_start = -1

    for i in range(h):
        if has_content[i]:
            content_started = True
            if gap_length >= 5 and gap_start > h * 0.1:
                # Found a significant gap - text ends before gap, diagram starts after
                text_end = gap_start
                diagram_start = i
                break
            gap_start = -1
            gap_length = 0
        else:
            if content_started:
                if gap_start == -1:
                    gap_start = i
                gap_length += 1

    if diagram_start == -1:
        # No clear gap found - try alternate: look for a gap in upper 60% of image
        for i in range(int(h * 0.15), int(h * 0.6)):
            if not has_content[i]:
                if gap_start == -1:
                    gap_start = i
                gap_length += 1
                if gap_length >= 4:
                    # Check if there's content after this gap
                    remaining = has_content[gap_start + gap_length:]
                    if np.any(remaining):
                        text_end = gap_start
                        # Find where content resumes
                        for j in range(gap_start + gap_length, h):
                            if has_content[j]:
                                diagram_start = j
                                break
                        if diagram_start > 0:
                            break
            else:
                gap_start = -1
                gap_length = 0

    if diagram_start <= 0 or diagram_start >= h * 0.9:
        # Couldn't find a good split - return full image
        return img

    # Add small margin above diagram
    margin = max(0, diagram_start - 3)

    # Find diagram bottom (last row with content)
    diagram_bottom = h
    for i in range(h - 1, diagram_start, -1):
        if has_content[i]:
            diagram_bottom = min(h, i + 5)
            break

    # Crop
    cropped = img.crop((0, margin, w, diagram_bottom))
    return cropped

def upload_to_cloudinary(image, question_code, suffix='q'):
    """Upload PIL image to Cloudinary"""
    buf = io.BytesIO()
    image.save(buf, format='PNG')
    buf.seek(0)

    public_id = f"electric-jjang/questions/{question_code}_{suffix}"
    result = cloudinary.uploader.upload(
        buf,
        public_id=public_id,
        folder="",
        overwrite=True,
        resource_type="image"
    )
    return result['secure_url']


# === MAIN ===
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Step 1: Get all questions with [그림]
cur.execute("""
    SELECT id, question_code, question_text, image_url,
           choice_1, choice_2, choice_3, choice_4,
           choice_1_image, choice_2_image, choice_3_image, choice_4_image
    FROM questions
    WHERE question_code LIKE 'ELEC-E-%%'
    ORDER BY question_code
""")
all_questions = cur.fetchall()
print(f"전체 문제: {len(all_questions)}개")

diagram_questions = []
text_only_questions = []
choice_diagram_questions = []

for row in all_questions:
    qid, code, qtext, img_url = row[0], row[1], row[2] or '', row[3] or ''
    c1, c2, c3, c4 = row[4] or '', row[5] or '', row[6] or '', row[7] or ''
    c1i, c2i, c3i, c4i = row[8] or '', row[9] or '', row[10] or '', row[11] or ''

    if '[그림]' in qtext:
        diagram_questions.append({
            'id': qid, 'code': code, 'img_url': img_url,
            'c1': c1, 'c2': c2, 'c3': c3, 'c4': c4,
            'c1i': c1i, 'c2i': c2i, 'c3i': c3i, 'c4i': c4i
        })
    else:
        text_only_questions.append({'id': qid, 'code': code})

    # Check choices for [그림]
    for i, (c, ci) in enumerate([(c1, c1i), (c2, c2i), (c3, c3i), (c4, c4i)], 1):
        if '[그림]' in c and ci:
            choice_diagram_questions.append({
                'id': qid, 'code': code, 'choice_num': i, 'choice_img': ci
            })

print(f"[그림] 문제: {len(diagram_questions)}개")
print(f"텍스트만 문제: {len(text_only_questions)}개")
print(f"[그림] 보기: {len(choice_diagram_questions)}개")

# Step 2: Clear ALL engineerlab URLs for text-only questions
print("\n--- 텍스트만 문제: engineerlab URL 제거 ---")
cleared = 0
for q in text_only_questions:
    cur.execute("""
        UPDATE questions SET
            image_url = NULL,
            choice_1_image = NULL, choice_2_image = NULL,
            choice_3_image = NULL, choice_4_image = NULL,
            updated_at = NOW()
        WHERE id = %s
    """, (q['id'],))
    cleared += 1
conn.commit()
print(f"  {cleared}개 URL 제거 완료")

# Step 3: Process [그림] questions - download, crop diagram, upload to Cloudinary
print("\n--- [그림] 문제: 다이어그램 추출 & Cloudinary 업로드 ---")
uploaded = 0
failed = 0

for i, q in enumerate(diagram_questions):
    code = q['code']
    img_url = q['img_url']

    if not img_url or 'engineerlab' not in img_url:
        print(f"  {code}: URL 없음, 스킵")
        failed += 1
        continue

    # Download
    fname = f"{code}_q.png"
    fpath = os.path.join(DOWNLOAD_DIR, fname)
    if not download_image(img_url, fpath):
        print(f"  {code}: 다운로드 실패")
        failed += 1
        continue

    # Crop diagram
    try:
        diagram_img = crop_diagram(fpath)
    except Exception as e:
        print(f"  {code}: 크롭 실패 - {e}")
        # Upload full image as fallback
        diagram_img = Image.open(fpath)

    # Upload to Cloudinary
    try:
        cloud_url = upload_to_cloudinary(diagram_img, code)
        # Update DB
        cur.execute("""
            UPDATE questions SET
                image_url = %s,
                choice_1_image = NULL, choice_2_image = NULL,
                choice_3_image = NULL, choice_4_image = NULL,
                updated_at = NOW()
            WHERE id = %s
        """, (cloud_url, q['id']))
        uploaded += 1
        if (i + 1) % 10 == 0:
            conn.commit()
            print(f"  [{i+1}/{len(diagram_questions)}] {code} -> {cloud_url[:60]}...")
    except Exception as e:
        print(f"  {code}: 업로드 실패 - {e}")
        failed += 1
        # Still clear the engineerlab URLs
        cur.execute("""
            UPDATE questions SET
                image_url = NULL,
                choice_1_image = NULL, choice_2_image = NULL,
                choice_3_image = NULL, choice_4_image = NULL,
                updated_at = NOW()
            WHERE id = %s
        """, (q['id'],))
        time.sleep(1)

conn.commit()
print(f"\n  업로드 완료: {uploaded}개, 실패: {failed}개")

# Step 4: Process choice [그림] images
print("\n--- [그림] 보기: 다이어그램 업로드 ---")
choice_uploaded = 0
for cq in choice_diagram_questions:
    code = cq['code']
    ci = cq['choice_img']
    cn = cq['choice_num']

    if not ci or 'engineerlab' not in ci:
        continue

    fname = f"{code}_c{cn}.png"
    fpath = os.path.join(DOWNLOAD_DIR, fname)
    if not download_image(ci, fpath):
        print(f"  {code} c{cn}: 다운로드 실패")
        continue

    try:
        # Choice images are usually just the diagram, no text to crop
        img = Image.open(fpath)
        cloud_url = upload_to_cloudinary(img, code, f"c{cn}")
        col = f"choice_{cn}_image"
        cur.execute(f"UPDATE questions SET {col} = %s, updated_at = NOW() WHERE id = %s",
                    (cloud_url, cq['id']))
        choice_uploaded += 1
    except Exception as e:
        print(f"  {code} c{cn}: 업로드 실패 - {e}")

conn.commit()
print(f"  보기 업로드: {choice_uploaded}개")

# Final summary
cur.execute("SELECT COUNT(*) FROM questions WHERE image_url IS NOT NULL AND image_url != '' AND question_code LIKE 'ELEC-E-%%'")
has_img = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM questions WHERE image_url LIKE '%%cloudinary%%' AND question_code LIKE 'ELEC-E-%%'")
has_cloud = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM questions WHERE image_url LIKE '%%engineerlab%%' AND question_code LIKE 'ELEC-E-%%'")
has_eng = cur.fetchone()[0]

print(f"\n=== 최종 결과 ===")
print(f"이미지 URL 있는 문제: {has_img}개")
print(f"Cloudinary URL: {has_cloud}개")
print(f"engineerlab URL 잔존: {has_eng}개")

conn.close()

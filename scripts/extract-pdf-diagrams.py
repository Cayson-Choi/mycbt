"""
PDF 페이지에서 다이어그램 문제의 그림 영역만 크롭하여 Cloudinary에 업로드
- 4문제/페이지 (2x2 그리드) 레이아웃 기준으로 개별 문제 영역 추출
- 각 문제 영역에서 텍스트 부분을 제외하고 그림만 크롭
- Agent 비전으로 crop_y 결정 후 크롭 + 업로드
"""
import os, sys, io, json
import cloudinary, cloudinary.uploader
from PIL import Image
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

cloudinary.config(cloud_name='dwulm3bd0', api_key='225368121665588', api_secret='P1HI0k-tz5-guQFTr5Zw6UVVgWg')

PAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'pdf-pages')
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'diagram-crops')
os.makedirs(OUT_DIR, exist_ok=True)

# Page layout: 1598 x 2126 pixels at 200 DPI
# 2x2 grid with header area at top (~150px) and footer (~80px)
# Position mapping:
#   pos 0 = top-left (Q1), pos 1 = top-right (Q3)
#   pos 2 = bottom-left (Q2), pos 3 = bottom-right (Q4)
# Actually the layout is:
#   top-left = odd (Q1), top-right = odd (Q3)
#   bottom-left = even (Q2), bottom-right = even (Q4)

PAGE_W = 1598
PAGE_H = 2126
HEADER_H = 150  # top header area
FOOTER_H = 80   # bottom answer area
CONTENT_H = PAGE_H - HEADER_H - FOOTER_H
HALF_W = PAGE_W // 2
HALF_H = CONTENT_H // 2

# Grid positions (x, y, w, h) relative to full page
# pos 0 (Q_odd_left): top-left quadrant
# pos 1 (Q_odd_right): top-right quadrant
# pos 2 (Q_even_left): bottom-left quadrant
# pos 3 (Q_even_right): bottom-right quadrant
GRID = {
    0: (0, HEADER_H, HALF_W, HALF_H),
    1: (HALF_W, HEADER_H, HALF_W, HALF_H),
    2: (0, HEADER_H + HALF_H, HALF_W, HALF_H),
    3: (HALF_W, HEADER_H + HALF_H, HALF_W, HALF_H),
}

PADDING = 8

SUBJECT_CODE = {'EM': 'EM', 'PC': 'PC', 'MA': 'MA', 'CC': 'CC', 'EL': 'EL'}

# exam_id and subject_id mapping
EXAM_MAP = {
    '2023-2': 44, '2023-3': 45, '2024-1': 46, '2024-2': 47, '2024-3': 48,
}


def crop_question_area(page_img_path, pos):
    """Extract one question's area from a 2x2 grid page."""
    img = Image.open(page_img_path).convert('RGB')
    x, y, w, h = GRID[pos]
    return img.crop((x, y, x + w, y + h))


def trim_whitespace(img, padding=PADDING):
    """Trim whitespace from all sides with uniform padding."""
    gray = np.array(img.convert('L'))
    mask = gray < 240
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)

    if not np.any(rows):
        return img

    top = np.argmax(rows)
    bottom = len(rows) - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = len(cols) - np.argmax(cols[::-1])

    h, w = gray.shape
    top = max(0, top - padding)
    bottom = min(h, bottom + padding)
    left = max(0, left - padding)
    right = min(w, right + padding)

    trimmed = img.crop((left, top, right, bottom))
    if trimmed.size[0] < 20 or trimmed.size[1] < 20:
        return img
    return trimmed


def extract_and_save(exam, subject, num, page, pos, crop_y=None):
    """Extract diagram from page, crop, and save."""
    page_path = os.path.join(PAGES_DIR, f'{exam}_p{page:02d}.png')
    if not os.path.exists(page_path):
        print(f'  WARNING: {page_path} not found')
        return None

    # Step 1: Extract question area from 2x2 grid
    q_img = crop_question_area(page_path, pos)

    # Step 2: Apply crop_y if provided (to remove text, keep only diagram)
    if crop_y and crop_y > 0:
        w, h = q_img.size
        if crop_y < h - 10:
            q_img = q_img.crop((0, crop_y, w, h))

    # Step 3: Trim whitespace
    q_img = trim_whitespace(q_img)

    # Step 4: Save locally
    code = f'{exam}_{subject}-{num:02d}'
    out_path = os.path.join(OUT_DIR, f'{code}.png')
    q_img.save(out_path)

    return out_path, q_img


def upload_to_cloudinary(img, question_code):
    """Upload image to Cloudinary and return URL."""
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    result = cloudinary.uploader.upload(
        buf,
        public_id=f"electric-jjang/questions/{question_code}_q",
        overwrite=True,
        resource_type="image"
    )
    return result['secure_url']


if __name__ == '__main__':
    # Load crop_y values from command line arg (JSON file)
    crop_data = {}
    if len(sys.argv) > 1:
        crop_data = json.load(open(sys.argv[1], encoding='utf-8'))

    # Load all diagram questions
    files = [
        'data/ocr-2023-2-part1.json', 'data/ocr-2023-2-part2.json',
        'data/ocr-2023-3-part1.json', 'data/ocr-2023-3-part2.json',
        'data/ocr-2024-1-part1.json', 'data/ocr-2024-1-part2.json',
        'data/ocr-2024-2-part1.json', 'data/ocr-2024-2-part2.json',
        'data/ocr-2024-3-part1.json', 'data/ocr-2024-3-part2.json',
    ]

    SUBJECT_PAGE_OFFSET = {'EM': 0, 'PC': 5, 'MA': 10, 'CC': 15, 'EL': 20}

    diagrams = []
    for f in files:
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
        data = json.load(open(os.path.join(base_dir, f), encoding='utf-8'))
        for q in data:
            if not q.get('has_diagram'):
                continue
            exam = q['exam']
            subj = q['subject']
            num = q['num']
            page = SUBJECT_PAGE_OFFSET[subj] + (num - 1) // 4 + 1
            pos = (num - 1) % 4
            diagrams.append((exam, subj, num, page, pos))

    print(f'Processing {len(diagrams)} diagrams...')

    # First pass: extract question areas without crop_y (save for visual inspection)
    for exam, subj, num, page, pos in diagrams:
        code = f'{exam}_{subj}-{num:02d}'
        crop_y = crop_data.get(code, 0)
        result = extract_and_save(exam, subj, num, page, pos, crop_y)
        if result:
            print(f'  {code}: saved to {result[0]}')

    print(f'\nDone! {len(diagrams)} diagram areas extracted to {OUT_DIR}')
    print('Next: run with crop_y values to crop text and upload to Cloudinary')

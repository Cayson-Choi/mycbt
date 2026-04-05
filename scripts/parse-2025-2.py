"""Parse 2025 2nd round HTML, download images, prepare for OCR"""
import re, sys, os, json, glob, requests, time
sys.stdout.reconfigure(encoding='utf-8')

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
html_matches = glob.glob(os.path.join(BASE, '*CBT*_html', '*2025*2*'))
if not html_matches:
    print('HTML file not found')
    sys.exit(1)
HTML_FILE = html_matches[0]
print(f'HTML: {HTML_FILE}')
IMG_DIR = os.path.join(BASE, 'data', 'ocr-images-2025-2')
OUTPUT = os.path.join(BASE, 'data', '2025-2-questions.json')

os.makedirs(IMG_DIR, exist_ok=True)

with open(HTML_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse questions using regex
questions = []
blocks = content.split('<div class="q-block">')[1:]

for block in blocks:
    m_num = re.search(r'Q(\d+)', block)
    if not m_num:
        continue
    num = int(m_num.group(1))

    imgs = re.findall(r'<img src="([^"]+)"', block)
    if len(imgs) < 5:
        print(f'Q{num}: not enough images ({len(imgs)})')
        continue

    q_img = imgs[0]
    c_imgs = imgs[1:5]

    m_ans = re.search(r'(\d)\uBC88', block)  # X번
    answer = int(m_ans.group(1)) if m_ans else 0

    questions.append({
        'num': num,
        'q_img': q_img,
        'c_imgs': c_imgs,
        'answer': answer,
    })

print(f'Parsed: {len(questions)} questions')

# Download images
downloaded = 0
failed = 0
for q in questions:
    urls = [q['q_img']] + q['c_imgs']
    for i, url in enumerate(urls):
        fname = f"Q{q['num']:03d}_{i}.png"
        fpath = os.path.join(IMG_DIR, fname)
        if os.path.exists(fpath):
            downloaded += 1
            continue
        try:
            r = requests.get(url, timeout=20)
            if r.status_code == 200:
                with open(fpath, 'wb') as f:
                    f.write(r.content)
                downloaded += 1
            else:
                print(f'  {fname}: HTTP {r.status_code}')
                failed += 1
        except Exception as e:
            print(f'  {fname}: {e}')
            failed += 1

print(f'Downloaded: {downloaded}, Failed: {failed}')

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f'Saved: {OUTPUT}')

"""이대우교수님 전기기능사 폴더의 모든 PDF → 페이지 PNG 변환.

각 PDF: data/func-pages/{year}-{round}/page-NN.png
회차 매핑:
  2016년: 1·2·4·5회 → 1·2·3·4
  나머지: 그대로
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import re
from pathlib import Path
import fitz

ROOT = Path(r"D:\Antigravity\electric-jjang\문제은행\이대우교수님자료-전기기능사")
OUT = Path(r"D:\Antigravity\electric-jjang\data\func-pages")

ROUND_MAP_2016 = {1: 1, 2: 2, 4: 3, 5: 4}


def round_year(filename):
    m = re.search(r'(\d{4})년.*?(\d+)회', filename)
    if not m:
        return None, None
    y = int(m.group(1))
    r = int(m.group(2))
    if y == 2016:
        r = ROUND_MAP_2016.get(r, r)
    return y, r


for year_dir in sorted(ROOT.iterdir()):
    if not year_dir.is_dir():
        continue
    for pdf in sorted(year_dir.glob('*.pdf')):
        y, r = round_year(pdf.name)
        if y is None:
            print(f"⚠️ skip: {pdf.name}")
            continue

        out_dir = OUT / f"{y}-{r}"
        existing = list(out_dir.glob('page-*.png')) if out_dir.exists() else []
        if existing:
            print(f"⊘ {y}-{r}: {len(existing)} pages already exist")
            continue

        out_dir.mkdir(parents=True, exist_ok=True)
        try:
            doc = fitz.open(str(pdf))
            mat = fitz.Matrix(2.0, 2.0)
            n = len(doc)
            for i, page in enumerate(doc, 1):
                pix = page.get_pixmap(matrix=mat)
                pix.save(str(out_dir / f"page-{i:02d}.png"))
            doc.close()
            print(f"✓ {y}-{r}: {n} pages → {out_dir.name}/")
        except Exception as e:
            print(f"❌ {y}-{r}: {e}")

print("\n전체 완료")

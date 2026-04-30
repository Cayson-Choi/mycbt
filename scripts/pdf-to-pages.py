"""PDF를 페이지별 PNG으로 변환 (PyMuPDF)"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import fitz
from pathlib import Path

if len(sys.argv) < 3:
    print("usage: pdf-to-pages.py <pdf_path> <out_dir>")
    sys.exit(1)

pdf_path = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)

doc = fitz.open(str(pdf_path))
mat = fitz.Matrix(2.0, 2.0)  # 2x for clarity

for i, page in enumerate(doc, 1):
    pix = page.get_pixmap(matrix=mat)
    out = out_dir / f"page-{i:02d}.png"
    pix.save(str(out))
    print(f"  page {i} -> {out.name}")

doc.close()
print(f"DONE: {len(doc)} pages -> {out_dir}")

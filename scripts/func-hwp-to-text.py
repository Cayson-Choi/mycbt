"""모든 HWP → 평문 텍스트 (data/func-hwp-text/{year}-{round}.txt)"""
import sys, io, re, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from pathlib import Path

ROOT = Path(r"D:\Antigravity\electric-jjang\문제은행\이대우교수님자료-전기기능사")
OUT = Path(r"D:\Antigravity\electric-jjang\data\func-hwp-text")
OUT.mkdir(parents=True, exist_ok=True)

ROUND_MAP_2016 = {1: 1, 2: 2, 4: 3, 5: 4}

for year_dir in sorted(ROOT.iterdir()):
    if not year_dir.is_dir():
        continue
    for hwp in sorted(year_dir.glob('*.hwp')):
        m = re.search(r'(\d{4})년.*?(\d+)회', hwp.name)
        if not m:
            continue
        y = int(m.group(1))
        r = int(m.group(2))
        if y == 2016:
            r = ROUND_MAP_2016.get(r, r)
        out = OUT / f"{y}-{r}.txt"
        if out.exists():
            print(f"⊘ {y}-{r}")
            continue
        try:
            res = subprocess.run(['hwp5txt', str(hwp)], capture_output=True, encoding='utf-8', errors='replace', timeout=60)
            if res.returncode == 0:
                out.write_text(res.stdout, encoding='utf-8')
                print(f"✓ {y}-{r}: {len(res.stdout)} chars")
            else:
                print(f"❌ {y}-{r}: hwp5txt failed")
        except Exception as e:
            print(f"❌ {y}-{r}: {e}")
print("\n완료")

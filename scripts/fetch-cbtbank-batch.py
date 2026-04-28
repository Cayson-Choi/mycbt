"""cbtbank.kr 다중 시험 일괄 다운로드 + 파싱.

각 URL → HTML 저장 → JSON 추출.
"""
import json
import re
import sys
import time
from pathlib import Path
import urllib.request

from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = Path(r"D:\Antigravity\electric-jjang\data\cbtbank")
DATA_DIR.mkdir(parents=True, exist_ok=True)

EXAMS = [
    ("2020-08-22", "kv20200822"),
    ("2020-06-06", "kv20200606"),
    ("2019-08-04", "kv20190804"),
    ("2019-04-27", "kv20190427"),
    ("2019-03-03", "kv20190303"),
    ("2018-08-19", "kv20180819"),
    ("2018-04-28", "kv20180428"),
    ("2018-03-04", "kv20180304"),
    ("2017-08-26", "kv20170826"),
    ("2017-05-07", "kv20170507"),
    ("2017-03-05", "kv20170305"),
    ("2016-08-21", "kv20160821"),
    ("2016-05-08", "kv20160508"),
    ("2016-03-06", "kv20160306"),
]

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def clean(s: str) -> str:
    return re.sub(r'\s+', ' ', s or '').strip()


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        dest.write_bytes(r.read())


def parse(html_path: Path, source_url: str) -> dict:
    soup = BeautifulSoup(html_path.read_text(encoding='utf-8'), 'html.parser')
    title_el = soup.find('title')
    exam_title = title_el.get_text(strip=True) if title_el else None

    questions = []
    for box in soup.find_all(class_='exam-box'):
        num_el = box.find(class_='exam-number')
        num = int(clean(num_el.get_text())) if num_el else None

        title_el = box.find(class_='exam-title')
        if title_el:
            n = title_el.find(class_='exam-number')
            if n:
                n.extract()
            q_text = re.sub(r'^\.\s*', '', clean(title_el.get_text()))
        else:
            q_text = ''

        choice_ol = box.find('ol', class_='circlednumbers')
        choices = []
        answer = None
        if choice_ol:
            answer = int(choice_ol.get('correct') or 0) or None
            for li in choice_ol.find_all('li', recursive=False):
                choices.append(clean(li.get_text()))

        cp_el = box.find(class_='exam-cpercent')
        cp_text = clean(cp_el.get_text()) if cp_el else ''
        m = re.search(r'(\d+)\s*%', cp_text)
        correct_pct = int(m.group(1)) if m else None

        rc = box.find(class_='reply-comment')
        explanation = clean(rc.get_text(' ', strip=True)) if rc else None

        questions.append({
            'num': num, 'q': q_text, 'choices': choices,
            'answer': answer, 'correct_pct': correct_pct,
            'explanation': explanation,
        })

    return {
        'source_url': source_url,
        'exam_title': exam_title,
        'total_questions': len(questions),
        'questions': questions,
    }


def main():
    summary = []
    for date_label, code in EXAMS:
        url = f"https://www.cbtbank.kr/exam/{code}"
        html_path = DATA_DIR / f"{code}.html"
        json_path = DATA_DIR / f"{code}.json"
        try:
            if not html_path.exists():
                print(f"⏬ {date_label} ({code}) 다운로드...", end=' ', flush=True)
                download(url, html_path)
                size_kb = html_path.stat().st_size // 1024
                print(f"{size_kb}KB")
                time.sleep(1)  # rate limit
            else:
                print(f"⊘ {date_label} ({code}) HTML 캐시 사용")
            data = parse(html_path, url)
            json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
            n = data['total_questions']
            no_ans = sum(1 for q in data['questions'] if not q['answer'])
            summary.append((date_label, code, n, no_ans))
            print(f"  ✓ {n}문제 추출 (정답불명 {no_ans})")
        except Exception as e:
            print(f"  ❌ 오류: {e}")
            summary.append((date_label, code, 0, 0))

    print("\n" + "=" * 70)
    print(f"{'시험일':12}  {'코드':14}  {'문제수':>6}  {'정답불명':>8}")
    print('-' * 70)
    total_q = 0
    for d, c, n, na in summary:
        print(f"{d:12}  {c:14}  {n:>6}  {na:>8}")
        total_q += n
    print(f"\n총 {total_q}문제 / {len([s for s in summary if s[2] > 0])}/{len(EXAMS)}개 시험 성공")


if __name__ == '__main__':
    main()

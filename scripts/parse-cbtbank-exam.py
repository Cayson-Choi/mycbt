"""cbtbank.kr exam HTML → JSON 추출.

각 문제: 번호, 문제텍스트, 보기 4개, 정답(1-4), 정답률, 해설(첫 댓글).
"""
import json
import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

HTML_PATH = Path(r"D:\Antigravity\electric-jjang\data\cbtbank-kv20200822.html")
OUT_PATH = Path(r"D:\Antigravity\electric-jjang\data\cbtbank-kv20200822.json")


def clean(s: str) -> str:
    return re.sub(r'\s+', ' ', s or '').strip()


def main():
    soup = BeautifulSoup(HTML_PATH.read_text(encoding='utf-8'), 'html.parser')

    exam_title = soup.find('title')
    exam_title = exam_title.get_text(strip=True) if exam_title else None

    boxes = soup.find_all(class_='exam-box')
    print(f"문제 박스 수: {len(boxes)}")

    questions = []
    for box in boxes:
        # 번호
        num_el = box.find(class_='exam-number')
        num = int(clean(num_el.get_text())) if num_el else None

        # 문제 텍스트 (.exam-title에서 .exam-number 제외)
        title_el = box.find(class_='exam-title')
        if title_el:
            num_in_title = title_el.find(class_='exam-number')
            if num_in_title:
                num_in_title.extract()
            q_text = clean(title_el.get_text())
            # 앞의 ". " 제거
            q_text = re.sub(r'^\.\s*', '', q_text)
        else:
            q_text = ''

        # 보기 + 정답
        choice_ol = box.find('ol', class_='circlednumbers')
        choices = []
        answer = None
        if choice_ol:
            answer = int(choice_ol.get('correct') or 0) or None
            for li in choice_ol.find_all('li', recursive=False):
                choices.append(clean(li.get_text()))

        # 정답률
        cp_el = box.find(class_='exam-cpercent')
        cp_text = clean(cp_el.get_text()) if cp_el else ''
        m = re.search(r'(\d+)\s*%', cp_text)
        correct_pct = int(m.group(1)) if m else None

        # 해설 (첫 reply-comment)
        rc = box.find(class_='reply-comment')
        explanation = clean(rc.get_text(' ', strip=True)) if rc else None

        questions.append({
            'num': num,
            'q': q_text,
            'choices': choices,
            'answer': answer,
            'correct_pct': correct_pct,
            'explanation': explanation,
        })

    out = {
        'source_url': 'https://www.cbtbank.kr/exam/kv20200822',
        'exam_title': exam_title,
        'total_questions': len(questions),
        'questions': questions,
    }
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n✓ 저장: {OUT_PATH}")
    print(f"  총 {len(questions)}문제")
    no_answer = [q['num'] for q in questions if not q['answer']]
    if no_answer:
        print(f"  ⚠️ 정답 누락: {len(no_answer)}개 (Q{no_answer})")
    no_choices = [q['num'] for q in questions if len(q['choices']) != 4]
    if no_choices:
        print(f"  ⚠️ 보기 4개 아님: {no_choices}")

    # 샘플 1, 50, 100번 출력
    for sample_num in (1, 50, 100):
        q = next((x for x in questions if x['num'] == sample_num), None)
        if q:
            print(f"\n--- Q{q['num']} (정답 {q['answer']}, 정답률 {q['correct_pct']}%) ---")
            print(f"  Q: {q['q'][:80]}")
            for i, c in enumerate(q['choices'], 1):
                marker = '★' if i == q['answer'] else ' '
                print(f"  {marker}{i}) {c[:70]}")


if __name__ == '__main__':
    main()

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
"""
이대우교수님자료-전기기능사 폴더의 모든 HWP 파일에서
문제번호 + 정답을 추출해 JSON으로 저장.

수식/그림은 빈 칸으로 빠지지만 정답(❶❷❸❹) 텍스트는 추출됨.
누락된 문제는 PDF 비전 OCR로 보완 예정.
"""
import os
import re
import json
import subprocess
from pathlib import Path

ROOT = Path(r"D:\Antigravity\electric-jjang\문제은행\이대우교수님자료-전기기능사")
OUT = Path(r"D:\Antigravity\electric-jjang\data\func-hwp-answers")
OUT.mkdir(parents=True, exist_ok=True)

# 회차 매핑: 폴더명에서 추출할 패턴
# 2016년: 1·2·4·5회 → 1·2·3·4 (기능사 회차로 압축)
# 2017~2022: 1·2·3·4회 그대로
# 2023: 1·2·3회 그대로
ROUND_MAP_2016 = {1: 1, 2: 2, 4: 3, 5: 4}

# 정답 마크 → 숫자
ANS_MARK = {'①': 1, '②': 2, '③': 3, '④': 4,
            '❶': 1, '❷': 2, '❸': 3, '❹': 4,
            '1': 1, '2': 2, '3': 3, '4': 4}


def extract_round_year(filename: str):
    """파일명에서 (year, round) 추출"""
    m = re.search(r'(\d{4})년.*?(\d+)회', filename)
    if m:
        year = int(m.group(1))
        raw_round = int(m.group(2))
        if year == 2016:
            return year, ROUND_MAP_2016.get(raw_round, raw_round)
        return year, raw_round
    return None, None


def parse_hwp(hwp_path: Path):
    """hwp5txt로 텍스트 추출 후 문제번호+정답 파싱"""
    try:
        result = subprocess.run(
            ['hwp5txt', str(hwp_path)],
            capture_output=True, encoding='utf-8', errors='replace', timeout=60
        )
        if result.returncode != 0:
            print(f"  ❌ hwp5txt 실패: {result.stderr[:200]}")
            return None
        text = result.stdout
    except Exception as e:
        print(f"  ❌ 예외: {e}")
        return None

    # 문제 블록 분리
    questions = {}
    lines = text.split('\n')
    current_q = None
    current_text = []

    for line in lines:
        m_q = re.match(r'^\s*(\d{1,2})\.\s*(.*)', line)
        if m_q and 1 <= int(m_q.group(1)) <= 60:
            if current_q is not None:
                questions[current_q] = '\n'.join(current_text)
            current_q = int(m_q.group(1))
            current_text = [m_q.group(2)]
        elif current_q is not None:
            current_text.append(line)

    if current_q is not None:
        questions[current_q] = '\n'.join(current_text)

    # 각 문제에서 정답 추출
    parsed = {}
    for qnum, body in questions.items():
        ans_match = re.search(r'정답\s*[:：]\s*([①②③④❶❷❸❹1234])', body)
        ans = ANS_MARK.get(ans_match.group(1)) if ans_match else 0

        # 보기 추출 (텍스트만 — 수식 객체는 빈 칸으로 나옴)
        choices = {}
        for i, mark in enumerate(['①', '②', '③', '④'], 1):
            ch_match = re.search(rf'{mark}\s*([^①②③④\n]*?)(?={"".join(["①②③④"])}|$|\n)', body)
            if ch_match:
                choices[i] = ch_match.group(1).strip()

        # 문제 본문(첫 ① 이전까지)
        q_match = re.split(r'①', body, maxsplit=1)
        q_text = q_match[0].strip() if q_match else body.strip()

        parsed[qnum] = {
            'q': q_text,
            'c1': choices.get(1, ''),
            'c2': choices.get(2, ''),
            'c3': choices.get(3, ''),
            'c4': choices.get(4, ''),
            'a': ans,
        }

    return parsed


def main():
    summary = []
    for year_dir in sorted(ROOT.iterdir()):
        if not year_dir.is_dir():
            continue
        for hwp in sorted(year_dir.glob('*.hwp')):
            year, rnd = extract_round_year(hwp.name)
            if year is None or rnd is None:
                print(f"⚠️ 회차 파싱 실패: {hwp.name}")
                continue

            print(f"📄 {year}년 {rnd}회 — {hwp.name}")
            data = parse_hwp(hwp)
            if data is None:
                print("  ❌ 추출 실패")
                continue

            # 정답 누락 카운트
            missing = [q for q, d in data.items() if d['a'] == 0]
            print(f"  ✓ 추출 {len(data)}문제, 정답 누락: {len(missing)}개 {missing[:10]}")

            out_path = OUT / f"{year}-{rnd}.json"
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump({
                    'year': year,
                    'round': rnd,
                    'source': hwp.name,
                    'questions': data,
                }, f, ensure_ascii=False, indent=2)

            summary.append({
                'year': year, 'round': rnd, 'count': len(data),
                'answer_missing': len(missing),
                'missing_q': missing,
            })

    # 요약 저장
    with open(OUT / '_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    total = sum(s['count'] for s in summary)
    miss = sum(s['answer_missing'] for s in summary)
    print(f"\n========== 완료 ==========")
    print(f"  시험 수: {len(summary)}")
    print(f"  총 문제: {total}")
    print(f"  정답 누락: {miss}개 ({miss/total*100:.1f}%)")


if __name__ == '__main__':
    main()

"""각 시험의 OCR JSON A/B를 병합 → data/func-final/{year}-{round}.json"""
import sys, io, json, argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from pathlib import Path

OCR_DIR = Path(r"D:\Antigravity\electric-jjang\data\func-ocr")
FINAL_DIR = Path(r"D:\Antigravity\electric-jjang\data\func-final")
FINAL_DIR.mkdir(parents=True, exist_ok=True)

# 등급 매핑 (CLAUDE.md 정책)
TIER_MAP = {
    2016: 'FREE', 2017: 'FREE', 2018: 'FREE',
    2019: 'BRONZE', 2020: 'BRONZE',
    2021: 'SILVER', 2022: 'SILVER',
    2023: 'GOLD',
    2024: 'GOLD',
    2025: 'PREMIUM', 2026: 'PREMIUM',
}


def merge(year, rnd):
    a_file = OCR_DIR / f"{year}-{rnd}-A.json"
    b_file = OCR_DIR / f"{year}-{rnd}-B.json"
    if not a_file.exists() or not b_file.exists():
        print(f"⚠️ {year}-{rnd}: A/B 파일 없음")
        return False

    def _read(f):
        d = json.loads(f.read_text(encoding='utf-8'))
        return d['questions'] if isinstance(d, dict) and 'questions' in d else d

    a_data = _read(a_file)
    b_data = _read(b_file)

    # 정규화: 'code' → 'n', 'img' 없으면 false
    def _norm(qs):
        for q in qs:
            if 'n' not in q:
                if 'code' in q:
                    import re as _re
                    m = _re.search(r'(\d+)$', str(q['code']))
                    if m:
                        q['n'] = int(m.group(1))
                elif 'number' in q:
                    q['n'] = int(q['number'])
            if 'img' not in q:
                q['img'] = False
        return [q for q in qs if 'n' in q]
    a_data = _norm(a_data)
    b_data = _norm(b_data)

    # 병합 (B가 우선 — 더 정확한 끝부분)
    by_n = {}
    for q in a_data:
        by_n[q['n']] = q
    for q in b_data:
        # B에 있는 건 B 사용 (페이지 경계 중복 시 후반부가 정확)
        if q['n'] in by_n and q['n'] in (31, 32):
            # 기본은 A 우선, B로 덮어쓰지 않음 (필요시 수동 검토)
            pass
        by_n[q['n']] = q

    # 1~60 검사
    questions = []
    missing = []
    for n in range(1, 61):
        if n in by_n:
            questions.append(by_n[n])
        else:
            missing.append(n)

    out = {
        'year': year,
        'round': rnd,
        'exam_name': f'전기기능사 {year}년 {rnd}회',
        'duration_minutes': 60,
        'min_tier': TIER_MAP.get(year, 'FREE'),
        'subjects': {'1-20': '전기이론', '21-40': '전기기기', '41-60': '전기설비'},
        'questions': questions,
    }

    if missing:
        print(f"⚠️ {year}-{rnd}: {len(missing)}문제 누락 {missing}")
    else:
        # 정답불명·이미지·이슈 통계
        ans_unknown = [q['n'] for q in questions if q.get('a', 0) == 0]
        img_count = sum(1 for q in questions if q.get('img'))
        print(f"✓ {year}-{rnd}: 60문제, 정답불명 {len(ans_unknown)}{ans_unknown if ans_unknown else ''}, img {img_count}")

    out_path = FINAL_DIR / f"{year}-{rnd}.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
    return len(missing) == 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--year', type=int)
    parser.add_argument('--round', type=int)
    parser.add_argument('--all', action='store_true')
    args = parser.parse_args()

    if args.all:
        for y in range(2016, 2024):
            for r in range(1, 5):
                if y == 2023 and r == 4:
                    continue
                merge(y, r)
    else:
        merge(args.year, args.round)

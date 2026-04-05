"""
전기기사 필기 기출문제 .doc(HTML) 파일 파싱 → JSON 데이터 생성
"""
import os, sys, re, json
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

DOC_DIR = os.path.join(os.path.dirname(__file__), '..', '엔지니어링랩-필기CBT복원')
OUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'electric-engineer-questions.json')

# 과목 코드 매핑
SUBJECT_CODE_MAP = {
    '전기자기학': 'EM',
    '전력공��': 'PC',
    '전기기��': 'MA',
    '회로이론 및 제어공학': 'CC',
    '전기설비기술기준': 'EL',
    '공통': 'GN',
}

def parse_filename(fname):
    """파일명에서 년도, 회차 추출"""
    m = re.search(r'(\d{4})년_(\d)회', fname)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None

def extract_answer(text):
    """정답 텍스트에서 번호 추출"""
    m = re.search(r'(\d)번', text)
    return int(m.group(1)) if m else None

def parse_questions_from_html(html_content):
    """HTML에서 과목별 문제 추출"""
    soup = BeautifulSoup(html_content, 'lxml')

    subjects = []
    current_subject = None
    global_q_idx = 0

    # h2 태그로 과목 구분, 그 뒤의 question blocks를 수집
    for element in soup.body.children if soup.body else []:
        if element.name == 'h2':
            text = element.get_text(strip=True)
            # "제1과목 : 전기자��학 (20문제)" 형태 파싱
            m = re.search(r':\s*(.+?)(?:\s*\(|$)', text)
            subject_name = m.group(1).strip() if m else text.strip()
            current_subject = {
                'name': subject_name,
                'code': SUBJECT_CODE_MAP.get(subject_name, 'XX'),
                'questions': []
            }
            subjects.append(current_subject)

        # question block 찾기 (두 가지 클래스 패턴)
        if element.name == 'div':
            blocks = []
            if 'qb' in element.get('class', []):
                blocks = [element]
            elif 'question-block' in element.get('class', []):
                blocks = [element]
            else:
                # 내부에서 찾기
                blocks = element.find_all('div', class_=['qb', 'question-block'])

            for block in blocks:
                if current_subject is None:
                    current_subject = {'name': '공통', 'code': 'GN', 'questions': []}
                    subjects.append(current_subject)

                global_q_idx += 1
                q = parse_question_block(block, global_q_idx)
                if q:
                    current_subject['questions'].append(q)

    # body 직접 순회로 못 잡은 경우 전체 탐색
    if not any(s['questions'] for s in subjects):
        all_blocks = soup.find_all('div', class_=['qb', 'question-block'])

        # h2 기준으로 과목 재매핑
        h2_tags = soup.find_all('h2')
        subject_ranges = []
        for h2 in h2_tags:
            m = re.search(r':\s*(.+?)(?:\s*\(|$)', h2.get_text(strip=True))
            subject_name = m.group(1).strip() if m else h2.get_text(strip=True)
            subject_ranges.append({
                'name': subject_name,
                'code': SUBJECT_CODE_MAP.get(subject_name, 'XX'),
                'element': h2,
                'questions': []
            })

        if not subject_ranges:
            subject_ranges = [{'name': '공통', 'code': 'GN', 'element': None, 'questions': []}]

        for idx, block in enumerate(all_blocks):
            # 이 block이 어느 과목에 속하는지 결정
            assigned = False
            for i, sr in enumerate(subject_ranges):
                if sr['element'] is None:
                    sr['questions'].append(parse_question_block(block, idx + 1))
                    assigned = True
                    break
                # block이 다음 h2보다 앞에 있으면 현재 과목
                if i + 1 < len(subject_ranges):
                    next_h2 = subject_ranges[i + 1]['element']
                    # 순서 비교: block의 위치
                    if block.sourceline and sr['element'].sourceline:
                        if block.sourceline >= sr['element'].sourceline and block.sourceline < next_h2.sourceline:
                            sr['questions'].append(parse_question_block(block, idx + 1))
                            assigned = True
                            break
                else:
                    if block.sourceline and sr['element'].sourceline and block.sourceline >= sr['element'].sourceline:
                        sr['questions'].append(parse_question_block(block, idx + 1))
                        assigned = True
                        break

            if not assigned and subject_ranges:
                subject_ranges[-1]['questions'].append(parse_question_block(block, idx + 1))

        subjects = [{'name': sr['name'], 'code': sr['code'], 'questions': [q for q in sr['questions'] if q]} for sr in subject_ranges]

    return subjects

def parse_question_block(block, fallback_num):
    """개별 문제 블록 파싱"""
    # 문제 번호
    header = block.find('div', class_=['qh', 'q-header'])
    q_num = fallback_num
    if header:
        m = re.search(r'Q(\d+)', header.get_text())
        if m:
            q_num = int(m.group(1))

    # 문제 이미지/텍스트
    q_content = block.find('div', class_=['qi', 'q-title-img'])
    question_image = None
    question_text = ''
    if q_content:
        img = q_content.find('img')
        if img and img.get('src'):
            question_image = img['src']
        text = q_content.get_text(strip=True)
        if text and not text.startswith('http'):
            question_text = text

    # 보기
    choices_div = block.find('div', class_=['ch', 'choices'])
    choices = []
    if choices_div:
        choice_items = choices_div.find_all('div', class_=['ci', 'choice'])
        for ci in choice_items:
            img = ci.find('img')
            choice_img = img['src'] if img and img.get('src') else None
            choice_text = ci.get_text(strip=True)
            # 번호와 체크마크 제거
            choice_text = re.sub(r'^[✅✔]?\s*\d+\.?\s*', '', choice_text).strip()
            choices.append({
                'text': choice_text if not choice_img else '',
                'image': choice_img
            })

    # 정답
    answer_div = block.find('div', class_=['ab', 'answer-box'])
    answer = None
    if answer_div:
        answer = extract_answer(answer_div.get_text())

    # 정답이 없으면 cc/correct-choice 클래스에서 추출
    if answer is None and choices_div:
        for i, ci in enumerate(choices_div.find_all('div', class_=['ci', 'choice'])):
            classes = ci.get('class', [])
            text = ci.get_text()
            if 'cc' in classes or 'correct-choice' in classes or '✅' in text:
                answer = i + 1
                break

    if not question_image and not question_text:
        return None

    return {
        'number': q_num,
        'question_text': question_text,
        'image_url': question_image,
        'choice_1': choices[0]['text'] if len(choices) > 0 else '',
        'choice_2': choices[1]['text'] if len(choices) > 1 else '',
        'choice_3': choices[2]['text'] if len(choices) > 2 else '',
        'choice_4': choices[3]['text'] if len(choices) > 3 else '',
        'choice_1_image': choices[0]['image'] if len(choices) > 0 else None,
        'choice_2_image': choices[1]['image'] if len(choices) > 1 else None,
        'choice_3_image': choices[2]['image'] if len(choices) > 2 else None,
        'choice_4_image': choices[3]['image'] if len(choices) > 3 else None,
        'answer': answer,
    }

def main():
    files = sorted([f for f in os.listdir(DOC_DIR) if f.endswith('.doc')])
    all_exams = []

    # 과목별 문제 번호 카운터
    subject_counters = {}

    for fname in files:
        year, round_num = parse_filename(fname)
        if not year:
            print(f'SKIP: {fname} (파일명 파싱 실패)')
            continue

        filepath = os.path.join(DOC_DIR, fname)
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            html_content = f.read()

        subjects = parse_questions_from_html(html_content)

        # question_code 생성
        for subj in subjects:
            code = subj['code']
            if code not in subject_counters:
                subject_counters[code] = 0
            for q in subj['questions']:
                subject_counters[code] += 1
                q['question_code'] = f'ELEC-E-{code}-{subject_counters[code]:03d}'

        total_q = sum(len(s['questions']) for s in subjects)
        print(f'{fname}: {year}년 {round_num}회 → {total_q}문제, 과목: {[f"{s["name"]}({len(s["questions"])})" for s in subjects]}')

        all_exams.append({
            'year': year,
            'round': round_num,
            'name': f'전기기사 {year}년 {round_num}회',
            'filename': fname,
            'subjects': [{
                'name': s['name'],
                'code': s['code'],
                'questions': s['questions']
            } for s in subjects]
        })

    # JSON 저장
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_exams, f, ensure_ascii=False, indent=2)

    total = sum(sum(len(s['questions']) for s in e['subjects']) for e in all_exams)
    print(f'\n총 {len(all_exams)}개 시험, {total}개 문제 → {OUT_FILE}')

if __name__ == '__main__':
    main()

"""Fix OCR parse errors and mark invalid questions"""
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

PROGRESS_FILE = 'data/ocr-progress.json'

with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
    progress = json.load(f)

# Fix 9 parse_error questions
errors = ['ELEC-E-CC-042', 'ELEC-E-CC-084', 'ELEC-E-EM-117', 'ELEC-E-EM-162',
          'ELEC-E-EM-179', 'ELEC-E-EM-183', 'ELEC-E-EM-219', 'ELEC-E-XX-416', 'ELEC-E-EM-257']

fixed = 0
for code in errors:
    raw = progress[code].get('question_text', '')
    if not raw:
        print(f'{code}: 텍스트 없음')
        continue
    # Extract fields using regex instead of JSON parsing (LaTeX backslashes break JSON)
    m_q = re.search(r'"q"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
    m_c1 = re.search(r'"c1"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
    m_c2 = re.search(r'"c2"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
    m_c3 = re.search(r'"c3"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
    m_c4 = re.search(r'"c4"\s*:\s*"((?:[^"\\]|\\.)*)"', raw)
    if not m_q:
        print(f'{code}: q 필드 추출 실패')
        print(f'  raw[:120] = {raw[:120]}')
        continue
    parsed = {
        'q': m_q.group(1) if m_q else '',
        'c1': m_c1.group(1) if m_c1 else '',
        'c2': m_c2.group(1) if m_c2 else '',
        'c3': m_c3.group(1) if m_c3 else '',
        'c4': m_c4.group(1) if m_c4 else '',
    }

    progress[code] = {
        'question_text': parsed.get('q', ''),
        'choice_1': parsed.get('c1', ''),
        'choice_2': parsed.get('c2', ''),
        'choice_3': parsed.get('c3', ''),
        'choice_4': parsed.get('c4', ''),
    }
    fixed += 1
    print(f'{code}: OK - {parsed.get("q","")[:60]}')

# EM-292: invalid URL
progress['ELEC-E-EM-292'] = {'invalid': True, 'reason': 'Invalid URL - no image available'}

# 32 EL questions: regulation-changed, choice images 403
el_403 = [
    'ELEC-E-EL-007','ELEC-E-EL-012','ELEC-E-EL-014','ELEC-E-EL-024','ELEC-E-EL-025',
    'ELEC-E-EL-037','ELEC-E-EL-042','ELEC-E-EL-060','ELEC-E-EL-064','ELEC-E-EL-067',
    'ELEC-E-EL-070','ELEC-E-EL-074','ELEC-E-EL-085','ELEC-E-EL-092','ELEC-E-EL-093',
    'ELEC-E-EL-094','ELEC-E-EL-095','ELEC-E-EL-099','ELEC-E-EL-100','ELEC-E-EL-102',
    'ELEC-E-EL-111','ELEC-E-EL-115','ELEC-E-EL-126','ELEC-E-EL-133','ELEC-E-EL-138',
    'ELEC-E-EL-154','ELEC-E-EL-156','ELEC-E-EL-157','ELEC-E-EL-164','ELEC-E-EL-171',
    'ELEC-E-EL-176','ELEC-E-EL-178',
]
for code in el_403:
    progress[code] = {'invalid': True, 'reason': '규정 개정으로 성립되지 않는 문제 (보기 이미지 403)'}

with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
    json.dump(progress, f, ensure_ascii=False)

print(f'\n수정: {fixed}개, 무효처리: {len(el_403)+1}개')

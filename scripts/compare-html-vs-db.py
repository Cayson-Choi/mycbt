"""Parse HTML exam files and compare against DB data to find discrepancies"""
import os, sys, re, json, psycopg2
from html.parser import HTMLParser
sys.stdout.reconfigure(encoding='utf-8')

HTML_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '엔지니어링랩-필기CBT복원_html')
DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

class ExamHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.questions = []
        self.current_q = None
        self.in_q_num = False
        self.in_choice = False
        self.in_answer = False
        self.in_subject = False
        self.current_subject = ''
        self.current_choice_correct = False
        self.text_buf = ''

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get('class', '')

        if tag == 'h2':
            self.in_subject = True
            self.text_buf = ''
        elif tag == 'div' and 'q-block' in cls:
            self.current_q = {'subject': self.current_subject, 'answer': 0, 'q_img': '', 'c_imgs': []}
        elif tag == 'div' and 'q-num' in cls:
            self.in_q_num = True
            self.text_buf = ''
        elif tag == 'div' and 'q-img' in cls:
            pass
        elif tag == 'div' and 'choice' in cls:
            self.in_choice = True
            self.current_choice_correct = 'correct' in cls
        elif tag == 'div' and 'answer' in cls:
            self.in_answer = True
            self.text_buf = ''
        elif tag == 'img' and self.current_q is not None:
            src = attrs_dict.get('src', '')
            if self.in_choice:
                self.current_q['c_imgs'].append(src)
            elif src:
                self.current_q['q_img'] = src
        elif tag == 'span' and 'choice-num' in cls:
            self.text_buf = ''

    def handle_endtag(self, tag):
        if tag == 'h2' and self.in_subject:
            self.in_subject = False
            self.current_subject = self.text_buf.strip()
        elif tag == 'div' and self.in_q_num:
            self.in_q_num = False
            m = re.search(r'Q(\d+)', self.text_buf)
            if m and self.current_q:
                self.current_q['num'] = int(m.group(1))
        elif tag == 'div' and self.in_choice:
            self.in_choice = False
            if self.current_choice_correct and self.current_q:
                self.current_q['answer'] = len(self.current_q['c_imgs'])
            self.current_choice_correct = False
        elif tag == 'div' and self.in_answer:
            self.in_answer = False
            m = re.search(r'(\d)번', self.text_buf)
            if m and self.current_q:
                self.current_q['answer'] = int(m.group(1))
        elif tag == 'div' and self.current_q and 'num' in self.current_q and len(self.current_q.get('c_imgs',[])) >= 4:
            self.questions.append(self.current_q)
            self.current_q = None

    def handle_data(self, data):
        self.text_buf += data

def parse_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    parser = ExamHTMLParser()
    parser.feed(content)
    return parser.questions

def extract_exam_info(filename):
    """Extract year and round from filename"""
    m = re.search(r'(\d{4})년_(\d)회', filename)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None

# Parse all HTML files
html_exams = {}
for fname in sorted(os.listdir(HTML_DIR)):
    if not fname.endswith('.html'):
        continue
    year, round_ = extract_exam_info(fname)
    if not year:
        continue
    filepath = os.path.join(HTML_DIR, fname)
    questions = parse_html_file(filepath)
    html_exams[(year, round_)] = {
        'file': fname,
        'questions': questions,
    }
    print(f'{fname}: {len(questions)}문제')

print(f'\nHTML 파일 총: {len(html_exams)}개 시험')

# Connect to DB and compare
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Get all exams
cur.execute("""
    SELECT e.id, e.year, e.round, q.question_code, q.answer, q.image_url,
           q.choice_1_image, q.choice_2_image, q.choice_3_image, q.choice_4_image,
           q.question_text, q.is_active
    FROM exams e
    JOIN questions q ON q.exam_id = e.id
    WHERE e.name LIKE '%%전기기사%%'
    ORDER BY e.year, e.round, q.question_code
""")

db_questions = {}
for r in cur.fetchall():
    year_str = r[1] or ''
    round_str = r[2] or ''
    ym = re.search(r'(\d{4})', str(year_str))
    rm = re.search(r'(\d)', str(round_str))
    if not ym or not rm:
        continue
    year = int(ym.group(1))
    round_ = int(rm.group(1))
    key = (year, round_)
    if key not in db_questions:
        db_questions[key] = []
    db_questions[key].append({
        'exam_id': r[0],
        'code': r[3],
        'answer': r[4],
        'q_img': r[5],
        'c1_img': r[6],
        'c2_img': r[7],
        'c3_img': r[8],
        'c4_img': r[9],
        'text': r[10],
        'active': r[11],
    })

# Compare
print('\n=== 비교 결과 ===\n')

issues = []

# Check HTML exams not in DB
for key in sorted(html_exams.keys()):
    year, round_ = key
    if key not in db_questions:
        issues.append(f'DB에 없음: {year}년 {round_}회 ({len(html_exams[key]["questions"])}문제)')
    elif len(db_questions[key]) == 0:
        issues.append(f'DB 문제 0개: {year}년 {round_}회 (HTML: {len(html_exams[key]["questions"])}문제)')

# Check answer mismatches
answer_mismatches = []
for key in sorted(html_exams.keys()):
    if key not in db_questions:
        continue
    year, round_ = key
    html_qs = html_exams[key]['questions']
    db_qs = db_questions[key]

    if len(html_qs) != len(db_qs):
        issues.append(f'{year}년 {round_}회: 문제수 불일치 HTML={len(html_qs)} DB={len(db_qs)}')

    # Match by image URL
    db_by_img = {}
    for i, dq in enumerate(db_qs):
        if dq['q_img']:
            db_by_img[dq['q_img']] = (i, dq)

    matched = 0
    for hq in html_qs:
        if hq['q_img'] in db_by_img:
            idx, dq = db_by_img[hq['q_img']]
            matched += 1
            if hq['answer'] and dq['answer'] and str(hq['answer']) != str(dq['answer']):
                answer_mismatches.append(f"{dq['code']}: HTML정답={hq['answer']} DB정답={dq['answer']}")

    if matched < len(html_qs):
        issues.append(f'{year}년 {round_}회: 이미지URL 매칭 {matched}/{len(html_qs)}')

for issue in issues:
    print(f'⚠ {issue}')

if answer_mismatches:
    print(f'\n정답 불일치 {len(answer_mismatches)}건:')
    for m in answer_mismatches:
        print(f'  ✗ {m}')
else:
    print('\n정답 불일치: 없음')

# Check for exams in DB but not in HTML
for key in sorted(db_questions.keys()):
    if key not in html_exams and len(db_questions[key]) > 0:
        year, round_ = key
        print(f'\nℹ DB에만 있음: {year}년 {round_}회 ({len(db_questions[key])}문제)')

conn.close()

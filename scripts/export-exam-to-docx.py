"""
시험 문제를 Word(.docx) 파일로 내보내기
- KaTeX/LaTeX 수식 → Pandoc으로 Word 네이티브 수식(OMML) 변환
- 이미지(Cloudinary URL) 자동 다운로드 후 임베드

사용법:
  # 시험 목록 보기
  python scripts/export-exam-to-docx.py --list

  # 특정 시험 내보내기 (정답·해설 포함)
  python scripts/export-exam-to-docx.py --exam-id 12

  # 옵션
  python scripts/export-exam-to-docx.py --exam-id 12 --no-answers --no-images
"""
import argparse
import os
import re
import sys
import psycopg2
import pypandoc
from docx import Document
from docx.shared import Cm, Emu
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

sys.stdout.reconfigure(encoding='utf-8')

DB_URL = 'postgresql://neondb_owner:npg_iZ5Jbx3TkUvX@ep-restless-truth-a17xc1kd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

CIRCLED = {1: '①', 2: '②', 3: '③', 4: '④'}


def list_exams(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT
            e.id,
            c.name AS category,
            e.name,
            e.year,
            e.round,
            e.exam_type,
            COUNT(q.id) AS qcount
        FROM exams e
        JOIN exam_categories c ON c.id = e.category_id
        LEFT JOIN questions q ON q.exam_id = e.id AND q.is_active = true
        GROUP BY e.id, c.name, e.name, e.year, e.round, e.exam_type
        HAVING COUNT(q.id) > 0
        ORDER BY c.name, e.year DESC NULLS LAST, e.round DESC NULLS LAST, e.id
    """)
    rows = cur.fetchall()
    cur.close()

    print(f"\n{'ID':>4}  {'카테고리':20}  {'시험명':40}  {'년도':>5}  {'회차':>4}  {'유형':10}  {'문항':>5}")
    print('-' * 110)
    for r in rows:
        eid, cat, name, year, rnd, etype, qcount = r
        print(f"{eid:>4}  {cat:20}  {name:40}  {str(year or ''):>5}  {str(rnd or ''):>4}  {etype:10}  {qcount:>5}")
    print(f"\n총 {len(rows)}개 시험\n")


def fetch_exam(conn, exam_id):
    cur = conn.cursor()
    cur.execute("""
        SELECT e.id, c.name, e.name, e.year, e.round, e.exam_type, e.duration_minutes
        FROM exams e
        JOIN exam_categories c ON c.id = e.category_id
        WHERE e.id = %s
    """, (exam_id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        return None, [], []
    exam = {
        'id': row[0], 'category': row[1], 'name': row[2],
        'year': row[3], 'round': row[4], 'exam_type': row[5],
        'duration': row[6],
    }

    cur.execute("""
        SELECT id, name, order_no, questions_per_attempt
        FROM subjects
        WHERE exam_id = %s
        ORDER BY order_no, id
    """, (exam_id,))
    subjects = [
        {'id': r[0], 'name': r[1], 'order_no': r[2], 'qpa': r[3]}
        for r in cur.fetchall()
    ]

    cur.execute("""
        SELECT id, subject_id, question_code, question_text,
               choice_1, choice_2, choice_3, choice_4,
               choice_1_image, choice_2_image, choice_3_image, choice_4_image,
               answer, answer_text, explanation, image_url, points
        FROM questions
        WHERE exam_id = %s AND is_active = true
        ORDER BY subject_id, id
    """, (exam_id,))
    questions = []
    for r in cur.fetchall():
        questions.append({
            'id': r[0], 'subject_id': r[1], 'code': r[2], 'q': r[3],
            'c1': r[4], 'c2': r[5], 'c3': r[6], 'c4': r[7],
            'c1_img': r[8], 'c2_img': r[9], 'c3_img': r[10], 'c4_img': r[11],
            'answer': r[12], 'answer_text': r[13], 'explanation': r[14],
            'image_url': r[15], 'points': r[16],
        })
    cur.close()
    return exam, subjects, questions


def normalize_math(text):
    if not text:
        return ''
    return text


def format_question_md(q, subject_name, q_num, include_answers, include_images, include_explanation):
    lines = []

    body = normalize_math(q['q'] or '')
    body_lines = body.split('\n')
    if not body_lines:
        body_lines = ['']
    first = body_lines[0]
    rest = body_lines[1:]
    if rest:
        lines.append(f"**{q_num}.** {first}\\")
        for i, bl in enumerate(rest):
            if i < len(rest) - 1:
                lines.append(bl + '\\')
            else:
                lines.append(bl)
    else:
        lines.append(f"**{q_num}.** {first}")
    lines.append('')

    if include_images and q['image_url']:
        lines.append(f"![]({q['image_url']})")
        lines.append('')

    for n in (1, 2, 3, 4):
        ctext = q.get(f'c{n}') or ''
        cimg = q.get(f'c{n}_img')
        circ = CIRCLED[n]
        line = f"{circ} {normalize_math(ctext)}"
        if include_images and cimg:
            line += f" ![]({cimg})"
        lines.append(line)
        lines.append('')

    if include_answers:
        ans = q['answer']
        if ans and ans in CIRCLED:
            lines.append(f"**정답: {CIRCLED[ans]}**")
        elif ans == 0:
            lines.append("**정답: ⚠️ 정답불명 (관리자 확인 필요)**")
        elif q['answer_text']:
            lines.append(f"**정답:** {q['answer_text']}")
        else:
            lines.append("**정답: -**")
        lines.append('')

        if include_explanation and q['explanation']:
            lines.append("**해설:** " + normalize_math(q['explanation']).replace('\n', ' '))
            lines.append('')

    lines.append('---')
    lines.append('')

    return '\n'.join(lines)


def build_exam_title(exam):
    title_parts = []
    if exam.get('year'):
        title_parts.append(f"{exam['year']}년")
    if exam.get('round'):
        title_parts.append(f"{exam['round']}회")
    title_parts.append(exam['name'])
    return ' '.join(title_parts)


def build_markdown(exam, subjects, questions, include_answers, include_images, include_explanation):
    subject_map = {s['id']: s for s in subjects}
    by_subject = {}
    for q in questions:
        by_subject.setdefault(q['subject_id'], []).append(q)

    md = []

    sorted_subjects = sorted(subjects, key=lambda s: (s['order_no'], s['id']))
    global_num = 0
    for s in sorted_subjects:
        qs = by_subject.get(s['id'], [])
        if not qs:
            continue
        md.append(f"**{s['order_no']}과목. {s['name']}**")
        md.append('')
        for q in qs:
            global_num += 1
            md.append(format_question_md(
                q, s['name'], global_num,
                include_answers, include_images, include_explanation,
            ))

    return '\n'.join(md)


def safe_filename(s):
    s = re.sub(r'[\\/:*?"<>|]', '_', s)
    s = re.sub(r'\s+', '_', s).strip('_')
    return s


def apply_two_column_layout(docx_path, header_title=None):
    """Pandoc 변환 결과를 2단 레이아웃으로 후처리.
    - 페이지 여백 축소(좌우 1.5cm)로 컬럼 폭 확보
    - section의 cols=2 설정
    - 머릿말에 시험 제목 (가운데 정렬, 굵게)
    - 본문 내 큰 이미지를 컬럼 폭 이내로 리사이즈
    """
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    doc = Document(docx_path)

    for section in doc.sections:
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.header_distance = Cm(1.2)
        section.footer_distance = Cm(1.2)

        if header_title:
            header = section.header
            p = header.paragraphs[0]
            p.text = ''
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run(header_title)
            run.bold = True

        sectPr = section._sectPr
        for old_cols in sectPr.findall(qn('w:cols')):
            sectPr.remove(old_cols)
        cols = OxmlElement('w:cols')
        cols.set(qn('w:num'), '2')
        cols.set(qn('w:space'), '425')  # 0.75cm in twips (≈ 0.3 inch)
        cols.set(qn('w:equalWidth'), '1')
        cols.set(qn('w:sep'), '1')  # 컬럼 사이 수직 구분선
        sectPr.append(cols)

    # Pandoc은 markdown `---`을 VML rectangle(<v:rect o:hr="t"/>)로 변환 → Word가 두꺼운/이중 줄로 렌더링.
    # VML hr 요소를 모두 제거하고, 해당 paragraph에 가는 단일 paragraph border(bottom)를 부여.
    for p in doc.paragraphs:
        p_xml = p._p
        picts = p_xml.findall('.//' + qn('w:pict'))
        has_hr = False
        for pict in picts:
            for child in pict:
                if child.tag.endswith('}rect') or child.tag.endswith('rect'):
                    has_hr = True
                    break
            r_parent = pict.getparent()
            while r_parent is not None and r_parent.tag != qn('w:r'):
                r_parent = r_parent.getparent()
            if r_parent is not None:
                gp = r_parent.getparent()
                if gp is not None:
                    gp.remove(r_parent)
        if not has_hr:
            continue

        pPr = p_xml.find(qn('w:pPr'))
        if pPr is None:
            pPr = OxmlElement('w:pPr')
            p_xml.insert(0, pPr)
        for old in pPr.findall(qn('w:pBdr')):
            pPr.remove(old)
        pBdr = OxmlElement('w:pBdr')
        bottom = OxmlElement('w:bottom')
        bottom.set(qn('w:val'), 'single')
        bottom.set(qn('w:sz'), '4')  # 0.5pt
        bottom.set(qn('w:space'), '1')
        bottom.set(qn('w:color'), 'BBBBBB')
        pBdr.append(bottom)
        pPr.append(pBdr)

    # 본문 글자 크기 통일: 일반 텍스트 10pt(20), 분수 안 텍스트 15pt(30)
    BODY_SZ = '20'
    FRAC_SZ = '30'
    M_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math'
    def mtag(tag):
        return f'{{{M_NS}}}{tag}'

    def force_size(w_rPr, val):
        for tag in ('w:sz', 'w:szCs'):
            el = w_rPr.find(qn(tag))
            if el is None:
                el = OxmlElement(tag)
                w_rPr.append(el)
            el.set(qn('w:val'), val)

    # 1) 본문 paragraph의 일반 텍스트 run (w:r) → 10pt
    for p in doc.paragraphs:
        for r in p._p.iter(qn('w:r')):
            rPr = r.find(qn('w:rPr'))
            if rPr is None:
                rPr = OxmlElement('w:rPr')
                r.insert(0, rPr)
            force_size(rPr, BODY_SZ)

    # 2) OMML 수식 텍스트 run (m:r) → 10pt (분수 밖)
    for p in doc.paragraphs:
        for r in p._p.iter(mtag('r')):
            m_rPr = r.find(mtag('rPr'))
            w_rPr = r.find(qn('w:rPr'))
            if w_rPr is None:
                w_rPr = OxmlElement('w:rPr')
                if m_rPr is not None:
                    m_rPr.addnext(w_rPr)
                else:
                    r.insert(0, w_rPr)
            force_size(w_rPr, BODY_SZ)

    # 3) 분수(m:f) 안 텍스트 run → 15pt (덮어쓰기)
    for f_elem in doc.element.iter(mtag('f')):
        for r_elem in f_elem.iter(mtag('r')):
            m_rPr = r_elem.find(mtag('rPr'))
            w_rPr = r_elem.find(qn('w:rPr'))
            if w_rPr is None:
                w_rPr = OxmlElement('w:rPr')
                if m_rPr is not None:
                    m_rPr.addnext(w_rPr)
                else:
                    r_elem.insert(0, w_rPr)
            force_size(w_rPr, FRAC_SZ)

    # 컬럼 폭 ≈ 7.6cm. 가로 7cm / 세로 5cm 이내에 들어오도록 비율 유지하며 축소
    max_img_width = Cm(7.0)
    max_img_height = Cm(5.0)
    for shape in doc.inline_shapes:
        try:
            w, h = shape.width, shape.height
            if not w or not h:
                continue
            scale_w = max_img_width / w
            scale_h = max_img_height / h
            scale = min(scale_w, scale_h, 1.0)
            if scale < 1.0:
                shape.width = Emu(int(w * scale))
                shape.height = Emu(int(h * scale))
        except Exception:
            pass

    doc.save(docx_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--list', action='store_true', help='시험 목록 조회')
    parser.add_argument('--exam-id', type=int, help='내보낼 시험 ID')
    parser.add_argument('--no-answers', action='store_true', help='정답 제외')
    parser.add_argument('--no-images', action='store_true', help='이미지 제외')
    parser.add_argument('--with-explanation', action='store_true', help='해설 포함')
    parser.add_argument('--out', type=str, help='출력 파일 경로(.docx)')
    args = parser.parse_args()

    conn = psycopg2.connect(DB_URL)

    if args.list or not args.exam_id:
        list_exams(conn)
        if not args.exam_id:
            print('--exam-id <ID> 로 시험을 지정하세요.')
            return

    exam, subjects, questions = fetch_exam(conn, args.exam_id)
    if not exam:
        print(f'❌ exam id={args.exam_id} 를 찾을 수 없습니다.')
        return
    if not questions:
        print(f'❌ 활성 문제가 없습니다.')
        return

    print(f"📘 {exam['category']} / {exam['name']} ({exam.get('year')}년 {exam.get('round')}회)")
    print(f"   문항 수: {len(questions)}, 과목 수: {len(subjects)}")

    md = build_markdown(
        exam, subjects, questions,
        include_answers=not args.no_answers,
        include_images=not args.no_images,
        include_explanation=args.with_explanation,
    )

    title_parts = [str(exam.get('year') or ''), f"{exam.get('round')}회" if exam.get('round') else '', exam['name']]
    base = safe_filename('_'.join(p for p in title_parts if p))
    if args.out:
        out_path = args.out
    else:
        os.makedirs('data/exports', exist_ok=True)
        out_path = os.path.join('data', 'exports', f'{base}.docx')

    md_debug_path = out_path.replace('.docx', '.md')
    with open(md_debug_path, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f"📄 markdown: {md_debug_path}")

    print(f"⏳ Pandoc 변환 중...")
    pypandoc.convert_text(
        md,
        to='docx',
        format='markdown+tex_math_dollars+raw_tex',
        outputfile=out_path,
        extra_args=['--standalone'],
    )

    print(f"🪄 2단 레이아웃 적용 중...")
    apply_two_column_layout(out_path, header_title=build_exam_title(exam))

    print(f"✅ 저장 완료: {out_path}")
    conn.close()


if __name__ == '__main__':
    main()

function escapeHtml(text: string): string {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function printExamPaperFromResult(data: any) {
  const w = window.open('', '_blank')
  if (!w) {
    alert('팝업이 차단되었습니다. 팝업을 허용해주세요.')
    return
  }

  const questionsHtml = data.questions.map((q: any, idx: number) => {
    const questionType = q.question_type || 'CHOICE'
    const isSubjective = questionType !== 'CHOICE'
    const pointsLabel = q.points && q.points > 1 ? ` (${q.points}점)` : ''
    const typeLabel = isSubjective ? ` <span style="color:#7c3aed; font-size:12px;">[${questionType === 'SHORT_ANSWER' ? '단답형' : '서술형'}]</span>` : ''

    if (isSubjective) {
      const gradingText = q.grading_status === 'GRADED'
        ? `<span style="color:#2563eb; font-weight:600;">${q.awarded_points}/${q.points}점</span>`
        : `<span style="color:#ca8a04; font-weight:600;">채점 대기</span>`
      return `
        <div style="margin-bottom:16px; page-break-inside:avoid;">
          <div style="font-weight:600; margin-bottom:6px;">
            ${idx + 1}. ${escapeHtml(q.question_text)}${pointsLabel}${typeLabel}
          </div>
          ${q.image_url ? `<img src="${escapeHtml(q.image_url)}" style="max-width:300px; max-height:200px; margin:4px 0 8px 20px;" />` : ''}
          <div style="margin-left:20px; padding:8px; border:1px solid #bfdbfe; border-radius:6px; background:#eff6ff;">
            <div style="font-size:12px; font-weight:600; color:#1d4ed8; margin-bottom:4px;">학생 답안:</div>
            <div style="white-space:pre-wrap;">${escapeHtml(q.student_answer_text || '(미작성)')}</div>
          </div>
          <div style="font-size:12px; color:#666; margin-top:4px; margin-left:20px;">
            ${gradingText}
          </div>
        </div>`
    }

    const choices = [q.choice_1, q.choice_2, q.choice_3, q.choice_4]
    return `
      <div style="margin-bottom:16px; page-break-inside:avoid;">
        <div style="font-weight:600; margin-bottom:6px;">
          ${idx + 1}. ${escapeHtml(q.question_text)}${pointsLabel}
        </div>
        ${q.image_url ? `<img src="${escapeHtml(q.image_url)}" style="max-width:300px; max-height:200px; margin:4px 0 8px 20px;" />` : ''}
        <div style="margin-left:20px;">
          ${choices.map((c: string, ci: number) => {
            const num = ci + 1
            const isStudent = q.student_answer === num
            const isCorrect = q.correct_answer === num
            let style = ''
            if (isStudent && isCorrect) style = 'color:#16a34a; font-weight:700;'
            else if (isStudent && !isCorrect) style = 'color:#dc2626; font-weight:700; text-decoration:line-through;'
            else if (isCorrect) style = 'color:#16a34a; font-weight:600;'
            const marker = isStudent ? (isCorrect ? ' [O]' : ' [X]') : (isCorrect ? ' [정답]' : '')
            return `<div style="margin:2px 0; ${style}">${num}. ${escapeHtml(c)}${marker}</div>`
          }).join('')}
        </div>
        <div style="font-size:12px; color:#666; margin-top:4px; margin-left:20px;">
          내 답: ${q.student_answer || '미응답'} / 정답: ${q.correct_answer} /
          <span style="color:${q.is_correct ? '#16a34a' : '#dc2626'}; font-weight:600;">${q.is_correct ? '정답' : '오답'}</span>
        </div>
      </div>`
  }).join('')

  w.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>시험지 - ${escapeHtml(data.student.name)}</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo', sans-serif; font-size: 13px; line-height: 1.6; color: #111; }
  .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 20px; margin: 0 0 8px; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .info-table td { padding: 6px 12px; border: 1px solid #ccc; font-size: 13px; }
  .info-table td:first-child { background: #f5f5f5; font-weight: 600; width: 80px; }
  .score-box { text-align: center; padding: 12px; background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; margin-bottom: 16px; }
  .score-box .score { font-size: 28px; font-weight: 700; color: ${data.total_score >= 60 ? '#16a34a' : '#dc2626'}; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head><body>
<div class="header">
  <h1>${escapeHtml(data.exam_name)}</h1>
  <div style="font-size:12px; color:#666;">시험 결과지</div>
</div>
<table class="info-table">
  <tr><td>이름</td><td>${escapeHtml(data.student.name)}</td><td>학번</td><td>${escapeHtml(data.student.student_id || '-')}</td></tr>
  <tr><td>소속</td><td>${escapeHtml(data.student.affiliation || '-')}</td><td>시험 날짜</td><td>${new Date(data.started_at).toLocaleDateString('ko-KR')}</td></tr>
</table>
<div class="score-box">
  <div>총점</div>
  <div class="score">${data.total_score}점</div>
  <div style="font-size:13px; color:#666;">정답 ${data.total_correct} / ${data.total_questions}문항</div>
</div>
<h2 style="font-size:16px; border-bottom:1px solid #ccc; padding-bottom:6px;">문제 및 답안</h2>
${questionsHtml}
<script>window.onload=function(){window.print();};window.onafterprint=function(){window.close();};</script>
</body></html>`)
  w.document.close()
}

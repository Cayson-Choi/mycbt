import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ examId: string; attemptId: string }> }
) {
  try {
    const supabase = await createClient()
    const { examId, attemptId } = await params

    // 관리자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!adminProfile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // attempt 확인
    const { data: attempt, error: attemptError } = await adminClient
      .from('attempts')
      .select('id, exam_id, status, total_questions')
      .eq('id', attemptId)
      .eq('exam_id', examId)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ error: '시험을 찾을 수 없습니다' }, { status: 404 })
    }

    if (attempt.status !== 'SUBMITTED') {
      return NextResponse.json({ error: '제출된 시험이 아닙니다' }, { status: 400 })
    }

    // 요청 데이터
    const body = await request.json()
    const { grades } = body as { grades: { question_id: number; awarded_points: number }[] }

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ error: '채점 데이터가 필요합니다' }, { status: 400 })
    }

    // 해당 문제의 배점 확인
    const questionIds = grades.map((g) => g.question_id)
    const { data: questions } = await adminClient
      .from('questions')
      .select('id, points, question_type')
      .in('id', questionIds)

    const questionsMap = new Map()
    questions?.forEach((q) => questionsMap.set(q.id, q))

    // 각 주관식 문항 채점
    for (const grade of grades) {
      const q = questionsMap.get(grade.question_id)
      if (!q) continue
      if (q.question_type === 'CHOICE') continue // 객관식은 건너뜀

      const maxPoints = q.points || 1
      const awardedPoints = Math.max(0, Math.min(grade.awarded_points, maxPoints))

      await adminClient
        .from('attempt_items')
        .update({
          awarded_points: awardedPoints,
          is_correct: awardedPoints > 0,
          grading_status: 'GRADED',
        })
        .eq('attempt_id', attemptId)
        .eq('question_id', grade.question_id)
    }

    // 모든 주관식 문항이 GRADED 되었는지 확인
    const { data: pendingItems } = await adminClient
      .from('attempt_items')
      .select('id')
      .eq('attempt_id', attemptId)
      .eq('grading_status', 'PENDING')

    const allGraded = !pendingItems || pendingItems.length === 0

    if (allGraded) {
      // 전체 점수 재계산: SUM(awarded_points) from attempt_items
      const { data: allItems } = await adminClient
        .from('attempt_items')
        .select('question_id, awarded_points, is_correct')
        .eq('attempt_id', attemptId)

      let totalPointsEarned = 0
      let totalCorrect = 0
      allItems?.forEach((item) => {
        totalPointsEarned += item.awarded_points || 0
        if (item.is_correct) totalCorrect++
      })

      // attempts 업데이트
      await adminClient
        .from('attempts')
        .update({
          total_score: totalPointsEarned,
          total_correct: totalCorrect,
          grading_status: 'COMPLETED',
        })
        .eq('id', attemptId)

      // subject_scores 재계산
      const { data: attemptQuestions } = await adminClient
        .from('attempt_questions')
        .select('question_id, questions(subject_id, points)')
        .eq('attempt_id', attemptId)

      const itemsMap = new Map()
      allItems?.forEach((item) => itemsMap.set(item.question_id, item))

      const subjectStats = new Map<number, { correct: number; total: number; pointsEarned: number }>()
      for (const aq of (attemptQuestions || []) as any[]) {
        const subjectId = aq.questions?.subject_id
        if (!subjectId) continue

        if (!subjectStats.has(subjectId)) {
          subjectStats.set(subjectId, { correct: 0, total: 0, pointsEarned: 0 })
        }
        const stats = subjectStats.get(subjectId)!
        stats.total++

        const item = itemsMap.get(aq.question_id)
        if (item) {
          stats.pointsEarned += item.awarded_points || 0
          if (item.is_correct) stats.correct++
        }
      }

      // 기존 subject_scores 삭제 후 재생성
      await adminClient
        .from('subject_scores')
        .delete()
        .eq('attempt_id', attemptId)

      for (const [subjectId, stats] of subjectStats.entries()) {
        await adminClient.from('subject_scores').insert({
          attempt_id: attemptId,
          subject_id: subjectId,
          subject_questions: stats.total,
          subject_correct: stats.correct,
          subject_score: stats.pointsEarned,
        })
      }

      return NextResponse.json({
        success: true,
        all_graded: true,
        total_score: totalPointsEarned,
        total_correct: totalCorrect,
      })
    }

    return NextResponse.json({
      success: true,
      all_graded: false,
      pending_count: pendingItems?.length || 0,
    })
  } catch (error) {
    console.error('Admin grade error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

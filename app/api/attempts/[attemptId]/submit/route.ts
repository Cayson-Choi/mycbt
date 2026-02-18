import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const supabase = await createClient()
    const { attemptId } = await params

    // 1. 로그인 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    // 2. attempt 확인
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('id, user_id, exam_id, status, expires_at, total_questions, exams(exam_mode)')
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ error: '시험을 찾을 수 없습니다' }, { status: 404 })
    }

    // 본인의 시험인지 확인
    if (attempt.user_id !== user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // IN_PROGRESS 상태인지 확인
    if (attempt.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: '이미 제출되었거나 만료된 시험입니다' }, { status: 400 })
    }

    // 만료 전인지 확인
    const now = new Date()
    const expiresAt = new Date(attempt.expires_at)
    if (now >= expiresAt) {
      return NextResponse.json({ error: '시험 시간이 만료되었습니다' }, { status: 400 })
    }

    // 3. attempt_questions에 있는 문제 목록 및 정답 조회
    const { data: attemptQuestions, error: questionsError } = await supabase
      .from('attempt_questions')
      .select(
        `
        question_id,
        questions (
          id,
          answer,
          question_type,
          subject_id,
          points
        )
      `
      )
      .eq('attempt_id', attemptId)

    if (questionsError || !attemptQuestions) {
      return NextResponse.json({ error: '문제를 불러올 수 없습니다' }, { status: 500 })
    }

    // 4. 학생이 제출한 답안 조회
    const { data: studentAnswers } = await supabase
      .from('attempt_items')
      .select('question_id, selected, answer_text')
      .eq('attempt_id', attemptId)

    // 답안을 question_id로 매핑
    const answersMap = new Map()
    studentAnswers?.forEach((item) => {
      answersMap.set(item.question_id, item)
    })

    // 5. 채점 및 is_correct 업데이트
    const examMode = (attempt as any).exams?.exam_mode
    const isOfficial = examMode === 'OFFICIAL'
    let totalCorrect = 0
    let totalPointsEarned = 0
    let hasSubjective = false
    const subjectStats = new Map() // subject_id -> { correct, total, pointsEarned, pointsTotal }

    for (const aq of attemptQuestions as any[]) {
      const questionId = aq.question_id
      const correctAnswer = aq.questions.answer
      const questionType = aq.questions.question_type || 'CHOICE'
      const subjectId = aq.questions.subject_id
      const questionPoints = aq.questions.points || 1
      const studentItem = answersMap.get(questionId)
      const studentAnswer = studentItem?.selected

      // subject 통계 업데이트
      if (!subjectStats.has(subjectId)) {
        subjectStats.set(subjectId, { correct: 0, total: 0, pointsEarned: 0, pointsTotal: 0 })
      }
      const stats = subjectStats.get(subjectId)
      stats.total++
      stats.pointsTotal += questionPoints

      if (questionType === 'CHOICE') {
        // 객관식: 자동 채점
        const isCorrect = studentAnswer === correctAnswer

        if (isCorrect) {
          totalCorrect++
          totalPointsEarned += questionPoints
          stats.correct++
          stats.pointsEarned += questionPoints
        }

        await supabase
          .from('attempt_items')
          .upsert(
            {
              attempt_id: attemptId,
              question_id: questionId,
              selected: studentAnswer || null,
              is_correct: isCorrect,
              awarded_points: isCorrect ? questionPoints : 0,
              grading_status: 'AUTO',
            },
            {
              onConflict: 'attempt_id,question_id',
            }
          )
      } else {
        // 주관식 (SHORT_ANSWER / ESSAY): 수동 채점 대기
        hasSubjective = true

        await supabase
          .from('attempt_items')
          .upsert(
            {
              attempt_id: attemptId,
              question_id: questionId,
              selected: null,
              answer_text: studentItem?.answer_text || null,
              is_correct: null,
              awarded_points: null,
              grading_status: 'PENDING',
            },
            {
              onConflict: 'attempt_id,question_id',
            }
          )
      }
    }

    // 6. 총점 계산 (OFFICIAL: 배점 합산, PRACTICE: 퍼센트)
    // 주관식이 있으면 객관식만 합산한 임시 점수
    const totalScore = isOfficial
      ? totalPointsEarned
      : Math.round((totalCorrect / attempt.total_questions) * 100)

    // 7. subject_scores 저장
    for (const [subjectId, stats] of subjectStats.entries()) {
      const subjectScore = isOfficial
        ? stats.pointsEarned
        : Math.round((stats.correct / stats.total) * 100)

      await supabase.from('subject_scores').insert({
        attempt_id: attemptId,
        subject_id: subjectId,
        subject_questions: stats.total,
        subject_correct: stats.correct,
        subject_score: subjectScore,
      })
    }

    // 8. attempts 업데이트 (SUBMITTED, 점수 저장)
    const submittedAt = new Date()
    const { error: updateError } = await supabase
      .from('attempts')
      .update({
        status: 'SUBMITTED',
        submitted_at: submittedAt.toISOString(),
        total_correct: totalCorrect,
        total_score: totalScore,
        grading_status: hasSubjective ? 'PENDING_MANUAL' : 'COMPLETED',
      })
      .eq('id', attemptId)

    if (updateError) {
      console.error('Update attempt error:', updateError)
      return NextResponse.json({ error: '시험 제출에 실패했습니다' }, { status: 500 })
    }

    // 9. daily_best_scores 업데이트 (오늘 KST 기준) - OFFICIAL 시험은 랭킹 제외
    if (!isOfficial) {
      const kstOffset = 9 * 60 // KST는 UTC+9
      const kstDate = new Date(submittedAt.getTime() + kstOffset * 60 * 1000)
      const kstDateString = kstDate.toISOString().split('T')[0] // YYYY-MM-DD

      // 해당 날짜의 기존 최고 점수 확인
      const { data: existingBest } = await supabase
        .from('daily_best_scores')
        .select('best_score')
        .eq('kst_date', kstDateString)
        .eq('exam_id', attempt.exam_id)
        .eq('user_id', user.id)
        .single()

      // 최고 점수인 경우에만 업데이트
      if (!existingBest || totalScore > existingBest.best_score) {
        await supabase.from('daily_best_scores').upsert(
          {
            kst_date: kstDateString,
            exam_id: attempt.exam_id,
            user_id: user.id,
            best_score: totalScore,
            best_submitted_at: submittedAt.toISOString(),
            attempt_id: attemptId,
          },
          {
            onConflict: 'kst_date,exam_id,user_id',
          }
        )
      }
    }

    // 10. 결과 반환
    return NextResponse.json({
      success: true,
      attempt_id: attemptId,
      total_questions: attempt.total_questions,
      total_correct: totalCorrect,
      total_score: totalScore,
      submitted_at: submittedAt.toISOString(),
    })
  } catch (error) {
    console.error('Submit attempt error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

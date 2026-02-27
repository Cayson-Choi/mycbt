import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 관리자 권한 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    // 시험 + 과목 + questions_per_attempt 조회
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('id, name, exam_mode, duration_minutes, sort_order')
      .order('sort_order')

    if (examsError) {
      return NextResponse.json({ error: '시험 목록 조회 실패' }, { status: 500 })
    }

    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, exam_id, name, questions_per_attempt, order_no')
      .order('order_no')

    if (subjectsError) {
      return NextResponse.json({ error: '과목 목록 조회 실패' }, { status: 500 })
    }

    // 과목별 문제 은행 수 조회
    const adminSupabase = createAdminClient()
    const { data: questionCounts, error: countError } = await adminSupabase
      .rpc('get_subject_question_counts')

    // RPC가 없을 수 있으므로 fallback으로 직접 집계
    let subjectQuestionCounts: Record<number, number> = {}
    if (countError || !questionCounts) {
      // 각 과목별 문제 수를 직접 조회
      for (const subject of subjects || []) {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('subject_id', subject.id)
        subjectQuestionCounts[subject.id] = count || 0
      }
    } else {
      for (const row of questionCounts) {
        subjectQuestionCounts[row.subject_id] = row.count
      }
    }

    return NextResponse.json({
      exams: exams || [],
      subjects: (subjects || []).map((s) => ({
        ...s,
        total_questions: subjectQuestionCounts[s.id] || 0,
      })),
    })
  } catch (error) {
    console.error('Exam settings GET error:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 관리자 권한 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { subjects, exams: examUpdates } = body as {
      subjects?: { id: number; questions_per_attempt: number }[]
      exams?: { id: number; duration_minutes: number }[]
    }

    if ((!Array.isArray(subjects) || subjects.length === 0) && (!Array.isArray(examUpdates) || examUpdates.length === 0)) {
      return NextResponse.json({ error: '수정할 정보가 없습니다' }, { status: 400 })
    }

    // 과목 유효성 검사
    if (subjects && subjects.length > 0) {
      for (const s of subjects) {
        if (typeof s.id !== 'number' || typeof s.questions_per_attempt !== 'number') {
          return NextResponse.json({ error: '잘못된 데이터 형식입니다' }, { status: 400 })
        }
        if (!Number.isInteger(s.questions_per_attempt) || s.questions_per_attempt < 0) {
          return NextResponse.json(
            { error: '출제 문항 수는 0 이상의 정수여야 합니다' },
            { status: 400 }
          )
        }
      }
    }

    // 시험 시간 유효성 검사
    if (examUpdates && examUpdates.length > 0) {
      for (const e of examUpdates) {
        if (typeof e.id !== 'number' || typeof e.duration_minutes !== 'number') {
          return NextResponse.json({ error: '잘못된 데이터 형식입니다' }, { status: 400 })
        }
        if (!Number.isInteger(e.duration_minutes) || e.duration_minutes < 1 || e.duration_minutes > 300) {
          return NextResponse.json(
            { error: '시험 시간은 1~300분이어야 합니다' },
            { status: 400 }
          )
        }
      }
    }

    const adminSupabase = createAdminClient()

    // 각 과목 업데이트
    if (subjects && subjects.length > 0) {
      for (const s of subjects) {
        const { error } = await adminSupabase
          .from('subjects')
          .update({ questions_per_attempt: s.questions_per_attempt })
          .eq('id', s.id)

        if (error) {
          console.error(`Subject ${s.id} update error:`, error)
          return NextResponse.json(
            { error: `과목 ID ${s.id} 업데이트 실패` },
            { status: 500 }
          )
        }
      }
    }

    // 시험 시간 업데이트
    if (examUpdates && examUpdates.length > 0) {
      for (const e of examUpdates) {
        const { error } = await adminSupabase
          .from('exams')
          .update({ duration_minutes: e.duration_minutes })
          .eq('id', e.id)

        if (error) {
          console.error(`Exam ${e.id} duration update error:`, error)
          return NextResponse.json(
            { error: `시험 ID ${e.id} 시간 업데이트 실패` },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      message: '설정이 저장되었습니다',
      updated_count: (subjects?.length || 0) + (examUpdates?.length || 0),
    })
  } catch (error) {
    console.error('Exam settings PUT error:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

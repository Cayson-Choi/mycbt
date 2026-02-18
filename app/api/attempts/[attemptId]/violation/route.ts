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
      .select('id, user_id, status, violation_count')
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
      return NextResponse.json({ error: '진행 중인 시험이 아닙니다' }, { status: 400 })
    }

    // 3. violation_count 증가
    const newCount = (attempt.violation_count || 0) + 1
    const { error: updateError } = await supabase
      .from('attempts')
      .update({ violation_count: newCount })
      .eq('id', attemptId)

    if (updateError) {
      console.error('Violation update error:', updateError)
      return NextResponse.json({ error: '위반 기록 실패' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      violation_count: newCount,
    })
  } catch (error) {
    console.error('Violation error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

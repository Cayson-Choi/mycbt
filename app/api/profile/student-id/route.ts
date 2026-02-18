import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // 1. 로그인 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    // 2. body 파싱
    const { student_id } = await request.json()

    if (!student_id || typeof student_id !== 'string' || student_id.trim().length === 0) {
      return NextResponse.json({ error: '학번을 입력해주세요' }, { status: 400 })
    }

    // 3. profiles 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ student_id: student_id.trim() })
      .eq('id', user.id)

    if (updateError) {
      console.error('Student ID update error:', updateError)
      return NextResponse.json({ error: '학번 저장에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      student_id: student_id.trim(),
    })
  } catch (error) {
    console.error('Student ID error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

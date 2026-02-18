import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { email, password, name, student_id, affiliation, phone } = await request.json()

  const adminSupabase = createAdminClient()

  // 1. 회원가입 (adminClient로 생성 → 이메일 인증 자동 완료)
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      affiliation,
      phone,
    },
  })

  if (authError) {
    let message = authError.message
    if (message.includes('already been registered')) {
      message = '이미 가입된 이메일입니다'
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // 2. 프로필 생성
  if (authData.user) {
    const { error: profileError } = await adminSupabase.from('profiles').insert({
      id: authData.user.id,
      name,
      student_id: student_id || null,
      affiliation,
      phone,
      is_admin: false,
    })

    if (profileError) {
      return NextResponse.json(
        { error: '프로필 생성 실패' },
        { status: 400 }
      )
    }

    // 3. 오늘 날짜 통계 업데이트 (KST 기준)
    try {
      const now = new Date()
      const nowKST = new Date(now.getTime() + 9 * 60 * 60 * 1000)
      const todayDateStr = nowKST.toISOString().split('T')[0]
      const userAffiliation = affiliation || '미지정'

      // 해당 날짜/소속의 기존 통계 조회
      const { data: existingStats } = await adminSupabase
        .from('daily_user_stats')
        .select('*')
        .eq('date', todayDateStr)
        .eq('affiliation', userAffiliation)
        .single()

      if (existingStats) {
        // 기존 통계가 있으면 UPDATE
        await adminSupabase
          .from('daily_user_stats')
          .update({
            signups_count: existingStats.signups_count + 1,
          })
          .eq('date', todayDateStr)
          .eq('affiliation', userAffiliation)
      } else {
        // 기존 통계가 없으면 INSERT
        await adminSupabase.from('daily_user_stats').insert({
          date: todayDateStr,
          affiliation: userAffiliation,
          signups_count: 1,
          deletions_count: 0,
        })
      }
    } catch (statsErr) {
      console.log('Stats update error (non-critical):', statsErr)
    }
  }

  return NextResponse.json({ success: true })
}

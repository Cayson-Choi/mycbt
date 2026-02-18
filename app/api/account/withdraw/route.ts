import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// 회원 탈퇴
export async function POST() {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 1. 본인 확인 (getUser로 서버 검증)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = user.id

    // 관리자는 탈퇴 불가
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (profile?.is_admin) {
      return NextResponse.json({ error: '관리자는 회원탈퇴가 불가능합니다. 먼저 관리자 권한을 해제해주세요.' }, { status: 403 })
    }

    // ★ 이하 모든 삭제는 adminClient 사용 (RLS 우회)
    // 본인 확인은 위에서 완료했으므로 안전

    // 2. daily_best_scores 삭제
    const now = new Date()
    const kstOffset = 9 * 60
    const kstDate = new Date(now.getTime() + kstOffset * 60 * 1000)
    const todayKST = kstDate.toISOString().split('T')[0]

    await adminClient
      .from('daily_best_scores')
      .delete()
      .eq('user_id', userId)
      .eq('kst_date', todayKST)

    // 3. daily_leaderboard_snapshots 익명 처리
    await adminClient
      .from('daily_leaderboard_snapshots')
      .update({
        user_id: null,
        user_name_display: '(탈퇴한 사용자)',
      })
      .eq('user_id', userId)

    // 4. 개인 응시 데이터 삭제
    const { data: userAttempts } = await adminClient
      .from('attempts')
      .select('id')
      .eq('user_id', userId)

    const attemptIds = userAttempts?.map((a) => a.id) || []

    if (attemptIds.length > 0) {
      await adminClient.from('attempt_items').delete().in('attempt_id', attemptIds)
      await adminClient.from('subject_scores').delete().in('attempt_id', attemptIds)
      await adminClient.from('attempt_questions').delete().in('attempt_id', attemptIds)
      await adminClient.from('attempts').delete().eq('user_id', userId)
    }

    // 5. profiles 삭제
    const { error: deleteProfileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      console.error('Delete profile error:', deleteProfileError)
      return NextResponse.json({ error: '프로필 삭제 실패' }, { status: 500 })
    }

    // 6. auth.users 삭제
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Delete auth user error:', deleteUserError)
      return NextResponse.json({ error: '사용자 삭제 실패' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '회원 탈퇴가 완료되었습니다',
    })
  } catch (error) {
    console.error('Withdraw error:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

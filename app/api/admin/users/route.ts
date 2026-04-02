import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// 회원 목록 조회
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

    // 관리자 클라이언트로 모든 회원 조회
    const adminSupabase = createAdminClient()

    const { data: profiles, error } = await adminSupabase
      .from('profiles')
      .select('id, name, affiliation, phone, is_admin, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Users query error:', error)
      return NextResponse.json({ error: '회원 조회 실패' }, { status: 500 })
    }

    // auth.users + 응시 통계를 병렬로 일괄 조회 (N+1 제거)
    const userIds = (profiles || []).map((p) => p.id)

    const [authListResult, attemptCountsResult] = await Promise.all([
      // 1) auth.users 일괄 조회 (개별 getUserById N번 -> listUsers 1번)
      adminSupabase.auth.admin.listUsers({ perPage: 1000 }),
      // 2) 응시 통계 일괄 조회 (개별 count N번 -> 단일 쿼리 1번)
      userIds.length > 0
        ? adminSupabase
            .from('attempts')
            .select('user_id')
            .in('user_id', userIds)
            .eq('status', 'SUBMITTED')
        : Promise.resolve({ data: [] }),
    ])

    const emailMap = new Map<string, string>()
    if (authListResult.data?.users) {
      for (const au of authListResult.data.users) {
        emailMap.set(au.id, au.email || '')
      }
    }

    const attemptCountMap = new Map<string, number>()
    if (attemptCountsResult.data) {
      for (const row of attemptCountsResult.data) {
        attemptCountMap.set(row.user_id, (attemptCountMap.get(row.user_id) || 0) + 1)
      }
    }

    // 조립
    const usersWithStats = (profiles || []).map((p) => ({
      ...p,
      email: emailMap.get(p.id) || '',
      attempt_count: attemptCountMap.get(p.id) || 0,
    }))

    return NextResponse.json({
      users: usersWithStats,
    })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

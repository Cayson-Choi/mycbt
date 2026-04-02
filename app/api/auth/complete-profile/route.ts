import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { name, phone } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 })
    }

    if (!phone?.trim() || !/^010-\d{4}-\d{4}$/.test(phone.trim())) {
      return NextResponse.json({ error: '전화번호는 010-xxxx-xxxx 형식으로 입력해주세요' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 중복 생성 방지
    const { data: existing } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: '이미 프로필이 존재합니다' }, { status: 409 })
    }

    const { error: profileError } = await adminSupabase.from('profiles').insert({
      id: user.id,
      name: name.trim(),
      phone: phone.trim(),
      is_admin: false,
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ error: '프로필 생성에 실패했습니다' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

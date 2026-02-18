import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Supabase 에러 메시지를 한국어로 변환
      let message = error.message
      if (message === 'Invalid login credentials') {
        message = '이메일 또는 비밀번호가 올바르지 않습니다'
      } else if (message === 'Email not confirmed') {
        message = '이메일 인증이 완료되지 않았습니다'
      }
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (err) {
    console.error('Login API error:', err)
    return NextResponse.json({ error: '로그인 처리 중 오류가 발생했습니다' }, { status: 500 })
  }
}

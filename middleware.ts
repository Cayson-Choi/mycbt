import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 공개 페이지는 인증 체크 없이 바로 통과
  const publicPaths = ['/', '/login', '/register', '/signup']
  const isPublic = publicPaths.includes(pathname)

  // API 라우트 중 공개 API도 바로 통과
  const publicApiPaths = ['/api/home/leaderboard', '/api/exams', '/api/auth']
  const isPublicApi = publicApiPaths.some(p => pathname.startsWith(p))

  if (isPublic || isPublicApi) {
    return NextResponse.next()
  }

  // 보호된 경로만 인증 체크
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ★ getSession()은 쿠키에서 로컬로 읽음 (네트워크 요청 없음, ~0ms)
  // getUser()는 Supabase 서버로 HTTP 요청 (~200-500ms)
  let user = null
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    user = session?.user ?? null
  } catch {
    // 리프레시 토큰 만료 등 인증 에러 → 로그인 페이지로
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 보호된 페이지: 로그인 필요
  const protectedPaths = ['/exam', '/my', '/admin']
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // 관리자 페이지: app_metadata.is_admin 체크 (DB 쿼리 없음, ~0ms)
  if (pathname.startsWith('/admin') && user) {
    if (!user.app_metadata?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

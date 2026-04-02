import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── 공개 경로 (Supabase 클라이언트 생성 없이 즉시 통과) ──
// 인증이 필요 없는 API: 리더보드, 시험목록, 인증 콜백/로그아웃, cron
const PUBLIC_API_PREFIXES = [
  '/api/home/leaderboard',
  '/api/exams',
  '/api/auth',
  '/api/cron',
]

// 공개 페이지: 홈, 로그인, 추가정보기입
const PUBLIC_PAGES = new Set(['/', '/login', '/complete-profile'])

// ── 보호된 경로 (로그인 필수) ──
const PROTECTED_PREFIXES = ['/exam', '/my', '/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1단계: 공개 경로 빠른 패스 (Supabase 클라이언트 생성 없이 즉시 통과)
  //   - 공개 API: 인증 불필요, 쿠키 갱신도 불필요
  //   - 공개 페이지: 로그인 안 한 사용자도 접근 가능
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const isPublicApi = PUBLIC_API_PREFIXES.some(p => pathname.startsWith(p))
  if (isPublicApi) {
    return NextResponse.next()
  }

  const isPublicPage = PUBLIC_PAGES.has(pathname)

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2단계: Supabase 클라이언트 생성 (쿠키 갱신용)
  //   - 공개 페이지: 쿠키 갱신만 하고 통과
  //   - 보호된 경로: 쿠키 갱신 + 세션 확인
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
  // getUser()는 Supabase 서버로 HTTP 요청 (~200-500ms) → 절대 사용 금지
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

  // 공개 페이지는 쿠키 갱신만 하고 통과
  if (isPublicPage) {
    return supabaseResponse
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3단계: 보호된 경로 접근 제어
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const isProtectedPath = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))

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
    /*
     * 아래 경로를 제외한 모든 요청에서 미들웨어 실행:
     * - _next/static (빌드 정적 파일: JS, CSS, 청크)
     * - _next/image (이미지 최적화 프록시)
     * - favicon.ico (파비콘)
     * - 정적 자산 확장자 (이미지, 폰트, 미디어, 데이터 파일)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot|otf|mp4|webm|json|xml|txt|robots\\.txt|sitemap\\.xml)$).*)',
  ],
}

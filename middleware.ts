import { NextResponse, type NextRequest } from "next/server"

// 공개 API
const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/home",
  "/api/exams",
  "/api/exam-categories",
  "/api/cron",
  "/api/payments/webhook",
]

// 공개 페이지
const PUBLIC_PAGES = new Set(["/", "/login", "/complete-profile", "/premium"])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 공개 API → 즉시 통과
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 2. 공개 페이지 → 즉시 통과
  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next()
  }

  // 2-1. 공개 경로 접두사 → 즉시 통과
  if (pathname.startsWith("/grade/") || pathname.startsWith("/category/") || pathname.startsWith("/videos/") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password") || pathname.startsWith("/find-email")) {
    return NextResponse.next()
  }

  // 3. 세션 쿠키 확인 (경량 체크, JWT 파싱 없음)
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  if (!sessionToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot|otf|mp4|webm|json|xml|txt|robots\\.txt|sitemap\\.xml)$).*)",
  ],
}

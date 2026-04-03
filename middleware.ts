import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

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
const PUBLIC_PAGES = new Set(["/", "/login", "/complete-profile"])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 공개 API → 즉시 통과
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 2. 공개 페이지 → 즉시 통과
  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next()
  }

  // 3. JWT 토큰 확인 (Prisma import 없이 경량 체크)
  const token = await getToken({ req: request })

  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // 4. 관리자 경로
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf|eot|otf|mp4|webm|json|xml|txt|robots\\.txt|sitemap\\.xml)$).*)",
  ],
}

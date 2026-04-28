import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Kakao from "next-auth/providers/kakao"
import Naver from "next-auth/providers/naver"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"
import { createTransport } from "nodemailer"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, image: true, password: true, emailVerified: true },
        })

        if (!user || !user.password) return null
        if (!user.emailVerified) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      // 카카오는 client_secret_post 방식 필수 (에러 E-009 방지)
      client: { token_endpoint_auth_method: "client_secret_post" },
      // scope 는 카카오 개발자 콘솔의 동의항목 설정을 그대로 따름.
      // email 미수신 케이스는 signIn 콜백에서 안내 메시지로 처리됨.
      allowDangerousEmailAccountLinking: true,
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Nodemailer({
      server: {
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const transport = createTransport(provider.server as any)
        const result = await transport.sendMail({
          to: email,
          from: provider.from,
          subject: "[CAYSON] 이메일 로그인 인증",
          text: `CAYSON 로그인 인증\n\n아래 링크를 클릭하면 로그인됩니다.\n${url}\n\n본인이 요청하지 않았다면 이 메일을 무시하세요.`,
          html: `
            <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
              <div style="text-align:center;margin-bottom:32px">
                <h1 style="font-size:28px;font-weight:bold;color:#1a1a1a;margin:0">CAYSON</h1>
                <p style="font-size:14px;color:#666;margin:8px 0 0">전기 자격시험 CBT</p>
              </div>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:32px 24px;text-align:center">
                <p style="font-size:16px;color:#334155;margin:0 0 8px;font-weight:600">이메일 로그인 인증</p>
                <p style="font-size:14px;color:#64748b;margin:0 0 24px">아래 버튼을 클릭하면 로그인됩니다.</p>
                <a href="${url}" target="_blank" style="display:inline-block;padding:14px 48px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600">로그인하기</a>
              </div>
              <div style="margin-top:24px;text-align:center">
                <p style="font-size:12px;color:#94a3b8;margin:0">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
                <p style="font-size:12px;color:#94a3b8;margin:4px 0 0">버튼이 작동하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.</p>
                <p style="font-size:11px;color:#cbd5e1;margin:8px 0 0;word-break:break-all">${url}</p>
              </div>
            </div>
          `,
        })
        if (result.rejected?.length) {
          throw new Error(`이메일 전송 실패: ${result.rejected.join(", ")}`)
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, user }) {
      // OAuth 로그인은 email 이 있어야 함
      // (카카오 등에서 email scope 미동의 시 새 계정이 생성되는 것을 차단)
      if (account && account.provider !== "credentials" && account.provider !== "nodemailer") {
        if (!user?.email) {
          return "/login?error=NoEmail"
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      // 1) 로그인/세션 update 시: 항상 DB 에서 최신 프로필 로드
      // 2) 그 외: nickname 이 비어있고 마지막 갱신이 60초 이상 지났을 때만 DB 조회
      //    (가입 직후처럼 nickname 이 영구히 null 상태에서 매 요청마다 DB hit 하는 것을 방지)
      const now = Math.floor(Date.now() / 1000)
      const lastFetched = (token.lastFetched as number) ?? 0
      const stale = !token.nickname && now - lastFetched > 60
      const shouldRefresh = !!user || trigger === "update" || stale

      if (shouldRefresh) {
        const userId = user?.id || token.sub
        if (userId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              nickname: true,
              isAdmin: true,
              tier: true,
              tierExpiresAt: true,
              phone: true,
            },
          })
          if (dbUser) {
            token.nickname = dbUser.nickname
            token.isAdmin = dbUser.isAdmin
            token.tier = dbUser.tier
            token.tierExpiresAt = dbUser.tierExpiresAt
            token.phone = dbUser.phone
          }
          token.lastFetched = now
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.nickname = (token.nickname as string) ?? null
        session.user.isAdmin = (token.isAdmin as boolean) ?? false
        session.user.tier = (token.tier as any) ?? "FREE"
        session.user.tierExpiresAt = (token.tierExpiresAt as Date) ?? null
        session.user.phone = (token.phone as string) ?? null
      }
      return session
    },
  },
})

import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Kakao from "next-auth/providers/kakao"
import Naver from "next-auth/providers/naver"
import Nodemailer from "next-auth/providers/nodemailer"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
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
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user || trigger === "update" || !token.nickname) {
        // 첫 로그인, 세션 갱신, 또는 nickname 미설정 시 DB에서 가져오기
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
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.nickname = (token.nickname as string) ?? null
        session.user.isAdmin = (token.isAdmin as boolean) ?? false
        session.user.tier = (token.tier as any) ?? "GUEST"
        session.user.tierExpiresAt = (token.tierExpiresAt as Date) ?? null
        session.user.phone = (token.phone as string) ?? null
      }
      return session
    },
  },
})

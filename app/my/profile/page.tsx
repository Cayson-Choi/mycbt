import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from 'next/link'
import ProfileForm from './ProfileForm'
import PasswordForm from './PasswordForm'

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?redirect=/my/profile")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      nickname: true,
      email: true,
      phone: true,
      password: true,
    },
  })

  if (!user) {
    redirect("/login?redirect=/my/profile")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">프로필 수정</h1>
          <p className="text-gray-600 dark:text-gray-400">전화번호를 수정할 수 있습니다</p>
        </div>

        {/* 프로필 수정 폼 */}
        <ProfileForm
          nickname={user.nickname || ''}
          email={user.email || ''}
          phone={user.phone || ''}
        />

        {/* 비밀번호 변경 폼 */}
        <PasswordForm hasPassword={!!user.password} />

        {/* 회원 탈퇴 링크 */}
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">회원 탈퇴</h3>
          <p className="text-sm text-red-800 dark:text-red-300 mb-3">
            탈퇴 시 모든 개인정보와 응시 기록이 삭제됩니다.
          </p>
          <Link
            href="/my/withdraw"
            className="inline-block px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600 text-sm"
          >
            회원 탈퇴하기
          </Link>
        </div>
      </div>
    </div>
  )
}

import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-5xl font-black tracking-tighter">전기짱</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400">
        서비스 준비중입니다
      </p>
      {session ? (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {session.user?.name || session.user?.email} 님 환영합니다
          </p>
        </div>
      ) : (
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          로그인
        </a>
      )}
    </div>
  )
}

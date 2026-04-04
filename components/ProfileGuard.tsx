"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfileGuard() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.id && (!session.user.nickname || !session.user.phone)) {
      router.replace("/complete-profile")
    }
  }, [session, router])

  // 홈 진입 시 주요 페이지를 미리 prefetch
  useEffect(() => {
    router.prefetch('/my')
    router.prefetch('/category/1')
    router.prefetch('/category/2')
    router.prefetch('/category/3')
    router.prefetch('/category/4')
  }, [router])

  return null
}

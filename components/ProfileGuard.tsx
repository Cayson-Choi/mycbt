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

  // 홈 진입 시 주요 페이지를 미리 prefetch (idle 시점까지 지연)
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 3000))
    const id = idle(() => {
      router.prefetch('/my')
      router.prefetch('/category/1')
      router.prefetch('/category/2')
      router.prefetch('/category/3')
      router.prefetch('/category/4')
    })
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(id as number)
      } else {
        clearTimeout(id as number)
      }
    }
  }, [router])

  return null
}

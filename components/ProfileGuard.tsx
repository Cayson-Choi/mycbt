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

  return null
}

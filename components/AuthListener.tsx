'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthListener() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // 토큰 갱신 실패로 자동 로그아웃된 경우
      if (event === 'SIGNED_OUT') {
        const publicPaths = ['/', '/login', '/complete-profile']
        if (!publicPaths.includes(pathname)) {
          router.push('/login')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, pathname])

  return null
}

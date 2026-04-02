import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  name: string
  affiliation: string | null
  is_admin: boolean
}

/**
 * 현재 로그인한 사용자 정보를 가져옵니다.
 * React `cache`로 감싸서 같은 렌더 사이클 내에서 중복 호출을 방지합니다.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return null

  const { data } = await supabase
    .from('profiles')
    .select('name, affiliation')
    .eq('id', session.user.id)
    .single()

  if (!data) return null

  return {
    id: session.user.id,
    name: data.name,
    affiliation: data.affiliation,
    is_admin: !!session.user.app_metadata?.is_admin,
  }
})

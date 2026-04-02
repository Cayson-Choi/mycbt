import MobileNav from './MobileNav'
import { getAuthUser } from '@/lib/auth'

export default async function HeaderMobileNav() {
  const user = await getAuthUser()

  const mobileUser = user
    ? { name: user.name, isAdmin: user.is_admin }
    : null

  return <MobileNav user={mobileUser} />
}

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UsersClient from "./UsersClient"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?redirect=/admin/users")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  if (!user?.isAdmin) redirect("/")

  // 회원 목록 조회 (API route의 GET 로직과 동일)
  const profiles = await prisma.user.findMany({
    select: {
      id: true,
      nickname: true,
      name: true,
      email: true,
      phone: true,
      isAdmin: true,
      tier: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const users = profiles.map((p) => ({
    id: p.id,
    nickname: p.nickname || "",
    name: p.name || "",
    email: p.email || "",
    phone: p.phone,
    is_admin: p.isAdmin,
    tier: p.tier,
    created_at: p.createdAt.toISOString(),
  }))

  return <UsersClient initialUsers={users} />
}

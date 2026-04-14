'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ConfirmDialog from '@/components/ConfirmDialog'

interface UserData {
  id: string
  nickname: string
  name: string
  email: string
  phone: string | null
  is_admin: boolean
  tier: string
  created_at: string
}

export default function UsersClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [adminFilter, setAdminFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // 필터링 및 검색
  useEffect(() => {
    let filtered = [...users]

    // 관리자 필터
    if (adminFilter === 'admin') {
      filtered = filtered.filter((u) => u.is_admin)
    } else if (adminFilter === 'user') {
      filtered = filtered.filter((u) => !u.is_admin)
    }

    // 검색
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.nickname?.toLowerCase().includes(query) ||
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      )
    }

    // 관리자를 맨 위로 정렬
    filtered.sort((a, b) => {
      if (a.is_admin && !b.is_admin) return -1
      if (!a.is_admin && b.is_admin) return 1
      return 0
    })

    setFilteredUsers(filtered)
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [users, searchQuery, adminFilter])

  const reloadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch {
      /* ignored */
    }
  }

  const [pendingToggle, setPendingToggle] = useState<{ userId: string; currentStatus: boolean } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ userId: string; userName: string } | null>(null)

  const toggleAdmin = (userId: string, currentStatus: boolean) => {
    setPendingToggle({ userId, currentStatus })
  }

  const confirmToggleAdmin = async () => {
    if (!pendingToggle) return
    const { userId, currentStatus } = pendingToggle
    setPendingToggle(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !currentStatus }),
      })

      if (res.ok) {
        reloadUsers()
      } else {
      }
    } catch {
      /* ignored */
    }
  }

  const deleteUser = (userId: string, userName: string) => {
    setPendingDelete({ userId, userName })
  }

  const confirmDeleteUser = async () => {
    if (!pendingDelete) return
    const { userId } = pendingDelete
    setPendingDelete(null)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        reloadUsers()
      } else {
      }
    } catch {
      /* ignored */
    }
  }

  const toggleSelect = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const toggleSelectAll = (pageUserIds: string[]) => {
    const allSelected = pageUserIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        pageUserIds.forEach((id) => next.delete(id))
      } else {
        pageUserIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const confirmBulkDelete = async () => {
    setPendingBulkDelete(false)
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      try {
        await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      } catch {
        /* ignored */
      }
    }
    setSelectedIds(new Set())
    reloadUsers()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 상단 네비게이션 */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          관리자 페이지
        </Link>
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            회원 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">회원 목록 및 권한 관리</p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">전체 권한</option>
              <option value="admin">관리자만</option>
              <option value="user">일반 회원만</option>
            </select>

            <div className="flex-1 min-w-[200px] max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 이메일, 전화번호 검색..."
                className="w-full px-3 py-2 pr-8 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 회원 목록 */}
        {(() => {
          const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
          const safePage = Math.min(currentPage, totalPages)
          const startIndex = (safePage - 1) * itemsPerPage
          const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

          const renderPagination = () => {
            if (totalPages <= 1) return null

            const pages: (number | string)[] = []
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i)
            } else {
              pages.push(1)
              if (safePage > 3) pages.push('...')
              for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
                pages.push(i)
              }
              if (safePage < totalPages - 2) pages.push('...')
              pages.push(totalPages)
            }

            return (
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => setCurrentPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded text-sm border dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  ‹ 이전
                </button>
                {pages.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`dot-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        p === safePage
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded text-sm border dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  다음 ›
                </button>
              </div>
            )
          }

          return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8 border dark:border-gray-700">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold dark:text-white">
                    회원 목록 ({filteredUsers.length}명
                    {filteredUsers.length !== users.length &&
                      ` / 전체 ${users.length}명`}
                    )
                  </h2>
                  {selectedIds.size > 0 && (
                    <button
                      onClick={() => setPendingBulkDelete(true)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      선택 삭제 ({selectedIds.size}명)
                    </button>
                  )}
                </div>
                {totalPages > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsers.length)}번째
                  </span>
                )}
              </div>

              {/* 상단 페이지네이션 */}
              {renderPagination() && <div className="px-6 pb-4">{renderPagination()}</div>}

              <div className="overflow-x-auto">
                <table className="w-full text-xs lg:text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-2 py-2 lg:py-3 text-center">
                        <input
                          type="checkbox"
                          checked={paginatedUsers.length > 0 && paginatedUsers.filter(u => !u.is_admin).every(u => selectedIds.has(u.id))}
                          onChange={() => toggleSelectAll(paginatedUsers.filter(u => !u.is_admin).map(u => u.id))}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">아이디</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">이메일</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">전화번호</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">회원등급</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">구분</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">가입일</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">권한관리</th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 font-medium text-gray-500 dark:text-gray-300 text-center mobile-vertical">계정관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedIds.has(user.id) ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                        <td className="px-2 py-3 text-center">
                          {user.is_admin ? (
                            <span className="w-4 h-4 inline-block" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(user.id)}
                              onChange={() => toggleSelect(user.id)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-gray-900 dark:text-gray-100 text-center font-medium mobile-vertical">
                          {user.nickname || user.name || '-'}
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-gray-900 dark:text-gray-100">
                          <span className="hidden lg:inline">{user.email}</span>
                          <span className="lg:hidden">
                            <div>{user.email.split('@')[0]}</div>
                            <div className="text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>@{user.email.split('@')[1]}</div>
                          </span>
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-gray-600 dark:text-gray-400 text-center">
                          {user.phone ? (() => {
                            const parts = user.phone.replace(/[^0-9]/g, '')
                            if (parts.length === 11) {
                              return (
                                <>
                                  <span className="hidden lg:inline">{parts.slice(0, 3)}-{parts.slice(3, 7)}-{parts.slice(7)}</span>
                                  <span className="lg:hidden">
                                    <div>{parts.slice(0, 3)}</div>
                                    <div>-{parts.slice(3, 7)}</div>
                                    <div>-{parts.slice(7)}</div>
                                  </span>
                                </>
                              )
                            }
                            return user.phone
                          })() : '-'}
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          <select
                            value={user.tier}
                            onChange={async (e) => {
                              const newTier = e.target.value
                              try {
                                const res = await fetch(`/api/admin/users/${user.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ tier: newTier }),
                                })
                                if (res.ok) {
                                  setUsers(prev => prev.map(u => u.id === user.id ? { ...u, tier: newTier } : u))
                                }
                              } catch {}
                            }}
                            className="text-xs px-1 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white cursor-pointer"
                          >
                            <option value="FREE">무료</option>
                            <option value="BRONZE">브론즈</option>
                            <option value="SILVER">실버</option>
                            <option value="GOLD">골드</option>
                            <option value="PREMIUM">프리미엄</option>
                            <option value="ADMIN">운영자</option>
                          </select>
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          {user.is_admin ? (
                            <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-1.5 lg:px-2 py-1 rounded font-medium leading-tight mobile-vertical">
                              관리자
                            </span>
                          ) : (
                            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1.5 lg:px-2 py-1 rounded font-medium leading-tight mobile-vertical">
                              일반
                            </span>
                          )}
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-gray-600 dark:text-gray-400 text-center whitespace-nowrap">
                          {(() => {
                            const d = new Date(user.created_at)
                            return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`
                          })()}
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          <button
                            onClick={() => toggleAdmin(user.id, user.is_admin)}
                            className={`px-1 lg:px-3 py-1.5 rounded font-medium leading-tight mobile-vertical ${
                              user.is_admin
                                ? 'bg-yellow-600 dark:bg-yellow-500 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600'
                                : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                            }`}
                          >
                            {user.is_admin ? '권한해제' : '관리자부여'}
                          </button>
                        </td>
                        <td className="px-2 lg:px-4 py-3 text-center">
                          <button
                            onClick={() => deleteUser(user.id, user.name)}
                            className="px-1 lg:px-3 py-1.5 bg-red-600 dark:bg-red-500 text-white rounded font-medium hover:bg-red-700 dark:hover:bg-red-600 leading-tight mobile-vertical"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 하단 페이지네이션 */}
              {renderPagination() && <div className="px-6 py-4">{renderPagination()}</div>}
            </div>
          )
        })()}

        <ConfirmDialog
          open={!!pendingToggle}
          title="권한 변경"
          message={`${pendingToggle?.currentStatus ? '관리자 권한을 해제' : '관리자 권한을 부여'}하시겠습니까?`}
          confirmText="변경"
          confirmColor="blue"
          onConfirm={confirmToggleAdmin}
          onCancel={() => setPendingToggle(null)}
        />

        <ConfirmDialog
          open={!!pendingDelete}
          title="회원 삭제"
          message={`정말로 "${pendingDelete?.userName}" 회원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 회원의 모든 데이터가 삭제됩니다.`}
          confirmText="삭제"
          confirmColor="red"
          onConfirm={confirmDeleteUser}
          onCancel={() => setPendingDelete(null)}
        />

        <ConfirmDialog
          open={pendingBulkDelete}
          title="선택 회원 일괄 삭제"
          message={`선택한 ${selectedIds.size}명의 회원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 회원들의 모든 데이터가 삭제됩니다.`}
          confirmText="일괄 삭제"
          confirmColor="red"
          onConfirm={confirmBulkDelete}
          onCancel={() => setPendingBulkDelete(false)}
        />
      </div>
    </div>
  )
}

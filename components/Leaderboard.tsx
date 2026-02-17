'use client'

import { useEffect, useState } from 'react'

interface LeaderboardProps {
  examId: number
  examName: string
}

export default function Leaderboard({ examId, examName }: LeaderboardProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [examId])

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`/api/home/leaderboard?exam_id=${examId}`)
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 dark:text-white">{examName} 랭킹</h3>
        <div className="text-center text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null

    if (status === 'NEW') {
      return <span className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">NEW</span>
    } else if (status === '▲') {
      return <span className="text-green-600 font-bold">▲</span>
    } else if (status === '▼') {
      return <span className="text-red-600 font-bold">▼</span>
    } else if (status === '=') {
      return <span className="text-gray-400">-</span>
    }
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
      <h3 className="font-bold text-lg mb-4 dark:text-white">{examName} 랭킹</h3>

      {/* 내 순위 */}
      {data.my_rank && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-900 dark:text-blue-200 font-medium">내 순위</span>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{data.my_rank}위</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">{data.my_score}점</div>
            </div>
          </div>
        </div>
      )}

      {/* 오늘 Top5 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">오늘 Top 5</h4>
        {data.today_top5.length > 0 ? (
          <div className="space-y-2">
            {data.today_top5.map((user: any) => (
              <div
                key={user.rank}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                      user.rank === 1
                        ? 'bg-yellow-400 text-yellow-900'
                        : user.rank === 2
                        ? 'bg-gray-300 dark:bg-gray-400 text-gray-700 dark:text-gray-900'
                        : user.rank === 3
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {user.rank}
                  </div>
                  <div>
                    <div className="font-medium text-sm dark:text-gray-200">
                      {user.name} ({user.affiliation})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(user.status)}
                  <div className="text-right">
                    <div className="font-bold text-blue-600 dark:text-blue-400">{user.score}점</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">아직 기록이 없습니다</div>
        )}
      </div>

      {/* 어제 Top5 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">어제 Top 5</h4>
        {data.yesterday_top5.length > 0 ? (
          <div className="space-y-2">
            {data.yesterday_top5.map((user: any) => (
              <div
                key={user.rank}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-bold text-sm">
                    {user.rank}
                  </div>
                  <div>
                    <div className="font-medium text-sm dark:text-gray-300">{user.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-600 dark:text-gray-400">{user.score}점</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">기록이 없습니다</div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

const CARD_LABELS: Record<string, string> = {
  basic: '진단평가',
  technician: '기능사',
  industrial: '산업기사',
  engineer: '기사',
  master: '기능장',
  public: '공기업',
  ncs: '과정평가형',
  etc: '공식시험',
}

const CARD_ORDER = ['basic', 'technician', 'industrial', 'engineer', 'master', 'public', 'ncs', 'etc']

export default function LandingCardSettings() {
  const [cards, setCards] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/landing-config')
      const data = await res.json()
      if (res.ok) {
        setCards(data.cards)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const toggleCard = async (cardId: string) => {
    const newVisible = !cards[cardId]
    setSaving(cardId)
    setResult(null)

    // 낙관적 업데이트
    setCards((prev) => ({ ...prev, [cardId]: newVisible }))

    try {
      const res = await fetch('/api/admin/landing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, visible: newVisible }),
      })
      if (!res.ok) {
        // 롤백
        setCards((prev) => ({ ...prev, [cardId]: !newVisible }))
        setResult({ type: 'error', message: '저장 실패' })
      } else {
        setResult({ type: 'success', message: `${CARD_LABELS[cardId]} ${newVisible ? '표시' : '숨김'} 완료` })
      }
    } catch {
      setCards((prev) => ({ ...prev, [cardId]: !newVisible }))
      setResult({ type: 'error', message: '네트워크 오류' })
    } finally {
      setSaving(null)
      setTimeout(() => setResult(null), 2000)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">🏠 랜딩 페이지 카드 관리</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-2 dark:text-white">🏠 랜딩 페이지 카드 관리</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        랜딩 페이지에 표시할 등급 카드를 선택합니다.
      </p>

      {result && (
        <div className={`text-sm mb-3 px-3 py-2 rounded ${
          result.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {result.message}
        </div>
      )}

      <div className="space-y-2">
        {CARD_ORDER.map((cardId) => (
          <div
            key={cardId}
            className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
          >
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {CARD_LABELS[cardId]}
            </span>
            <button
              onClick={() => toggleCard(cardId)}
              disabled={saving === cardId}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                cards[cardId]
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${saving === cardId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={cards[cardId]}
              aria-label={`${CARD_LABELS[cardId]} ${cards[cardId] ? '표시중' : '숨김'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  cards[cardId] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

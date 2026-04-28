"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { hasTierAccess, TIER_LABELS } from "@/lib/tier"

const roundColors = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
]

const TIER_BADGE: Record<string, string> = {
  FREE: "bg-emerald-400/90 text-white",
  BRONZE: "bg-amber-700/90 text-white",
  SILVER: "bg-slate-300/90 text-slate-800",
  GOLD: "bg-yellow-400/95 text-yellow-900",
  PREMIUM: "bg-violet-500/90 text-white",
  ADMIN: "bg-rose-500/90 text-white",
}

const TIER_TEXT: Record<string, string> = {
  FREE: "text-emerald-600",
  BRONZE: "text-amber-700",
  SILVER: "text-slate-500",
  GOLD: "text-yellow-600",
  PREMIUM: "text-violet-600",
  ADMIN: "text-rose-600",
}

export type ExamItem = {
  id: number
  name: string
  year: number | null
  round: number | null
  duration_minutes: number
  min_tier: string
  total_questions: number
  questions_per_attempt: number
}

export default function ExamCard({
  exam,
  categoryName,
  colorIndex,
}: {
  exam: ExamItem
  categoryName: string
  colorIndex: number
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const [locked, setLocked] = useState(false)

  const hasQuestions = exam.total_questions > 0
  const color = roundColors[colorIndex % roundColors.length]
  const userTier = (session?.user as { tier?: string } | undefined)?.tier ?? "FREE"
  const userIsAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false
  const canAccess = userIsAdmin || hasTierAccess(userTier, exam.min_tier)

  const handleClick = (e: React.MouseEvent) => {
    if (!hasQuestions) return
    if (!session?.user) {
      e.preventDefault()
      router.push(`/login?redirect=/exam/${exam.id}`)
      return
    }
    if (!canAccess) {
      e.preventDefault()
      setLocked(true)
      return
    }
  }

  const cardContent = (
    <div
      className={`relative overflow-hidden rounded-xl p-4 sm:p-5 h-full transition-all ${
        hasQuestions
          ? `bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer`
          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
      }`}
    >
      {hasQuestions && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
      )}

      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            hasQuestions
              ? "bg-white/20 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
          }`}
        >
          {exam.round ? `${exam.round}회차` : "연습"}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            hasQuestions ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          {exam.duration_minutes}분
        </span>
      </div>

      <h3 className="font-bold text-sm sm:text-base mb-1">
        {exam.year ? `${categoryName} ${exam.year}년 ${exam.round}회` : exam.name}
      </h3>

      <p
        className={`text-xs mb-3 ${
          hasQuestions ? "text-white/70" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {hasQuestions ? `${exam.questions_per_attempt}문항 출제` : "준비 중"}
      </p>

      {hasQuestions ? (
        <div className="flex items-center text-xs font-medium text-white/90">
          시험 응시하기
          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ) : (
        <div className="text-xs">문제 등록 대기</div>
      )}

      {hasQuestions && (
        <span
          className={`absolute bottom-3 right-3 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm ${
            TIER_BADGE[exam.min_tier] ?? TIER_BADGE.FREE
          }`}
        >
          {TIER_LABELS[exam.min_tier] ?? exam.min_tier}
        </span>
      )}
    </div>
  )

  return (
    <>
      {!hasQuestions ? (
        cardContent
      ) : (
        <Link href={`/exam/${exam.id}`} onClick={handleClick} className="block">
          {cardContent}
        </Link>
      )}

      {locked && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={() => setLocked(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xl">
                🔒
              </div>
              <h3 className="text-lg font-bold dark:text-white">등급을 올려주세요</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              이 시험은{" "}
              <span className={`font-bold ${TIER_TEXT[exam.min_tier] ?? ""}`}>
                {TIER_LABELS[exam.min_tier] ?? exam.min_tier}
              </span>{" "}
              등급 이상만 응시할 수 있습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              현재 등급: <span className="font-medium">{TIER_LABELS[userTier] ?? userTier}</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setLocked(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                닫기
              </button>
              <Link
                href="/my"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 text-sm font-bold"
              >
                등급 업그레이드
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

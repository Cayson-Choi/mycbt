"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import VideoPlayerModal from "./VideoPlayerModal"
import { hasTierAccess, TIER_LABELS, TIER_TEXT_COLOR as TIER_COLOR } from "@/lib/tier"

export type VideoListItem = {
  id: number
  title: string
  videoUrl: string
  thumbnailUrl: string | null
  categoryName: string | null
  durationText: string | null
  ratingText: string | null
  price: number | null
  minTier: string
}

export default function VideosListClient({ videos }: { videos: VideoListItem[] }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [playing, setPlaying] = useState<VideoListItem | null>(null)
  const [locked, setLocked] = useState<VideoListItem | null>(null)
  const [filter, setFilter] = useState<"all" | "free" | "paid">("all")

  const userTier = (session?.user as { tier?: string } | undefined)?.tier ?? "FREE"
  const userIsAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false

  const filtered = videos.filter((v) => {
    if (filter === "free") return !v.price || v.price === 0
    if (filter === "paid") return v.price && v.price > 0
    return true
  })

  const handlePlay = (v: VideoListItem) => {
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!userIsAdmin && !hasTierAccess(userTier, v.minTier)) {
      setLocked(v)
      return
    }
    setPlaying(v)
  }

  return (
    <div>
      {/* 필터 탭 */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        {[
          { key: "all", label: "전체" },
          { key: "free", label: "무료" },
          { key: "paid", label: "유료" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              filter === tab.key
                ? "bg-[#1B2A4A] dark:bg-amber-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          {filtered.length}개 표시
        </span>
      </div>

      {/* 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filtered.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => handlePlay(v)}
            className="text-left w-full group rounded-xl border border-[#C9A84C]/15 dark:border-gray-700 overflow-hidden h-full min-h-[260px] sm:min-h-[280px] bg-white dark:bg-gray-900 hover:shadow-xl hover:shadow-[#C9A84C]/20 transition-all hover:-translate-y-1 flex flex-col"
          >
            <div className="flex-[2] min-h-0 bg-[#F5F0E6] dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnailUrl}
                  alt={v.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <svg
                  className="w-10 h-10 text-[#C9A84C]/40 dark:text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
                <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="#1B2A4A" className="w-6 h-6 ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </div>
            <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[#1B2A4A] dark:text-white leading-snug line-clamp-2 mb-1.5">
                  {v.title}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-[#1B2A4A]/80 dark:text-gray-300 mb-1.5">
                  {v.price && v.price > 0 ? `${v.price.toLocaleString()}원` : "무료"}
                </p>
                {(v.ratingText || v.durationText) && (
                  <div className="flex items-center gap-1.5 text-xs text-[#1B2A4A]/70 dark:text-gray-400">
                    {v.ratingText && (
                      <>
                        <span className="text-[#C9A84C]">★</span>
                        <span>{v.ratingText}</span>
                      </>
                    )}
                    {v.ratingText && v.durationText && <span className="text-[#C9A84C]/30">|</span>}
                    {v.durationText && <span>{v.durationText}</span>}
                  </div>
                )}
              </div>
              <p
                className={`text-sm sm:text-base font-extrabold mt-2 text-right tracking-wide ${
                  TIER_COLOR[v.minTier] ?? "text-gray-500"
                }`}
              >
                {TIER_LABELS[v.minTier] ?? v.minTier}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* 빈 필터 결과 */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-sm">
          해당 필터에 맞는 강의가 없습니다.
        </div>
      )}

      <VideoPlayerModal
        open={!!playing}
        onClose={() => setPlaying(null)}
        video={playing}
      />

      {locked && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
          onClick={() => setLocked(null)}
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
              이 강의는{" "}
              <span className={`font-bold ${TIER_COLOR[locked.minTier] ?? ""}`}>
                {TIER_LABELS[locked.minTier] ?? locked.minTier}
              </span>{" "}
              등급 이상만 시청할 수 있습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              현재 등급: <span className="font-medium">{TIER_LABELS[userTier] ?? userTier}</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setLocked(null)}
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
    </div>
  )
}

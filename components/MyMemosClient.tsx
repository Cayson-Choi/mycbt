'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import VideoPlayerModal, { type PlayerVideo } from '@/components/VideoPlayerModal'

type MemoItem = {
  videoId: number
  content: string
  updatedAt: string
  video: {
    id: number
    title: string
    thumbnailUrl: string | null
    categoryName: string | null
    videoUrl: string
    ratingText: string | null
    durationText: string | null
  }
}

function formatRelativeTime(iso: string): string {
  const updated = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - updated.getTime()
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return '방금 전'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}일 전`
  if (day < 30) return `${Math.floor(day / 7)}주 전`
  return updated.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function MyMemosClient({ initialMemos }: { initialMemos: MemoItem[] }) {
  const [memos] = useState<MemoItem[]>(initialMemos)
  const [activeVideo, setActiveVideo] = useState<PlayerVideo | null>(null)
  const [open, setOpen] = useState(false)

  const total = memos.length

  const handleOpen = (m: MemoItem) => {
    setActiveVideo({
      id: m.video.id,
      title: m.video.title,
      videoUrl: m.video.videoUrl,
      ratingText: m.video.ratingText,
      durationText: m.video.durationText,
      categoryName: m.video.categoryName,
    })
    setOpen(true)
  }

  const sortedMemos = useMemo(
    () =>
      [...memos].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [memos]
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📝</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                내 학습 메모
              </h1>
              <span className="ml-2 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                총 {total}개
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              강의를 들으며 작성한 메모를 한곳에서 모아보고 이어서 학습하세요.
            </p>
          </div>
          <Link
            href="/my"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            ← 마이페이지로
          </Link>
        </div>

        {/* 빈 상태 */}
        {total === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-10 sm:p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              아직 작성한 메모가 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              강의를 시청하면서 핵심 내용을 메모하면 자동으로 여기에 모입니다.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition"
            >
              강의 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {sortedMemos.map((m) => (
              <article
                key={m.videoId}
                className="group bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {/* 썸네일 */}
                <button
                  onClick={() => handleOpen(m)}
                  className="relative w-full aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden group/thumb"
                  aria-label={`${m.video.title} 강의 열기`}
                >
                  {m.video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.video.thumbnailUrl}
                      alt={m.video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                      썸네일 없음
                    </div>
                  )}
                  {/* 재생 오버레이 */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-gray-900 ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* 메타 뱃지 */}
                  {m.video.durationText && (
                    <span className="absolute bottom-2 right-2 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-black/70 text-white">
                      {m.video.durationText}
                    </span>
                  )}
                </button>

                {/* 본문 */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[11px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase truncate">
                      {m.video.categoryName ?? 'CAYSON 강의'}
                    </p>
                    <button
                      onClick={() => handleOpen(m)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                    >
                      전체 보기/편집
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2">
                    {m.video.title}
                  </h3>

                  {/* 메모 미리보기 */}
                  <div
                    onClick={() => handleOpen(m)}
                    className="cursor-pointer flex-1 rounded-lg bg-amber-50/70 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 mb-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                    role="button"
                  >
                    {m.content.trim() ? (
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-wrap line-clamp-5">
                        {m.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        (빈 메모)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-auto">
                    <span>수정: {formatRelativeTime(m.updatedAt)}</span>
                    {m.video.ratingText && (
                      <span className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        {m.video.ratingText}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <VideoPlayerModal open={open} onClose={() => setOpen(false)} video={activeVideo} />
    </div>
  )
}

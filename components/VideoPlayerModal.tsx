"use client"

import { useEffect, useRef, useState } from "react"

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

function buildEmbedSrc(videoUrl: string): string {
  const ytId = extractYouTubeId(videoUrl)
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
  return videoUrl
}

export type PlayerVideo = {
  id: number
  title: string
  videoUrl: string
  ratingText?: string | null
  durationText?: string | null
  categoryName?: string | null
  price?: number | null
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function VideoPlayerModal({
  open,
  onClose,
  video,
}: {
  open: boolean
  onClose: () => void
  video: PlayerVideo | null
}) {
  const [memo, setMemo] = useState("")
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [authError, setAuthError] = useState(false)
  const [loading, setLoading] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // memo 변경이 사용자 입력에 의한 것인지 (서버에서 로드한 것인지) 구분
  const skipNextSaveRef = useRef(false)
  const currentVideoIdRef = useRef<number | null>(null)

  // 모달 열릴 때 서버에서 메모 로드
  useEffect(() => {
    if (!open || !video) {
      currentVideoIdRef.current = null
      return
    }
    let cancelled = false
    currentVideoIdRef.current = video.id
    setSaveState('idle')
    setSavedAt(null)
    setAuthError(false)
    setLoading(true)
    skipNextSaveRef.current = true
    setMemo("") // 새 비디오 열릴 때 즉시 비우기

    fetch(`/api/my/video-memos/${video.id}`, { credentials: 'include' })
      .then(async (res) => {
        if (cancelled || currentVideoIdRef.current !== video.id) return
        if (res.status === 401) {
          setAuthError(true)
          setMemo("")
          return
        }
        if (!res.ok) {
          // 메모가 없거나 오류 시 빈 값 처리
          setMemo("")
          return
        }
        const data = await res.json().catch(() => ({}))
        skipNextSaveRef.current = true
        setMemo(typeof data?.content === 'string' ? data.content : "")
      })
      .catch(() => {
        if (cancelled) return
        skipNextSaveRef.current = true
        setMemo("")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, video])

  // 메모 입력 → debounce 800ms → PUT
  useEffect(() => {
    if (!open || !video) return
    if (authError) return
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveState('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/my/video-memos/${video.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content: memo }),
        })
        if (!res.ok) {
          if (res.status === 401) setAuthError(true)
          setSaveState('error')
          return
        }
        const data = await res.json().catch(() => ({}))
        const updatedAt = data?.updatedAt ? new Date(data.updatedAt) : new Date()
        setSavedAt(
          updatedAt.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        )
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 800)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [memo, open, video, authError])

  // ESC 닫기 + body scroll lock
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open || !video) return null

  const handleClearMemo = async () => {
    if (!video) return
    if (!confirm("메모를 모두 지울까요?")) return
    try {
      await fetch(`/api/my/video-memos/${video.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch {}
    skipNextSaveRef.current = true
    setMemo("")
    setSavedAt(null)
    setSaveState('idle')
  }

  const renderSaveStatus = () => {
    if (authError) return null
    if (saveState === 'saving') {
      return <span className="text-[10px] text-amber-300/80">저장 중...</span>
    }
    if (saveState === 'saved' && savedAt) {
      return <span className="text-[10px] text-emerald-400/80">저장됨 · {savedAt}</span>
    }
    if (saveState === 'error') {
      return <span className="text-[10px] text-rose-400">저장 오류</span>
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0b0d12] text-gray-100 flex flex-col animate-fadeIn">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-3 border-b border-white/5 bg-[#0b0d12]/95 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-[10px] font-black text-[#1B2A4A]">
            CS
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-amber-400/80 tracking-[0.2em] uppercase">
              {video.categoryName ?? "CAYSON Lecture"}
            </p>
            <h2 className="text-sm sm:text-base font-bold truncate max-w-[60vw]">
              {video.title}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="w-9 h-9 rounded-full hover:bg-white/10 transition flex items-center justify-center text-xl"
        >
          ✕
        </button>
      </header>

      {/* 본문 — 좌: 비디오 / 우: 메모 사이드바 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* 비디오 영역 */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black">
          <div className="w-full max-w-[1400px] aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <iframe
              src={buildEmbedSrc(video.videoUrl)}
              title={video.title}
              className="w-full h-full"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* 메모 사이드바 */}
        <aside className="lg:w-[380px] lg:min-w-[320px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#11141b] flex flex-col">
          {/* 강의 정보 */}
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-base font-bold mb-1 line-clamp-2">{video.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {video.ratingText && (
                <>
                  <span className="text-amber-400">★</span>
                  <span>{video.ratingText}</span>
                </>
              )}
              {video.ratingText && video.durationText && <span className="text-gray-600">|</span>}
              {video.durationText && <span>{video.durationText}</span>}
              {(video.ratingText || video.durationText) && video.price != null && (
                <span className="text-gray-600">|</span>
              )}
              {video.price != null && (
                <span className="font-semibold text-amber-300">
                  {video.price > 0 ? `${video.price.toLocaleString()}원` : "무료"}
                </span>
              )}
            </div>
          </div>

          {/* 메모 영역 */}
          <div className="flex-1 min-h-0 flex flex-col p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h4 className="text-sm font-bold tracking-wide">학습 메모</h4>
              </div>
              {renderSaveStatus()}
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              disabled={authError || loading}
              placeholder={
                authError
                  ? "로그인 후 메모 저장 가능"
                  : loading
                  ? "메모를 불러오는 중..."
                  : "강의를 들으며 핵심 내용을 메모해보세요. 자동 저장됩니다."
              }
              className="flex-1 min-h-[200px] resize-none w-full rounded-lg bg-[#0b0d12] border border-white/10 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 outline-none p-3 text-sm leading-relaxed text-gray-100 placeholder-gray-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-500 mt-2">
              {authError
                ? "로그인 후 메모 저장 가능합니다."
                : "메모는 자동으로 서버에 저장되어 어디서나 이어볼 수 있습니다."}
            </p>
          </div>

          {/* 하단 액션 */}
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
            <span>ESC 키로 닫기</span>
            <button
              onClick={handleClearMemo}
              disabled={authError}
              className="text-rose-400/80 hover:text-rose-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              메모 지우기
            </button>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  )
}

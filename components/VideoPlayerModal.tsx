"use client"

import { useEffect } from "react"

function extractYouTubeId(url: string): string | null {
  // youtu.be/{id}, youtube.com/watch?v={id}, /embed/{id}, /shorts/{id}
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
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`
  return videoUrl
}

export default function VideoPlayerModal({
  open,
  onClose,
  videoUrl,
  title,
}: {
  open: boolean
  onClose: () => void
  videoUrl: string
  title?: string
}) {
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

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white text-sm sm:text-base font-medium truncate pr-8">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={buildEmbedSrc(videoUrl)}
            title={title ?? "동영상"}
            className="w-full h-full"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

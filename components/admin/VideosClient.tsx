"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Video = {
  id: number
  title: string
  videoUrl: string
  thumbnailUrl: string | null
  categoryId: number | null
  categoryName: string | null
  durationText: string | null
  ratingText: string | null
  price: number | null
  sortOrder: number
  isActive: boolean
}

type Category = { id: number; name: string; grade: string }

type FormState = {
  id?: number
  title: string
  videoUrl: string
  thumbnailUrl: string
  categoryId: string
  durationText: string
  ratingText: string
  price: string
  sortOrder: string
  isActive: boolean
}

const EMPTY_FORM: FormState = {
  title: "",
  videoUrl: "",
  thumbnailUrl: "",
  categoryId: "",
  durationText: "",
  ratingText: "",
  price: "",
  sortOrder: "0",
  isActive: true,
}

export default function VideosClient({
  initialVideos,
  categories,
}: {
  initialVideos: Video[]
  categories: Category[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [thumbTab, setThumbTab] = useState<"url" | "upload">("url")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; title: string } | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const reload = () => startTransition(() => router.refresh())

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setThumbTab("url")
    setShowForm(true)
  }

  const openEdit = (v: Video) => {
    setForm({
      id: v.id,
      title: v.title,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl ?? "",
      categoryId: v.categoryId ? String(v.categoryId) : "",
      durationText: v.durationText ?? "",
      ratingText: v.ratingText ?? "",
      price: v.price != null ? String(v.price) : "",
      sortOrder: String(v.sortOrder),
      isActive: v.isActive,
    })
    setThumbTab("url")
    setShowForm(true)
  }

  const handleUploadThumbnail = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload/image", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert("업로드 실패: " + (err?.error ?? res.status))
        return
      }
      const data = await res.json()
      setForm((p) => ({ ...p, thumbnailUrl: data.url }))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.videoUrl.trim()) {
      alert("제목과 영상 URL은 필수입니다.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        videoUrl: form.videoUrl.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
        durationText: form.durationText.trim() || null,
        ratingText: form.ratingText.trim() || null,
        price: form.price ? parseInt(form.price, 10) : null,
        sortOrder: form.sortOrder ? parseInt(form.sortOrder, 10) : 0,
        isActive: form.isActive,
      }
      const url = form.id ? `/api/admin/videos/${form.id}` : "/api/admin/videos"
      const method = form.id ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert("저장 실패: " + (err?.error ?? res.status))
        return
      }
      const saved = await res.json()
      const cat = categories.find((c) => c.id === saved.categoryId)
      const merged: Video = {
        id: saved.id,
        title: saved.title,
        videoUrl: saved.videoUrl,
        thumbnailUrl: saved.thumbnailUrl,
        categoryId: saved.categoryId,
        categoryName: cat?.name ?? null,
        durationText: saved.durationText,
        ratingText: saved.ratingText,
        price: saved.price,
        sortOrder: saved.sortOrder,
        isActive: saved.isActive,
      }
      setVideos((prev) => {
        if (form.id) return prev.map((v) => (v.id === form.id ? merged : v))
        return [merged, ...prev]
      })
      setShowForm(false)
      setForm(EMPTY_FORM)
      reload()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (v: Video) => {
    setTogglingId(v.id)
    try {
      const res = await fetch(`/api/admin/videos/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      })
      if (!res.ok) {
        alert("토글 실패")
        return
      }
      setVideos((prev) => prev.map((x) => (x.id === v.id ? { ...x, isActive: !x.isActive } : x)))
      reload()
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    const id = confirmDelete.id
    setConfirmDelete(null)
    const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" })
    if (!res.ok) {
      alert("삭제 실패")
      return
    }
    setVideos((prev) => prev.filter((v) => v.id !== id))
    reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:underline">← 관리자 홈</Link>
            <h1 className="text-2xl font-bold dark:text-white mt-1">동영상 관리</h1>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + 동영상 추가
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white mb-4">
              {form.id ? "동영상 수정" : "새 동영상"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">제목 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">영상 URL * (YouTube 등)</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">썸네일</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setThumbTab("url")}
                    className={`px-3 py-1 text-xs rounded ${thumbTab === "url" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-600 dark:text-gray-200"}`}
                  >
                    URL 입력
                  </button>
                  <button
                    type="button"
                    onClick={() => setThumbTab("upload")}
                    className={`px-3 py-1 text-xs rounded ${thumbTab === "upload" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-600 dark:text-gray-200"}`}
                  >
                    파일 업로드
                  </button>
                </div>
                {thumbTab === "url" ? (
                  <input
                    type="url"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                    placeholder="https://img.youtube.com/vi/{ID}/maxresdefault.jpg"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleUploadThumbnail(f)
                      }}
                      disabled={uploading}
                      className="text-sm dark:text-gray-200"
                    />
                    {uploading && <span className="text-xs text-gray-500">업로드 중...</span>}
                  </div>
                )}
                {form.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.thumbnailUrl}
                    alt="썸네일 미리보기"
                    className="mt-2 max-h-32 rounded border dark:border-gray-600"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">카테고리</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-- 미지정 --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">정렬 순서</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">별점 텍스트 (예: 4.8(52))</label>
                <input
                  type="text"
                  value={form.ratingText}
                  onChange={(e) => setForm((p) => ({ ...p, ratingText: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">강의 시간 (예: 32시간)</label>
                <input
                  type="text"
                  value={form.durationText}
                  onChange={(e) => setForm((p) => ({ ...p, durationText: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">가격 (원, 비우면 &quot;무료&quot;)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm dark:text-gray-200">활성 (랜딩에 표시)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 text-sm"
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.length === 0 && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              등록된 동영상이 없습니다.
            </div>
          )}
          {videos.map((v) => (
            <div
              key={v.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden ${!v.isActive ? "opacity-60" : ""}`}
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                {v.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">썸네일 없음</div>
                )}
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded ${v.isActive ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}
                >
                  {v.isActive ? "활성" : "비활성"}
                </span>
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {v.categoryName ?? "카테고리 미지정"} · 정렬 {v.sortOrder}
                </div>
                <h3 className="font-semibold dark:text-white text-sm mb-2 line-clamp-2">{v.title}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
                  {v.videoUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(v)}
                    disabled={togglingId === v.id}
                    className={`flex-1 px-2 py-1 text-xs rounded ${v.isActive ? "bg-gray-200 dark:bg-gray-700 dark:text-gray-200" : "bg-emerald-100 text-emerald-700"} disabled:opacity-50`}
                  >
                    {togglingId === v.id ? "..." : v.isActive ? "숨기기" : "표시"}
                  </button>
                  <button
                    onClick={() => openEdit(v)}
                    className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ id: v.id, title: v.title })}
                    className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold dark:text-white mb-2">동영상 삭제</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                <strong>{confirmDelete.title}</strong> 을(를) 삭제하시겠습니까?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

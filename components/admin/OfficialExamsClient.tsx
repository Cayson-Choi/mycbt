'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ExamData = {
  id: number
  name: string
  exam_mode: string
  password: string
  duration_minutes: number
  created_at: string
  is_published: boolean
  question_count: number
  attempt_count: number
}

export default function OfficialExamsClient({
  initialExams,
}: {
  initialExams: ExamData[]
}) {
  const router = useRouter()
  const [exams, setExams] = useState<ExamData[]>(initialExams)
  useEffect(() => { setExams(initialExams) }, [initialExams])
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    type: 'delete' | 'toggle'
    examId: number
    examName: string
    currentPublished?: boolean
  } | null>(null)

  // 생성 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    duration_minutes: 60,
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')

    try {
      const res = await fetch('/api/admin/official-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '생성 실패')
        setCreating(false)
        return
      }

      // 생성 후 바로 상세 페이지(문제 출제)로 이동
      router.push(`/admin/official-exams/${data.exam_id}`)
    } catch {
      setError('오류가 발생했습니다')
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = (e: React.MouseEvent, examId: number, examName: string, currentPublished: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmModal({ type: 'toggle', examId, examName, currentPublished })
  }

  const handleToggleConfirm = async () => {
    if (!confirmModal || confirmModal.type !== 'toggle') return
    const { examId, currentPublished } = confirmModal
    setConfirmModal(null)

    setTogglingId(examId)
    try {
      const res = await fetch('/api/admin/official-exams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId, is_published: !currentPublished }),
      })

      if (res.ok) {
        setExams((prev) =>
          prev.map((ex) => (ex.id === examId ? { ...ex, is_published: !currentPublished } : ex))
        )
      }
    } catch {
      /* ignored */
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = (e: React.MouseEvent, examId: number, examName: string) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmModal({ type: 'delete', examId, examName })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmModal || confirmModal.type !== 'delete') return
    const { examId } = confirmModal
    setConfirmModal(null)

    setDeletingId(examId)
    try {
      const res = await fetch('/api/admin/official-exams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId }),
      })

      if (res.ok) {
        setExams((prev) => prev.filter((ex) => ex.id !== examId))
      }
    } catch {
      /* ignored */
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              공식 시험 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              중간고사/기말고사 등 공식 시험을 생성하고 관리합니다
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 text-sm"
            >
              관리자 홈
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              {showForm ? '취소' : '새 시험 생성'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 생성 폼 */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 dark:text-white">새 공식 시험 생성</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  시험 이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 2026년 공유압실습(중간고사)"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                    비밀번호 *
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="시험 접근 비밀번호"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                    시험 시간(분) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })
                    }
                    min={1}
                    max={300}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                시험 생성 후 바로 문제 출제 화면으로 이동합니다.
              </p>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? '생성 중...' : '시험 생성'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 시험 목록 */}
        <div className="space-y-4">
          {exams.length === 0 && !showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center border dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                아직 생성된 공식 시험이 없습니다
              </p>
            </div>
          )}

          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/admin/official-exams/${exam.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold dark:text-white">{exam.name}</h3>
                    <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-semibold">
                      공식
                    </span>
                    {exam.is_published ? (
                      <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
                        게시 중
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                        비게시
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <span>시간: {exam.duration_minutes}분</span>
                    <span>문제: {exam.question_count}개</span>
                    <span>응시: {exam.attempt_count}명</span>
                    <span>비밀번호: <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{exam.password}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleTogglePublish(e, exam.id, exam.name, exam.is_published)}
                    disabled={togglingId === exam.id}
                    className={`px-3 py-1.5 text-xs rounded font-medium disabled:opacity-50 ${
                      exam.is_published
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50'
                    }`}
                  >
                    {togglingId === exam.id ? '처리 중...' : exam.is_published ? '게시 종료' : '게시'}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, exam.id, exam.name)}
                    disabled={deletingId === exam.id}
                    className="px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 font-medium disabled:opacity-50"
                  >
                    {deletingId === exam.id ? '삭제 중...' : '삭제'}
                  </button>
                  <svg
                    className="w-5 h-5 text-gray-400 hidden sm:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 확인 모달 */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 border dark:border-gray-700">
            <h3 className="text-lg font-bold mb-3 dark:text-white">
              {confirmModal.type === 'delete' ? '시험 삭제' : confirmModal.currentPublished ? '게시 종료' : '시험 게시'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {confirmModal.type === 'delete'
                ? `"${confirmModal.examName}" 시험을 삭제하시겠습니까? 등록된 문제도 함께 삭제됩니다.`
                : `"${confirmModal.examName}" 시험을 ${confirmModal.currentPublished ? '게시 종료' : '게시'}하시겠습니까?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                취소
              </button>
              <button
                onClick={confirmModal.type === 'delete' ? handleDeleteConfirm : handleToggleConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmModal.type === 'delete' ? '삭제' : confirmModal.currentPublished ? '게시 종료' : '게시'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

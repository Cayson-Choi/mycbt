"use client"

import { useState } from "react"
import Link from "next/link"
import ConfirmDialog from "@/components/ConfirmDialog"

interface ExamItem {
  id: number
  category_id: number
  category_name: string
  name: string
  year: number | null
  round: number | null
  exam_mode: string
  exam_type: string
  duration_minutes: number
  is_published: boolean
  subjects: { id: number; name: string; questions_per_attempt: number }[]
  question_count: number
  attempt_count: number
}

interface Category {
  id: number
  name: string
}

export default function ExamsClient({
  initialExams,
  initialCategories,
}: {
  initialExams: ExamItem[]
  initialCategories: Category[]
}) {
  const [exams, setExams] = useState<ExamItem[]>(initialExams)
  const [categories] = useState<Category[]>(initialCategories)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // 생성 폼
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCategoryId, setNewCategoryId] = useState<number>(
    initialCategories.length > 0 ? initialCategories[0].id : 0
  )
  const [newYear, setNewYear] = useState<number>(2026)
  const [newRound, setNewRound] = useState<number>(1)
  const [newExamType, setNewExamType] = useState<string>("WRITTEN")
  const [newDuration, setNewDuration] = useState<number>(60)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 삭제
  const [deleteTarget, setDeleteTarget] = useState<ExamItem | null>(null)

  const reloadExams = async () => {
    try {
      const res = await fetch("/api/admin/exams")
      if (res.ok) {
        const data = await res.json()
        setExams(data)
      }
    } catch {
      console.error("Failed to reload exams")
    }
  }

  const handleCreate = async () => {
    if (!newCategoryId) {
      setError("카테고리를 선택해주세요")
      return
    }
    setCreating(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: newCategoryId,
          year: newYear,
          round: newRound,
          exam_type: newExamType,
          duration_minutes: newDuration,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "생성 실패")
      } else {
        setSuccess(
          `${data.exam.name} 시험이 생성되었습니다 (과목 ${data.exam.subjects}개)`
        )
        setShowCreateForm(false)
        reloadExams()
      }
    } catch {
      setError("오류가 발생했습니다")
    } finally {
      setCreating(false)
    }
  }

  const handleTogglePublish = async (exam: ExamItem) => {
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !exam.is_published }),
      })
      if (res.ok) reloadExams()
    } catch {}
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      const res = await fetch(`/api/admin/exams/${deleteTarget.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "삭제 실패")
      } else {
        setSuccess(`${deleteTarget.name} 시험이 삭제되었습니다`)
        reloadExams()
      }
    } catch {
      setError("오류가 발생했습니다")
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredExams =
    categoryFilter === "all"
      ? exams
      : exams.filter((e) => e.category_id === parseInt(categoryFilter))

  // 카테고리별 그룹핑
  const groupedExams = new Map<string, ExamItem[]>()
  for (const exam of filteredExams) {
    const key = exam.category_name
    const group = groupedExams.get(key) || []
    group.push(exam)
    groupedExams.set(key, group)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              시험 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              년도/회차별 시험 생성 및 관리
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              관리자 홈
            </Link>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm)
                setError("")
                setSuccess("")
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              {showCreateForm ? "취소" : "+ 시험 추가"}
            </button>
          </div>
        </div>

        {/* 알림 */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* 생성 폼 */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 dark:text-white">
              새 시험 추가
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  카테고리
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  유형
                </label>
                <select
                  value={newExamType}
                  onChange={(e) => setNewExamType(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                >
                  <option value="WRITTEN">필기</option>
                  <option value="PRACTICAL">실기</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  년도
                </label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(parseInt(e.target.value))}
                  min={2000}
                  max={2100}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  회차
                </label>
                <input
                  type="number"
                  value={newRound}
                  onChange={(e) => setNewRound(parseInt(e.target.value))}
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  시간(분)
                </label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={(e) => setNewDuration(parseInt(e.target.value))}
                  min={1}
                  max={300}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              과목은 같은 카테고리의 기존 시험에서 자동 복사됩니다. 기존
              시험이 없으면 과목 없이 생성됩니다.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {creating ? "생성 중..." : "시험 생성"}
            </button>
          </div>
        )}

        {/* 필터 */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium dark:text-gray-200">
            카테고리:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="all">전체</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            총 {filteredExams.length}개
          </span>
        </div>

        {/* 시험 목록 */}
        {Array.from(groupedExams.entries()).map(
          ([categoryName, categoryExams]) => (
            <div key={categoryName} className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                {categoryName}
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                        시험
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        유형
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        과목
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        문제 수
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        시간
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        상태
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {categoryExams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                      >
                        <td className="px-4 py-3 dark:text-gray-200">
                          <div className="font-medium">
                            {exam.year
                              ? `${exam.category_name} ${exam.year}년 ${exam.round}회차`
                              : exam.name}
                          </div>
                          {exam.subjects.length > 0 && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {exam.subjects
                                .map((s) => s.name)
                                .join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            exam.exam_type === "PRACTICAL"
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                              : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                          }`}>
                            {exam.exam_type === "PRACTICAL" ? "실기" : "필기"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center dark:text-gray-300">
                          {exam.subjects.length}개
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={
                              exam.question_count > 0
                                ? "text-blue-600 dark:text-blue-400 font-medium"
                                : "text-gray-400 dark:text-gray-500"
                            }
                          >
                            {exam.question_count}개
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center dark:text-gray-300">
                          {exam.duration_minutes}분
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleTogglePublish(exam)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              exam.is_published
                                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                                : "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {exam.is_published ? "게시" : "비게시"}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/admin/questions?exam=${exam.id}`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-medium"
                            >
                              문제관리
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(exam)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {filteredExams.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              등록된 시험이 없습니다
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="시험 삭제"
        message={`"${deleteTarget?.name}" 시험을 삭제하시겠습니까?\n\n시험에 포함된 과목과 문제도 함께 삭제됩니다.`}
        confirmText="삭제"
        confirmColor="red"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

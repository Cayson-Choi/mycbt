'use client'

import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import MathText from '@/components/MathText'
import ConfirmDialog from '@/components/ConfirmDialog'

const QuestionSplitEditor = lazy(() => import('@/components/QuestionSplitEditor'))
const BulkUploadSplitEditor = lazy(() => import('@/components/BulkUploadSplitEditor'))

export default function QuestionsClient({
  initialExams,
  initialQuestions,
}: {
  initialExams?: any[]
  initialQuestions?: any[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<any[]>(initialQuestions || [])
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>(initialQuestions || [])
  const [loading, setLoading] = useState(!initialQuestions)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [examTypeFilter, setExamTypeFilter] = useState<string>('all')
  const [examFilter, setExamFilter] = useState<string>(searchParams.get('exam') || 'all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [imageFilter, setImageFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [subjects, setSubjects] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [exams, setExams] = useState<any[]>(initialExams || [])
  const itemsPerPage = 20

  useEffect(() => {
    if (initialExams && initialExams.length > 0) {
      // 서버에서 프리페치된 데이터 사용 — URL 파라미터 처리만 수행
      const examParam = searchParams.get('exam')
      if (examParam && examParam !== 'all') {
        const matched = initialExams.find((e: any) => e.id.toString() === examParam)
        if (matched?.category_name) {
          setCategoryFilter(matched.category_name)
        }
      }
      return
    }
    fetch('/api/admin/exam-settings')
      .then(res => res.ok ? res.json() : { exams: [] })
      .then(data => {
        const examsList = data.exams || []
        setExams(examsList)
        // URL 파라미터로 시험이 지정된 경우 카테고리도 자동 선택
        const examParam = searchParams.get('exam')
        if (examParam && examParam !== 'all') {
          const matched = examsList.find((e: any) => e.id.toString() === examParam)
          if (matched?.category_name) {
            setCategoryFilter(matched.category_name)
          }
        }
      })
      .catch(() => {})
  }, [])

  const skipInitialLoad = useRef(!!initialQuestions && imageFilter === 'all')
  useEffect(() => {
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false
      return
    }
    loadQuestions()
  }, [examFilter, categoryFilter, examTypeFilter, imageFilter])

  // 과목 목록 로드
  useEffect(() => {
    loadSubjects()
  }, [examFilter])

  // 필터링 및 검색
  useEffect(() => {
    let filtered = [...questions]

    // 과목 필터
    if (subjectFilter !== 'all') {
      filtered = filtered.filter((q) => q.subject_id === parseInt(subjectFilter))
    }

    // 이미지 필터
    if (imageFilter === 'with') {
      filtered = filtered.filter((q) => q.image_url || q.choice_1_image || q.choice_2_image || q.choice_3_image || q.choice_4_image)
    } else if (imageFilter === 'without') {
      filtered = filtered.filter((q) => !q.image_url && !q.choice_1_image && !q.choice_2_image && !q.choice_3_image && !q.choice_4_image)
    }

    // 검색
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (q) =>
          q.question_text?.toLowerCase().includes(query) ||
          q.choice_1?.toLowerCase().includes(query) ||
          q.choice_2?.toLowerCase().includes(query) ||
          q.choice_3?.toLowerCase().includes(query) ||
          q.choice_4?.toLowerCase().includes(query) ||
          q.question_code?.toLowerCase().includes(query)
      )
    }

    setFilteredQuestions(filtered)
    setCurrentPage(1)
  }, [questions, subjectFilter, imageFilter, searchQuery])

  const loadSubjects = async () => {
    try {
      if (examFilter === 'all') {
        // 전체 선택 시 모든 시험의 과목을 불러와서 합치기
        const allSubjects: any[] = []
        for (const exam of exams) {
          const res = await fetch(`/api/exams/${exam.id}/subjects`)
          if (res.ok) {
            const data = await res.json()
            allSubjects.push(...data)
          }
        }

        // 중복 제거 (같은 id의 과목은 하나만)
        const uniqueSubjects = Array.from(
          new Map(allSubjects.map((s) => [s.id, s])).values()
        )
        setSubjects(uniqueSubjects)
      } else {
        // 특정 시험 선택 시
        const res = await fetch(`/api/exams/${examFilter}/subjects`)
        if (res.ok) {
          const data = await res.json()
          setSubjects(data || [])
        }
      }
    } catch (err) {
      console.error('Failed to load subjects:', err)
    }
  }

  const loadRequestId = useRef(0)
  const loadQuestions = async () => {
    const requestId = ++loadRequestId.current
    setLoading(true)
    try {
      let url = '/api/admin/questions'
      if (examFilter !== 'all') {
        url = `/api/admin/questions?exam_id=${examFilter}`
      } else if (categoryFilter !== 'all') {
        // 카테고리 선택 + 전체 시험: 해당 카테고리의 모든 exam_id를 쿼리
        const catExamIds = exams
          .filter((e: any) => e.category_name === categoryFilter)
          .filter((e: any) => examTypeFilter === 'all' || e.exam_type === examTypeFilter)
          .map((e: any) => e.id)
        if (catExamIds.length > 0) {
          url = `/api/admin/questions?exam_ids=${catExamIds.join(',')}`
        }
      }

      if (imageFilter !== 'all') {
        url += (url.includes('?') ? '&' : '?') + `has_image=${imageFilter}`
      }

      const res = await fetch(url)
      if (requestId !== loadRequestId.current) return // 레이스 컨디션 방지

      if (res.status === 401) {
        router.push('/login?redirect=/admin/questions')
        return
      }
      if (res.status === 403) {
        router.push('/')
        return
      }

      if (res.ok) {
        const data = await res.json()
        if (requestId !== loadRequestId.current) return // 레이스 컨디션 방지
        setQuestions(data.questions || [])
      }
    } catch (err) {
      console.error('Failed to load questions:', err)
    } finally {
      if (requestId === loadRequestId.current) setLoading(false)
    }
  }

  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async (id: number) => {
    setPendingDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    setShowDeleteConfirm(false)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/admin/questions/${pendingDeleteId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        loadQuestions()
      } else {
        const data = await res.json()
        setDeleteError(data.error || '삭제에 실패했습니다')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setDeleteError('삭제 중 오류가 발생했습니다')
    } finally {
      setPendingDeleteId(null)
    }
  }

  const toggleSelectAll = () => {
    if (
      selectedQuestions.size === filteredQuestions.length &&
      filteredQuestions.length > 0
    ) {
      setSelectedQuestions(new Set())
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map((q) => q.id)))
    }
  }

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedQuestions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedQuestions(newSelected)
  }

  const handleBulkDelete = () => {
    if (selectedQuestions.size === 0) return
    setShowBulkDeleteConfirm(true)
  }

  const confirmBulkDelete = async () => {
    setShowBulkDeleteConfirm(false)
    setDeleteError(null)

    try {
      const results = await Promise.all(
        Array.from(selectedQuestions).map(async (id) => {
          const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            const data = await res.json().catch(() => ({ error: '삭제 실패' }))
            return { id, ok: false, error: data.error }
          }
          return { id, ok: true, error: null }
        })
      )

      const failed = results.filter((r) => !r.ok)
      const succeeded = results.filter((r) => r.ok)

      if (failed.length > 0) {
        const reason = failed[0].error || '삭제에 실패했습니다'
        setDeleteError(
          failed.length === results.length
            ? `${failed.length}개 문제 삭제 실패: ${reason}`
            : `${succeeded.length}개 삭제 성공, ${failed.length}개 실패: ${reason}`
        )
      }

      // 성공한 항목만 선택 해제
      const failedIds = new Set(failed.map((r) => r.id))
      setSelectedQuestions(failedIds.size > 0 ? failedIds : new Set())
      loadQuestions()
    } catch (err) {
      console.error('Bulk delete error:', err)
      setDeleteError('삭제 중 오류가 발생했습니다')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg dark:text-white">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📝 문제 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">문제 추가, 수정, 삭제</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedQuestions.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-sm"
              >
                선택 삭제 ({selectedQuestions.size})
              </button>
            )}
            <button
              onClick={() => setShowBulkUpload(true)}
              className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm"
            >
              📤 일괄 추가
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm"
            >
              + 개별 추가
            </button>
          </div>
        </div>

        {/* 삭제 오류 메시지 */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <span className="text-red-700 dark:text-red-300">{deleteError}</span>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 필터 및 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            {/* 1단계: 카테고리 */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setExamTypeFilter('all')
                setExamFilter('all')
                setSubjectFilter('all')
              }}
              className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">전체 카테고리</option>
              {(() => {
                // grade별로 카테고리를 그룹핑
                const gradeMap = new Map<string, string[]>()
                const seen = new Set<string>()
                for (const e of exams) {
                  const cat = e.category_name
                  const grade = e.category_grade || '기타'
                  if (!cat || seen.has(cat)) continue
                  seen.add(cat)
                  if (!gradeMap.has(grade)) gradeMap.set(grade, [])
                  gradeMap.get(grade)!.push(cat)
                }
                return Array.from(gradeMap.entries()).map(([grade, cats]) => (
                  <optgroup key={grade} label={grade}>
                    {cats.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </optgroup>
                ))
              })()}
            </select>

            {/* 2단계: 필기/실기 (카테고리 선택 시) */}
            {categoryFilter !== 'all' && (
              <select
                value={examTypeFilter}
                onChange={(e) => {
                  setExamTypeFilter(e.target.value)
                  setExamFilter('all')
                  setSubjectFilter('all')
                }}
                className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">전체 유형</option>
                <option value="WRITTEN">필기</option>
                <option value="PRACTICAL">실기</option>
              </select>
            )}

            {/* 3단계: 시험 (카테고리 선택 시) */}
            {categoryFilter !== 'all' && (
              <select
                value={examFilter}
                onChange={(e) => {
                  setExamFilter(e.target.value)
                  setSubjectFilter('all')
                }}
                className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">전체 시험</option>
                {exams
                  .filter((e: any) => e.category_name === categoryFilter)
                  .filter((e: any) => examTypeFilter === 'all' || e.exam_type === examTypeFilter)
                  .map((exam: any) => (
                    <option key={exam.id} value={exam.id.toString()}>
                      {exam.name}
                    </option>
                  ))}
              </select>
            )}

            {/* 3단계: 과목 (시험 선택 시) */}
            {examFilter !== 'all' && subjects.length > 0 && (
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">전체 과목</option>
                {subjects.map((subject: any) => (
                  <option key={subject.id} value={subject.id.toString()}>
                    {subject.name}
                  </option>
                ))}
              </select>
            )}

            {/* 이미지 필터 */}
            <select
              value={imageFilter}
              onChange={(e) => setImageFilter(e.target.value)}
              className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">전체 문제</option>
              <option value="with">🖼️ 이미지 있음</option>
              <option value="without">이미지 없음</option>
            </select>

            <div className="flex-1 min-w-[200px] max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="문제 내용, 선택지, 문제코드 검색..."
                className="w-full px-3 py-2 pr-8 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 문제 목록 */}
        {(() => {
          const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage))
          const safePage = Math.min(currentPage, totalPages)
          const startIndex = (safePage - 1) * itemsPerPage
          const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage)

          const renderPagination = () => {
            if (totalPages <= 1) return null

            const pages: (number | string)[] = []
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i)
            } else {
              pages.push(1)
              if (safePage > 3) pages.push('...')
              for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
                pages.push(i)
              }
              if (safePage < totalPages - 2) pages.push('...')
              pages.push(totalPages)
            }

            return (
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => setCurrentPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="px-3 py-1.5 rounded text-sm border dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  ‹ 이전
                </button>
                {pages.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`dot-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        p === safePage
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="px-3 py-1.5 rounded text-sm border dark:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  다음 ›
                </button>
              </div>
            )
          }

          return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold dark:text-white">
                    문제 목록 ({filteredQuestions.length}개
                    {filteredQuestions.length !== questions.length &&
                      ` / 전체 ${questions.length}개`}
                    )
                  </h2>
                  {filteredQuestions.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          selectedQuestions.size === filteredQuestions.length &&
                          filteredQuestions.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">전체 선택</span>
                    </label>
                  )}
                </div>
                {totalPages > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredQuestions.length)}번째
                  </span>
                )}
              </div>

              {/* 상단 페이지네이션 */}
              {renderPagination() && <div className="mb-4">{renderPagination()}</div>}

              {paginatedQuestions.length > 0 ? (
                <div className="space-y-4">
                  {paginatedQuestions.map((q: any) => (
                    <div
                      key={q.id}
                      className="border dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.has(q.id)}
                          onChange={() => toggleSelect(q.id)}
                          className="mt-1 w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              {q.exams?.name}
                            </span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                              {q.subjects?.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {q.question_code}
                            </span>
                            {q.image_url && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                                🖼️ 이미지 포함
                              </span>
                            )}
                          </div>
                          <MathText
                            text={q.question_text}
                            className="font-medium mb-2 dark:text-white block"
                          />
                          {q.image_url && (
                            <div className="mb-3">
                              <Image
                                src={q.image_url}
                                alt="문제 이미지"
                                width={320}
                                height={160}
                                className="max-w-xs max-h-40 object-contain rounded border border-gray-300 dark:border-gray-600"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {[1, 2, 3, 4].map((n) => (
                              <div key={n} className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                                  q.answer === n
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                }`}>{n}</span>
                                {q[`choice_${n}_image` as keyof typeof q] ? (
                                  <img
                                    src={q[`choice_${n}_image` as keyof typeof q] as string}
                                    alt={`선택지 ${n}`}
                                    className="inline-block max-h-10 align-middle"
                                  />
                                ) : (
                                  <MathText text={q[`choice_${n}` as keyof typeof q] as string} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditingQuestion(q)}
                            className="px-3 py-1 bg-yellow-600 dark:bg-yellow-500 text-white text-sm rounded hover:bg-yellow-700 dark:hover:bg-yellow-600"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  문제가 없습니다
                </div>
              )}

              {/* 하단 페이지네이션 */}
              {renderPagination() && <div className="mt-4">{renderPagination()}</div>}
            </div>
          )
        })()}

        {/* 하단 버튼 */}
        <Link
          href="/admin"
          className="inline-block px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
        >
          ← 관리자 페이지
        </Link>

        {/* 문제 추가/수정 분할 편집기 */}
        {(showAddForm || editingQuestion) && (
          <Suspense fallback={null}>
            <QuestionSplitEditor
              question={editingQuestion}
              onClose={() => {
                setShowAddForm(false)
                setEditingQuestion(null)
              }}
              onSuccess={() => {
                setShowAddForm(false)
                setEditingQuestion(null)
                loadQuestions()
              }}
            />
          </Suspense>
        )}

        {/* 일괄 업로드 분할 편집기 */}
        {showBulkUpload && (
          <Suspense fallback={null}>
            <BulkUploadSplitEditor
              onClose={() => setShowBulkUpload(false)}
              onSuccess={() => {
                setShowBulkUpload(false)
                loadQuestions()
              }}
            />
          </Suspense>
        )}

        <ConfirmDialog
          open={showDeleteConfirm}
          title="문제 삭제"
          message="정말 삭제하시겠습니까?"
          confirmText="삭제"
          confirmColor="red"
          onConfirm={confirmDelete}
          onCancel={() => { setShowDeleteConfirm(false); setPendingDeleteId(null) }}
        />

        <ConfirmDialog
          open={showBulkDeleteConfirm}
          title="일괄 삭제"
          message={`선택한 ${selectedQuestions.size}개 문제를 삭제하시겠습니까?`}
          confirmText="삭제"
          confirmColor="red"
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      </div>
    </div>
  )
}


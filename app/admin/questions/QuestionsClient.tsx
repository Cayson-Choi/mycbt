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

  // 필터 변경 시 + 마운트 시 항상 전체 문제 로드 (SSR 초기 데이터는 일부만이므로)
  useEffect(() => {
    loadQuestions()
  }, [examFilter, categoryFilter, examTypeFilter, imageFilter])

  // 과목 목록 로드
  useEffect(() => {
    loadSubjects()
  }, [examFilter])

  // 필터링 및 검색 (페이지는 유지)
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
  }, [questions, subjectFilter, imageFilter, searchQuery])

  // 필터/검색/시험 변경 시에만 1페이지로 리셋 (questions 변경은 제외 → 수정 후 페이지 유지)
  useEffect(() => {
    setCurrentPage(1)
  }, [subjectFilter, imageFilter, searchQuery, examFilter, categoryFilter, examTypeFilter])

  const subjectsRequestId = useRef(0)
  const loadSubjects = async () => {
    const reqId = ++subjectsRequestId.current
    // 시험이 선택되지 않으면 과목 드롭다운은 숨겨지므로 미리 로드할 필요 없음
    if (examFilter === 'all') {
      setSubjects([])
      return
    }
    try {
      const res = await fetch(`/api/exams/${examFilter}/subjects`)
      if (reqId !== subjectsRequestId.current) return
      if (res.ok) {
        const data = await res.json()
        if (reqId !== subjectsRequestId.current) return
        setSubjects(data || [])
      }
    } catch {
      /* ignored */
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
        } else {
          // 해당 카테고리+유형에 시험이 없으면 빈 결과 반환
          if (requestId === loadRequestId.current) {
            setQuestions([])
            setLoading(false)
          }
          return
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
    } catch {
      /* ignored */
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
    } catch {
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
    } catch {
      setDeleteError('삭제 중 오류가 발생했습니다')
    }
  }

  // 시험지 인쇄 (A4 세로 2단 — JS 수동 배분)
  const handlePrintExam = () => {
    if (filteredQuestions.length === 0) return

    let examTitle = '시험지'
    if (examFilter !== 'all') {
      const ex = exams.find((e: any) => e.id.toString() === examFilter)
      if (ex) examTitle = ex.name
    } else if (categoryFilter !== 'all') {
      examTitle = categoryFilter + (examTypeFilter !== 'all' ? (examTypeFilter === 'WRITTEN' ? ' 필기' : ' 실기') : '')
    }

    const escHtml = (s: string) => s?.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') || ''
    const renderText = (text: string) => {
      if (!text) return ''
      return escHtml(text)
        .replace(/\$\$(.+?)\$\$/g, '<span class="math-block">\\($1\\)</span>')
        .replace(/\$(.+?)\$/g, '<span class="math-inline">\\($1\\)</span>')
        .replace(/\n/g, '<br/>')
    }

    const questionsHtml = filteredQuestions.map((q, i) => {
      const num = i + 1
      const choices = [q.choice_1, q.choice_2, q.choice_3, q.choice_4].filter(Boolean)
      return `<div class="q-block" data-idx="${i}">
        <div class="q-header"><span class="q-num">${num}</span> ${renderText(q.question_text)}</div>
        ${q.image_url ? `<div class="q-img"><img src="${escHtml(q.image_url)}" /></div>` : ''}
        <div class="q-choices">
          ${choices.map((c, ci) => {
            const hasImg = q[`choice_${ci+1}_image`]
            return `<div class="choice"><span class="choice-num">${ci+1}</span> ${hasImg ? `<img src="${escHtml(hasImg)}" class="choice-img"/>` : renderText(c)}</div>`
          }).join('')}
        </div>
      </div>`
    }).join('')

    const answerHtml = filteredQuestions.map((q, i) => {
      return `<div class="answer-cell"><div class="a-num">${i+1}</div><div class="a-ans">${q.answer || '-'}</div></div>`
    }).join('')

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${escHtml(examTitle)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.css" crossorigin="anonymous">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/katex.min.js" crossorigin="anonymous"><\/script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.28/dist/contrib/auto-render.min.js" crossorigin="anonymous"
  onload="renderMathInElement(document.body, {delimiters:[{left:'\\\\(',right:'\\\\)',display:false},{left:'\\\\[',right:'\\\\]',display:true}]})"><\/script>
<style>
  @page { size: A4 portrait; margin: 12mm 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Malgun Gothic', sans-serif; font-size: 10px; line-height: 1.45; color: #111; }
  .exam-title { text-align: center; font-size: 16px; font-weight: 700; padding: 6px 0 10px; border-bottom: 2px solid #333; margin-bottom: 10px; }
  /* 측정용 숨김 컨테이너 */
  #measure { position: absolute; left: -9999px; width: 340px; }
  /* 페이지별 2단 레이아웃 */
  .page { display: flex; gap: 16px; page-break-after: always; }
  .page:last-of-type { page-break-after: auto; }
  .col { flex: 1; min-width: 0; }
  .col + .col { border-left: 1px solid #ddd; padding-left: 16px; }
  .q-block { margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px dotted #ccc; }
  .q-header { font-weight: 600; margin-bottom: 3px; }
  .q-num { display: inline-block; min-width: 18px; height: 18px; line-height: 18px; text-align: center; background: #333; color: #fff; border-radius: 50%; font-size: 9px; font-weight: 700; margin-right: 4px; }
  .q-img { margin: 4px 0; }
  .q-img img { max-width: 100%; max-height: 120px; }
  .q-choices { padding-left: 22px; }
  .choice { margin: 1px 0; }
  .choice-num { display: inline-block; width: 14px; height: 14px; line-height: 14px; text-align: center; border: 1px solid #999; border-radius: 50%; font-size: 8px; margin-right: 3px; }
  .choice-img { max-height: 24px; vertical-align: middle; }
  .math-inline, .math-block { font-size: 11px; }
  .answer-page { page-break-before: always; padding-top: 20px; }
  .answer-page h2 { text-align: center; font-size: 16px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #333; }
  .answer-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px 4px; max-width: 500px; margin: 0 auto; font-size: 11px; }
  .answer-cell { text-align: center; padding: 4px 0; border: 1px solid #ddd; border-radius: 4px; }
  .answer-cell .a-num { font-weight: 700; }
  .answer-cell .a-ans { color: #2563eb; font-weight: 700; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head><body>
<div class="exam-title">${escHtml(examTitle)} (${filteredQuestions.length}문제)</div>
<!-- 측정용: 1열 너비로 높이 측정 -->
<div id="measure">${questionsHtml}</div>
<!-- 실제 출력: JS가 채움 -->
<div id="pages"></div>
<div class="answer-page">
  <h2>${escHtml(examTitle)} 정답표</h2>
  <div class="answer-grid">${answerHtml}</div>
</div>
<script>
// KaTeX 렌더 후 실행 (1.2초 대기)
setTimeout(function() {
  var PAGE_H = 980; // A4 content area (273mm at ~96dpi)
  var TITLE_H = 50; // 첫 페이지 타이틀 높이
  var blocks = document.querySelectorAll('#measure .q-block');
  var heights = [];
  for (var i = 0; i < blocks.length; i++) {
    heights.push(blocks[i].getBoundingClientRect().height + 8);
  }

  // 페이지별 좌/우 배분
  var pages = [];
  var leftHtml = [], rightHtml = [];
  var leftH = 0, rightH = 0;
  var fillingRight = false;
  var isFirstPage = true;
  var pageMax = isFirstPage ? PAGE_H - TITLE_H : PAGE_H;

  for (var i = 0; i < blocks.length; i++) {
    var h = heights[i];
    if (!fillingRight) {
      if (leftH + h <= pageMax) {
        leftHtml.push(blocks[i].outerHTML);
        leftH += h;
      } else {
        fillingRight = true;
        i--; // 이 문제를 우측에서 다시 시도
      }
    } else {
      if (rightH + h <= pageMax) {
        rightHtml.push(blocks[i].outerHTML);
        rightH += h;
      } else {
        // 양쪽 다 찼음 → 페이지 완료
        pages.push('<div class="page"><div class="col">' + leftHtml.join('') + '</div><div class="col">' + rightHtml.join('') + '</div></div>');
        leftHtml = []; rightHtml = [];
        leftH = 0; rightH = 0;
        fillingRight = false;
        isFirstPage = false;
        pageMax = PAGE_H;
        i--; // 이 문제를 다음 페이지 좌측에서 다시 시도
      }
    }
  }
  // 마지막 페이지
  if (leftHtml.length || rightHtml.length) {
    pages.push('<div class="page"><div class="col">' + leftHtml.join('') + '</div><div class="col">' + rightHtml.join('') + '</div></div>');
  }

  document.getElementById('measure').style.display = 'none';
  document.getElementById('pages').innerHTML = pages.join('');
  setTimeout(function() { window.print(); }, 300);
}, 1200);
<\/script>
</body></html>`)
    w.document.close()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-4 border dark:border-gray-700">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-600" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 animate-spin" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">불러오는 중...</span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4">
        {/* 상단 네비게이션 */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          관리자 페이지
        </Link>
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
            {examFilter !== 'all' && filteredQuestions.length > 0 && (
              <button
                onClick={handlePrintExam}
                className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 text-sm"
              >
                🖨️ 시험지 출력
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

        {/* 삭제 오류 모달 */}
        {deleteError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold dark:text-white">삭제 실패</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{deleteError}</p>
              <button
                onClick={() => setDeleteError(null)}
                className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-500 text-sm font-medium"
              >
                확인
              </button>
            </div>
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
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            {q.answer === 0 && (
                              <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-600 rounded px-2 py-1">
                                ⚠️ 정답불명 (0번)
                              </div>
                            )}
                            {[1, 2, 3, 4].map((n) => {
                              const hasImage = q[`choice_${n}_image` as keyof typeof q]
                              return (
                                <div key={n} className={`flex ${hasImage ? 'items-start' : 'items-center'} gap-2`}>
                                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                                    q.answer === n
                                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                                  } ${hasImage ? 'mt-1' : ''}`}>{n}</span>
                                  {hasImage ? (
                                    <img
                                      src={hasImage as string}
                                      alt={`선택지 ${n}`}
                                      className="max-h-32 max-w-xs object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
                                    />
                                  ) : (
                                    <MathText text={q[`choice_${n}` as keyof typeof q] as string} />
                                  )}
                                </div>
                              )
                            })}
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


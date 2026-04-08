'use client'

import { useState, useEffect, type ReactNode } from 'react'

interface Exam {
  id: number
  name: string
  category_name?: string
  exam_mode?: string
  exam_type?: string
  duration_minutes?: number
}

interface Subject {
  id: number
  exam_id: number
  name: string
  questions_per_attempt: number
  order_no: number
  total_questions: number
}

interface Props {
  exams: Exam[]
}

export default function ExamSettingsSection({ exams }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [editValues, setEditValues] = useState<Record<number, number>>({})
  const [durationValues, setDurationValues] = useState<Record<number, number>>({})
  const [examDurations, setExamDurations] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/exam-settings')
      const data = await res.json()
      if (res.ok) {
        setSubjects(data.subjects)
        const values: Record<number, number> = {}
        for (const s of data.subjects) {
          values[s.id] = s.questions_per_attempt
        }
        setEditValues(values)

        // 시험 시간 초기값 설정
        const durations: Record<number, number> = {}
        for (const e of data.exams || []) {
          durations[e.id] = e.duration_minutes || 60
        }
        setDurationValues(durations)
        setExamDurations(durations)
      }
    } catch {
      setResult({ type: 'error', message: '설정을 불러오는데 실패했습니다' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (subjectId: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    const num = cleaned === '' ? 0 : parseInt(cleaned, 10)
    if (num < 0) return
    setEditValues((prev) => ({ ...prev, [subjectId]: num }))
    setResult(null)
  }

  const handleDurationChange = (examId: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    const num = cleaned === '' ? 0 : parseInt(cleaned, 10)
    if (num > 300) return
    setDurationValues((prev) => ({ ...prev, [examId]: num }))
    setResult(null)
  }

  const hasChanges = () => {
    const subjectChanged = subjects.some((s) => editValues[s.id] !== s.questions_per_attempt)
    const durationChanged = Object.keys(durationValues).some(
      (id) => durationValues[parseInt(id)] !== examDurations[parseInt(id)]
    )
    return subjectChanged || durationChanged
  }

  const handleSave = async () => {
    setSaving(true)
    setResult(null)

    try {
      const changedSubjects = subjects
        .filter((s) => editValues[s.id] !== s.questions_per_attempt)
        .map((s) => ({ id: s.id, questions_per_attempt: editValues[s.id] }))

      const changedExams = Object.keys(durationValues)
        .filter((id) => durationValues[parseInt(id)] !== examDurations[parseInt(id)])
        .map((id) => ({ id: parseInt(id), duration_minutes: durationValues[parseInt(id)] }))

      if (changedSubjects.length === 0 && changedExams.length === 0) {
        setResult({ type: 'error', message: '변경된 항목이 없습니다' })
        setSaving(false)
        return
      }

      const res = await fetch('/api/admin/exam-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: changedSubjects.length > 0 ? changedSubjects : undefined,
          exams: changedExams.length > 0 ? changedExams : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ type: 'error', message: data.error || '저장 실패' })
      } else {
        setResult({ type: 'success', message: data.message })
        await fetchSettings()
      }
    } catch {
      setResult({ type: 'error', message: '네트워크 오류가 발생했습니다' })
    } finally {
      setSaving(false)
    }
  }

  const getSubjectsForExam = (examId: number) => {
    return subjects.filter((s) => s.exam_id === examId)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          시험 시간 및 출제 문항 수 설정
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">불러오는 중...</p>
      </div>
    )
  }

  // 카테고리별 그룹핑
  const groupedExams = new Map<string, Exam[]>()
  for (const exam of exams) {
    const catName = exam.category_name || exam.name.split(' ')[0]
    const group = groupedExams.get(catName) || []
    group.push(exam)
    groupedExams.set(catName, group)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        시험 시간 및 출제 문항 수 설정
      </h2>

      <div className="space-y-3">
        {Array.from(groupedExams.entries()).map(([catName, catExams]) => {
          const writtenExams = catExams.filter(e => e.exam_type !== 'PRACTICAL')
          const practicalExams = catExams.filter(e => e.exam_type === 'PRACTICAL')
          return (
          <CategoryAccordionClient key={catName} categoryName={catName}>
            <div className="space-y-2">
              {catExams.map((exam) => {
                const examSubjects = getSubjectsForExam(exam.id)
                if (examSubjects.length === 0) return null

                const isOfficial = exam.exam_mode === 'OFFICIAL'

                return (
                  <div key={exam.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        exam.exam_type === 'PRACTICAL'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      }`}>
                        {exam.exam_type === 'PRACTICAL' ? '실기' : '필기'}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {exam.name}
                      </h3>
                      {isOfficial && (
                        <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
                          공식 - 전체 출제
                        </span>
                      )}
                    </div>
                    {isOfficial ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        공식 시험은 등록된 모든 활성 문제가 출제됩니다.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gray-700 dark:text-gray-300">시험 시간</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={durationValues[exam.id] ?? 60}
                            onChange={(e) => handleDurationChange(exam.id, e.target.value)}
                            className="w-14 px-1.5 py-0.5 border rounded text-center dark:bg-gray-600 dark:border-gray-500 dark:text-white text-xs"
                          />
                          <span className="text-gray-400 dark:text-gray-500">분</span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                          {examSubjects.map((subject) => (
                            <div
                              key={subject.id}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <span className="text-gray-700 dark:text-gray-300">{subject.name}</span>
                              <span className="text-gray-400 dark:text-gray-500">({subject.total_questions})</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={editValues[subject.id] ?? subject.questions_per_attempt}
                                onChange={(e) => handleChange(subject.id, e.target.value)}
                                className="w-14 px-1.5 py-0.5 border rounded text-center dark:bg-gray-600 dark:border-gray-500 dark:text-white text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CategoryAccordionClient>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '저장 중...' : '저장'}
        </button>

        {result && (
          <span
            className={`text-sm ${
              result.type === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {result.message}
          </span>
        )}
      </div>
    </div>
  )
}

function CategoryAccordionClient({
  categoryName,
  children,
}: {
  categoryName: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white">
          {categoryName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

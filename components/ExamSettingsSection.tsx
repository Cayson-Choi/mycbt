'use client'

import { useState, useEffect } from 'react'

interface Exam {
  id: number
  name: string
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
      }
    } catch {
      setResult({ type: 'error', message: '설정을 불러오는데 실패했습니다' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (subjectId: number, value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10)
    if (isNaN(num) || num < 0) return
    setEditValues((prev) => ({ ...prev, [subjectId]: num }))
    setResult(null)
  }

  const hasChanges = () => {
    return subjects.some((s) => editValues[s.id] !== s.questions_per_attempt)
  }

  const handleSave = async () => {
    setSaving(true)
    setResult(null)

    try {
      const changedSubjects = subjects
        .filter((s) => editValues[s.id] !== s.questions_per_attempt)
        .map((s) => ({ id: s.id, questions_per_attempt: editValues[s.id] }))

      if (changedSubjects.length === 0) {
        setResult({ type: 'error', message: '변경된 항목이 없습니다' })
        setSaving(false)
        return
      }

      const res = await fetch('/api/admin/exam-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: changedSubjects }),
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
          설정 출제 문항 수 설정
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        설정 출제 문항 수 설정
      </h2>

      <div className="space-y-6">
        {exams.map((exam) => {
          const examSubjects = getSubjectsForExam(exam.id)
          if (examSubjects.length === 0) return null

          return (
            <div key={exam.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {exam.name}
              </h3>
              <div className="space-y-2">
                {examSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                      {subject.name}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                      (문제 은행: {subject.total_questions}개)
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={editValues[subject.id] ?? subject.questions_per_attempt}
                        onChange={(e) => handleChange(subject.id, e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-center dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                      />
                      <span className="text-gray-500 dark:text-gray-400 text-xs">문항</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

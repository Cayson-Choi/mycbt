'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import MathText from '@/components/MathText'
import { dataUrlToBlob, normalizeLineBreaks } from '@/lib/utils'

interface QuestionSplitEditorProps {
  question?: any
  onClose: () => void
  onSuccess: () => void
  lockedExam?: { id: number; name: string; examMode?: string }
}

export default function QuestionSplitEditor({
  question,
  onClose,
  onSuccess,
  lockedExam,
}: QuestionSplitEditorProps) {
  const defaultPoints = lockedExam?.examMode === 'OFFICIAL' ? 10 : 1
  const [formData, setFormData] = useState({
    question_code: question?.question_code || '',
    exam_id: question?.exam_id || lockedExam?.id || 1,
    subject_id: question?.subject_id || 1,
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'CHOICE',
    choice_1: question?.choice_1 || '',
    choice_2: question?.choice_2 || '',
    choice_3: question?.choice_3 || '',
    choice_4: question?.choice_4 || '',
    choice_1_image: question?.choice_1_image || '',
    choice_2_image: question?.choice_2_image || '',
    choice_3_image: question?.choice_3_image || '',
    choice_4_image: question?.choice_4_image || '',
    answer: question?.answer || 1,
    answer_text: question?.answer_text || '',
    answer_text_image: question?.answer_text_image || '',
    explanation: question?.explanation || '',
    explanation_image: question?.explanation_image || '',
    image_url: question?.image_url || '',
    points: question?.points || defaultPoints,
  })
  const [subjects, setSubjects] = useState<any[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [codeCheckStatus, setCodeCheckStatus] = useState<
    'idle' | 'checking' | 'available' | 'duplicate'
  >('idle')
  const [lastUsedCode, setLastUsedCode] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  const [saving, setSaving] = useState(false)
  const [savedQuestionId, setSavedQuestionId] = useState<number | null>(question?.id || null)
  const [hasSavedOnce, setHasSavedOnce] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)
  const [formError, setFormError] = useState('')
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  // Track initial form data for dirty check
  const initialFormRef = useRef(JSON.stringify({
    question_code: question?.question_code || '',
    exam_id: question?.exam_id || lockedExam?.id || 1,
    subject_id: question?.subject_id || 1,
    question_text: question?.question_text || '',
    question_type: question?.question_type || 'CHOICE',
    choice_1: question?.choice_1 || '',
    choice_2: question?.choice_2 || '',
    choice_3: question?.choice_3 || '',
    choice_4: question?.choice_4 || '',
    choice_1_image: question?.choice_1_image || '',
    choice_2_image: question?.choice_2_image || '',
    choice_3_image: question?.choice_3_image || '',
    choice_4_image: question?.choice_4_image || '',
    answer: question?.answer || 1,
    answer_text: question?.answer_text || '',
    answer_text_image: question?.answer_text_image || '',
    explanation: question?.explanation || '',
    explanation_image: question?.explanation_image || '',
    image_url: question?.image_url || '',
    points: question?.points || defaultPoints,
  }))

  const isDirty = JSON.stringify(formData) !== initialFormRef.current

  // Dark mode detection via MutationObserver
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  // Body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Load subjects when exam changes
  useEffect(() => {
    if (formData.exam_id) {
      loadSubjects(formData.exam_id)
    }
  }, [formData.exam_id])

  // Load subjects for edit mode
  useEffect(() => {
    if (question && question.exam_id) {
      loadSubjects(question.exam_id)
    }
  }, [question])

  // Question code duplicate check (debounced)
  useEffect(() => {
    if (!formData.question_code || question || savedQuestionId) return

    const timer = setTimeout(async () => {
      setCodeCheckStatus('checking')
      try {
        const res = await fetch(
          `/api/admin/questions/check-code?code=${encodeURIComponent(
            formData.question_code
          )}`
        )
        if (res.ok) {
          const data = await res.json()
          setCodeCheckStatus(data.available ? 'available' : 'duplicate')
        }
      } catch {
        setCodeCheckStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.question_code, question])

  // Keyboard shortcuts
  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true)
      return
    }
    if (hasSavedOnce) {
      onSuccess()
    } else {
      onClose()
    }
  }, [isDirty, hasSavedOnce, onClose, onSuccess])

  const handleCloseConfirm = useCallback(() => {
    setShowCloseConfirm(false)
    if (hasSavedOnce) {
      onSuccess()
    } else {
      onClose()
    }
  }, [hasSavedOnce, onClose, onSuccess])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose, formData])

  const loadSubjects = async (examId: number) => {
    try {
      const res = await fetch(`/api/exams/${examId}/subjects`)
      if (res.ok) {
        const data = await res.json()
        setSubjects(data || [])
        if (!question && data && data.length > 0) {
          setFormData((prev) => ({ ...prev, subject_id: data[0].id }))
        }
      }
    } catch {
      /* ignored */
    }
  }

  const handleAutoGenerateCode = async () => {
    try {
      const res = await fetch(
        `/api/admin/questions/next-code?exam_id=${formData.exam_id}&subject_id=${formData.subject_id}`
      )

      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, question_code: data.code }))
        setLastUsedCode(data.lastCode)
        setCodeCheckStatus('available')
      } else {
        const data = await res.json()
        alert(data.error || '자동 생성 실패')
      }
    } catch {
      alert('자동 생성 중 오류가 발생했습니다')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다')
      return
    }

    try {
      setUploadingImage(true)

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, image_url: data.url }))
        alert('이미지가 업로드되었습니다')
      } else {
        const data = await res.json()
        alert(data.error || '이미지 업로드 실패')
      }
    } catch {
      alert('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setUploadingImage(false)
    }
  }

  // Base64/Blob → Storage 업로드 공통 함수 (targetField: 저장할 formData 키)
  const uploadImageBlob = async (blob: Blob, targetField: string = 'image_url') => {
    if (blob.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다')
      return
    }

    try {
      setUploadingImage(true)
      const file = new File([blob], `paste-${Date.now()}.png`, { type: blob.type || 'image/png' })
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, [targetField]: data.url }))
      } else {
        const data = await res.json()
        alert(data.error || '이미지 업로드 실패')
      }
    } catch {
      alert('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setUploadingImage(false)
    }
  }

  // 이미지 URL 입력 변경 (Base64 data URL 자동 감지 → 업로드)
  const handleImageUrlChange = (value: string, targetField: string = 'image_url') => {
    if (value.startsWith('data:image/')) {
      try {
        const blob = dataUrlToBlob(value)
        uploadImageBlob(blob, targetField)
      } catch {
        alert('Base64 이미지 데이터가 올바르지 않습니다')
      }
    } else {
      setFormData((prev) => ({ ...prev, [targetField]: value }))
    }
  }

  // 클립보드 이미지 붙여넣기 (targetField: 저장할 formData 키)
  const handleImagePaste = (e: React.ClipboardEvent, targetField: string = 'image_url') => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) uploadImageBlob(blob, targetField)
        return
      }
    }

    const text = e.clipboardData?.getData('text')
    if (text && text.startsWith('data:image/')) {
      e.preventDefault()
      try {
        const blob = dataUrlToBlob(text)
        uploadImageBlob(blob, targetField)
      } catch {
        // 파싱 실패 시 텍스트로 입력
      }
    }
  }

  // 파일 선택으로 이미지 업로드 (targetField: 저장할 formData 키)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string = 'image_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드 가능합니다'); return }
    if (file.size > 5 * 1024 * 1024) { alert('이미지 크기는 5MB 이하여야 합니다'); return }

    try {
      setUploadingImage(true)
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const res = await fetch('/api/upload/image', { method: 'POST', body: uploadFormData })
      if (res.ok) {
        const data = await res.json()
        setFormData((prev) => ({ ...prev, [targetField]: data.url }))
      } else {
        const data = await res.json()
        alert(data.error || '이미지 업로드 실패')
      }
    } catch {
      alert('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setFormError('')

    if (!formData.question_text) {
      setFormError('문제 내용을 입력해주세요')
      return
    }

    if (formData.question_type === 'CHOICE') {
      if (!formData.choice_1 || !formData.choice_2 || !formData.choice_3 || !formData.choice_4) {
        setFormError('모든 선택지를 입력해주세요')
        return
      }
    }

    if (!savedQuestionId && !formData.question_code) {
      setFormError('문제 코드를 입력해주세요')
      return
    }

    try {
      setSaving(true)
      const isUpdate = !!savedQuestionId
      const url = isUpdate
        ? `/api/admin/questions/${savedQuestionId}`
        : '/api/admin/questions'

      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        // 새 문제 추가 시 반환된 ID 저장 (이후 저장은 PUT)
        if (!isUpdate && data.question?.id) {
          setSavedQuestionId(data.question.id)
        }
        // dirty 상태 리셋
        initialFormRef.current = JSON.stringify(formData)
        setHasSavedOnce(true)
        // 저장 완료 플래시
        setSaveFlash(true)
        setTimeout(() => setSaveFlash(false), 2000)
      } else {
        const errData = await res.json()
        setFormError(errData.error || '오류가 발생했습니다')
      }
    } catch {
      setFormError('오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const examNameMap: Record<number, string> = { 17: '전기기초', 1: '전기기능사', 2: '전기산업기사', 3: '전기기사' }
  const examName = lockedExam ? lockedExam.name : examNameMap[formData.exam_id] || '시험'
  const subjectName = subjects.find((s) => s.id === formData.subject_id)?.name || '과목'

  return (
    <div
      className="animate-slide-in-right"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#111827' : '#ffffff',
        color: isDark ? '#f3f4f6' : '#111827',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
            color: isDark ? '#d1d5db' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← 목록으로
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: isDark ? '#f9fafb' : '#111827',
            }}
          >
            {savedQuestionId ? '문제 수정' : '문제 추가'}
          </h1>
          {saveFlash && (
            <span
              style={{
                fontSize: '13px',
                color: '#16a34a',
                fontWeight: 600,
                animation: 'fadeIn 0.2s ease-in',
              }}
            >
              저장됨
            </span>
          )}
        </div>

        {formError && (
          <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>
            {formError}
          </span>
        )}

        <button
          onClick={() => handleSubmit()}
          disabled={saving || !isDirty}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: saving
              ? (isDark ? '#1e40af' : '#93c5fd')
              : !isDirty
              ? (isDark ? '#374151' : '#d1d5db')
              : '#2563eb',
            color: saving || !isDirty ? (isDark ? '#6b7280' : '#9ca3af') : '#ffffff',
            cursor: saving || !isDirty ? 'default' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {saving ? '저장 중...' : '저장 (Ctrl+S)'}
        </button>
      </div>

      {/* Mobile tab switcher (< 1024px) */}
      <div
        style={{
          display: 'none',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          flexShrink: 0,
        }}
        className="lg:!hidden max-lg:!flex"
      >
        <button
          onClick={() => setMobileTab('edit')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderBottom: mobileTab === 'edit' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: mobileTab === 'edit'
              ? '#2563eb'
              : isDark ? '#9ca3af' : '#6b7280',
            fontWeight: mobileTab === 'edit' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          편집
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderBottom: mobileTab === 'preview' ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: mobileTab === 'preview'
              ? '#2563eb'
              : isDark ? '#9ca3af' : '#6b7280',
            fontWeight: mobileTab === 'preview' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          미리보기
        </button>
      </div>

      {/* Split panels */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Edit Form */}
        <div
          className={`split-panel-edit lg:!block ${mobileTab === 'edit' ? 'max-lg:!block' : 'max-lg:!hidden'}`}
          style={{
            width: '50%',
            overflowY: 'auto',
            padding: '24px',
            borderRight: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <EditPanel
            formData={formData}
            setFormData={setFormData}
            question={question}
            savedQuestionId={savedQuestionId}
            subjects={subjects}
            uploadingImage={uploadingImage}
            codeCheckStatus={codeCheckStatus}
            lastUsedCode={lastUsedCode}
            isDark={isDark}
            handleAutoGenerateCode={handleAutoGenerateCode}
            handleImageUpload={handleImageUpload}
            handleImageUrlChange={handleImageUrlChange}
            handleImagePaste={handleImagePaste}
            handleImageFileUpload={handleImageFileUpload}
            handleSubmit={handleSubmit}
            lockedExam={lockedExam}
          />
        </div>

        {/* Right Panel - Live Preview */}
        <div
          className={`split-panel-preview lg:!block ${mobileTab === 'preview' ? 'max-lg:!block' : 'max-lg:!hidden'}`}
          style={{
            width: '50%',
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: isDark ? '#0f172a' : '#f3f4f6',
          }}
        >
          <PreviewPanel
            formData={formData}
            isDark={isDark}
            examName={examName}
            subjectName={subjectName}
          />
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 1023px) {
          .split-panel-edit, .split-panel-preview {
            width: 100% !important;
            border-right: none !important;
          }
        }
      `}</style>

      {/* Dirty indicator */}
      {isDirty && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)',
            color: isDark ? '#fbbf24' : '#b45309',
            border: `1px solid ${isDark ? '#854d0e' : '#fbbf24'}`,
            pointerEvents: 'none',
          }}
        >
          저장하지 않은 변경사항이 있습니다
        </div>
      )}

      {/* 닫기 확인 모달 */}
      {showCloseConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '360px', width: '100%', margin: '0 16px', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: isDark ? '#ffffff' : '#111827' }}>변경사항 저장 안 함</h3>
            <p style={{ fontSize: '14px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '20px' }}>
              저장하지 않은 변경사항이 있습니다. 저장하지 않고 나가시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowCloseConfirm(false)}
                style={{ flex: 1, padding: '8px 16px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`, backgroundColor: 'transparent', color: isDark ? '#d1d5db' : '#374151', fontSize: '14px', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleCloseConfirm}
                style={{ flex: 1, padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Edit Panel ─── */
function EditPanel({
  formData,
  setFormData,
  question,
  savedQuestionId,
  subjects,
  uploadingImage,
  codeCheckStatus,
  lastUsedCode,
  isDark,
  handleAutoGenerateCode,
  handleImageUpload,
  handleImageUrlChange,
  handleImagePaste,
  handleImageFileUpload,
  handleSubmit,
  lockedExam,
}: {
  formData: any
  setFormData: (fn: any) => void
  question: any
  savedQuestionId: number | null
  subjects: any[]
  uploadingImage: boolean
  codeCheckStatus: string
  lastUsedCode: string | null
  isDark: boolean
  handleAutoGenerateCode: () => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleImageUrlChange: (value: string, targetField?: string) => void
  handleImagePaste: (e: React.ClipboardEvent, targetField?: string) => void
  handleImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>, targetField?: string) => void
  handleSubmit: (e?: React.FormEvent) => void
  lockedExam?: { id: number; name: string; examMode?: string }
}) {
  const defaultPoints = lockedExam?.examMode === 'OFFICIAL' ? 10 : 1
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
    backgroundColor: isDark ? '#374151' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#111827',
    fontSize: '14px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '4px',
    color: isDark ? '#d1d5db' : '#374151',
  }

  const sectionGap = '16px'

  const update = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSubmit(e) }}
      style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}
    >
      {/* Question Code */}
      {!question && !savedQuestionId && (
        <div>
          <label style={labelStyle}>문제 코드 *</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={formData.question_code}
                onChange={(e) => update('question_code', e.target.value.toUpperCase())}
                style={{
                  ...inputStyle,
                  borderColor:
                    codeCheckStatus === 'duplicate'
                      ? '#ef4444'
                      : codeCheckStatus === 'available'
                      ? '#22c55e'
                      : inputStyle.borderColor,
                  backgroundColor:
                    codeCheckStatus === 'duplicate'
                      ? isDark ? '#451a1a' : '#fef2f2'
                      : codeCheckStatus === 'available'
                      ? isDark ? '#14532d33' : '#f0fdf4'
                      : inputStyle.backgroundColor,
                }}
                placeholder="예: F-S1-001"
                required
              />
              {codeCheckStatus === 'checking' && (
                <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: '#9ca3af' }}>
                  확인 중...
                </span>
              )}
              {codeCheckStatus === 'duplicate' && (
                <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                  중복
                </span>
              )}
              {codeCheckStatus === 'available' && (
                <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>
                  사용 가능
                </span>
              )}
            </div>
            {!lockedExam && (
              <button
                type="button"
                onClick={handleAutoGenerateCode}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                }}
              >
                자동 생성
              </button>
            )}
          </div>
          {lastUsedCode && (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>
              마지막 코드: <span style={{ fontFamily: 'monospace' }}>{lastUsedCode}</span>
            </p>
          )}
          <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', lineHeight: '1.5' }}>
            형식: [분야]-[등급]-[과목]-[번호] / 비워두면 자동 생성
          </p>
        </div>
      )}

      {(question || savedQuestionId) && (
        <div>
          <label style={labelStyle}>문제 코드 *</label>
          <input
            type="text"
            value={formData.question_code}
            onChange={(e) => update('question_code', e.target.value.toUpperCase())}
            style={{ ...inputStyle, fontFamily: 'monospace' }}
            required
          />
          <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
            문제 코드 변경 시 주의: 이미지 파일명과 일치해야 합니다
          </p>
        </div>
      )}

      {/* Exam Select */}
      <div>
        <label style={labelStyle}>시험 *</label>
        {lockedExam ? (
          <input
            type="text"
            value={lockedExam.name}
            disabled
            style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }}
          />
        ) : (
          <select
            value={formData.exam_id}
            onChange={(e) => update('exam_id', parseInt(e.target.value))}
            style={inputStyle}
          >
            <option value={17}>전기기초</option>
            <option value={1}>전기기능사</option>
            <option value={2}>전기산업기사</option>
            <option value={3}>전기기사</option>
          </select>
        )}
      </div>

      {/* Subject Select */}
      <div>
        <label style={labelStyle}>과목 *</label>
        <select
          value={formData.subject_id}
          onChange={(e) => update('subject_id', parseInt(e.target.value))}
          style={inputStyle}
          required
        >
          {subjects.length === 0 ? (
            <option value="">로딩 중...</option>
          ) : (
            subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Question Type - lockedExam일 때만 표시 */}
      {lockedExam && (
        <div>
          <label style={labelStyle}>문제 유형 *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {([
              { value: 'CHOICE', label: '객관식' },
              { value: 'SHORT_ANSWER', label: '단답형' },
              { value: 'ESSAY', label: '서술형' },
            ] as const).map((opt) => (
              <label
                key={opt.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `2px solid ${formData.question_type === opt.value
                    ? '#2563eb'
                    : isDark ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: formData.question_type === opt.value
                    ? isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe'
                    : 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: formData.question_type === opt.value ? 600 : 400,
                  color: formData.question_type === opt.value
                    ? isDark ? '#93c5fd' : '#1d4ed8'
                    : isDark ? '#d1d5db' : '#374151',
                }}
              >
                <input
                  type="radio"
                  name="question_type"
                  value={opt.value}
                  checked={formData.question_type === opt.value}
                  onChange={() => update('question_type', opt.value)}
                  style={{ display: 'none' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Question Text */}
      <div>
        <label style={labelStyle}>문제 내용 *</label>
        <textarea
          value={formData.question_text}
          onChange={(e) => update('question_text', e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          rows={4}
          required
        />
        <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
          수학 기호: {'<sub>아래첨자</sub>'}, {'<sup>위첨자</sup>'}, {'<frac>분자/분모</frac>'}
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label style={labelStyle}>이미지</label>
        <input
          type="text"
          value={formData.image_url}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          onPaste={handleImagePaste}
          style={{ ...inputStyle, marginBottom: '8px' }}
          placeholder="URL 입력, Base64 붙여넣기, 또는 Ctrl+V로 이미지 붙여넣기"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label
            htmlFor="split-image-upload"
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: uploadingImage ? '#7c3aed80' : '#7c3aed',
              color: '#ffffff',
              cursor: uploadingImage ? 'not-allowed' : 'pointer',
              fontSize: '13px',
            }}
          >
            {uploadingImage ? '업로드 중...' : '이미지 파일 업로드'}
          </label>
          <input
            id="split-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            style={{ display: 'none' }}
          />
          {formData.image_url && (
            <button
              type="button"
              onClick={() => update('image_url', '')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              이미지 제거
            </button>
          )}
        </div>
        <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '6px' }}>
          선택사항, 최대 5MB | Ctrl+V로 클립보드 이미지 붙여넣기 | Base64 data URL 자동 업로드
        </p>
        {formData.image_url && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
            }}
          >
            <p style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: isDark ? '#d1d5db' : '#374151' }}>
              이미지 미리보기:
            </p>
            <img
              src={formData.image_url}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '4px' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Choices - CHOICE 유형일 때만 */}
      {formData.question_type === 'CHOICE' && (
        <>
          {[1, 2, 3, 4].map((n) => (
            <div key={n}>
              <label style={labelStyle}>선택지 {n} *</label>
              <input
                type="text"
                value={formData[`choice_${n}` as keyof typeof formData]}
                onChange={(e) => update(`choice_${n}`, e.target.value)}
                style={{
                  ...inputStyle,
                  borderColor: formData.answer === n
                    ? isDark ? '#22c55e' : '#16a34a'
                    : inputStyle.borderColor,
                }}
                required
              />
              {/* 선택지 이미지: URL 입력 + Ctrl+V 붙여넣기 + 파일 선택 */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={formData[`choice_${n}_image` as keyof typeof formData] || ''}
                  onChange={(e) => handleImageUrlChange(e.target.value, `choice_${n}_image`)}
                  onPaste={(e) => handleImagePaste(e, `choice_${n}_image`)}
                  placeholder={`선택지 ${n} 이미지 (URL 입력 또는 Ctrl+V 붙여넣기)`}
                  style={{ ...inputStyle, flex: 1, fontSize: '12px', margin: 0 }}
                />
                <label style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  color: isDark ? '#d1d5db' : '#374151',
                }}>
                  파일
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e, `choice_${n}_image`)}
                    style={{ display: 'none' }}
                  />
                </label>
                {formData[`choice_${n}_image` as keyof typeof formData] && (
                  <button
                    type="button"
                    onClick={() => update(`choice_${n}_image`, '')}
                    style={{
                      padding: '6px 8px',
                      fontSize: '11px',
                      backgroundColor: isDark ? '#991b1b' : '#fef2f2',
                      border: `1px solid ${isDark ? '#b91c1c' : '#fecaca'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: isDark ? '#fca5a5' : '#dc2626',
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
              {formData[`choice_${n}_image` as keyof typeof formData] && (
                <img
                  src={String(formData[`choice_${n}_image` as keyof typeof formData])}
                  alt={`선택지 ${n} 이미지`}
                  style={{ marginTop: '4px', maxHeight: '60px', borderRadius: '4px', border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}` }}
                />
              )}
            </div>
          ))}

          {/* Answer Select */}
          <div>
            <label style={labelStyle}>정답 *</label>
            <select
              value={formData.answer}
              onChange={(e) => update('answer', parseInt(e.target.value))}
              style={inputStyle}
            >
              <option value={1}>1번</option>
              <option value={2}>2번</option>
              <option value={3}>3번</option>
              <option value={4}>4번</option>
            </select>
          </div>
        </>
      )}

      {/* Answer Text - 주관식일 때만 */}
      {formData.question_type !== 'CHOICE' && (
        <div>
          <label style={labelStyle}>참고 정답</label>
          {formData.question_type === 'SHORT_ANSWER' ? (
            <input
              type="text"
              value={formData.answer_text}
              onChange={(e) => update('answer_text', e.target.value)}
              style={inputStyle}
              placeholder="채점 참고용 정답 (선택)"
            />
          ) : (
            <textarea
              value={formData.answer_text}
              onChange={(e) => update('answer_text', e.target.value)}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              rows={4}
              placeholder="채점 참고용 모범답안 (선택)"
            />
          )}
          <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
            관리자 수동 채점 시 참고용으로 사용됩니다
          </p>
          {renderImageField(
            '참고 정답 이미지',
            formData.answer_text_image,
            'answer_text_image',
            setFormData,
            handleImageFileUpload,
            handleImagePaste,
            handleImageUrlChange,
            isDark,
            inputStyle,
            labelStyle,
          )}
        </div>
      )}

      {/* Points (배점) - lockedExam일 때만 표시 */}
      {lockedExam && (
        <div>
          <label style={labelStyle}>배점</label>
          <input
            type="number"
            min={1}
            max={100}
            value={formData.points}
            onChange={(e) => update('points', parseInt(e.target.value) || defaultPoints)}
            style={{ ...inputStyle, width: '120px' }}
          />
          <p style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
            공식 시험 배점 (기본 {defaultPoints}점)
          </p>
        </div>
      )}

      {/* Explanation */}
      <div>
        <label style={labelStyle}>해설</label>
        <textarea
          value={formData.explanation}
          onChange={(e) => update('explanation', e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
          rows={3}
        />
        {renderImageField(
          '해설 이미지',
          formData.explanation_image,
          'explanation_image',
          setFormData,
          handleImageFileUpload,
          handleImagePaste,
          handleImageUrlChange,
          isDark,
          inputStyle,
          labelStyle,
        )}
      </div>

      {/* Bottom padding for dirty indicator */}
      <div style={{ height: '40px' }} />
    </form>
  )
}

/* ─── Render Image Field Helper (참고정답 이미지/해설 이미지 전용) ─── */
function renderImageField(
  label: string,
  value: string,
  field: string,
  setFormData: (fn: any) => void,
  handleImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>, target?: string) => void,
  handleImagePaste: (e: React.ClipboardEvent, target?: string) => void,
  handleImageUrlChange: (v: string, target?: string) => void,
  isDark: boolean,
  inputStyle: React.CSSProperties,
  labelStyle: React.CSSProperties,
) {
  const inputId = `img-upload-${field}`
  return (
    <div style={{ marginTop: '10px' }}>
      <label style={{ ...labelStyle, fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
        {label} (선택)
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={value}
          onChange={(e) => handleImageUrlChange(e.target.value, field)}
          onPaste={(e) => handleImagePaste(e, field)}
          placeholder="URL 붙여넣기 또는 아래 버튼으로 업로드"
          style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
        />
        <label
          htmlFor={inputId}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          이미지 업로드
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageFileUpload(e, field)}
          style={{ display: 'none' }}
        />
        {value && (
          <button
            type="button"
            onClick={() => setFormData((prev: any) => ({ ...prev, [field]: '' }))}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            제거
          </button>
        )}
      </div>
      {value && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            borderRadius: '6px',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          }}
        >
          <img
            src={value}
            alt={label}
            style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '4px' }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ─── Preview Panel ─── */
function PreviewPanel({
  formData,
  isDark,
  examName,
  subjectName,
}: {
  formData: any
  isDark: boolean
  examName: string
  subjectName: string
}) {
  const hasContent = formData.question_text || formData.choice_1

  if (!hasContent) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: isDark ? '#6b7280' : '#9ca3af',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '48px', opacity: 0.5 }}>&#128196;</div>
        <p style={{ fontSize: '15px' }}>왼쪽에서 문제를 입력하면</p>
        <p style={{ fontSize: '15px' }}>실시간으로 미리보기가 표시됩니다</p>
      </div>
    )
  }

  return (
    <div>
      <p
        style={{
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '16px',
          color: isDark ? '#9ca3af' : '#6b7280',
          textAlign: 'center',
        }}
      >
        학생에게 보이는 실제 시험 화면
      </p>

      {/* Simulated exam card */}
      <div
        style={{
          borderRadius: '12px',
          border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          backgroundColor: isDark ? '#111827' : '#f9fafb',
          padding: '8px',
        }}
      >
        <div
          style={{
            borderRadius: '8px',
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Question number badge */}
            <div
              style={{
                flexShrink: 0,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
                color: isDark ? '#93c5fd' : '#1d4ed8',
              }}
            >
              1
            </div>

            <div style={{ flex: 1 }}>
              {/* Exam + Subject badges */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.2)' : '#dbeafe',
                    color: isDark ? '#93c5fd' : '#1d4ed8',
                  }}
                >
                  {examName}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
                    color: isDark ? '#86efac' : '#166534',
                  }}
                >
                  {subjectName}
                </span>
                {formData.question_code && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontFamily: 'monospace',
                    }}
                  >
                    {formData.question_code}
                  </span>
                )}
                {formData.points > 1 && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3',
                      color: isDark ? '#fbbf24' : '#a16207',
                      fontWeight: 600,
                    }}
                  >
                    {formData.points}점
                  </span>
                )}
              </div>

              {/* Subject name */}
              <div
                style={{
                  fontSize: '13px',
                  marginBottom: '8px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                }}
              >
                {subjectName}
              </div>

              {/* Question text */}
              <div
                style={{
                  fontSize: '17px',
                  fontWeight: 500,
                  marginBottom: '16px',
                  color: isDark ? '#f3f4f6' : '#111827',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <MathText text={normalizeLineBreaks(formData.question_text)} />
              </div>

              {/* Image */}
              {formData.image_url && (
                <div style={{ marginBottom: '16px' }}>
                  <img
                    src={formData.image_url}
                    alt="문제 이미지"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Choices or Subjective indicator */}
              {formData.question_type === 'CHOICE' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[1, 2, 3, 4].map((choice) => {
                    const choiceText = formData[`choice_${choice}` as keyof typeof formData]
                    if (!choiceText) return null
                    const isCorrect = formData.answer === choice
                    return (
                      <div
                        key={choice}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: `2px solid ${
                            isCorrect
                              ? isDark ? '#22c55e' : '#16a34a'
                              : isDark ? '#374151' : '#e5e7eb'
                          }`,
                          backgroundColor: isCorrect
                            ? isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4'
                            : isDark ? 'rgba(55, 65, 81, 0.3)' : '#ffffff',
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            backgroundColor: isCorrect
                              ? isDark ? '#ffffff' : '#111827'
                              : isDark ? '#4b5563' : '#e5e7eb',
                            color: isCorrect
                              ? isDark ? '#111827' : '#ffffff'
                              : isDark ? '#d1d5db' : '#4b5563',
                          }}
                        >
                          {choice}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: '15px',
                            color: isDark ? '#e5e7eb' : '#111827',
                          }}
                        >
                          {formData[`choice_${choice}_image` as keyof typeof formData] ? (
                            <img
                              src={String(formData[`choice_${choice}_image` as keyof typeof formData])}
                              alt={`선택지 ${choice}`}
                              style={{ display: 'inline-block', maxHeight: '64px', verticalAlign: 'middle' }}
                            />
                          ) : (
                            <MathText text={normalizeLineBreaks(String(choiceText))} />
                          )}
                          {isCorrect && (
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: isDark ? '#4ade80' : '#16a34a',
                              }}
                            >
                              (정답)
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px dashed ${isDark ? '#4b5563' : '#d1d5db'}`,
                    backgroundColor: isDark ? 'rgba(55, 65, 81, 0.3)' : '#f9fafb',
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    marginBottom: formData.answer_text ? '8px' : 0,
                  }}>
                    {formData.question_type === 'SHORT_ANSWER' ? '단답형 주관식' : '서술형 주관식'}
                    {' '} - 학생이 직접 답안을 작성합니다
                  </div>
                  {formData.answer_text && (
                    <div style={{
                      fontSize: '13px',
                      color: isDark ? '#d1d5db' : '#374151',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                      border: `1px solid ${isDark ? '#22c55e40' : '#bbf7d0'}`,
                      textAlign: 'left',
                      whiteSpace: 'pre-wrap',
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#4ade80' : '#16a34a' }}>
                        참고 정답:
                      </span>{' '}
                      {formData.answer_text}
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {formData.explanation && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#1e3a5f' : '#bfdbfe'}`,
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: isDark ? '#93c5fd' : '#1d4ed8',
                    }}
                  >
                    해설
                  </p>
                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: isDark ? '#d1d5db' : '#374151',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    <MathText text={normalizeLineBreaks(formData.explanation)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

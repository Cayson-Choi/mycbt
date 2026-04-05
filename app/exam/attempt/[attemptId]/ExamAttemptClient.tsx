'use client'

import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import MathText from '@/components/MathText'
import ConfirmDialog from '@/components/ConfirmDialog'

// --- ExamTimer: isolated timer component so ticks don't re-render the question list ---
function ExamTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    return diff
  })

  useEffect(() => {
    const target = new Date(expiresAt).getTime()

    const update = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000))
      setTimeLeft(diff)
      if (diff === 0) onExpire()
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="text-right">
      <div
        className={`text-lg sm:text-2xl font-bold ${
          timeLeft < 300 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
        }`}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">남은 시간</div>
    </div>
  )
}

// --- QuestionCard: memoized so only the card whose answer changed re-renders ---
const QuestionCard = memo(function QuestionCard({
  question,
  index,
  selectedAnswer,
  answerText,
  onAnswer,
  onAnswerText,
}: {
  question: any
  index: number
  selectedAnswer: number | undefined
  answerText: string | undefined
  onAnswer: (questionId: number, choice: number) => void
  onAnswerText: (questionId: number, text: string) => void
}) {
  const questionType = question.question_type || 'MULTIPLE_CHOICE'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full font-bold text-sm text-blue-700 dark:text-blue-300">
          {index + 1}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{question.subject_name}</span>
        {questionType !== 'MULTIPLE_CHOICE' && (
          <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
            {questionType === 'SHORT_ANSWER' ? '단답형' : '서술형'}
          </span>
        )}
      </div>
      <div>
        <MathText
          text={question.question_text}
          className="text-base sm:text-lg font-medium mb-4 block dark:text-white"
        />

          {question.image_url && (
            <div className="mb-4">
              <Image
                src={question.image_url}
                alt="문제 이미지"
                width={400}
                height={280}
                className="max-w-sm max-h-[280px] w-auto h-auto rounded border border-gray-200"
                loading="lazy"
              />
            </div>
          )}

          {questionType === 'MULTIPLE_CHOICE' ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((choice) => (
                <label
                  key={choice}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === choice
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.question_id}`}
                    checked={selectedAnswer === choice}
                    onChange={() => onAnswer(question.question_id, choice)}
                    className="sr-only"
                  />
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      selectedAnswer === choice
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {choice}
                  </span>
                  <span className="flex-1 dark:text-gray-200">
                    {question[`choice_${choice}_image` as keyof PaperQuestion] ? (
                      <img
                        src={question[`choice_${choice}_image` as keyof PaperQuestion] as string}
                        alt={`선택지 ${choice}`}
                        className="inline-block max-h-16 align-middle"
                      />
                    ) : (
                      <MathText text={question[`choice_${choice}`]} />
                    )}
                  </span>
                </label>
              ))}
            </div>
          ) : questionType === 'SHORT_ANSWER' ? (
            <input
              type="text"
              value={answerText || ''}
              onChange={(e) => onAnswerText(question.question_id, e.target.value)}
              placeholder="답을 입력하세요"
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <textarea
              value={answerText || ''}
              onChange={(e) => onAnswerText(question.question_id, e.target.value)}
              placeholder="답안을 작성하세요"
              rows={5}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-700 dark:text-white resize-vertical"
            />
          )}
      </div>
    </div>
  )
})

// --- QuitButton: isolated so opening the quit dialog doesn't re-render the question list ---
function QuitButton({ attemptId }: { attemptId: string }) {
  const router = useRouter()
  const [showQuit, setShowQuit] = useState(false)

  const handleQuit = () => {
    setShowQuit(false)
    // 시험 기록 완전 삭제 (fire-and-forget)
    fetch(`/api/attempts/${attemptId}/abandon`, { method: 'POST' }).catch(() => {})
    router.push('/')
  }

  return (
    <>
      <button
        onClick={() => setShowQuit(true)}
        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
      >
        중단
      </button>
      <ConfirmDialog
        open={showQuit}
        title="시험 중단"
        message={"시험을 중단하시겠습니까?\n작성한 답안은 모두 삭제됩니다."}
        confirmText="중단하기"
        confirmColor="red"
        onConfirm={handleQuit}
        onCancel={() => setShowQuit(false)}
      />
    </>
  )
}

// --- SubmitSection: isolated so opening submit dialogs doesn't re-render the question list ---
function SubmitSection({
  answeredCount,
  totalCount,
  attemptId,
  onError,
}: {
  answeredCount: number
  totalCount: number
  attemptId: string
  onError: (msg: string) => void
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [confirmType, setConfirmType] = useState<
    null | 'submit-unanswered' | 'submit'
  >(null)

  const handleSubmitClick = () => {
    if (answeredCount < totalCount) {
      setConfirmType('submit-unanswered')
    } else {
      setConfirmType('submit')
    }
  }

  const doSubmit = async () => {
    setConfirmType(null)
    setSubmitting(true)

    // 브라우저에 paint 기회를 줘서 "제출 중..." 즉시 표시
    await new Promise(resolve => setTimeout(resolve, 0))

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        onError(data.error || '제출에 실패했습니다')
        setSubmitting(false)
        return
      }

      router.push(`/exam/result/${attemptId}`)
    } catch {
      onError('오류가 발생했습니다')
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-gray-600 dark:text-gray-400">
            {answeredCount === totalCount
              ? '모든 문제를 풀었습니다'
              : `${totalCount - answeredCount}문제가 남았습니다`}
          </div>
          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? '제출 중...' : '시험 제출'}
          </button>
        </div>
      </div>

      {/* 미답 문제 제출 확인 */}
      <ConfirmDialog
        open={confirmType === 'submit-unanswered'}
        title="미완료 문제 있음"
        message={`${totalCount - answeredCount}문제를 풀지 않았습니다.\n정말 제출하시겠습니까?`}
        confirmText="제출하기"
        confirmColor="green"
        onConfirm={() => setConfirmType('submit')}
        onCancel={() => setConfirmType(null)}
      />

      {/* 최종 제출 확인 */}
      <ConfirmDialog
        open={confirmType === 'submit'}
        title="시험 제출"
        message={"시험을 제출하시겠습니까?\n제출 후에는 수정할 수 없습니다."}
        confirmText="제출"
        confirmColor="green"
        onConfirm={doSubmit}
        onCancel={() => setConfirmType(null)}
      />
    </>
  )
}

// --- Types ---
export interface PaperQuestion {
  seq: number
  question_id: number
  question_code: string | null
  question_text: string
  question_type: string
  choice_1: string | null
  choice_2: string | null
  choice_3: string | null
  choice_4: string | null
  choice_1_image: string | null
  choice_2_image: string | null
  choice_3_image: string | null
  choice_4_image: string | null
  image_url: string | null
  subject_name: string
  selected: number | null
  answer_text: string | null
}

export interface PaperData {
  attempt_id: number
  exam_name: string
  exam_mode: string
  exam_type: string
  expires_at: string
  total_questions: number
  questions: PaperQuestion[]
}

// --- Main client component ---
export default function ExamAttemptClient({
  attemptId,
  paper,
}: {
  attemptId: string
  paper: PaperData
}) {
  const router = useRouter()

  const [answers, setAnswers] = useState<Map<number, number>>(() => {
    const map = new Map<number, number>()
    paper.questions.forEach((q) => {
      if (q.selected) map.set(q.question_id, q.selected)
    })
    return map
  })
  const [textAnswers, setTextAnswers] = useState<Map<number, string>>(() => {
    const map = new Map<number, string>()
    paper.questions.forEach((q) => {
      if (q.answer_text) map.set(q.question_id, q.answer_text)
    })
    return map
  })
  const [error, setError] = useState('')
  const [timeExpired, setTimeExpired] = useState(false)

  const handleAnswer = useCallback((questionId: number, choice: number) => {
    // UI 즉시 업데이트
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, choice)
      return next
    })

    // 서버에 저장 (fire-and-forget: await 없이 백그라운드 저장)
    fetch(`/api/attempts/${attemptId}/answer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: questionId, selected: choice }),
    }).catch(err => console.error('답안 저장 실패:', err))
  }, [attemptId])

  // 주관식 답안 저장 (debounced)
  const textSaveTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const handleAnswerText = useCallback((questionId: number, text: string) => {
    // UI 즉시 업데이트
    setTextAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, text)
      return next
    })

    // 기존 타이머 클리어
    const existing = textSaveTimers.current.get(questionId)
    if (existing) clearTimeout(existing)

    // 500ms 디바운스 후 서버 저장
    const timer = setTimeout(() => {
      fetch(`/api/attempts/${attemptId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, answer_text: text }),
      }).catch(err => console.error('답안 저장 실패:', err))
      textSaveTimers.current.delete(questionId)
    }, 500)
    textSaveTimers.current.set(questionId, timer)
  }, [attemptId])

  const handleExpire = useCallback(() => {
    setTimeExpired(true)
  }, [])

  const handleError = useCallback((msg: string) => {
    setError(msg)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // 객관식 답안 + 주관식 답안(비어있지 않은) 합산
  const answeredCount = (() => {
    let count = answers.size
    textAnswers.forEach((text, qid) => {
      if (text.trim() && !answers.has(qid)) count++
    })
    return count
  })()
  const totalCount = paper.questions.length

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 상단 고정 바 */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 fixed top-0 left-0 right-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            {/* 모바일: 2줄 (시험명 | 시간+중단), PC: 1줄 */}
            <div className="flex justify-between items-center gap-2">
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold dark:text-white truncate">
                  <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded mr-1.5 align-middle ${
                    paper.exam_type === 'PRACTICAL'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  }`}>
                    {paper.exam_type === 'PRACTICAL' ? '실기' : '필기'}
                  </span>
                  {paper.exam_name}
                  {paper.exam_mode === 'OFFICIAL' && (
                    <span className="ml-1.5 text-[10px] sm:text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full font-semibold align-middle">
                      공식
                    </span>
                  )}
                </h1>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  답안: {answeredCount} / {totalCount}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ExamTimer expiresAt={paper.expires_at} onExpire={handleExpire} />
                <QuitButton attemptId={attemptId} />
              </div>
            </div>
          </div>
        </div>

        {/* 문제 */}
        <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
          <div className="space-y-8">
            {paper.questions.map((question, index) => (
              <QuestionCard
                key={question.question_id}
                question={question}
                index={index}
                selectedAnswer={answers.get(question.question_id)}
                answerText={textAnswers.get(question.question_id)}
                onAnswer={handleAnswer}
                onAnswerText={handleAnswerText}
              />
            ))}
          </div>

          {/* 제출 버튼 */}
          <SubmitSection
            answeredCount={answeredCount}
            totalCount={totalCount}
            attemptId={attemptId}
            onError={handleError}
          />
        </div>

        {/* 시간 만료 안내 */}
        <ConfirmDialog
          open={timeExpired}
          title="시험 시간 종료"
          message="시험 시간이 종료되었습니다."
          confirmText="확인"
          cancelText="확인"
          onConfirm={() => router.push('/')}
          onCancel={() => router.push('/')}
        />
      </div>
    </>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import MathText from '@/components/MathText'

interface RetryQuestion {
  question_id: number
  question_code: string
  question_text: string
  subject_name: string
  choice_1: string | null
  choice_2: string | null
  choice_3: string | null
  choice_4: string | null
  choice_1_image: string | null
  choice_2_image: string | null
  choice_3_image: string | null
  choice_4_image: string | null
  correct_answer: number
  explanation: string | null
  wrong_count: number
}

export default function RetryClient({
  questions,
}: {
  questions: RetryQuestion[]
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Map<number, number>>(new Map())
  const [showAnswer, setShowAnswer] = useState(false)
  const [finished, setFinished] = useState(false)

  const total = questions.length
  const current = questions[currentIdx]
  const selectedAnswer = answers.get(current?.question_id ?? -1)

  const stats = useMemo(() => {
    let correct = 0
    let incorrect = 0
    for (const q of questions) {
      const sel = answers.get(q.question_id)
      if (sel === undefined) continue
      if (sel === q.correct_answer) correct++
      else incorrect++
    }
    return { correct, incorrect, answered: correct + incorrect }
  }, [answers, questions])

  function selectChoice(choice: number) {
    if (showAnswer) return
    setAnswers((prev) => new Map(prev).set(current.question_id, choice))
  }

  function checkAnswer() {
    if (selectedAnswer === undefined) return
    setShowAnswer(true)
  }

  function nextQuestion() {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1)
      setShowAnswer(false)
    } else {
      setFinished(true)
    }
  }

  function prevQuestion() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
      setShowAnswer(answers.has(questions[currentIdx - 1].question_id))
    }
  }

  function restart() {
    setCurrentIdx(0)
    setAnswers(new Map())
    setShowAnswer(false)
    setFinished(false)
  }

  if (!current) return null

  // 완료 화면
  if (finished) {
    const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 border dark:border-gray-700 text-center">
            <div className="text-6xl mb-4">
              {accuracy === 100 ? '🏆' : accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
            </div>
            <h1 className="text-3xl font-bold mb-2 dark:text-white">다시 풀기 완료!</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              총 {total}문제를 다시 풀었습니다
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.correct}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">정답</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 border border-red-200 dark:border-red-700">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.incorrect}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">오답</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {accuracy}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">정답률</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={restart}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                다시 풀기
              </button>
              <Link
                href="/my/wrong-answers"
                className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                오답노트로
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 풀이 화면
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-5 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/my/wrong-answers"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← 오답노트
            </Link>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-bold text-blue-600 dark:text-blue-400">{currentIdx + 1}</span>
              {' / '}
              {total}
            </div>
          </div>
          {/* 진행률 바 */}
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="text-green-600 dark:text-green-400 font-semibold">
              ✓ {stats.correct}
            </span>
            <span className="text-red-600 dark:text-red-400 font-semibold">
              ✗ {stats.incorrect}
            </span>
          </div>
        </div>

        {/* 문제 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 border dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
              {current.subject_name}
            </span>
            {current.wrong_count >= 2 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                🔁 {current.wrong_count}회 오답
              </span>
            )}
          </div>

          <MathText
            text={current.question_text}
            className="text-base sm:text-lg font-medium mb-5 dark:text-white block"
          />

          <div className="space-y-2 mb-5">
            {[1, 2, 3, 4].map((choice) => {
              const isSelected = selectedAnswer === choice
              const isCorrect = choice === current.correct_answer
              let border = 'border-gray-200 dark:border-gray-600'
              let bg = ''
              if (showAnswer) {
                if (isCorrect) {
                  border = 'border-green-500 dark:border-green-400'
                  bg = 'bg-green-50 dark:bg-green-900/30'
                } else if (isSelected) {
                  border = 'border-red-500 dark:border-red-400'
                  bg = 'bg-red-50 dark:bg-red-900/30'
                }
              } else if (isSelected) {
                border = 'border-blue-500 dark:border-blue-400'
                bg = 'bg-blue-50 dark:bg-blue-900/30'
              }

              const choiceImage = current[`choice_${choice}_image` as keyof RetryQuestion] as string | null
              const choiceText = current[`choice_${choice}` as keyof RetryQuestion] as string | null

              return (
                <button
                  key={choice}
                  onClick={() => selectChoice(choice)}
                  disabled={showAnswer}
                  className={`w-full text-left p-3 border-2 rounded-lg transition-all ${border} ${bg} ${
                    showAnswer ? 'cursor-default' : 'hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        showAnswer && isCorrect
                          ? 'bg-green-500 text-white'
                          : showAnswer && isSelected
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {choice}
                    </span>
                    <span className="flex-1 dark:text-gray-200">
                      {choiceImage ? (
                        <img
                          src={choiceImage}
                          alt={`선택지 ${choice}`}
                          className="inline-block max-h-32 align-middle"
                        />
                      ) : (
                        <MathText text={choiceText || ''} />
                      )}
                    </span>
                    {showAnswer && isCorrect && (
                      <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400">
                        ✓ 정답
                      </span>
                    )}
                    {showAnswer && isSelected && !isCorrect && (
                      <span className="ml-auto text-xs font-bold text-red-600 dark:text-red-400">
                        ✗ 오답
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 해설 */}
          {showAnswer && current.explanation && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">💡 해설</div>
              <MathText
                text={current.explanation}
                className="text-blue-800 dark:text-blue-300"
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentIdx === 0}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← 이전
            </button>
            <div className="flex gap-2">
              {!showAnswer ? (
                <button
                  onClick={checkAnswer}
                  disabled={selectedAnswer === undefined}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  정답 확인
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {currentIdx < total - 1 ? '다음 →' : '완료'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

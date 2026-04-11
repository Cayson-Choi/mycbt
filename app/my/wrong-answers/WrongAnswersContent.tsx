'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MathText from '@/components/MathText'

interface SubjectStat {
  subject_name: string
  attempted: number
  wrong: number
  error_rate: number
}

interface WrongAnswer {
  attempt_id: number
  attempt_date: string
  exam_id: number
  exam_name: string
  exam_type: string
  subject_id: number
  subject_name: string
  question_id: number
  question_code: string
  question_text: string
  choice_1: string | null
  choice_2: string | null
  choice_3: string | null
  choice_4: string | null
  choice_1_image: string | null
  choice_2_image: string | null
  choice_3_image: string | null
  choice_4_image: string | null
  correct_answer: number
  student_answer: number
  explanation: string | null
  wrong_count: number
  bookmarked: boolean
  user_memo: string | null
}

interface TrendDay {
  date: string
  count: number
}

interface WrongAnswersData {
  wrong_answers: WrongAnswer[]
  total_count: number
  total_attempted: number
  subject_stats: SubjectStat[]
  trend_data: TrendDay[]
}

type FilterMode = 'all' | 'bookmarked' | 'repeated' | string // string = subject_name

export default function WrongAnswersContent({ data }: { data: WrongAnswersData }) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterMode>('all')
  const [answers, setAnswers] = useState(data.wrong_answers)
  const [memoEditing, setMemoEditing] = useState<number | null>(null)
  const [memoDraft, setMemoDraft] = useState('')

  useEffect(() => {
    router.prefetch('/my')
    router.prefetch('/')
  }, [router])

  // 필터링
  const filteredAnswers = useMemo(() => {
    if (filter === 'all') return answers
    if (filter === 'bookmarked') return answers.filter((a) => a.bookmarked)
    if (filter === 'repeated') return answers.filter((a) => a.wrong_count >= 2)
    return answers.filter((a) => a.subject_name === filter)
  }, [answers, filter])

  // 북마크 수, 반복 오답 수
  const bookmarkedCount = useMemo(() => answers.filter((a) => a.bookmarked).length, [answers])
  const repeatedCount = useMemo(() => answers.filter((a) => a.wrong_count >= 2).length, [answers])

  // 전체 오답률
  const overallErrorRate = data.total_attempted > 0
    ? Math.round((data.total_count / data.total_attempted) * 1000) / 10
    : 0

  // 최대 트렌드 값 (차트 스케일링용)
  const maxTrendCount = Math.max(1, ...data.trend_data.map((d) => d.count))

  // 북마크 토글
  async function toggleBookmark(questionId: number, current: boolean) {
    const next = !current
    setAnswers((prev) =>
      prev.map((a) => (a.question_id === questionId ? { ...a, bookmarked: next } : a))
    )
    try {
      await fetch('/api/my/wrong-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, bookmarked: next }),
      })
    } catch {
      // rollback
      setAnswers((prev) =>
        prev.map((a) => (a.question_id === questionId ? { ...a, bookmarked: current } : a))
      )
    }
  }

  // 메모 저장
  async function saveMemo(questionId: number) {
    const memo = memoDraft.trim() || null
    setAnswers((prev) =>
      prev.map((a) => (a.question_id === questionId ? { ...a, user_memo: memo } : a))
    )
    setMemoEditing(null)
    try {
      await fetch('/api/my/wrong-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, userMemo: memo }),
      })
    } catch {}
  }

  function startMemoEdit(item: WrongAnswer) {
    setMemoEditing(item.question_id)
    setMemoDraft(item.user_memo || '')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">오답노트</h1>
          <p className="text-gray-600 dark:text-gray-400">
            틀린 문제를 복습하고 약점을 보완하세요
          </p>
        </div>

        {answers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-16 text-center border dark:border-gray-700">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              오답이 없습니다!
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              모든 문제를 맞혔거나 아직 시험을 보지 않았습니다.
            </div>
            <Link
              href="/"
              className="inline-block mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              시험 풀러 가기
            </Link>
          </div>
        ) : (
          <>
            {/* 상단 통계 카드 4개 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <StatCard
                label="총 오답"
                value={`${data.total_count}`}
                unit="문제"
                color="red"
                icon="📕"
              />
              <StatCard
                label="전체 오답률"
                value={`${overallErrorRate}`}
                unit="%"
                color="orange"
                icon="📊"
              />
              <StatCard
                label="반복 오답"
                value={`${repeatedCount}`}
                unit="문제"
                color="purple"
                icon="🔁"
              />
              <StatCard
                label="북마크"
                value={`${bookmarkedCount}`}
                unit="문제"
                color="yellow"
                icon="⭐"
              />
            </div>

            {/* 과목별 약점 분석 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 mb-6 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  <span>🎯</span> 과목별 약점 분석
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">오답률 순</span>
              </div>
              <div className="space-y-3">
                {data.subject_stats.map((stat) => {
                  const barColor =
                    stat.error_rate >= 50
                      ? 'bg-red-500'
                      : stat.error_rate >= 30
                      ? 'bg-orange-500'
                      : stat.error_rate >= 15
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  return (
                    <div key={stat.subject_name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {stat.subject_name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            {stat.wrong}
                          </span>
                          {' / '}
                          {stat.attempted}
                          {' ('}
                          <span className="font-semibold">{stat.error_rate}%</span>
                          {')'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.min(100, stat.error_rate)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 최근 30일 오답 트렌드 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 mb-6 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                  <span>📈</span> 최근 30일 오답 트렌드
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  일별 오답 발생 수
                </span>
              </div>
              <div className="flex items-end gap-0.5 sm:gap-1 h-24">
                {data.trend_data.map((d) => {
                  const h = d.count === 0 ? 3 : Math.max(6, (d.count / maxTrendCount) * 96)
                  const color = d.count === 0
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : d.count >= maxTrendCount * 0.7
                    ? 'bg-red-500'
                    : d.count >= maxTrendCount * 0.4
                    ? 'bg-orange-400'
                    : 'bg-blue-400'
                  return (
                    <div
                      key={d.date}
                      className="flex-1 group relative"
                    >
                      <div
                        className={`w-full rounded-t ${color} transition-all`}
                        style={{ height: `${h}px` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {d.date.slice(5)} · {d.count}개
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
                <span>{data.trend_data[0]?.date.slice(5)}</span>
                <span>오늘</span>
              </div>
            </div>

            {/* 필터 + 다시 풀기 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 mb-6 border dark:border-gray-700">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="font-semibold dark:text-white">필터</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                    — {filteredAnswers.length}문제
                  </span>
                </div>
                {filteredAnswers.length > 0 && (
                  <Link
                    href={`/my/wrong-answers/retry?filter=${encodeURIComponent(filter)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold text-sm shadow-md transition-all"
                  >
                    <span>▶</span> 다시 풀기 ({filteredAnswers.length}문제)
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                  label="전체"
                  count={answers.length}
                  color="blue"
                />
                <FilterButton
                  active={filter === 'repeated'}
                  onClick={() => setFilter('repeated')}
                  label="🔁 반복 오답"
                  count={repeatedCount}
                  color="purple"
                />
                <FilterButton
                  active={filter === 'bookmarked'}
                  onClick={() => setFilter('bookmarked')}
                  label="⭐ 북마크"
                  count={bookmarkedCount}
                  color="yellow"
                />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-600 mx-1" />
                {data.subject_stats.map((stat) => (
                  <FilterButton
                    key={stat.subject_name}
                    active={filter === stat.subject_name}
                    onClick={() => setFilter(stat.subject_name)}
                    label={stat.subject_name}
                    count={stat.wrong}
                    color="red"
                  />
                ))}
              </div>
            </div>

            {/* 오답 문제 목록 */}
            {filteredAnswers.length > 0 ? (
              <div className="space-y-5">
                {filteredAnswers.map((item, index) => (
                  <div
                    key={`${item.attempt_id}-${item.question_id}`}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 sm:p-6 border dark:border-gray-700 border-l-4 border-l-red-500 dark:border-l-red-400"
                  >
                    {/* 상단 태그 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      {item.wrong_count >= 2 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                          🔁 {item.wrong_count}회 오답
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.exam_type === 'PRACTICAL'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      }`}>
                        {item.exam_type === 'PRACTICAL' ? '실기' : '필기'}
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                        {item.exam_name}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
                        {item.subject_name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                        {new Date(item.attempt_date).toLocaleDateString('ko-KR')}
                      </span>
                      <button
                        onClick={() => toggleBookmark(item.question_id, item.bookmarked)}
                        className={`text-lg leading-none transition-transform hover:scale-110 ${
                          item.bookmarked ? '' : 'opacity-30 hover:opacity-70'
                        }`}
                        title={item.bookmarked ? '북마크 해제' : '북마크'}
                      >
                        {item.bookmarked ? '⭐' : '☆'}
                      </button>
                    </div>

                    <MathText
                      text={item.question_text}
                      className="text-base sm:text-lg font-medium mb-4 dark:text-white block"
                    />

                    {/* 보기 */}
                    <div className="space-y-2 mb-4">
                      {[1, 2, 3, 4].map((choice) => {
                        const isCorrect = choice === item.correct_answer
                        const isSelected = choice === item.student_answer
                        return (
                          <div
                            key={choice}
                            className={`p-3 border-2 rounded-lg ${
                              isCorrect
                                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30'
                                : isSelected
                                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30'
                                : 'border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isCorrect
                                    ? 'bg-green-500 text-white'
                                    : isSelected
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {choice}
                              </span>
                              <span className="flex-1 dark:text-gray-200">
                                {item[`choice_${choice}_image` as keyof WrongAnswer] ? (
                                  <img
                                    src={item[`choice_${choice}_image` as keyof WrongAnswer] as string}
                                    alt={`선택지 ${choice}`}
                                    className="inline-block max-h-32 align-middle"
                                  />
                                ) : (
                                  <MathText text={(item[`choice_${choice}` as keyof WrongAnswer] as string) || ''} />
                                )}
                              </span>
                              {isCorrect && (
                                <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400">
                                  (정답)
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="ml-auto text-xs font-bold text-red-600 dark:text-red-400">
                                  (내 선택)
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* 해설 */}
                    {item.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-3">
                        <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">💡 해설</div>
                        <MathText
                          text={item.explanation}
                          className="text-blue-800 dark:text-blue-300"
                        />
                      </div>
                    )}

                    {/* 내 메모 */}
                    <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                          📝 내 메모
                        </span>
                        {memoEditing !== item.question_id && (
                          <button
                            onClick={() => startMemoEdit(item)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {item.user_memo ? '수정' : '메모 추가'}
                          </button>
                        )}
                      </div>
                      {memoEditing === item.question_id ? (
                        <div>
                          <textarea
                            value={memoDraft}
                            onChange={(e) => setMemoDraft(e.target.value)}
                            placeholder="틀린 이유, 주의사항, 핵심 개념 등을 메모하세요..."
                            className="w-full text-sm p-2 border border-yellow-300 dark:border-yellow-700 rounded bg-white dark:bg-gray-800 dark:text-white resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setMemoEditing(null)}
                              className="text-xs px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => saveMemo(item.question_id)}
                              className="text-xs px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium"
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap min-h-[1.25rem]">
                          {item.user_memo || (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              메모가 없습니다
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border dark:border-gray-700">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  조건에 맞는 오답이 없습니다
                </div>
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                  다른 필터를 선택해보세요
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── 통계 카드 컴포넌트 ───
function StatCard({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string
  value: string
  unit: string
  color: 'red' | 'orange' | 'purple' | 'yellow'
  icon: string
}) {
  const colorClasses = {
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
    purple: 'text-purple-600 dark:text-purple-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-lg sm:text-xl">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl sm:text-3xl font-bold ${colorClasses[color]}`}>{value}</span>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{unit}</span>
      </div>
    </div>
  )
}

// ─── 필터 버튼 컴포넌트 ───
function FilterButton({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  color: 'blue' | 'red' | 'purple' | 'yellow'
}) {
  const activeColors = {
    blue: 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white shadow-md',
    red: 'bg-red-600 dark:bg-red-500 border-red-600 dark:border-red-500 text-white shadow-md',
    purple: 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500 text-white shadow-md',
    yellow: 'bg-yellow-500 dark:bg-yellow-500 border-yellow-500 dark:border-yellow-500 text-white shadow-md',
  }
  const badgeColors = {
    blue: active ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    red: active ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300',
    purple: active ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
    yellow: active ? 'bg-white/20 text-white' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300',
  }
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all text-sm ${
        active
          ? activeColors[color]
          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${badgeColors[color]}`}>
        {count}
      </span>
    </button>
  )
}

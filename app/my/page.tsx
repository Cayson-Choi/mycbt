import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import AttemptHistoryClient from "./AttemptHistoryClient"
import { TIER_LABELS } from "@/lib/tier"

const TIER_BADGE_STYLE: Record<string, string> = {
  FREE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  BRONZE: "bg-amber-700/30 text-amber-300 border-amber-700/40",
  SILVER: "bg-slate-400/20 text-slate-200 border-slate-400/40",
  GOLD: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  PREMIUM: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  ADMIN: "bg-rose-500/20 text-rose-300 border-rose-500/40",
}

export default async function MyPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?redirect=/my")
  }

  const userId = session.user.id

  const [profile, attempts, memoCount, wrongCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, nickname: true, email: true, tier: true, image: true, isAdmin: true, createdAt: true },
    }),
    prisma.attempt.findMany({
      where: { userId, status: "SUBMITTED" },
      select: {
        id: true, examId: true, startedAt: true, submittedAt: true,
        totalScore: true, gradingStatus: true,
        exam: { select: { name: true, examType: true } },
      },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.videoMemo.count({ where: { userId } }).catch(() => 0),
    prisma.wrongNoteItem.count({ where: { userId, bookmarked: true } }).catch(() => 0),
  ])

  // 과목별 점수 일괄 조회
  const attemptIds = attempts.map((a) => a.id)
  const allSubjectScores =
    attemptIds.length > 0
      ? await prisma.subjectScore.findMany({
          where: { attemptId: { in: attemptIds } },
          select: {
            attemptId: true, subjectId: true, subjectScore: true,
            subjectCorrect: true, subjectQuestions: true,
            subject: { select: { name: true } },
          },
          orderBy: { subjectId: "asc" },
        })
      : []

  type AttemptSubjectScore = {
    attempt_id: number
    subject_id: number
    subject_score: number
    subject_correct: number
    subject_questions: number
    subjects: { name: string }
  }
  const scoresByAttempt = new Map<number, AttemptSubjectScore[]>()
  for (const s of allSubjectScores) {
    const list = scoresByAttempt.get(s.attemptId) || []
    list.push({
      attempt_id: s.attemptId, subject_id: s.subjectId,
      subject_score: s.subjectScore, subject_correct: s.subjectCorrect,
      subject_questions: s.subjectQuestions, subjects: { name: s.subject.name },
    })
    scoresByAttempt.set(s.attemptId, list)
  }

  const attemptsWithSubjects = attempts.map((a) => ({
    id: a.id, exam_id: a.examId,
    started_at: a.startedAt.toISOString(),
    submitted_at: a.submittedAt?.toISOString() ?? null,
    total_score: a.totalScore, grading_status: a.gradingStatus,
    exam_name: a.exam?.name || "알 수 없음",
    exam_type: a.exam?.examType || "WRITTEN",
    subject_scores: scoresByAttempt.get(a.id) || [],
  }))

  // 통계
  const totalAttempts = attempts.length
  const scores = attempts.map((a) => a.totalScore).filter((s): s is number => s !== null)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const passCount = scores.filter((s) => s >= 60).length
  const passRate = totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0

  // 시험별 통계
  const examStatsMap: Record<number, { exam_id: number; exam_name: string; count: number; scores: number[] }> = {}
  for (const a of attempts) {
    const id = a.examId
    if (!examStatsMap[id]) {
      examStatsMap[id] = { exam_id: id, exam_name: a.exam?.name || "알 수 없음", count: 0, scores: [] }
    }
    examStatsMap[id].count++
    if (a.totalScore !== null) examStatsMap[id].scores.push(a.totalScore)
  }
  const examStats = Object.values(examStatsMap).map((s) => ({
    exam_id: s.exam_id, exam_name: s.exam_name, attempt_count: s.count,
    avg_score: s.scores.length > 0 ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 0,
    max_score: s.scores.length > 0 ? Math.max(...s.scores) : 0,
  }))

  const displayName = profile?.nickname || profile?.name || profile?.email?.split("@")[0] || "회원"
  const tierKey = profile?.tier ?? "FREE"
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
    : null

  return (
    <div className="min-h-screen bg-[#FEFDF5] dark:bg-gray-950">
      {/* ════════ 프로필 히어로 ════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#243558] to-[#2A3F6A] text-white">
        {/* CAYSON 워터마크 */}
        <span
          className="absolute top-1/2 left-1/2 text-[140px] sm:text-[200px] font-black text-white/[0.04] select-none leading-none tracking-tight whitespace-nowrap pointer-events-none"
          style={{ transform: "translate(-50%, -50%) rotate(-15deg)" }}
        >
          CAYSON
        </span>
        {/* 노이즈 질감 */}
        <div
          className="absolute inset-0 opacity-[0.4] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='nf'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nf)'/></svg>\")",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="text-xs text-amber-400 tracking-[0.3em] uppercase mb-3 font-semibold">My Page</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
            {/* 아바타 */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-3xl sm:text-4xl font-black text-[#1B2A4A] shadow-lg ring-4 ring-white/10 shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2">
                {displayName}
                <span className="text-base sm:text-lg font-medium text-white/60 ml-1">님</span>
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    TIER_BADGE_STYLE[tierKey] ?? TIER_BADGE_STYLE.FREE
                  }`}
                >
                  {TIER_LABELS[tierKey] ?? tierKey} 등급
                </span>
                {profile?.isAdmin && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    운영자
                  </span>
                )}
                {profile?.email && (
                  <span className="text-xs text-white/60 truncate">{profile.email}</span>
                )}
              </div>
              {memberSince && (
                <p className="text-[11px] text-white/40 mt-2">가입일 · {memberSince}</p>
              )}
            </div>
            <Link
              href="/my/profile"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-semibold border border-white/15 transition self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              프로필 설정
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 메인 ════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
        {/* KPI */}
        <section>
          <h2 className="text-base sm:text-lg font-bold text-[#1B2A4A] dark:text-white mb-4">학습 현황</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard label="총 응시" value={`${totalAttempts}회`} accent="from-blue-500 to-blue-600" />
            <KpiCard label="평균 점수" value={`${avgScore}점`} accent="from-emerald-500 to-emerald-600" />
            <KpiCard label="최고 점수" value={`${maxScore}점`} accent="from-violet-500 to-violet-600" />
            <KpiCard label="합격률" value={`${passRate}%`} sub={`${passCount}회 합격`} accent="from-amber-500 to-amber-600" />
          </div>
        </section>

        {/* 빠른 메뉴 */}
        <section>
          <h2 className="text-base sm:text-lg font-bold text-[#1B2A4A] dark:text-white mb-4">바로가기</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <QuickLink
              href="/my/memos"
              title="학습 메모"
              desc="강의 시청 메모 모아보기"
              count={memoCount}
              iconBg="bg-amber-100 dark:bg-amber-900/30"
              iconColor="text-amber-600 dark:text-amber-400"
              icon={
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              }
            />
            <QuickLink
              href="/my/wrong-answers"
              title="오답노트"
              desc="틀린 문제 다시 풀기"
              count={wrongCount}
              iconBg="bg-rose-100 dark:bg-rose-900/30"
              iconColor="text-rose-600 dark:text-rose-400"
              icon={<path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />}
            />
            <QuickLink
              href="/my/profile"
              title="프로필"
              desc="정보 수정 · 회원 탈퇴"
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600 dark:text-blue-400"
              icon={<path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />}
            />
            <QuickLink
              href="/"
              title="홈으로"
              desc="시험·강의 둘러보기"
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600 dark:text-emerald-400"
              icon={<path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />}
            />
          </div>
        </section>

        {/* 시험별 성적 */}
        {examStats.length > 0 && (
          <section>
            <h2 className="text-base sm:text-lg font-bold text-[#1B2A4A] dark:text-white mb-4">시험별 성적</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {examStats.map((exam) => (
                <div
                  key={exam.exam_id}
                  className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-[#C9A84C]/15 dark:border-gray-700 p-5 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-bl-full pointer-events-none" />
                  <h3 className="font-bold text-base sm:text-lg text-[#1B2A4A] dark:text-white mb-3 line-clamp-1">
                    {exam.exam_name}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <Row label="응시" value={`${exam.attempt_count}회`} valueClass="text-[#1B2A4A] dark:text-white" />
                    <Row label="평균" value={`${exam.avg_score}점`} valueClass="text-emerald-600 dark:text-emerald-400 font-bold" />
                    <Row label="최고" value={`${exam.max_score}점`} valueClass="text-violet-600 dark:text-violet-400 font-bold" />
                  </div>
                  {/* 평균 진행도 */}
                  <div className="mt-4">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, exam.avg_score)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 응시 기록 */}
        <section>
          <h2 className="text-base sm:text-lg font-bold text-[#1B2A4A] dark:text-white mb-4">응시 기록</h2>
          <AttemptHistoryClient attempts={attemptsWithSubjects} examStats={examStats} />
        </section>
      </main>
    </div>
  )
}

function KpiCard({
  label, value, sub, accent,
}: {
  label: string; value: string; sub?: string; accent: string
}) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-[#C9A84C]/15 dark:border-gray-700 p-4 sm:p-5 shadow-sm hover:shadow-md transition">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1.5">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-[#1B2A4A] dark:text-white tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function QuickLink({
  href, title, desc, count, iconBg, iconColor, icon,
}: {
  href: string; title: string; desc: string; count?: number
  iconBg: string; iconColor: string; icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-[#C9A84C]/15 dark:border-gray-700 p-4 sm:p-5 hover:shadow-lg hover:shadow-[#C9A84C]/10 hover:-translate-y-0.5 transition-all flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${iconBg} flex items-center justify-center`}>
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
        {typeof count === "number" && count > 0 && (
          <span className="text-xs font-bold bg-[#1B2A4A]/5 dark:bg-white/10 text-[#1B2A4A] dark:text-white px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <h3 className="font-bold text-base sm:text-lg text-[#1B2A4A] dark:text-white mb-0.5">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      <span className="text-[#C9A84C] mt-3 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
        바로가기
        <span className="inline-block group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
      </span>
    </Link>
  )
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-gray-500 dark:text-gray-400 text-xs">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const supabase = await createClient()
    const { examId } = await params

    // 전체 문제 수 + 과목 목록 병렬 조회
    const [countResult, subjectsResult] = await Promise.all([
      supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('exam_id', examId)
        .eq('is_active', true),
      supabase
        .from('subjects')
        .select('id')
        .eq('exam_id', examId)
        .order('order_no'),
    ])

    if (countResult.error) {
      return NextResponse.json({ error: '조회 실패' }, { status: 500 })
    }

    // 과목별 문제 수 병렬 조회
    const bySubject: Record<number, number> = {}
    if (subjectsResult.data && subjectsResult.data.length > 0) {
      const subjectCounts = await Promise.all(
        subjectsResult.data.map((s) =>
          supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', examId)
            .eq('subject_id', s.id)
            .eq('is_active', true)
        )
      )
      subjectsResult.data.forEach((s, i) => {
        bySubject[s.id] = subjectCounts[i].count || 0
      })
    }

    const response = NextResponse.json({ count: countResult.count || 0, bySubject })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

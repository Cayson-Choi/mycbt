import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const supabase = await createClient()
    const { examId } = await params

    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', examId)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: '조회 실패' }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

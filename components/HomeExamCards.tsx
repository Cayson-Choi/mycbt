import { createClient } from '@/lib/supabase/server'
import ExamCards from './ExamCards'

export default async function HomeExamCards() {
  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, name, exam_mode, duration_minutes, created_at, is_published, sort_order')
    .order('sort_order')

  const visibleExams = exams?.filter(e => e.exam_mode !== 'OFFICIAL' || e.is_published) || []

  return <ExamCards initialExams={visibleExams} />
}

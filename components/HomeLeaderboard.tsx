import { createClient } from '@/lib/supabase/server'
import Leaderboard from './Leaderboard'

export default async function HomeLeaderboard() {
  const supabase = await createClient()
  const { data: exams } = await supabase
    .from('exams')
    .select('id, name, exam_mode, duration_minutes, created_at, is_published, sort_order')
    .order('sort_order')

  const practiceExams = exams?.filter(e => e.exam_mode !== 'OFFICIAL') || []

  return <Leaderboard exams={practiceExams} />
}

import { prisma } from '../lib/prisma'

async function main() {
  const cats = await prisma.examCategory.findMany({
    select: { id: true, name: true, grade: true },
    orderBy: { id: 'asc' }
  })
  console.log('전체 카테고리:')
  for (const c of cats) console.log(`  [${c.id}] ${c.name} (grade=${c.grade})`)

  const funcCat = cats.find(c => c.name.includes('전기기능사'))
  if (funcCat) {
    const exams = await prisma.exam.findMany({
      where: { categoryId: funcCat.id },
      select: { id: true, name: true, year: true, round: true, examMode: true, durationMinutes: true, minTier: true },
      orderBy: [{ year: 'asc' }, { round: 'asc' }]
    })
    console.log(`\n${funcCat.name}(id=${funcCat.id}) 기존 시험 ${exams.length}개:`)
    for (const e of exams) console.log(`  ${e.year}년 ${e.round}회 (id=${e.id}, mode=${e.examMode}, dur=${e.durationMinutes}분, tier=${e.minTier})`)

    const subjects = await prisma.subject.findMany({
      where: { exam: { categoryId: funcCat.id } },
      select: { name: true, examId: true, questionsPerAttempt: true, orderNo: true },
      orderBy: [{ examId: 'asc' }, { orderNo: 'asc' }]
    })
    console.log(`\n과목들 (${subjects.length}개):`)
    const byName = new Map<string, number>()
    for (const s of subjects) byName.set(s.name, (byName.get(s.name) ?? 0) + 1)
    for (const [n, c] of byName) console.log(`  "${n}" × ${c}`)

    if (exams.length > 0) {
      const sampleQ = await prisma.question.count({
        where: { examId: exams[0].id }
      })
      console.log(`\n샘플(${exams[0].name}) 문제수: ${sampleQ}`)
    }
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })

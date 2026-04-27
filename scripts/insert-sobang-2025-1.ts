import { prisma } from '../lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

type OCR = {
  n: number
  q: string
  c1: string
  c2: string
  c3: string
  c4: string
  a: number
  has_q_img?: boolean
  has_c_imgs?: boolean
}

const OCR_PATH = path.join(__dirname, '..', 'data', 'sobang-2025-1-ocr.json')
const URLS_PATH = path.join(__dirname, '..', 'data', 'sobang-2025-1-qimg-urls.json')

async function main() {
  const ocr: OCR[] = JSON.parse(fs.readFileSync(OCR_PATH, 'utf-8'))
  const urls: Record<string, string> = fs.existsSync(URLS_PATH)
    ? JSON.parse(fs.readFileSync(URLS_PATH, 'utf-8'))
    : {}

  if (ocr.length !== 80) throw new Error(`OCR 문제 수 오류: ${ocr.length} (예상 80)`)

  const exam = await prisma.exam.create({
    data: {
      categoryId: 10,
      name: '소방설비산업기사(전기) 2025년 1회',
      year: 2025,
      round: 1,
      examMode: 'PRACTICE',
      examType: 'WRITTEN',
      durationMinutes: 120,
      isPublished: true,
      sortOrder: 1,
      minTier: 'FREE',
    },
  })
  console.log(`Exam 생성: id=${exam.id} | ${exam.name}`)

  const subjects = [
    { name: '소방원론', orderNo: 1 },
    { name: '소방전기일반', orderNo: 2 },
    { name: '소방관계법규', orderNo: 3 },
    { name: '소방전기시설의 구조 및 원리', orderNo: 4 },
  ]
  const subjIds: number[] = []
  for (const s of subjects) {
    const created = await prisma.subject.create({
      data: { examId: exam.id, name: s.name, orderNo: s.orderNo, questionsPerAttempt: 20 },
    })
    subjIds.push(created.id)
    console.log(`Subject 생성: id=${created.id} | ${s.name}`)
  }

  const subjectIdFor = (n: number) => {
    if (n <= 20) return subjIds[0]
    if (n <= 40) return subjIds[1]
    if (n <= 60) return subjIds[2]
    return subjIds[3]
  }

  let inserted = 0
  for (const q of ocr) {
    const code = `소방설비산업기사-전기-필기-2025-1-${q.n}`
    const subjectId = subjectIdFor(q.n)
    const imageUrl = q.has_q_img ? urls[String(q.n)] || null : null

    await prisma.question.create({
      data: {
        questionCode: code,
        examId: exam.id,
        subjectId,
        questionType: 'MULTIPLE_CHOICE',
        questionText: q.q,
        choice1: q.c1,
        choice2: q.c2,
        choice3: q.c3,
        choice4: q.c4,
        answer: q.a,
        points: 1,
        isActive: true,
        imageUrl,
      },
    })
    inserted++
  }
  console.log(`Question 생성: ${inserted}개`)

  const verify = await prisma.question.groupBy({
    by: ['subjectId'],
    where: { examId: exam.id },
    _count: { id: true },
  })
  console.log('\n검증 (과목별 문제 수):')
  for (const v of verify) {
    const name = subjects[subjIds.indexOf(v.subjectId)]?.name
    console.log(`  ${name}: ${v._count.id}문제`)
  }

  const imgQs = await prisma.question.count({
    where: { examId: exam.id, imageUrl: { not: null } },
  })
  console.log(`\n이미지 연결된 문제: ${imgQs}개`)

  await prisma.$disconnect()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})

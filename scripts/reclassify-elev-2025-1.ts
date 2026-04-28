import { prisma } from '../lib/prisma'

const SUBJECT_INSTALL = 906 // 승강기설치
const SUBJECT_MAINT = 907 // 유지관리
const SUBJECT_SAFETY = 908 // 안전관리

const CLASSIFICATION: Record<number, number> = {
  // 승강기설치 (37)
  2: SUBJECT_INSTALL, 5: SUBJECT_INSTALL, 7: SUBJECT_INSTALL, 8: SUBJECT_INSTALL, 9: SUBJECT_INSTALL,
  10: SUBJECT_INSTALL, 11: SUBJECT_INSTALL, 12: SUBJECT_INSTALL, 14: SUBJECT_INSTALL, 16: SUBJECT_INSTALL,
  19: SUBJECT_INSTALL, 20: SUBJECT_INSTALL, 22: SUBJECT_INSTALL, 25: SUBJECT_INSTALL, 26: SUBJECT_INSTALL,
  27: SUBJECT_INSTALL, 28: SUBJECT_INSTALL, 29: SUBJECT_INSTALL, 30: SUBJECT_INSTALL, 33: SUBJECT_INSTALL,
  34: SUBJECT_INSTALL, 35: SUBJECT_INSTALL, 36: SUBJECT_INSTALL, 38: SUBJECT_INSTALL, 39: SUBJECT_INSTALL,
  42: SUBJECT_INSTALL, 45: SUBJECT_INSTALL, 46: SUBJECT_INSTALL, 49: SUBJECT_INSTALL, 50: SUBJECT_INSTALL,
  51: SUBJECT_INSTALL, 52: SUBJECT_INSTALL, 53: SUBJECT_INSTALL, 55: SUBJECT_INSTALL, 56: SUBJECT_INSTALL,
  58: SUBJECT_INSTALL, 60: SUBJECT_INSTALL,
  // 유지관리 (6)
  1: SUBJECT_MAINT, 4: SUBJECT_MAINT, 18: SUBJECT_MAINT, 37: SUBJECT_MAINT, 41: SUBJECT_MAINT, 43: SUBJECT_MAINT,
  // 안전관리 (17)
  3: SUBJECT_SAFETY, 6: SUBJECT_SAFETY, 13: SUBJECT_SAFETY, 15: SUBJECT_SAFETY, 17: SUBJECT_SAFETY,
  21: SUBJECT_SAFETY, 23: SUBJECT_SAFETY, 24: SUBJECT_SAFETY, 31: SUBJECT_SAFETY, 32: SUBJECT_SAFETY,
  40: SUBJECT_SAFETY, 44: SUBJECT_SAFETY, 47: SUBJECT_SAFETY, 48: SUBJECT_SAFETY, 54: SUBJECT_SAFETY,
  57: SUBJECT_SAFETY, 59: SUBJECT_SAFETY,
}

async function main() {
  // 검증: 60문제 모두 분류됐는지
  const keys = Object.keys(CLASSIFICATION).map(Number).sort((a, b) => a - b)
  if (keys.length !== 60) throw new Error(`분류 누락: ${keys.length}/60`)
  for (let i = 1; i <= 60; i++) {
    if (!CLASSIFICATION[i]) throw new Error(`Q${i} 분류 누락`)
  }

  const counts: Record<number, number> = { [SUBJECT_INSTALL]: 0, [SUBJECT_MAINT]: 0, [SUBJECT_SAFETY]: 0 }
  for (const sid of Object.values(CLASSIFICATION)) counts[sid]++
  console.log(`분류: 설치=${counts[SUBJECT_INSTALL]} / 유지관리=${counts[SUBJECT_MAINT]} / 안전=${counts[SUBJECT_SAFETY]}`)
  console.log(`합계: ${counts[SUBJECT_INSTALL] + counts[SUBJECT_MAINT] + counts[SUBJECT_SAFETY]}`)

  // 각 문제 subjectId 업데이트
  let updated = 0
  for (const [n, sid] of Object.entries(CLASSIFICATION)) {
    const code = `승강기기능사-필기-2025-1-${n}`
    await prisma.question.update({
      where: { questionCode: code },
      data: { subjectId: sid },
    })
    updated++
  }
  console.log(`문제 재분류 완료: ${updated}건`)

  // Subject의 questionsPerAttempt 업데이트
  await prisma.subject.update({
    where: { id: SUBJECT_INSTALL },
    data: { questionsPerAttempt: counts[SUBJECT_INSTALL] },
  })
  await prisma.subject.update({
    where: { id: SUBJECT_MAINT },
    data: { questionsPerAttempt: counts[SUBJECT_MAINT] },
  })
  await prisma.subject.update({
    where: { id: SUBJECT_SAFETY },
    data: { questionsPerAttempt: counts[SUBJECT_SAFETY] },
  })
  console.log('Subject questionsPerAttempt 업데이트 완료')

  // 최종 검증
  const verify = await prisma.question.groupBy({
    by: ['subjectId'],
    where: { questionCode: { startsWith: '승강기기능사-필기-2025-1-' } },
    _count: { id: true },
  })
  console.log('\n최종 검증:')
  for (const v of verify) console.log(`  subjectId=${v.subjectId} : ${v._count.id}문제`)

  await prisma.$disconnect()
}
main()

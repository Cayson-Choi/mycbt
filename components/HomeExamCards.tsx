import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import GradeSections from "./GradeSections"

const getCategories = unstable_cache(
  async () => {
    return prisma.examCategory.findMany({
      where: { isActive: true },
      include: {
        exams: {
          where: { isPublished: true, examMode: "PRACTICE" },
          select: { id: true, examType: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
  },
  ["exam-categories-v2"],
  { revalidate: 60 }
)

// 등급 정의 (고정)
const gradeConfig = [
  { grade: '기능사', color: 'emerald', icon: '🔧', description: '자격증 취득의 첫 걸음' },
  { grade: '산업기사', color: 'violet', icon: '⚙️', description: '전문 기술인의 시작' },
  { grade: '기사', color: 'blue', icon: '⚡', description: '엔지니어의 필수 자격' },
  { grade: '기능장', color: 'amber', icon: '🏅', description: '최고 등급 도전' },
  { grade: '공기업', color: 'cyan', icon: '🏢', description: '공기업 채용 대비' },
] as const

export default async function HomeExamCards() {
  const categories = await getCategories()

  const gradeGroups = gradeConfig.map((config) => {
    const cats = categories
      .filter((c) => c.grade === config.grade)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        examCount: cat.exams.length,
        writtenCount: cat.exams.filter((e) => e.examType === "WRITTEN").length,
        practicalCount: cat.exams.filter((e) => e.examType === "PRACTICAL").length,
      }))

    return {
      ...config,
      categories: cats,
    }
  })

  return <GradeSections grades={gradeGroups} />
}

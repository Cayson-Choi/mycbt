import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import ExamCards from "./ExamCards"

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
  ["exam-categories"],
  { revalidate: 60 }
)

export default async function HomeExamCards() {
  const categories = await getCategories()

  const categoryCards = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    examCount: cat.exams.length,
    writtenCount: cat.exams.filter((e) => e.examType === "WRITTEN").length,
    practicalCount: cat.exams.filter((e) => e.examType === "PRACTICAL").length,
  }))

  return <ExamCards categories={categoryCards} />
}

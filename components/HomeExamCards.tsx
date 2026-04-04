import { prisma } from "@/lib/prisma"
import ExamCards from "./ExamCards"

export default async function HomeExamCards() {
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    include: {
      exams: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          year: true,
          round: true,
          examMode: true,
          durationMinutes: true,
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  })

  const exams = categories.flatMap((cat) =>
    cat.exams.map((exam) => ({
      id: exam.id,
      name: cat.name,
      examMode: exam.examMode,
      durationMinutes: exam.durationMinutes,
      isPublished: true,
    }))
  )

  return <ExamCards initialExams={exams} />
}

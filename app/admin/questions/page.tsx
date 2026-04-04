import { Suspense } from "react"
import QuestionsClient from "./QuestionsClient"

export default function AdminQuestionsPage() {
  return (
    <Suspense>
      <QuestionsClient />
    </Suspense>
  )
}

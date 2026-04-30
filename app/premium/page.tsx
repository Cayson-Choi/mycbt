import type { Metadata } from "next"
import PremiumDetailContent from "./PremiumDetailContent"

export const metadata: Metadata = {
  title: "프리미엄 멤버십 | CAYSON",
  description: "자격증 합격은 시작일 뿐, 취업까지 책임집니다. 전국 350+ 협력 기업과 매칭, 평균 43일 입사.",
}

export default function PremiumPage() {
  return <PremiumDetailContent />
}

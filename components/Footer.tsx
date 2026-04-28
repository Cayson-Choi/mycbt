import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a1426] text-gray-200 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7">
        {/* 메인 — 3단 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-4 md:pb-4 border-b border-white/10">
          {/* 1) 브랜드 */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo_new.png" alt="CAYSON" width={36} height={36} className="rounded-full" />
              <span className="text-2xl text-white font-black tracking-tight">CAYSON</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-200 max-w-sm">
              전기 자격시험 합격을 위한 가장 빠른 길.<br />
              검증된 기출문제와 실전 환경으로 합격을 만들어갑니다.
            </p>
          </div>

          {/* 2) 고객센터 */}
          <div className="md:col-span-4">
            <h4 className="text-white text-xs font-bold mb-4 tracking-[0.18em] uppercase">Customer Care</h4>
            <a
              href="mailto:cayson0127@gmail.com"
              className="block text-sm font-semibold text-white hover:text-[#C9A84C] transition-colors mb-2 break-all"
            >
              cayson0127@gmail.com
            </a>
            <p className="text-sm text-gray-300 leading-relaxed">
              운영시간 평일 10:00 ~ 18:00<br />
              <span className="text-gray-400">주말·공휴일 휴무</span>
            </p>
          </div>

          {/* 3) 사업자 정보 */}
          <div className="md:col-span-4">
            <h4 className="text-white text-xs font-bold mb-4 tracking-[0.18em] uppercase">Company</h4>
            <dl className="space-y-2.5 text-sm">
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0">상호</dt>
                <dd className="text-white font-medium">이큐앤에이(E-Q&amp;A)</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0">대표자</dt>
                <dd className="text-white font-medium">고의숙</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-gray-400 w-24 shrink-0">사업자등록번호</dt>
                <dd className="text-white font-medium tabular-nums">113-96-59979</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 하단 — 카피라이트 */}
        <div className="pt-3">
          <p className="text-xs text-gray-300 text-center">
            &copy; {currentYear} 이큐앤에이(E-Q&amp;A). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

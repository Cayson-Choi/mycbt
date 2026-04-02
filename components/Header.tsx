import { Suspense } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import MobileNav from './MobileNav'
import HeaderUserNav from './HeaderUserNav'
import HeaderMobileNav from './HeaderMobileNav'

function HeaderUserNavFallback() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  )
}

function HeaderMobileNavFallback() {
  return <MobileNav user={null} />
}

export default function Header() {
  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-tight whitespace-nowrap">전기짱</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Suspense fallback={<HeaderUserNavFallback />}>
              <HeaderUserNav />
            </Suspense>
          </nav>

          {/* Mobile nav */}
          <Suspense fallback={<HeaderMobileNavFallback />}>
            <HeaderMobileNav />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

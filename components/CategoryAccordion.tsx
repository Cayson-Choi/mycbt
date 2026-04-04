"use client"

import { useState, type ReactNode } from "react"

export default function CategoryAccordion({
  categoryName,
  children,
}: {
  categoryName: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white">
          {categoryName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

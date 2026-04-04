'use client'

/**
 * MathText Component
 *
 * Safely renders text with mathematical notation.
 * Supports:
 * - LaTeX math: $...$ (inline), $$...$$ (display)
 * - HTML tags: <sub>, <sup>, <frac>
 *
 * KaTeX is dynamically imported to avoid 264KB bundle on initial load.
 */

import { memo, useState, useEffect, useRef } from 'react'

type KaTeX = typeof import('katex')
let katexPromise: Promise<KaTeX> | null = null
let katexModule: KaTeX | null = null

// Singleton: load katex once and cache it
function getKatex(): Promise<KaTeX> {
  if (katexModule) return Promise.resolve(katexModule)
  if (!katexPromise) {
    katexPromise = import('katex').then((m) => {
      katexModule = m
      return m
    })
  }
  return katexPromise
}

interface MathTextProps {
  text: string
  className?: string
}

// Convert LaTeX $...$ and $$...$$ segments to KaTeX HTML
function renderLatex(text: string, katex: KaTeX['default']): string {
  // Process $$...$$ (display math) first, then $...$ (inline math)
  return text
    .replace(/\$\$(.+?)\$\$/g, (_match, tex: string) => {
      try {
        return katex.renderToString(tex, { displayMode: true, throwOnError: false })
      } catch {
        return _match
      }
    })
    .replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_match, tex: string) => {
      try {
        return katex.renderToString(tex, { displayMode: false, throwOnError: false })
      } catch {
        return _match
      }
    })
}

// Sanitize HTML: only allow <sub>, <sup>, and <frac> tags
function sanitizeHtml(html: string): string {
  // First, convert <frac> tags to proper fraction HTML
  let processed = html.replace(
    /<frac>([^<]+)\/([^<]+)<\/frac>/gi,
    '<sup>$1</sup>⁄<sub>$2</sub>'
  )

  // Allow only <sub>, </sub>, <sup>, </sup> tags
  processed = processed
    .replace(/<(?!\/?(?:sub|sup)\b)[^>]*>/gi, '') // Remove all tags except sub/sup
    .replace(/<(sub|sup)([^>]*)>/gi, '<$1>') // Remove attributes from sub/sup tags

  return processed
}

export default memo(function MathText({ text, className = '' }: MathTextProps) {
  // If text has no $, no katex needed — process synchronously
  const needsKatex = text.includes('$')

  // For non-katex text, render immediately with sanitized HTML
  const fallbackHtml = needsKatex ? text : sanitizeHtml(text)

  const [html, setHtml] = useState<string>(() => {
    // If katex is already loaded, render synchronously (no flash)
    if (needsKatex && katexModule) {
      return renderLatex(text, katexModule.default)
    }
    return fallbackHtml
  })

  const prevTextRef = useRef(text)

  useEffect(() => {
    if (!needsKatex) {
      setHtml(sanitizeHtml(text))
      return
    }

    // If katex already loaded and text hasn't changed from initial render, skip
    if (katexModule && prevTextRef.current === text) {
      prevTextRef.current = text
      return
    }
    prevTextRef.current = text

    let cancelled = false
    getKatex().then((mod) => {
      if (!cancelled) {
        setHtml(renderLatex(text, mod.default))
      }
    })
    return () => { cancelled = true }
  }, [text, needsKatex])

  return (
    <span
      className={`${className} [&>sub]:text-[0.7em] [&>sub]:align-sub [&>sup]:text-[0.7em] [&>sup]:align-super`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ color: 'inherit' }}
    />
  )
})

'use client'

import { useEffect, useRef, ReactNode } from 'react'

export default function HeroSection({ children }: { children?: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = 0
    let height = 0
    let isVisible = true

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      width = parent.offsetWidth
      height = parent.offsetHeight
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    // 탭 비활성 시 애니메이션 중지
    const handleVisibility = () => {
      isVisible = !document.hidden
      if (isVisible) {
        animationId = requestAnimationFrame(animate)
      } else {
        cancelAnimationFrame(animationId)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // 전기 파티클 (모바일에서는 파티클 수 감소)
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      color: string
      pulse: number
      pulseSpeed: number
      cellX: number
      cellY: number
    }

    const isMobile = width < 768
    const PARTICLE_COUNT = isMobile ? 30 : 60
    const CONNECTION_DIST = 120
    const CELL_SIZE = CONNECTION_DIST

    const particles: Particle[] = []
    const colors = ['#f0c27f', '#e8d5b7', '#ffd700', '#ffb347', '#ff6b35']

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        cellX: Math.floor(x / CELL_SIZE),
        cellY: Math.floor(y / CELL_SIZE),
      })
    }

    // 번개 효과
    interface Lightning {
      startX: number
      startY: number
      segments: { x: number; y: number }[]
      opacity: number
      life: number
      maxLife: number
    }

    const lightnings: Lightning[] = []

    const createLightning = () => {
      const startX = Math.random() * width
      const startY = Math.random() * height * 0.3
      const segments: { x: number; y: number }[] = [{ x: startX, y: startY }]
      let x = startX
      let y = startY
      const steps = Math.floor(Math.random() * 5) + 3

      for (let i = 0; i < steps; i++) {
        x += (Math.random() - 0.5) * 60
        y += Math.random() * 30 + 10
        segments.push({ x, y })
      }

      lightnings.push({
        startX,
        startY,
        segments,
        opacity: 0.8,
        life: 0,
        maxLife: 20 + Math.random() * 15,
      })
    }

    // 연결선 - 공간 분할(spatial grid)로 O(n*k) 복잡도 최적화
    const drawConnections = () => {
      // 그리드 구축
      const grid: Map<string, number[]> = new Map()
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.cellX = Math.floor(p.x / CELL_SIZE)
        p.cellY = Math.floor(p.y / CELL_SIZE)
        const key = `${p.cellX},${p.cellY}`
        const cell = grid.get(key)
        if (cell) {
          cell.push(i)
        } else {
          grid.set(key, [i])
        }
      }

      // 인접 셀만 검사하여 연결선 그리기
      const distSq = CONNECTION_DIST * CONNECTION_DIST
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i]
        // 현재 셀과 인접 셀 검사 (오른쪽, 아래, 대각선만 - 중복 방지)
        for (let dx = 0; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy <= 0 && !(dx === 0 && dy === 0)) continue
            const key = `${pi.cellX + dx},${pi.cellY + dy}`
            const cell = grid.get(key)
            if (!cell) continue
            for (const j of cell) {
              if (j <= i) continue
              const pj = particles[j]
              const ddx = pi.x - pj.x
              const ddy = pi.y - pj.y
              const d = ddx * ddx + ddy * ddy
              if (d < distSq) {
                const dist = Math.sqrt(d)
                const opacity = (1 - dist / CONNECTION_DIST) * 0.08
                ctx.beginPath()
                ctx.strokeStyle = `rgba(255, 200, 100, ${opacity})`
                ctx.lineWidth = 0.5
                ctx.moveTo(pi.x, pi.y)
                ctx.lineTo(pj.x, pj.y)
                ctx.stroke()
              }
            }
          }
        }
      }
    }

    let frame = 0

    const animate = () => {
      if (!isVisible) return

      ctx.clearRect(0, 0, width, height)
      frame++

      // 연결선
      drawConnections()

      // 파티클 업데이트 & 렌더
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        const pulsedOpacity = p.opacity + Math.sin(p.pulse) * 0.15
        const pulsedSize = p.size + Math.sin(p.pulse) * 0.5

        // 글로우
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedSize * 4)
        gradient.addColorStop(0, `rgba(255, 200, 100, ${pulsedOpacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)')
        ctx.fillStyle = gradient
        ctx.arc(p.x, p.y, pulsedSize * 4, 0, Math.PI * 2)
        ctx.fill()

        // 코어
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.globalAlpha = pulsedOpacity
        ctx.arc(p.x, p.y, pulsedSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // 번개 생성 (랜덤)
      if (frame % 90 === 0 && Math.random() > 0.4) {
        createLightning()
      }

      // 번개 렌더
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const l = lightnings[i]
        l.life++

        if (l.life > l.maxLife) {
          lightnings.splice(i, 1)
          continue
        }

        const progress = l.life / l.maxLife
        const opacity = l.opacity * (1 - progress)

        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`
        ctx.lineWidth = 1.5 * (1 - progress)
        ctx.shadowColor = '#ffd700'
        ctx.shadowBlur = 10 * (1 - progress)

        ctx.moveTo(l.segments[0].x, l.segments[0].y)
        for (let s = 1; s < l.segments.length; s++) {
          ctx.lineTo(l.segments[s].x, l.segments[s].y)
        }
        ctx.stroke()

        ctx.shadowBlur = 0
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <div className="relative overflow-hidden hero-bg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 lg:pt-8 pb-4 lg:pb-6">
        <div className="text-center">
          {/* 번개 아이콘 */}
          <div className="inline-flex items-center justify-center mb-2">
            <span className="hero-bolt text-3xl lg:text-4xl">&#x26A1;</span>
          </div>

          <h1 className="hero-title text-5xl lg:text-8xl font-black mb-2 leading-none tracking-tighter">
            전기짱
          </h1>

          <div className="hero-divider mx-auto mb-2" />

          <p className="text-sm lg:text-base text-amber-100/70 leading-relaxed max-w-md mx-auto font-light">
            전문가가 엄선하고 검증한 실전 기출문제,<br />
            시중 CBT와는 차원이 다릅니다.
          </p>
        </div>
      </div>

      {/* Children (Leaderboard 등) - 캔버스 위에 겹쳐서 표시 */}
      {children && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 lg:pb-6">
          {children}
        </div>
      )}
    </div>
  )
}

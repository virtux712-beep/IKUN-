import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
}

const COLORS = ['#FFD700', '#F5C842', '#FFFFFF', '#DAA520']
const LINK_DISTANCE = 120
const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE

/** 根据视口面积决定粒子数量，小屏设备自动减负 */
function particleCountFor(width: number, height: number): number {
  const area = width * height
  const base = Math.round(area / 16000)
  return Math.max(24, Math.min(72, base))
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let particles: Particle[] = []
    let rafId = 0
    let running = true

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2 + 0.6,
      opacity: Math.random() * 0.45 + 0.12,
      color: COLORS[(Math.random() * COLORS.length) | 0],
    })

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight

      // 用物理像素尺寸保证高分屏不模糊
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = particleCountFor(width, height)
      if (particles.length === 0) {
        particles = Array.from({ length: target }, createParticle)
      } else if (particles.length > target) {
        particles.length = target
      } else {
        while (particles.length < target) particles.push(createParticle())
      }

      if (reducedMotion) drawFrame(false)
    }

    const drawFrame = (advance: boolean) => {
      ctx.clearRect(0, 0, width, height)

      if (advance) {
        for (const p of particles) {
          p.x += p.vx
          p.y += p.vy
          if (p.x <= 0 || p.x >= width) {
            p.vx *= -1
            p.x = Math.min(Math.max(p.x, 0), width)
          }
          if (p.y <= 0 || p.y >= height) {
            p.vy *= -1
            p.y = Math.min(Math.max(p.y, 0), height)
          }
        }
      }

      // 先画连线再画粒子，避免线条压在点上
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distSq = dx * dx + dy * dy
          if (distSq > LINK_DISTANCE_SQ) continue
          const alpha = 0.08 * (1 - Math.sqrt(distSq) / LINK_DISTANCE)
          ctx.strokeStyle = `rgba(255, 215, 0, ${alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      for (const p of particles) {
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      drawFrame(true)
      rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reducedMotion) return
      running = true
      rafId = requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
    }

    // 页面隐藏时停掉动画，省电、省 CPU
    const onVisibilityChange = () => {
      if (document.hidden) stop()
      else start()
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 150)
    }

    resize()
    if (reducedMotion) {
      drawFrame(false)
    } else {
      start()
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      stop()
      if (resizeTimer) clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  )
}

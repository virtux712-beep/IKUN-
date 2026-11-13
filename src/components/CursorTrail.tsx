import { useEffect, useRef } from 'react'
import { useSettings } from '@/settings'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  color: string
}

/**
 * 鼠标拖尾粒子（思路参考 tholman/cursor-effects）。
 * 只在桌面端、且用户没有开启「减少动效」时启用。
 */
export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { cursor, reduceMotion } = useSettings()

  useEffect(() => {
    if (!cursor || reduceMotion) return
    // 触屏设备不启用
    if (window.matchMedia('(pointer: coarse)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const particles: Particle[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()

    const colors = ['#FFD700', '#F5C842', '#FFF1A8', '#DAA520']

    const onMove = (e: PointerEvent) => {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 + 0.35,
          life: 1,
          size: Math.random() * 2.6 + 1,
          color: colors[(Math.random() * colors.length) | 0] as string,
        })
      }
      if (particles.length > 160) particles.splice(0, particles.length - 160)
    }

    let raf = 0
    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i] as Particle
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.life -= 0.022
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life * 0.75
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [cursor, reduceMotion])

  if (!cursor || reduceMotion) return null

  return <canvas ref={canvasRef} className="fixed inset-0 z-[70] pointer-events-none" />
}

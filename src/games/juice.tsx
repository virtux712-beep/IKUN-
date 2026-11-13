import { useCallback, useRef, useState } from 'react'

/**
 * 手感增强层（game juice）。
 * 参考 GitHub 热门小游戏（2048 / A Dark Room / shapez.io）的反馈设计：
 * 命中要有音效 + 视觉 + 动效三重反馈，否则操作会「发飘」。
 */

export interface Particle {
  id: number
  x: number
  y: number
  emoji: string
  vx: number
  vy: number
}

export interface PopText {
  id: number
  x: number
  y: number
  text: string
  tone?: 'good' | 'bad'
}

export function useJuice() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [pops, setPops] = useState<PopText[]>([])
  const [shakeKey, setShakeKey] = useState(0)
  const idRef = useRef(0)

  /** 屏幕抖动（命中/失败反馈） */
  const shake = useCallback(() => {
    setShakeKey((k) => k + 1)
  }, [])

  /** emoji 粒子爆发 */
  const burst = useCallback((x: number, y: number, emoji = '✨', count = 6) => {
    const batch: Particle[] = []
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.6
      const speed = 2 + Math.random() * 3
      batch.push({
        id: idRef.current++,
        x,
        y,
        emoji,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 1,
      })
    }
    setParticles((prev) => [...prev.slice(-40), ...batch])
    const ids = new Set(batch.map((b) => b.id))
    setTimeout(() => setParticles((prev) => prev.filter((p) => !ids.has(p.id))), 700)
  }, [])

  /** 浮动数字/文字 */
  const popText = useCallback(
    (x: number, y: number, text: string, tone: 'good' | 'bad' = 'good') => {
      const id = idRef.current++
      setPops((prev) => [...prev.slice(-12), { id, x, y, text, tone }])
      setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== id)), 800)
    },
    [],
  )

  return { particles, pops, shakeKey, shake, burst, popText }
}

/** 粒子渲染层：绝对定位覆盖在游戏区上 */
export function JuiceLayer({ juice }: { juice: ReturnType<typeof useJuice> }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {juice.particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-lg"
          style={{
            left: p.x,
            top: p.y,
            animation: 'juice-fly 0.7s cubic-bezier(0.15, 0.8, 0.3, 1) forwards',
            ['--vx' as string]: p.vx + 'px',
            ['--vy' as string]: p.vy + 'px',
          }}
        >
          {p.emoji}
        </span>
      ))}
      {juice.pops.map((p) => (
        <span
          key={p.id}
          className={
            'absolute font-black text-sm ' +
            (p.tone === 'good' ? 'text-ikun-yellow' : 'text-red-400')
          }
          style={{
            left: p.x,
            top: p.y,
            animation: 'juice-pop 0.8s ease-out forwards',
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  )
}

/** 数字格式化：1.2K / 3.4M / 5.6B */
export function shortNum(n: number): string {
  if (n < 1000) return n.toFixed(n < 10 && n % 1 !== 0 ? 1 : 0)
  const units = ['K', 'M', 'B', 'T', 'Qa']
  let value = n
  let unit = -1
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000
    unit++
  }
  return value.toFixed(value < 10 ? 1 : 0) + (units[unit] ?? '')
}

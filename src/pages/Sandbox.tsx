import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn, SFX, useRaf } from '@/features/ui'

interface Body {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  emoji: string
  mass: number
}

const W = 360
const H = 460
const WALL_REST = 0.55
const BODY_REST = 0.42
const AIR = 0.999

const KINDS = [
  { emoji: '🐔', r: 22, mass: 1 },
  { emoji: '🏀', r: 24, mass: 1.2 },
  { emoji: '🍋', r: 16, mass: 0.7 },
  { emoji: '🥚', r: 14, mass: 0.5 },
  { emoji: '💪', r: 20, mass: 1.1 },
]

export default function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bodies = useRef<Body[]>([])
  const dragRef = useRef<{ index: number; ox: number; oy: number } | null>(null)
  const [gravity, setGravity] = useState(0.5)
  const gravityRef = useRef(gravity)
  gravityRef.current = gravity
  const [count, setCount] = useState(0)

  const spawn = useCallback((emoji: string, r: number, mass: number, x?: number, y?: number) => {
    if (bodies.current.length > 60) return
    bodies.current.push({
      x: x ?? W / 2 + (Math.random() - 0.5) * 120,
      y: y ?? -r - Math.random() * 60,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2,
      r,
      emoji,
      mass,
    })
    setCount(bodies.current.length)
  }, [])

  const addRandom = useCallback(() => {
    const k = KINDS[(Math.random() * KINDS.length) | 0]
    if (k) spawn(k.emoji, k.r, k.mass)
    SFX.pop()
  }, [spawn])

  // 初始布置
  useEffect(() => {
    bodies.current = []
    spawn('🐔', 22, 1, W / 2 - 60, 80)
    spawn('🏀', 24, 1.2, W / 2 + 50, 60)
    spawn('🍋', 16, 0.7, W / 2, 20)
    setCount(3)
  }, [spawn])

  useRaf(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return

    const list = bodies.current
    const g = gravityRef.current

    // 积分
    for (const b of list) {
      b.vy += g
      b.vx *= AIR
      b.vy *= AIR
      b.x += b.vx
      b.y += b.vy
    }

    // 墙壁
    for (const b of list) {
      if (b.x - b.r < 0) {
        b.x = b.r
        b.vx = Math.abs(b.vx) * WALL_REST
      }
      if (b.x + b.r > W) {
        b.x = W - b.r
        b.vx = -Math.abs(b.vx) * WALL_REST
      }
      if (b.y + b.r > H) {
        b.y = H - b.r
        if (Math.abs(b.vy) > 1.4) {
          SFX.tick()
        }
        b.vy = -Math.abs(b.vy) * WALL_REST
      }
      if (b.y - b.r < 0) {
        b.y = b.r
        b.vy = Math.abs(b.vy) * WALL_REST
      }
    }

    // 圆体碰撞
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        const min = a.r + b.r
        if (dist === 0 || dist >= min) continue

        const nx = dx / dist
        const ny = dy / dist
        const overlap = min - dist
        const totalMass = a.mass + b.mass

        // 位置分离
        a.x -= nx * overlap * (b.mass / totalMass)
        a.y -= ny * overlap * (b.mass / totalMass)
        b.x += nx * overlap * (a.mass / totalMass)
        b.y += ny * overlap * (a.mass / totalMass)

        // 速度冲量
        const rvx = b.vx - a.vx
        const rvy = b.vy - a.vy
        const velAlongNormal = rvx * nx + rvy * ny
        if (velAlongNormal > 0) continue

        const impulse = (-(1 + BODY_REST) * velAlongNormal) / (1 / a.mass + 1 / b.mass)
        a.vx -= (impulse * nx) / a.mass
        a.vy -= (impulse * ny) / a.mass
        b.vx += (impulse * nx) / b.mass
        b.vy += (impulse * ny) / b.mass
      }
    }

    // 拖拽中的物体跟随指针
    const drag = dragRef.current
    if (drag) {
      const b = list[drag.index]
      if (b) {
        b.x = drag.ox
        b.y = drag.oy
        b.vx = 0
        b.vy = 0
      }
    }

    // 绘制
    ctx.clearRect(0, 0, W, H)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const b of list) {
      ctx.globalAlpha = 0.12
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.font = `${b.r * 2}px "Segoe UI Emoji", "Apple Color Emoji", serif`
      ctx.fillText(b.emoji, b.x, b.y)
    }
  }, true)

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scale = W / rect.width
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = pointerPos(e)
    const list = bodies.current
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i]
      if (!b) continue
      if (Math.hypot(b.x - p.x, b.y - p.y) <= b.r + 6) {
        dragRef.current = { index: i, ox: p.x, oy: p.y }
        e.currentTarget.setPointerCapture(e.pointerId)
        SFX.pop()
        return
      }
    }
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return
    const p = pointerPos(e)
    dragRef.current.ox = p.x
    dragRef.current.oy = p.y
  }

  const onUp = () => {
    dragRef.current = null
  }

  const boom = () => {
    for (const b of bodies.current) {
      const ang = Math.random() * Math.PI * 2
      const power = 8 + Math.random() * 10
      b.vx += Math.cos(ang) * power
      b.vy += Math.sin(ang) * power - 4
    }
    SFX.fail()
  }

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-narrow">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            🧲 <span className="text-ikun-yellow">鸡窝</span>物理沙盒
          </h1>
          <p className="text-gray-400">拖动、投掷、引爆，全部是实时物理模拟</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="w-full rounded-xl bg-black/30 touch-none cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: `${W}/${H}` }}
          />

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400 shrink-0">重力</span>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              aria-label="重力大小"
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-9 text-right tabular-nums">
              {gravity.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <Btn onClick={addRandom}>＋ 投放一个</Btn>
            <Btn kind="danger" onClick={boom}>
              💥 爆炸
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => {
                for (const k of KINDS) spawn(k.emoji, k.r, k.mass)
              }}
            >
              🎲 各来一个
            </Btn>
            <Btn
              kind="ghost"
              onClick={() => {
                bodies.current = []
                dragRef.current = null
                setCount(0)
              }}
            >
              🧹 清空
            </Btn>
          </div>

          <p className="text-xs text-gray-600 mt-3 text-center">当前物体 {count} 个 · 最多 60 个</p>
        </div>

        <p className="text-xs text-gray-600 mt-4 text-center leading-relaxed">
          自研的圆体物理：重力积分、墙壁反弹、圆-圆弹性碰撞与质量冲量解算。
          <br />
          按住任意鸡、球、柠檬拖拽，松手即可投掷。
        </p>
      </div>
    </div>
  )
}

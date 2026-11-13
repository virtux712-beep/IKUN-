import { useEffect, useRef, useState } from 'react'
import { Bar, Btn, Hint, Row, SFX, sweep, tone, useRaf, useRecord } from './ui'

/* ================================================================
   28. 鸡叫模拟器
   ================================================================ */
const CRIES = [
  { label: '标准鸡叫', fn: () => sweep(1100, 260, 0.22, 'sawtooth') },
  {
    label: '公鸡打鸣',
    fn: () => {
      sweep(500, 1400, 0.3, 'square')
      setTimeout(() => sweep(1400, 400, 0.35, 'square'), 300)
    },
  },
  {
    label: '小鸡叽叽',
    fn: () => {
      tone(1600, 0.07, 'square', 0.08)
      setTimeout(() => tone(1900, 0.07, 'square', 0.08), 90)
    },
  },
  { label: '惨叫', fn: () => sweep(1500, 120, 0.45, 'sawtooth') },
  { label: '懒鸡', fn: () => sweep(300, 200, 0.5, 'sine') },
  {
    label: '打嗝鸡',
    fn: () => {
      tone(700, 0.06, 'square')
      setTimeout(() => tone(520, 0.06, 'square'), 80)
    },
  },
]

export function ChickenVoice() {
  const [last, setLast] = useState('')

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {CRIES.map((c) => (
          <button
            type="button"
            key={c.label}
            onClick={() => {
              c.fn()
              setLast(c.label)
            }}
            className="px-3 py-4 rounded-xl bg-white/5 hover:bg-ikun-yellow/15 border border-white/10 hover:border-ikun-yellow/30 transition-all text-sm text-gray-200 cursor-pointer active:scale-95"
          >
            🐔 {c.label}
          </button>
        ))}
      </div>
      {last && <p className="text-center text-xs text-gray-500">刚刚播放：{last}</p>}
      <Hint>全部使用 Web Audio API 实时合成，没有任何音频文件，所以加载瞬间完成。</Hint>
    </div>
  )
}

/* ================================================================
   29. 铁山靠音效板
   ================================================================ */
const BOARD = [
  {
    label: '铁山靠',
    emoji: '💪',
    fn: () => {
      sweep(180, 60, 0.18, 'square')
      setTimeout(() => tone(90, 0.2, 'square', 0.1), 120)
    },
  },
  {
    label: '鸡你太美',
    emoji: '🎵',
    fn: () => {
      tone(523, 0.12)
      setTimeout(() => tone(659, 0.12), 130)
      setTimeout(() => tone(784, 0.2), 260)
    },
  },
  { label: '篮球拍地', emoji: '🏀', fn: () => tone(120, 0.08, 'sine', 0.2) },
  { label: '你干嘛', emoji: '😤', fn: () => sweep(600, 900, 0.2, 'triangle') },
  { label: '哎呦', emoji: '😣', fn: () => sweep(900, 500, 0.25, 'sine') },
  {
    label: '荔枝',
    emoji: '🍋',
    fn: () => {
      tone(880, 0.08, 'triangle')
      setTimeout(() => tone(1175, 0.12, 'triangle'), 90)
    },
  },
  {
    label: '中分头',
    emoji: '💇',
    fn: () => {
      tone(440, 0.06)
      setTimeout(() => tone(554, 0.06), 70)
      setTimeout(() => tone(659, 0.1), 140)
    },
  },
  {
    label: '练习两年半',
    emoji: '⏱️',
    fn: () => {
      for (const [i, f] of [523, 587, 659, 698].entries()) {
        setTimeout(() => tone(f, 0.12), i * 110)
      }
    },
  },
]

export function SoundBoard() {
  const [pressed, setPressed] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {BOARD.map((b) => (
          <button
            type="button"
            key={b.label}
            onClick={() => {
              b.fn()
              setPressed(b.label)
              setTimeout(() => setPressed((p) => (p === b.label ? null : p)), 200)
            }}
            className={
              'px-3 py-5 rounded-xl border transition-all text-sm cursor-pointer active:scale-95 ' +
              (pressed === b.label
                ? 'bg-ikun-yellow/25 border-ikun-yellow/50 text-ikun-yellow scale-105'
                : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10')
            }
          >
            <div className="text-2xl mb-1">{b.emoji}</div>
            {b.label}
          </button>
        ))}
      </div>
      <Hint>8 个经典音效，全部现场合成。建议戴耳机，音量已控制在舒适范围。</Hint>
    </div>
  )
}

/* ================================================================
   30. 只因时钟
   ================================================================ */
export function ZhiYinClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 100)
    return () => clearInterval(id)
  }, [])

  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  const secondsOfDay = (now.getTime() - midnight.getTime()) / 1000
  const zhiyinUnits = secondsOfDay / 2.5
  const dayProgress = (secondsOfDay / 86400) * 100

  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl font-black tabular-nums text-white">
        {now.toLocaleTimeString('zh-CN', { hour12: false })}
      </div>
      <div className="text-xs text-gray-500">现实时间</div>

      <div className="rounded-xl bg-white/5 p-4 space-y-2">
        <div className="text-3xl font-black text-ikun-yellow tabular-nums">
          {zhiyinUnits.toFixed(1)}
        </div>
        <div className="text-xs text-gray-400">只因单位（今天已过去 2.5 秒的个数）</div>
        <Bar value={dayProgress} />
        <div className="text-[11px] text-gray-600">今日进度 {dayProgress.toFixed(2)}%</div>
      </div>

      <Hint>把一天的秒数除以 2.5，得到「练习时长」单位的计数，每秒刷新 10 次。</Hint>
    </div>
  )
}

/* ================================================================
   31. 功德木鱼
   ================================================================ */
export function WoodenFish() {
  const [count, setCount] = useState(0)
  const [float, setFloat] = useState<{ id: number; x: number }[]>([])
  const idRef = useRef(0)
  const { record, submit } = useRecord('ikun_f_merit')

  const knock = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCount((c) => {
      const next = c + 1
      if (next % 100 === 0) submit(next)
      return next
    })
    const rect = e.currentTarget.getBoundingClientRect()
    const id = idRef.current++
    setFloat((f) => [...f.slice(-8), { id, x: e.clientX - rect.left }])
    setTimeout(() => setFloat((f) => f.filter((x) => x.id !== id)), 900)
    tone(320 + Math.random() * 40, 0.12, 'sine', 0.15)
  }

  return (
    <div className="space-y-3 text-center">
      <div className="text-sm text-gray-400">
        功德 <span className="text-ikun-yellow font-black text-2xl tabular-nums">{count}</span>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={knock}
          className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-amber-700/40 to-amber-900/30 border-2 border-amber-600/40 grid place-items-center text-6xl transition-transform active:scale-90 cursor-pointer select-none"
          aria-label="敲木鱼"
        >
          🪵
        </button>
        {float.map((f) => (
          <span
            key={f.id}
            className="absolute bottom-1/2 text-ikun-yellow font-bold animate-fadeUp pointer-events-none"
            style={{ left: f.x }}
            aria-hidden="true"
          >
            +1
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500">最高纪录 {record} · 每敲 100 下记一次</div>
      <Hint>点击木鱼积累功德，声音由 Web Audio 合成，每一下音高略有不同。</Hint>
    </div>
  )
}

/* ================================================================
   32. 鸡头稳定器
   ================================================================ */
export function ChickenHead() {
  const boxRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const cur = useRef({ x: 0, y: 0 })

  useRaf(() => {
    cur.current.x += (target.current.x - cur.current.x) * 0.12
    cur.current.y += (target.current.y - cur.current.y) * 0.12
    if (headRef.current) {
      headRef.current.style.transform = `translate(${cur.current.x}px, ${cur.current.y}px) rotate(${cur.current.x * 0.12}deg)`
    }
  }, true)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    target.current = { x: nx * 60, y: ny * 40 }
  }

  return (
    <div className="space-y-3">
      <div
        ref={boxRef}
        onPointerMove={onMove}
        onPointerLeave={() => {
          target.current = { x: 0, y: 0 }
        }}
        className="h-56 rounded-2xl bg-white/5 grid place-items-center overflow-hidden cursor-crosshair touch-none"
      >
        <div
          ref={headRef}
          className="text-7xl will-change-transform select-none"
          aria-hidden="true"
        >
          🐔
        </div>
      </div>
      <Hint>把鼠标移到方框里，鸡头会以惯性跟随，像真的在盯着你看。</Hint>
    </div>
  )
}

/* ================================================================
   33. 篮球弹跳
   ================================================================ */
export function BouncingBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ball = useRef({ x: 120, y: 80, vx: 3.2, vy: 0, r: 22 })
  const [bounces, setBounces] = useState(0)
  const [gravity, setGravity] = useState(0.42)
  const gravityRef = useRef(gravity)
  gravityRef.current = gravity

  useRaf(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const W = c.width
    const H = c.height
    const b = ball.current

    b.vy += gravityRef.current
    b.x += b.vx
    b.y += b.vy

    if (b.x - b.r < 0) {
      b.x = b.r
      b.vx = Math.abs(b.vx)
    }
    if (b.x + b.r > W) {
      b.x = W - b.r
      b.vx = -Math.abs(b.vx)
    }
    if (b.y + b.r > H) {
      b.y = H - b.r
      b.vy = -Math.abs(b.vy) * 0.82
      if (Math.abs(b.vy) > 0.8) {
        setBounces((n) => n + 1)
        tone(90 + Math.abs(b.vy) * 10, 0.06, 'sine', 0.06)
      }
    }
    if (b.y - b.r < 0) {
      b.y = b.r
      b.vy = Math.abs(b.vy) * 0.8
    }

    ctx.clearRect(0, 0, W, H)
    ctx.font = `${b.r * 2}px "Segoe UI Emoji", "Apple Color Emoji", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🏀', b.x, b.y)
  }, true)

  const boost = () => {
    ball.current.vy = -12
    ball.current.vx = (Math.random() - 0.5) * 8
    SFX.pop()
  }

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={360}
        height={220}
        className="w-full rounded-2xl bg-white/5 border border-white/10"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 shrink-0">重力</span>
        <input
          type="range"
          min={0.05}
          max={1.2}
          step={0.05}
          value={gravity}
          onChange={(e) => setGravity(Number(e.target.value))}
          aria-label="重力大小"
          className="flex-1"
        />
        <span className="text-xs text-gray-500 w-8 tabular-nums">{gravity.toFixed(2)}</span>
      </div>
      <div className="flex gap-2">
        <Btn className="flex-1" onClick={boost}>
          再来一球
        </Btn>
        <Btn kind="ghost" onClick={() => setBounces(0)}>
          清零
        </Btn>
      </div>
      <Row label="弹跳次数" value={bounces} />
      <Hint>真实的重力与阻尼模拟，拖动滑杆可以调重力。每次触地都会有音效。</Hint>
    </div>
  )
}

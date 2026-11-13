import { useCallback, useEffect, useRef, useState } from 'react'
import { Bar, Btn, Hint, pick, Row, SFX, useRecord } from './ui'

/* ================================================================
   34. 只因计算器
   ================================================================ */
export function ZhiYinCalculator() {
  const [value, setValue] = useState('100')
  const n = Number(value)
  const valid = Number.isFinite(n)

  const rows = [
    { k: '÷ 2.5（练习时长单位）', v: valid ? (n / 2.5).toFixed(3) : '—' },
    { k: '× 2.5', v: valid ? (n * 2.5).toFixed(3) : '—' },
    { k: '2.5 次方', v: valid ? (Math.abs(n) ** 2.5).toFixed(3) : '—' },
    { k: '两年半换算成秒', v: valid ? `${(n * 2.5 * 86400).toLocaleString('zh-CN')} 秒` : '—' },
    { k: '折合篮球场（28m）', v: valid ? `${(n / 28).toFixed(2)} 个` : '—' },
  ]

  return (
    <div className="space-y-3">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="输入数值"
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold tabular-nums focus:outline-none focus:border-ikun-yellow/50"
      />
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.k}
            className="flex items-center justify-between gap-3 text-sm px-3 py-2 rounded-lg bg-white/5"
          >
            <span className="text-gray-400">{r.k}</span>
            <span className="font-bold text-ikun-yellow tabular-nums text-right">{r.v}</span>
          </div>
        ))}
      </div>
      <Hint>以「2.5」为核心常数的计算器，把任何数字换算成练习时长、篮球场等各种单位。</Hint>
    </div>
  )
}

/* ================================================================
   35. 鸡你太美打字机
   ================================================================ */
const TYPE_TEXT = '鸡你太美，哎呦你干嘛~ 我练习时长两年半，喜欢唱、跳、rap、篮球 🐔🏀'

export function Typewriter() {
  const [text, setText] = useState('')
  const [speed, setSpeed] = useState(90)
  const [running, setRunning] = useState(false)
  const idxRef = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setRunning(false)
  }, [])

  useEffect(() => {
    if (!running) return
    const tick = () => {
      idxRef.current += 1
      setText(TYPE_TEXT.slice(0, idxRef.current))
      if (idxRef.current % 3 === 0) SFX.tick()
      if (idxRef.current >= TYPE_TEXT.length) {
        setRunning(false)
        return
      }
      timer.current = setTimeout(tick, speed)
    }
    timer.current = setTimeout(tick, speed)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [running, speed])

  const start = () => {
    idxRef.current = 0
    setText('')
    setRunning(true)
  }

  return (
    <div className="space-y-3">
      <div className="min-h-[110px] rounded-xl bg-black/40 border border-white/10 p-4 font-mono text-sm text-green-300 leading-relaxed break-all">
        {text}
        {running && <span className="animate-pulse">▊</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 shrink-0">速度</span>
        <input
          type="range"
          min={20}
          max={300}
          step={10}
          value={330 - speed}
          onChange={(e) => setSpeed(330 - Number(e.target.value))}
          aria-label="打字速度"
          className="flex-1"
        />
        <span className="text-xs text-gray-500 w-12 text-right tabular-nums">{speed}ms</span>
      </div>
      <div className="flex gap-2">
        <Btn className="flex-1" onClick={start} disabled={running}>
          开始打字
        </Btn>
        <Btn kind="ghost" onClick={stop} disabled={!running}>
          停止
        </Btn>
      </div>
      <Hint>终端风格的打字机效果，每个字符都带机械键盘音效。</Hint>
    </div>
  )
}

/* ================================================================
   36. 反小黑子检测器
   ================================================================ */
const VERDICT = [
  '检测到 99% 小黑子成分，建议立刻补充鸡腿 🍗',
  '纯度不足，需要再练习两年半 🐔',
  '恭喜，你是纯正的 ikun，颁发证书 🏆',
  '检测失败：样本已被「荔枝」污染 🍋',
  '警告：检测到强烈的篮球执念 🏀',
  '结果：你只是一个路过的普通人 🚶',
]

export function FakeDetector() {
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ score: number; text: string } | null>(null)

  useEffect(() => {
    if (!scanning) return
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id)
          const score = 20 + Math.floor(Math.random() * 80)
          setResult({ score, text: pick(VERDICT) })
          setScanning(false)
          SFX.ok()
          return 100
        }
        return p + 4
      })
    }, 40)
    return () => clearInterval(id)
  }, [scanning])

  return (
    <div className="space-y-3">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="输入一段话，检测小黑子含量"
        aria-label="输入待检测文本"
        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
      />
      <Btn
        className="w-full"
        disabled={scanning || !input.trim()}
        onClick={() => {
          setResult(null)
          setProgress(0)
          setScanning(true)
        }}
      >
        {scanning ? '检测中…' : '开始检测'}
      </Btn>
      {(scanning || result) && (
        <div className="space-y-2">
          <Bar value={progress} />
          {result && (
            <div className="text-center space-y-1">
              <div className="text-3xl font-black text-ikun-yellow tabular-nums">
                {result.score}%
              </div>
              <p className="text-sm text-gray-300">{result.text}</p>
            </div>
          )}
        </div>
      )}
      <Hint>完全随机，仅供娱乐。输入什么并不影响结果 😏</Hint>
    </div>
  )
}

/* ================================================================
   37. 鸡腿抽奖转盘
   ================================================================ */
const PRIZES = ['🍗 大鸡腿', '🐔 整只鸡', '🏀 篮球', '🍋 柠檬', '💨 空气', '👑 王者鸡腿']

export function LuckyWheel() {
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [prize, setPrize] = useState<string | null>(null)
  const { record, submit } = useRecord('ikun_f_wheel')

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setPrize(null)
    const idx = Math.floor(Math.random() * PRIZES.length)
    const target = 360 * 6 + idx * (360 / PRIZES.length) + 360 / PRIZES.length / 2
    setAngle((a) => a + target)
    setTimeout(() => {
      setSpinning(false)
      const p = PRIZES[idx] ?? PRIZES[0]!
      setPrize(p)
      if (p.includes('🍗') || p.includes('👑')) {
        SFX.ok()
        submit(record + 1)
      } else {
        SFX.fail()
      }
    }, 3200)
  }

  const seg = 360 / PRIZES.length
  const gradient = PRIZES.map((_, i) => {
    const from = i * seg
    const to = from + seg
    const color = i % 2 === 0 ? '#FFD700' : '#2a2a2a'
    return `${color} ${from}deg ${to}deg`
  }).join(', ')

  return (
    <div className="space-y-3 text-center">
      <div className="relative w-56 h-56 mx-auto">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-2xl z-10">🔻</div>
        <div
          className="w-full h-full rounded-full border-4 border-white/20"
          style={{
            background: `conic-gradient(${gradient})`,
            transform: `rotate(${angle}deg)`,
            transition: 'transform 3.2s cubic-bezier(0.15, 0.9, 0.2, 1)',
          }}
        />
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-ikun-black border-2 border-ikun-yellow grid place-items-center text-xl">
            🐔
          </div>
        </div>
      </div>

      <Btn className="w-full" onClick={spin} disabled={spinning}>
        {spinning ? '转动中…' : '抽一次'}
      </Btn>
      {prize && <p className="text-sm text-ikun-yellow font-bold">恭喜获得：{prize}</p>}
      <Row label="抽中鸡腿次数" value={record} />
      <Hint>纯随机，没有任何保底机制。抽到空气也别生气，荔枝一点。</Hint>
    </div>
  )
}

/* ================================================================
   38. 今日鸡腿
   ================================================================ */
const LEGS = [
  { emoji: '🍗', name: '奥尔良烤鸡腿', desc: '外酥里嫩，今日运势 +20' },
  { emoji: '🍖', name: '酱香大鸡腿', desc: '浓香入味，适合大快朵颐' },
  { emoji: '🍤', name: '炸鸡腿', desc: '酥脆到掉渣，配可乐更佳' },
  { emoji: '🥩', name: '卤鸡腿', desc: '慢炖三小时，入口即化' },
  { emoji: '🌭', name: '鸡腿堡', desc: '夹在面包里的快乐' },
  { emoji: '🍢', name: '烤鸡腿串', desc: '撒上孜然，深夜放毒' },
]

export function DailyChickenLeg() {
  const [revealed, setRevealed] = useState(false)
  const d = new Date()
  const seed = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % LEGS.length
  const leg = LEGS[seed] ?? LEGS[0]!

  return (
    <div className="space-y-4 text-center">
      <div className="text-6xl">{revealed ? leg.emoji : '🍽️'}</div>
      {revealed ? (
        <>
          <h3 className="text-lg font-bold text-ikun-yellow">{leg.name}</h3>
          <p className="text-sm text-gray-400">{leg.desc}</p>
          <p className="text-xs text-gray-600">明天 0 点刷新</p>
        </>
      ) : (
        <Btn
          onClick={() => {
            setRevealed(true)
            SFX.pop()
          }}
        >
          揭晓今日鸡腿
        </Btn>
      )}
      <Hint>按日期生成，同一天结果固定，每天都能开到不同口味。</Hint>
    </div>
  )
}

/* ================================================================
   39. 只因倒计时
   ================================================================ */
export function ZhiYinCountdown() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // 下一个「2.5 小时」整点
  const period = 2.5 * 3600 * 1000
  const next = Math.ceil(now / period) * period
  const diff = Math.max(0, next - now)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  return (
    <div className="space-y-4 text-center">
      <div className="text-xs text-gray-500">距离下一个「2.5 小时」节点还有</div>
      <div className="flex items-center justify-center gap-2">
        {[
          { v: h, l: '时' },
          { v: m, l: '分' },
          { v: s, l: '秒' },
        ].map((x) => (
          <div key={x.l} className="rounded-xl bg-white/5 px-4 py-3 min-w-[70px]">
            <div className="text-2xl font-black text-ikun-yellow tabular-nums">
              {String(x.v).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-gray-500">{x.l}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        目标时间 {new Date(next).toLocaleTimeString('zh-CN', { hour12: false })}
      </div>
      <Hint>以 2.5 小时为一个周期倒计时，每到一个节点就是一次「练习时长」打卡。</Hint>
    </div>
  )
}

/* ================================================================
   40. 弹幕鸡窝
   ================================================================ */
interface Danmaku {
  id: number
  text: string
  top: number
  duration: number
  color: string
}

const DANMAKU_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#34D399', '#ffffff']
const PRESETS = [
  '鸡你太美',
  '你干嘛~',
  '铁山靠！',
  '荔枝一点',
  '两年半了',
  '打篮球吗',
  '哎呦不错哦',
  '只因你太美',
]

export function DanmakuWall() {
  const [items, setItems] = useState<Danmaku[]>([])
  const [text, setText] = useState('')
  const idRef = useRef(0)

  const send = useCallback((content: string) => {
    const t = content.trim()
    if (!t) return
    const id = idRef.current++
    setItems((prev) => [
      ...prev.slice(-20),
      {
        id,
        text: t.slice(0, 30),
        top: 5 + Math.random() * 80,
        duration: 6 + Math.random() * 4,
        color: pick(DANMAKU_COLORS),
      },
    ])
    setTimeout(() => setItems((prev) => prev.filter((d) => d.id !== id)), 11000)
  }, [])

  return (
    <div className="space-y-3">
      <div className="relative h-64 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
        {items.map((d) => (
          <div
            key={d.id}
            className="absolute whitespace-nowrap text-sm font-bold pointer-events-none"
            style={{
              top: `${d.top}%`,
              color: d.color,
              animation: `danmaku-move ${d.duration}s linear forwards`,
            }}
          >
            {d.text}
          </div>
        ))}
        {items.length === 0 && (
          <div className="absolute inset-0 grid place-items-center text-gray-600 text-sm">
            发一条弹幕试试 👇
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              send(text)
              setText('')
            }
          }}
          placeholder="发条弹幕…"
          maxLength={30}
          aria-label="弹幕内容"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
        />
        <Btn
          onClick={() => {
            send(text)
            setText('')
          }}
        >
          发送
        </Btn>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => send(p)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>
      <Hint>弹幕从右向左飘过，最多同时保留 20 条。可以点预设或自己输入。</Hint>
    </div>
  )
}

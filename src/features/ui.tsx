import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '@/hooks'
import { isSoundEnabled } from '@/settings/sound'

export const GOLD = '#FFD700'

/* ---------------------------- 按钮 / 小组件 ---------------------------- */

type BtnKind = 'primary' | 'ghost' | 'danger'

const BTN_STYLES: Record<BtnKind, string> = {
  primary: 'bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black hover:brightness-110',
  ghost: 'bg-white/10 text-white hover:bg-white/20',
  danger: 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
}

export function Btn({
  children,
  onClick,
  kind = 'primary',
  disabled,
  className = '',
  title,
}: {
  children: React.ReactNode
  onClick?: () => void
  kind?: BtnKind
  disabled?: boolean
  className?: string
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        'px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer active:scale-95 ' +
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ' +
        BTN_STYLES[kind] +
        ' ' +
        className
      }
    >
      {children}
    </button>
  )
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ' +
        (active
          ? 'bg-ikun-yellow/20 text-ikun-yellow border-ikun-yellow/30'
          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10')
      }
    >
      {children}
    </button>
  )
}

export function Bar({
  value,
  max = 100,
  tone = 'gold',
}: {
  value: number
  max?: number
  tone?: 'gold' | 'red' | 'green'
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const colors = {
    gold: 'from-ikun-yellow to-ikun-gold',
    red: 'from-red-500 to-orange-400',
    green: 'from-green-400 to-emerald-400',
  }
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-150 ${colors[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold text-white tabular-nums">{value}</span>
    </div>
  )
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500 leading-relaxed">{children}</p>
}

/* ---------------------------- 记录 / 计时 ---------------------------- */

/** 本地最高纪录（0 表示暂无记录） */
export function useRecord(key: string, defaultMode: 'high' | 'low' = 'high') {
  const [record, setRecord] = useLocalStorage<number>(key, 0)
  const submit = useCallback(
    (value: number, mode: 'high' | 'low' = defaultMode) => {
      const better = record === 0 || (mode === 'high' ? value > record : value < record)
      if (better) setRecord(value)
      return better
    },
    [record, setRecord, defaultMode],
  )
  return { record, submit, reset: () => setRecord(0) }
}

/** 定时器 Hook：传 null 暂停 */
export function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (ms === null) return
    const id = setInterval(() => ref.current(), ms)
    return () => clearInterval(id)
  }, [ms])
}

/** 逐帧循环（页面不可见时自动暂停） */
export function useRaf(cb: (dt: number) => void, active: boolean) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(now - last, 60) / 16.667
      last = now
      ref.current(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

/** 倒计时秒数 */
export function useCountdown(seconds: number, active: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds)
  const endRef = useRef(onEnd)
  endRef.current = onEnd

  useEffect(() => {
    if (!active) return
    setLeft(seconds)
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          endRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [active, seconds])

  return left
}

/* ---------------------------- 音效合成 ---------------------------- */

let audioCtx: AudioContext | null = null

function ctx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

/** 合成一个音符，无需任何音频资源 */
export function tone(freq: number, duration = 0.15, type: OscillatorType = 'sine', volume = 0.12) {
  if (!isSoundEnabled()) return
  const ac = ctx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  gain.gain.setValueAtTime(volume, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

/** 频率滑动（鸡叫、铁山靠之类的滑音） */
export function sweep(
  from: number,
  to: number,
  duration = 0.25,
  type: OscillatorType = 'sawtooth',
) {
  if (!isSoundEnabled()) return
  const ac = ctx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, ac.currentTime)
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), ac.currentTime + duration)
  gain.gain.setValueAtTime(0.12, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration)
}

export const SFX = {
  ok: () => tone(880, 0.1, 'triangle'),
  fail: () => tone(160, 0.2, 'square', 0.1),
  tick: () => tone(1200, 0.04, 'square', 0.05),
  pop: () => tone(520, 0.08, 'sine'),
  cluck: () => sweep(900, 300, 0.18, 'sawtooth'),
}

/* ---------------------------- 杂项 ---------------------------- */

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j] as T, out[i] as T]
  }
  return out
}

/** 把文本画到 canvas 并触发下载 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

/** 圆角矩形 */
export function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

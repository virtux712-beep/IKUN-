import { ArrowLeft, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSynth } from '@/hooks'

interface PianoKey {
  word: string
  note: string
  freq: number
  sub: string
  /** 键底的彩色描边，与原型五键配色一致 */
  accent: string
}

const KEYS: PianoKey[] = [
  { word: '鸡', note: 'C5', freq: 523.25, sub: '开嗓', accent: 'rgba(255, 93, 143, 0.55)' },
  { word: '你', note: 'D5', freq: 587.33, sub: '起范', accent: 'rgba(255, 138, 93, 0.55)' },
  { word: '太', note: 'E5', freq: 659.25, sub: '入戏', accent: 'rgba(255, 201, 77, 0.55)' },
  { word: '美', note: 'G5', freq: 783.99, sub: '上头', accent: 'rgba(77, 255, 160, 0.45)' },
  { word: '哇', note: 'A5', freq: 880.0, sub: '封神', accent: 'rgba(77, 216, 255, 0.55)' },
]

const DEMO_SEQUENCE = [0, 1, 2, 3, 4, 3, 2, 1, 2, 4]
const DEMO_INTERVAL = 230

export default function KunPiano({ onBack }: { onBack: () => void }) {
  const { playTone } = useSynth()
  const [activeKey, setActiveKey] = useState<number | null>(null)
  const [demoPlaying, setDemoPlaying] = useState(false)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const t of timers) clearTimeout(t)
    }
  }, [])

  const hit = useCallback(
    (index: number) => {
      const key = KEYS[index]
      if (!key) return
      playTone(key.freq)
      setActiveKey(index)
      later(() => {
        setActiveKey((current) => (current === index ? null : current))
      }, 180)
    },
    [playTone, later],
  )

  const playDemo = useCallback(() => {
    if (demoPlaying) return
    setDemoPlaying(true)
    DEMO_SEQUENCE.forEach((keyIndex, i) => {
      later(() => hit(keyIndex), i * DEMO_INTERVAL)
    })
    later(() => setDemoPlaying(false), DEMO_SEQUENCE.length * DEMO_INTERVAL + 100)
  }, [demoPlaying, hit, later])

  // 键盘 1–5 弹奏
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const n = Number.parseInt(e.key, 10)
      if (n >= 1 && n <= KEYS.length) hit(n - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hit])

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🎹 坤坤琴键</h1>
          <div className="shrink-0 min-w-[64px]" aria-hidden="true" />
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          五个键，五声音阶，怎么乱弹都不难听。点一点、摸一摸，或者按键盘
          1–5。先听听示范，再秀你自己的两年半功力。
        </p>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {KEYS.map((key, i) => (
              <button
                key={key.note}
                type="button"
                onClick={() => hit(i)}
                aria-label={`琴键「${key.word}」，音高 ${key.note}，按数字键 ${i + 1} 也可弹奏`}
                aria-pressed={activeKey === i}
                className={
                  'rounded-2xl border border-white/10 bg-white/5 py-6 sm:py-7 text-center cursor-pointer select-none transition-transform duration-150 hover:bg-white/10 ' +
                  (activeKey === i ? 'scale-95 bg-white/15' : '')
                }
                style={{ boxShadow: `inset 0 -6px 0 ${key.accent}` }}
              >
                <span className="block text-2xl sm:text-[27px] font-black text-white leading-none">
                  {key.word}
                </span>
                <span className="block text-[11px] text-gray-400 tracking-wide mt-2">
                  {key.note} · {key.sub}
                </span>
              </button>
            ))}
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={playDemo}
              disabled={demoPlaying}
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
            >
              <Play size={16} aria-hidden="true" />
              {demoPlaying ? '示范弹奏中…' : '听一段示范'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

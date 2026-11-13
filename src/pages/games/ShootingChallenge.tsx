import { ArrowLeft, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const ZONE_START = 42
const ZONE_END = 58
const CENTER = 50
/** 跑针速度：%/秒（原型为每帧 1.15%，按 60fps 换算） */
const NEEDLE_SPEED = 69
const BEST_KEY = 'ikun_shooting_best'

type FlyKind = 'score' | 'miss-left' | 'miss-right' | null

const PRAISES = [
  '空心入网！这手感，两年半没白练！',
  '正中靶心！鸡你太美！',
  '漂亮！篮筐像装了磁铁！',
  '进了！今晚加鸡腿！',
]

const MISSES = [
  '哐！打铁声很清脆，再来！',
  '差一点点！就差那么一点点！',
  '篮筐拒绝了你，但 ikun 不会！',
  '三不沾……这球很有想法。',
]

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function ShootingChallenge({ onBack }: { onBack: () => void }) {
  const [pos, setPos] = useState(0)
  const [flying, setFlying] = useState<FlyKind>(null)
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(readBest)
  const [message, setMessage] = useState('瞄准绿色区，按下出手！')

  const bestRef = useRef(best)

  const posRef = useRef(0)
  const dirRef = useRef(1)
  const streakRef = useRef(0)
  const flyingRef = useRef(false)
  const flyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 跑针主循环：requestAnimationFrame + delta 时间，帧率无关
  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!flyingRef.current) {
        let next = posRef.current + dirRef.current * NEEDLE_SPEED * dt
        if (next >= 98) {
          next = 98
          dirRef.current = -1
        } else if (next <= 0) {
          next = 0
          dirRef.current = 1
        }
        posRef.current = next
        setPos(next)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    return () => {
      if (flyTimer.current) clearTimeout(flyTimer.current)
    }
  }, [])

  const shoot = useCallback(() => {
    if (flyingRef.current) return
    flyingRef.current = true

    const at = posRef.current
    const inZone = at >= ZONE_START && at <= ZONE_END
    const centerOffset = Math.abs(at - CENTER)

    setShots((n) => n + 1)

    if (inZone) {
      setFlying('score')
      setScore((n) => n + 1)
      streakRef.current += 1
      const next = streakRef.current
      setStreak(next)
      if (next > bestRef.current) {
        bestRef.current = next
        setBest(next)
        try {
          localStorage.setItem(BEST_KEY, String(next))
        } catch {
          /* 忽略写入失败 */
        }
      }
      const praise =
        centerOffset <= 3 ? '🎯 完美中心球！' : PRAISES[Math.floor(Math.random() * PRAISES.length)]
      setMessage(next >= 3 ? `${praise}（${next} 连进，封神！）` : praise)
    } else {
      setFlying(at < CENTER ? 'miss-left' : 'miss-right')
      streakRef.current = 0
      setStreak(0)
      setMessage(MISSES[Math.floor(Math.random() * MISSES.length)])
    }

    flyTimer.current = setTimeout(() => {
      flyTimer.current = null
      flyingRef.current = false
      setFlying(null)
    }, 900)
  }, [])

  // 空格键出手（与按钮等价，出手动画期间由 flyingRef 守卫不会连发）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      e.preventDefault()
      shoot()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shoot])

  const ballStyle: React.CSSProperties =
    flying === 'score'
      ? { transform: 'translateY(-58px) scale(0.55)', opacity: 0.25 }
      : flying === 'miss-left'
        ? { transform: 'translate(-70px, -30px) rotate(120deg)', opacity: 0.35 }
        : flying === 'miss-right'
          ? { transform: 'translate(70px, -30px) rotate(120deg)', opacity: 0.35 }
          : {}

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
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🏀 投篮挑战</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums flex items-center gap-1 justify-end">
              <Trophy size={12} aria-hidden="true" />
              {best > 0 ? `${best} 连进` : '--'}
            </div>
            <div className="text-xs text-gray-500">最佳连进</div>
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          白针在能量条里来回跑，按下「出手」的那一刻停在哪儿很关键：停进绿色区就进球，越靠近正中心评价越高。点按钮或按空格出手，连进有惊喜文案。
        </p>

        <div className="glass rounded-3xl p-6 sm:p-8 select-none">
          <div className="text-center mb-2" aria-hidden="true">
            <div className="text-6xl leading-none">🏀</div>
            <div
              className="text-[44px] leading-none inline-block transition-all duration-500"
              style={ballStyle}
            >
              🏀
            </div>
          </div>

          <div
            className="relative h-5 rounded-full bg-white/10 border border-white/10 overflow-hidden mt-4"
            role="img"
            aria-label="投篮能量条，绿色区为进球区"
          >
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-green-400/60 to-green-400/90"
              style={{ left: `${ZONE_START}%`, width: `${ZONE_END - ZONE_START}%` }}
            />
            <div
              className="absolute -top-0.5 -bottom-0.5 w-[5px] rounded bg-white shadow-[0_0_10px_#fff]"
              style={{ left: `${pos}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 tracking-wide">
            <span>打铁区</span>
            <span className="text-green-400">进球区</span>
            <span>打铁区</span>
          </div>

          <div className="flex gap-7 justify-center mt-6 text-sm text-gray-400">
            <span>
              进球{' '}
              <b className="text-white text-xl tabular-nums" aria-live="polite">
                {score}
              </b>
            </span>
            <span>
              出手{' '}
              <b className="text-white text-xl tabular-nums" aria-live="polite">
                {shots}
              </b>
            </span>
            <span>
              连进{' '}
              <b className="text-white text-xl tabular-nums" aria-live="polite">
                {streak}
              </b>
            </span>
          </div>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={shoot}
              disabled={flying !== null}
              className="px-8 py-3 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-full hover:scale-105 transition-all cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
            >
              🏀 出 手
            </button>
          </div>

          <p
            className="min-h-7 text-center text-base sm:text-lg font-bold text-ikun-yellow mt-4"
            aria-live="polite"
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

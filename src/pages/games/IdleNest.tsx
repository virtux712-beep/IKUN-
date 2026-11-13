import { ArrowLeft, RotateCcw, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SFX } from '@/features/ui'
import { JuiceLayer, shortNum, useJuice } from '@/games/juice'
import { useLocalStorage } from '@/hooks'

interface Producer {
  id: string
  emoji: string
  name: string
  desc: string
  baseCost: number
  baseRate: number
}

/** 设施表：指数级涨价，线性加产出 */
const PRODUCERS: Producer[] = [
  { id: 'coop', emoji: '🐣', name: '小鸡窝', desc: '孵化几只小鸡', baseCost: 10, baseRate: 0.5 },
  { id: 'hens', emoji: '🐔', name: '成年鸡', desc: '开始稳定下蛋', baseCost: 120, baseRate: 3 },
  {
    id: 'court',
    emoji: '🏀',
    name: '篮球场',
    desc: '鸡们开始打篮球',
    baseCost: 1400,
    baseRate: 18,
  },
  {
    id: 'studio',
    emoji: '🎤',
    name: '练习室',
    desc: '唱跳 rap 一起练',
    baseCost: 16000,
    baseRate: 110,
  },
  {
    id: 'empire',
    emoji: '🏟️',
    name: '鸡窝帝国',
    desc: '产业规模化',
    baseCost: 200000,
    baseRate: 700,
  },
]

const GROWTH = 1.15
const OFFLINE_CAP_HOURS = 8
const SAVE_KEY = 'ikun_idle_v1'

interface SaveData {
  zhiyin: number
  owned: Record<string, number>
  totalEarned: number
  lastSeen: number
  clicks: number
}

const DEFAULT_SAVE: SaveData = {
  zhiyin: 0,
  owned: {},
  totalEarned: 0,
  lastSeen: Date.now(),
  clicks: 0,
}

function costOf(p: Producer, owned: number): number {
  return Math.ceil(p.baseCost * GROWTH ** owned)
}

export default function IdleNest({ onBack }: { onBack: () => void }) {
  const [save, setSave] = useLocalStorage<SaveData>(SAVE_KEY, DEFAULT_SAVE)
  const [offlineGain, setOfflineGain] = useState(0)
  const juice = useJuice()
  const saveRef = useRef(save)
  saveRef.current = save

  const owned = save.owned ?? {}
  const rate = PRODUCERS.reduce((sum, p) => sum + (owned[p.id] ?? 0) * p.baseRate, 0)
  const perClick = 1 + Math.floor(rate * 0.1)

  /* ---------------- 离线收益：进入时结算一次 ---------------- */
  // 进入时结算离线收益，只跑一次：从 ref 读快照，避免进入依赖循环
  useEffect(() => {
    const now = Date.now()
    const snapshot = saveRef.current
    const elapsedSec = Math.max(0, (now - (snapshot.lastSeen || now)) / 1000)
    if (elapsedSec < 30) return

    const capped = Math.min(elapsedSec, OFFLINE_CAP_HOURS * 3600)
    const base = PRODUCERS.reduce((sum, p) => sum + (snapshot.owned[p.id] ?? 0) * p.baseRate, 0)
    const gain = base * capped
    if (gain <= 0) return

    setOfflineGain(gain)
    setSave((prev) => ({
      ...prev,
      zhiyin: prev.zhiyin + gain,
      totalEarned: prev.totalEarned + gain,
      lastSeen: now,
    }))
  }, [setSave])

  /* ---------------- 自动产出 ---------------- */
  useEffect(() => {
    if (rate <= 0) return
    const id = setInterval(() => {
      setSave((prev) => ({
        ...prev,
        zhiyin: prev.zhiyin + rate / 10,
        totalEarned: prev.totalEarned + rate / 10,
        lastSeen: Date.now(),
      }))
    }, 100)
    return () => clearInterval(id)
  }, [rate, setSave])

  /* ---------------- 定时存档时间戳 ---------------- */
  useEffect(() => {
    const id = setInterval(() => {
      setSave((prev) => ({ ...prev, lastSeen: Date.now() }))
    }, 5000)
    return () => clearInterval(id)
  }, [setSave])

  const click = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setSave((prev) => ({
        ...prev,
        zhiyin: prev.zhiyin + perClick,
        totalEarned: prev.totalEarned + perClick,
        clicks: prev.clicks + 1,
        lastSeen: Date.now(),
      }))
      juice.burst(x, y, '🐔', 4)
      juice.popText(x, y, `+${shortNum(perClick)}`)
      SFX.pop()
    },
    [perClick, juice, setSave],
  )

  const buy = useCallback(
    (p: Producer, e: React.MouseEvent<HTMLButtonElement>) => {
      const count = saveRef.current.owned[p.id] ?? 0
      const cost = costOf(p, count)
      if (saveRef.current.zhiyin < cost) {
        SFX.fail()
        juice.shake()
        return
      }
      const rect = e.currentTarget.getBoundingClientRect()
      setSave((prev) => ({
        ...prev,
        zhiyin: prev.zhiyin - cost,
        owned: { ...prev.owned, [p.id]: (prev.owned[p.id] ?? 0) + 1 },
        lastSeen: Date.now(),
      }))
      juice.burst(rect.width / 2, 20, p.emoji, 8)
      SFX.ok()
    },
    [juice, setSave],
  )

  const reset = () => {
    setSave({ ...DEFAULT_SAVE, lastSeen: Date.now() })
    setOfflineGain(0)
  }

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🏡 鸡窝放置</h1>
          <div className="w-[64px]" aria-hidden="true" />
        </div>

        {/* 离线收益提示 */}
        {offlineGain > 0 && (
          <div className="mb-4 rounded-xl bg-ikun-yellow/10 border border-ikun-yellow/25 px-4 py-2.5 text-center">
            <p className="text-xs text-ikun-yellow">
              离线期间鸡窝没闲着，产出 <span className="font-bold">+{shortNum(offlineGain)}</span>{' '}
              只因值
            </p>
          </div>
        )}

        {/* 主数值 */}
        <div className="card p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="text-xs text-gray-500 mb-1">只因值</div>
          <div className="text-4xl sm:text-5xl font-black text-ikun-yellow tabular-nums">
            {shortNum(save.zhiyin)}
          </div>
          <div className="mt-2 text-xs text-gray-500 tabular-nums">
            每秒 +{shortNum(rate)} · 累计产出 {shortNum(save.totalEarned)}
          </div>

          {/* 点击主按钮 */}
          <button
            type="button"
            onClick={click}
            className="relative mt-6 w-full py-8 rounded-2xl bg-gradient-to-br from-ikun-yellow/20 to-ikun-gold/5 border border-ikun-yellow/25 active:scale-[0.98] transition-transform cursor-pointer overflow-hidden"
          >
            <span className="text-6xl block" aria-hidden="true">
              🐔
            </span>
            <span className="block mt-2 text-sm text-ikun-yellow font-bold">
              点我 +{shortNum(perClick)}
            </span>
            <JuiceLayer juice={juice} />
          </button>
        </div>

        {/* 设施列表 */}
        <div className="mt-4 space-y-2">
          {PRODUCERS.map((p) => {
            const count = owned[p.id] ?? 0
            const cost = costOf(p, count)
            const affordable = save.zhiyin >= cost
            return (
              <button
                type="button"
                key={p.id}
                onClick={(e) => buy(p, e)}
                className={
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ' +
                  (affordable
                    ? 'bg-white/[0.06] border-white/12 hover:bg-white/10 hover:border-ikun-yellow/30'
                    : 'bg-white/[0.02] border-white/5 opacity-60')
                }
              >
                <span className="text-3xl shrink-0" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{p.name}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-ikun-yellow/20 text-ikun-yellow shrink-0 tabular-nums">
                        ×{count}
                      </span>
                    )}
                  </span>
                  <span className="block text-[11px] text-gray-500 truncate">{p.desc}</span>
                  <span className="block text-[11px] text-gray-600 tabular-nums">
                    +{p.baseRate}/秒
                  </span>
                </span>
                <span className="text-right shrink-0">
                  <span
                    className={
                      'block text-sm font-bold tabular-nums ' +
                      (affordable ? 'text-ikun-yellow' : 'text-gray-500')
                    }
                  >
                    {shortNum(cost)}
                  </span>
                  <span className="block text-[10px] text-gray-600">
                    {count > 0 ? '升级' : '购买'}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} aria-hidden="true" />
            已点击 {save.clicks} 次
          </span>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} aria-hidden="true" /> 重置存档
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-5 text-center leading-relaxed">
          设施自动产出只因值，离线也能积累（上限 8 小时）。
          <br />
          每次点击额外获得「每秒产出 × 10%」，所以设施越多点得越值。
        </p>
      </div>
    </div>
  )
}

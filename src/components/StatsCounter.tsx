import { Flame, Heart, Image, Trophy, Users, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { memes } from '@/data/memes'
import { usePrefersReducedMotion } from '@/hooks'
import { getGameScores, getMemeCollection, getPurityHistory, getVisitCount } from '@/store'

interface StatItem {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  color: string
}

export default function StatsCounter() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 统计数据尽量取自真实存储，而不是写死
  const favorites = getMemeCollection().length
  const gameCount = getGameScores().length
  const purityCount = getPurityHistory().length
  const likeSeed = 2847 + favorites * 7 + gameCount * 13 + purityCount * 5

  const stats: StatItem[] = [
    {
      icon: <Users className="text-ikun-yellow" size={26} aria-hidden="true" />,
      label: '访问人数',
      value: getVisitCount(),
      suffix: '+',
      color: 'from-ikun-yellow/20',
    },
    {
      icon: <Image className="text-green-400" size={26} aria-hidden="true" />,
      label: '表情包数量',
      value: memes.length,
      color: 'from-green-400/20',
    },
    {
      icon: <Zap className="text-blue-400" size={26} aria-hidden="true" />,
      label: '小黑子指数',
      value: 98,
      suffix: '%',
      color: 'from-blue-400/20',
    },
    {
      icon: <Heart className="text-red-400" size={26} aria-hidden="true" />,
      label: '获赞总数',
      value: likeSeed,
      color: 'from-red-400/20',
    },
    {
      icon: <Trophy className="text-purple-400" size={26} aria-hidden="true" />,
      label: '游戏场次',
      value: 520 + gameCount,
      color: 'from-purple-400/20',
    },
    {
      icon: <Flame className="text-orange-400" size={26} aria-hidden="true" />,
      label: '在线ikun',
      value: 42,
      color: 'from-orange-400/20',
    },
  ]

  return (
    <section ref={sectionRef} className="relative z-10 py-16 px-4" aria-labelledby="stats-title">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="stats-title" className="text-2xl sm:text-3xl font-bold text-white mb-2">
            实时数据
          </h2>
          <p className="text-gray-400">IKUN之家正在蓬勃发展中</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} active={visible} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ icon, label, value, suffix, color, active }: StatItem & { active: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!active) return
    if (reducedMotion) {
      setDisplayValue(value)
      return
    }

    let frame = 0
    const duration = 1600
    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [active, value, reducedMotion])

  return (
    <div
      className={
        'glass rounded-2xl p-5 text-center transition-all duration-300 ' +
        'hover:scale-105 hover:bg-white/10 bg-gradient-to-b to-transparent ' +
        color
      }
    >
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
        {displayValue.toLocaleString('zh-CN')}
        {suffix ?? ''}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}

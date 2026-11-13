import {
  BookOpen,
  ChevronRight,
  FlaskConical,
  Gamepad2,
  MessageCircle,
  Music,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import StatsCounter from '@/components/StatsCounter'
import { getVisitCount, recordVisit } from '@/store'
import type { TabId } from '@/types'

interface HomeProps {
  onTabChange: (tab: TabId) => void
}

export default function Home({ onTabChange }: HomeProps) {
  const [visitCount, setVisitCount] = useState(getVisitCount)

  // 每个浏览器会话只计一次访问，避免来回切页面把数字刷爆
  useEffect(() => {
    setVisitCount(recordVisit())
  }, [])

  return (
    <div className="relative z-10">
      <HeroSection onTabChange={onTabChange} visitCount={visitCount} />
      <StatsCounter />
      <QuickAccess onTabChange={onTabChange} />
      <FeaturedSection onTabChange={onTabChange} />
    </div>
  )
}

const FLOATING_EMOJIS = [
  { emoji: '🏀', className: 'top-24 left-[8%] text-6xl', delay: '0s' },
  { emoji: '🐔', className: 'top-40 right-[12%] text-5xl', delay: '1.2s' },
  { emoji: '🎵', className: 'bottom-44 left-[16%] text-5xl', delay: '2.4s' },
  { emoji: '🎤', className: 'bottom-24 right-[10%] text-6xl', delay: '0.6s' },
  { emoji: '💪', className: 'top-1/3 left-[22%] text-4xl', delay: '1.8s' },
  { emoji: '✨', className: 'bottom-1/3 right-[24%] text-4xl', delay: '3s' },
]

function HeroSection({
  onTabChange,
  visitCount,
}: {
  onTabChange: (tab: TabId) => void
  visitCount: number
}) {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* 装饰层 */}
      <div
        className="absolute inset-0 bg-grid mask-fade-b opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {FLOATING_EMOJIS.map((item) => (
          <span
            key={item.emoji}
            className={`absolute opacity-[0.08] animate-float ${item.className}`}
            style={{ animationDelay: item.delay }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <div className="relative text-center max-w-4xl mx-auto">
        {/* 徽标 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-ikun-yellow/25 mb-8 animate-fadeUp">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-ikun-yellow opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ikun-yellow" />
          </span>
          <span className="text-sm text-ikun-yellow">小黑子的专属精神家园</span>
          <Sparkles size={14} className="text-ikun-yellow" aria-hidden="true" />
        </div>

        {/* 主标题 */}
        <h1
          className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6 tracking-tight animate-fadeUp"
          style={{ animationDelay: '0.08s' }}
        >
          <span className="text-white">欢迎来到</span>
          <br />
          <span className="text-gradient-gold drop-shadow-[0_0_40px_rgba(255,215,0,0.25)]">
            IKUN之家
          </span>
        </h1>

        {/* 副标题 */}
        <p
          className="text-lg sm:text-xl text-gray-400 mb-3 animate-fadeUp"
          style={{ animationDelay: '0.16s' }}
        >
          唱 · 跳 · Rap · 🏀 · 鸡你太美
        </p>
        <p
          className="text-sm text-gray-500 mb-10 animate-fadeUp"
          style={{ animationDelay: '0.22s' }}
        >
          已有{' '}
          <span className="text-ikun-yellow font-bold tabular-nums">
            {visitCount.toLocaleString('zh-CN')}
          </span>{' '}
          位小黑子到访
        </p>

        {/* 主按钮 */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeUp"
          style={{ animationDelay: '0.28s' }}
        >
          <button
            type="button"
            onClick={() => onTabChange('games')}
            className="group px-8 py-4 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-2xl text-lg transition-all duration-300 shadow-lg shadow-ikun-yellow/20 hover:shadow-xl hover:shadow-ikun-yellow/35 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <span className="text-xl transition-transform group-hover:scale-125" aria-hidden="true">
              🐔
            </span>
            进入鸡窝
            <ChevronRight
              size={20}
              className="transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('encyclopedia')}
            className="px-8 py-4 glass border-white/20 text-white font-bold rounded-2xl text-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
          >
            <BookOpen size={20} aria-hidden="true" />
            IKUN图鉴
          </button>
        </div>

        {/* 快捷入口 */}
        <div
          className="mt-16 flex justify-center gap-3 sm:gap-5 animate-fadeUp"
          style={{ animationDelay: '0.36s' }}
        >
          {[
            { icon: BookOpen, label: '图鉴', tab: 'encyclopedia' as TabId },
            { icon: Music, label: '音乐', tab: 'music' as TabId },
            { icon: Gamepad2, label: '游戏', tab: 'games' as TabId },
            { icon: MessageCircle, label: '留言', tab: 'messages' as TabId },
          ].map(({ icon: Icon, label, tab }) => (
            <button
              type="button"
              key={tab}
              onClick={() => onTabChange(tab)}
              className="group flex flex-col items-center gap-2 p-3 w-[68px] rounded-xl glass hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <Icon
                size={22}
                className="text-gray-400 group-hover:text-ikun-yellow transition-colors"
                aria-hidden="true"
              />
              <span className="text-xs text-gray-500 group-hover:text-gray-300">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURES: {
  emoji: string
  title: string
  desc: string
  tab: TabId
  gradient: string
}[] = [
  {
    emoji: '📖',
    title: 'IKUN图鉴',
    desc: '探索小黑子宇宙中的各种角色和传说',
    tab: 'encyclopedia',
    gradient: 'from-blue-500/15 to-purple-500/15',
  },
  {
    emoji: '😱',
    title: '表情包中心',
    desc: '海量 ikun 专属表情包，一键复制下载',
    tab: 'memes',
    gradient: 'from-green-500/15 to-teal-500/15',
  },
  {
    emoji: '🎵',
    title: '音乐播放器',
    desc: '聆听 ikun 专属 BGM，感受节奏的魅力',
    tab: 'music',
    gradient: 'from-pink-500/15 to-rose-500/15',
  },
  {
    emoji: '🎮',
    title: '小游戏',
    desc: '接篮球、抓鸡、反应测试等你来挑战',
    tab: 'games',
    gradient: 'from-orange-500/15 to-red-500/15',
  },
  {
    emoji: '🧪',
    title: 'IKUN纯度测试',
    desc: '15 道题，测出你的小黑子等级',
    tab: 'games',
    gradient: 'from-yellow-500/15 to-amber-500/15',
  },
  {
    emoji: '💬',
    title: '留言墙',
    desc: '与其他小黑子交流互动',
    tab: 'messages',
    gradient: 'from-cyan-500/15 to-blue-500/15',
  },
]

function QuickAccess({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  return (
    <section className="relative z-10 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">探索IKUN之家</h2>
          <p className="text-gray-400">发现小黑子世界的无限精彩</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <button
              type="button"
              key={feature.title}
              onClick={() => onTabChange(feature.tab)}
              className={
                'group glass rounded-2xl p-6 text-left transition-all duration-300 ' +
                'hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ' +
                'bg-gradient-to-br cursor-pointer ' +
                feature.gradient
              }
            >
              <div
                className="text-4xl mb-3 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {feature.emoji}
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-ikun-yellow transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-ikun-yellow/0 group-hover:text-ikun-yellow transition-all">
                进入
                <ChevronRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedSection({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  return (
    <section className="relative z-10 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden glass rounded-3xl p-8 sm:p-12 text-center">
          <div
            className="absolute inset-0 bg-gradient-to-br from-ikun-yellow/10 via-transparent to-ikun-golden/10 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-6xl mb-6 animate-bounce-custom" aria-hidden="true">
              🏆
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今日热门挑战</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              完成 IKUN 纯度测试，看看你的小黑子等级！测试你对 ikun 文化的了解程度，从萌新到大神。
            </p>
            <button
              type="button"
              onClick={() => onTabChange('games')}
              className="px-8 py-4 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-2xl text-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ikun-yellow/30 cursor-pointer inline-flex items-center gap-2"
            >
              <FlaskConical size={20} aria-hidden="true" />
              开始测试
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

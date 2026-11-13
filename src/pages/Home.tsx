import { ArrowUpRight, ChevronRight, Gamepad2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import SectionHeader from '@/components/SectionHeader'
import StatsCounter from '@/components/StatsCounter'
import { getVisitCount, recordVisit } from '@/store'
import type { TabId } from '@/types'

interface HomeProps {
  onTabChange: (tab: TabId) => void
}

export default function Home({ onTabChange }: HomeProps) {
  const [visitCount, setVisitCount] = useState(getVisitCount)

  useEffect(() => {
    setVisitCount(recordVisit())
  }, [])

  return (
    <div className="relative z-10">
      <Hero onTabChange={onTabChange} visitCount={visitCount} />
      <StatsCounter />
      <BentoFeatures onTabChange={onTabChange} />
      <CultureSection />
      <FinalCta onTabChange={onTabChange} />
    </div>
  )
}

/* ================================================================
   Hero：左侧大标题 + 右侧卡片堆叠
   ================================================================ */
function Hero({
  onTabChange,
  visitCount,
}: {
  onTabChange: (tab: TabId) => void
  visitCount: number
}) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden pt-28 pb-16">
      <div
        className="absolute inset-0 bg-grid mask-fade-b opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          {/* 左：文字 */}
          <div>
            <span className="badge-pill animate-fadeUp">
              <Sparkles size={12} aria-hidden="true" />
              小黑子的专属精神家园
            </span>

            <h1 className="type-display mt-6 animate-fadeUp" style={{ animationDelay: '0.06s' }}>
              欢迎来到
              <br />
              <span className="text-gradient-gold">IKUN之家</span>
            </h1>

            <p
              className="type-body mt-6 max-w-xl animate-fadeUp"
              style={{ animationDelay: '0.12s' }}
            >
              唱 · 跳 · Rap · 篮球。这里收着 60 个表情包、40 个互动项目、10
              款小游戏，还有一整面属于小黑子的留言墙。全部纯前端，断网也能玩。
            </p>

            <div
              className="flex flex-wrap items-center gap-3 mt-9 animate-fadeUp"
              style={{ animationDelay: '0.18s' }}
            >
              <button
                type="button"
                onClick={() => onTabChange('lab')}
                className="group flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ikun-yellow/25 cursor-pointer"
              >
                进入鸡窝
                <ChevronRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => onTabChange('encyclopedia')}
                className="px-7 py-3.5 rounded-2xl border border-white/12 bg-white/5 text-white font-bold hover:bg-white/10 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                看看图鉴
              </button>
            </div>

            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 type-caption animate-fadeUp"
              style={{ animationDelay: '0.24s' }}
            >
              <span>
                已有{' '}
                <span className="text-ikun-yellow font-bold tabular-nums">
                  {visitCount.toLocaleString('zh-CN')}
                </span>{' '}
                位小黑子到访
              </span>
              <span className="w-8 divider" aria-hidden="true" />
              <span>40 个互动项目 · 全部离线可用</span>
            </div>
          </div>

          {/* 右：卡片堆叠 */}
          <div className="relative hidden lg:block h-[420px]" aria-hidden="true">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-ikun-yellow/10 via-transparent to-purple-500/10 blur-2xl" />

            <div
              className="absolute top-6 left-4 w-56 h-64 rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-sm -rotate-6 animate-float"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="grid place-items-center h-full text-7xl opacity-40">🏀</div>
            </div>

            <div
              className="absolute top-16 right-0 w-56 h-64 rounded-3xl border border-white/8 bg-white/[0.04] backdrop-blur-sm rotate-6 animate-float"
              style={{ animationDelay: '1.2s' }}
            >
              <div className="grid place-items-center h-full text-7xl opacity-40">🎤</div>
            </div>

            <div className="absolute top-28 left-1/2 -translate-x-1/2 w-60 h-72 rounded-3xl border border-ikun-yellow/30 bg-ikun-dark/90 backdrop-blur-xl shadow-2xl shadow-black/60 animate-float">
              <div className="grid place-items-center h-full">
                <span className="text-8xl">🐔</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   Bento 功能网格
   ================================================================ */
interface BentoItem {
  key: string
  emoji: string
  title: string
  desc: string
  tab: TabId
  badge: string
  span: string
  featured?: boolean
  glow: string
}

const BENTO: BentoItem[] = [
  {
    key: 'lab',
    emoji: '🧪',
    title: '互动实验室',
    desc: '40 个纯前端互动项目：反应、脑力、生成器、测试、音效、工具。',
    tab: 'lab',
    badge: '40 项',
    span: 'lg:col-span-2 lg:row-span-2',
    featured: true,
    glow: 'from-yellow-500/15',
  },
  {
    key: 'sandbox',
    emoji: '🧲',
    title: '物理沙盒',
    desc: '拖动、投掷、引爆，实时圆体物理模拟。',
    tab: 'sandbox',
    badge: '实时物理',
    span: 'lg:col-span-2',
    glow: 'from-cyan-500/12',
  },
  {
    key: 'encyclopedia',
    emoji: '📖',
    title: 'IKUN图鉴',
    desc: '12 位角色',
    tab: 'encyclopedia',
    badge: '12',
    span: '',
    glow: 'from-blue-500/12',
  },
  {
    key: 'memes',
    emoji: '😱',
    title: '表情包',
    desc: '60 个表情',
    tab: 'memes',
    badge: '60',
    span: '',
    glow: 'from-green-500/12',
  },
  {
    key: 'music',
    emoji: '🎵',
    title: '音乐播放器',
    desc: '10 首曲目，无漂移进度条，空格键控制。',
    tab: 'music',
    badge: '10 首',
    span: 'lg:col-span-2',
    glow: 'from-pink-500/12',
  },
  {
    key: 'games',
    emoji: '🎮',
    title: '小游戏',
    desc: '接篮球、抓鸡、反应测试、纯度测试、投篮挑战、坤坤琴键、今日坤签、只因合成、鸡窝放置、只因打字。',
    tab: 'games',
    badge: '10 款',
    span: 'lg:col-span-2',
    glow: 'from-orange-500/12',
  },
]

function BentoFeatures({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  return (
    <section className="section" aria-labelledby="features-title">
      <div className="container-page">
        <SectionHeader
          index="02"
          eyebrow="功能地图"
          title="每一格都是一片新大陆"
          description="从图鉴到沙盒，从表情包到互动实验室。点开看看，说不定就出不来了。"
          className="mb-10 sm:mb-12"
        />

        <div className="bento">
          {BENTO.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => onTabChange(item.tab)}
              className={
                'bento-item group text-left p-5 sm:p-6 cursor-pointer ' +
                'bg-gradient-to-br to-transparent ' +
                item.glow +
                ' ' +
                item.span
              }
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={
                    'transition-transform duration-300 group-hover:scale-110 ' +
                    (item.featured ? 'text-5xl sm:text-6xl' : 'text-3xl')
                  }
                  aria-hidden="true"
                >
                  {item.emoji}
                </span>
                <span className="badge-pill shrink-0">{item.badge}</span>
              </div>

              <div className="mt-auto pt-4">
                <h3
                  className={
                    'font-black text-white tracking-tight ' +
                    (item.featured ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg')
                  }
                >
                  {item.title}
                </h3>
                <p
                  className={
                    'text-white/45 mt-1.5 leading-relaxed ' +
                    (item.featured ? 'text-sm sm:text-[15px] max-w-sm' : 'text-xs line-clamp-2')
                  }
                >
                  {item.desc}
                </p>
              </div>

              <span className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={16} className="text-ikun-yellow" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   文化档案
   ================================================================ */
interface CultureItem {
  badge: string
  emoji: string
  title: string
  desc: string
}

const CULTURE: CultureItem[] = [
  {
    badge: '镇馆之宝',
    emoji: '🐔',
    title: '鸡你太美',
    desc: '源自《只因你太美》的一句空耳，意外成为传播最广的文化符号。听到这四个字还能面不改色的，基本可以判定不是自己人。',
  },
  {
    badge: '入教仪式',
    emoji: '🎤',
    title: '唱、跳、RAP、篮球',
    desc: '那段自我介绍，短短几个字，信息量拉满：唱、跳、RAP、篮球——四大才艺一字排开，从此成为 ikun 的接头暗号。',
  },
  {
    badge: '时间计量单位',
    emoji: '⏱️',
    title: '练习时长两年半',
    desc: '在 ikun 的世界里，两年半不是一段时间，而是一种信仰、一种资历、一种宇宙通用计量单位。',
  },
  {
    badge: '镇站神曲',
    emoji: '🎵',
    title: '只因你太美',
    desc: '一切梗的源头，一切故事的开始。前奏一响，DNA 就动了。本站不敢放原曲，但音乐区的坤坤琴键可以让你亲手弹个气氛。',
  },
  {
    badge: '防御姿势',
    emoji: '💪',
    title: '铁山靠',
    desc: '看似普通的一个肩部动作，实则是 ikun 面对一切质疑时的标准防御姿态。挡得住流言，也挡得住尴尬。',
  },
  {
    badge: '处世哲学',
    emoji: '🍋',
    title: '大家要荔枝',
    desc: '「理智」的谐音。当你看到评论区即将失控，只需要轻轻留下一句「大家要荔枝啊」，就能瞬间平息战火。',
  },
]

function CultureSection() {
  return (
    <section className="section" aria-labelledby="culture-title">
      <div className="container-page">
        <SectionHeader
          index="01"
          eyebrow="文化档案"
          title="名场面，一卷都不能少"
          description="每一位 ikun 都会背的经典，全都在这里了。新来的朋友请先补课，老 ikun 请大声朗读并背诵全文。"
          className="mb-10 sm:mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {CULTURE.map((item) => (
            <article key={item.title} className="card p-7 sm:p-9 group">
              <span className="badge-pill mb-5">{item.badge}</span>
              <h3 className="type-h2 flex items-center gap-3 text-white mb-3">
                <span aria-hidden="true">{item.emoji}</span>
                {item.title}
              </h3>
              <p className="type-body">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================
   结尾 CTA
   ================================================================ */
function FinalCta({ onTabChange }: { onTabChange: (tab: TabId) => void }) {
  return (
    <section className="section-tight">
      <div className="container-page">
        <div className="divider mb-14" aria-hidden="true" />
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-5xl mb-5" aria-hidden="true">
            🏆
          </div>
          <h2 className="type-h1 text-white mb-4">测测你的 IKUN 纯度</h2>
          <p className="type-body mb-8">
            15 道题，单题单屏作答，答完还能生成分享卡片。看看你是萌新还是骨灰级小黑子。
          </p>
          <button
            type="button"
            onClick={() => onTabChange('games')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold text-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-ikun-yellow/30 cursor-pointer"
          >
            <Gamepad2 size={20} aria-hidden="true" />
            开始测试
          </button>
        </div>
      </div>
    </section>
  )
}

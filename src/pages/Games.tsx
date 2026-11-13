import {
  Crosshair,
  FlaskConical,
  Gamepad2,
  Layers,
  Music,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAchievements } from '@/achievements'
import SectionHeader from '@/components/SectionHeader'
import CatchBasketball from './games/CatchBasketball'
import CatchChicken from './games/CatchChicken'
import FortuneDraw from './games/FortuneDraw'
import IdleNest from './games/IdleNest'
import KunPiano from './games/KunPiano'
import MergeChicken from './games/MergeChicken'
import PurityTest from './games/PurityTest'
import ReactionTest from './games/ReactionTest'
import ShootingChallenge from './games/ShootingChallenge'

type GameId =
  | 'menu'
  | 'basketball'
  | 'chicken'
  | 'reaction'
  | 'purity'
  | 'shooting'
  | 'piano'
  | 'fortune'
  | 'merge'
  | 'idle'

const GAMES: {
  id: GameId
  emoji: string
  title: string
  desc: string
  tag: string
  accent: string
  icon: React.ReactNode
}[] = [
  {
    id: 'basketball',
    emoji: '🏀',
    title: '接篮球',
    desc: '左右移动接住落下的篮球，漏掉 3 个就结束',
    tag: '操作 · 生存',
    accent: 'from-orange-500/15 to-red-500/15',
    icon: <Target size={18} />,
  },
  {
    id: 'chicken',
    emoji: '🐔',
    title: '抓鸡大作战',
    desc: '30 秒内点击尽可能多的鸡，手速决定一切',
    tag: '手速 · 限时',
    accent: 'from-yellow-500/15 to-amber-500/15',
    icon: <Zap size={18} />,
  },
  {
    id: 'reaction',
    emoji: '⚡',
    title: '小黑子反应测试',
    desc: '屏幕变绿立刻点击，测出你的真实反应速度',
    tag: '反应 · 评级',
    accent: 'from-blue-500/15 to-cyan-500/15',
    icon: <Zap size={18} />,
  },
  {
    id: 'purity',
    emoji: '🧪',
    title: 'IKUN纯度测试',
    desc: '15 道题，看看你是萌新还是骨灰级小黑子',
    tag: '答题 · 称号',
    accent: 'from-purple-500/15 to-pink-500/15',
    icon: <FlaskConical size={18} />,
  },
  {
    id: 'shooting',
    emoji: '🎯',
    title: '投篮挑战',
    desc: '跑针停进绿色区就进球，越靠近中心评价越高',
    tag: '时机 · 手感',
    accent: 'from-green-500/15 to-emerald-500/15',
    icon: <Crosshair size={18} />,
  },
  {
    id: 'piano',
    emoji: '🎹',
    title: '坤坤琴键',
    desc: '五声音阶的五个键，怎么乱弹都不难听',
    tag: '音乐 · 弹奏',
    accent: 'from-pink-500/15 to-rose-500/15',
    icon: <Music size={18} />,
  },
  {
    id: 'fortune',
    emoji: '🔮',
    title: '今日坤签',
    desc: '进门先抽一签，看看今天宜干什么',
    tag: '每日 · 玄学',
    accent: 'from-amber-500/15 to-yellow-500/15',
    icon: <Sparkles size={18} />,
  },
  {
    id: 'merge',
    emoji: '🧬',
    title: '只因合成',
    desc: '滑动合并同级单位，从 🐣 一路合成到 👑 只因之神',
    tag: '合并 · 刷分',
    accent: 'from-teal-500/15 to-emerald-500/15',
    icon: <Layers size={18} />,
  },
  {
    id: 'idle',
    emoji: '🏡',
    title: '鸡窝放置',
    desc: '买设施自动产出只因值，离线也能攒，最高 8 小时',
    tag: '放置 · 挂机',
    accent: 'from-yellow-500/15 to-orange-500/15',
    icon: <TrendingUp size={18} />,
  },
]

export default function Games() {
  const [activeGame, setActiveGame] = useState<GameId>('menu')
  const { record } = useAchievements()

  const goMenu = useCallback(() => setActiveGame('menu'), [])

  const startGame = useCallback(
    (id: GameId) => {
      setActiveGame(id)
      record({ type: 'game' })
    },
    [record],
  )

  // 游戏内按 Esc 返回菜单
  useEffect(() => {
    if (activeGame === 'menu') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeGame, goMenu])

  if (activeGame === 'basketball') return <CatchBasketball onBack={goMenu} />
  if (activeGame === 'chicken') return <CatchChicken onBack={goMenu} />
  if (activeGame === 'reaction') return <ReactionTest onBack={goMenu} />
  if (activeGame === 'purity') return <PurityTest onBack={goMenu} />
  if (activeGame === 'shooting') return <ShootingChallenge onBack={goMenu} />
  if (activeGame === 'piano') return <KunPiano onBack={goMenu} />
  if (activeGame === 'fortune') return <FortuneDraw onBack={goMenu} />
  if (activeGame === 'merge') return <MergeChicken onBack={goMenu} />
  if (activeGame === 'idle') return <IdleNest onBack={goMenu} />

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-page">
        <SectionHeader
          index="06"
          eyebrow="小游戏中心"
          title="挑战你的极限"
          description="九款小游戏：接篮球、抓鸡、反应测试、纯度测试、投篮挑战、坤坤琴键、今日坤签、只因合成、鸡窝放置。全部纯前端实现，进度本地保存。"
          className="mb-12"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAMES.map((game) => (
            <button
              type="button"
              key={game.id}
              onClick={() => startGame(game.id)}
              className={
                'group card p-7 text-left transition-all duration-300 ' +
                'hover:-translate-y-1 bg-gradient-to-br cursor-pointer ' +
                game.accent
              }
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-5xl transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {game.emoji}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-black/30 text-gray-400">
                  {game.icon}
                  {game.tag}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-ikun-yellow transition-colors">
                {game.title}
              </h2>
              <p className="text-sm text-gray-400 mb-4">{game.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-ikun-yellow opacity-0 group-hover:opacity-100 transition-opacity">
                开始游戏 →
              </span>
            </button>
          ))}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-gray-600 mt-8">
          <Gamepad2 size={12} aria-hidden="true" />
          游戏内按 Esc 可返回菜单
        </p>
      </div>
    </div>
  )
}

/**
 * 成就定义（纯数据，不依赖 React）。
 * 单独拆出来的原因：
 *  1. 可以在 Node 环境直接单元测试
 *  2. AI 编码工具检索「有哪些成就」时不需要理解 React 上下文
 */

/* ------------------------------ 统计模型 ------------------------------ */

export interface PlayerStats {
  tabs: string[]
  features: string[]
  messages: number
  likes: number
  memes: number
  songs: number
  games: number
  usedSearch: boolean
  usedPalette: boolean
  triggeredEgg: boolean
  changedTheme: boolean
  bestCps: number
  bestPurity: number
  days: string[]
  nightOwl: boolean
}

export const EMPTY: PlayerStats = {
  tabs: [],
  features: [],
  messages: 0,
  likes: 0,
  memes: 0,
  songs: 0,
  games: 0,
  usedSearch: false,
  usedPalette: false,
  triggeredEgg: false,
  changedTheme: false,
  bestCps: 0,
  bestPurity: 0,
  days: [],
  nightOwl: false,
}

/* ------------------------------ 成就定义 ------------------------------ */

export interface AchievementDef {
  id: string
  emoji: string
  title: string
  desc: string
  /** 进度计算：返回 [当前值, 目标值]，用于展示进度条 */
  progress: (s: PlayerStats) => [number, number]
  secret?: boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-visit',
    emoji: '🐣',
    title: '初次到访',
    desc: '第一次来到 IKUN之家',
    progress: (s) => [Math.min(s.tabs.length, 1), 1],
  },
  {
    id: 'explorer',
    emoji: '🧭',
    title: '全站通',
    desc: '访问过所有 8 个页面',
    progress: (s) => [s.tabs.length, 8],
  },
  {
    id: 'scholar',
    emoji: '📖',
    title: '图鉴学者',
    desc: '浏览过 IKUN 图鉴',
    progress: (s) => [s.tabs.includes('encyclopedia') ? 1 : 0, 1],
  },
  {
    id: 'collector',
    emoji: '😱',
    title: '表情包收藏家',
    desc: '收藏 5 个表情包',
    progress: (s) => [Math.min(s.memes, 5), 5],
  },
  {
    id: 'audiophile',
    emoji: '🎧',
    title: '音乐发烧友',
    desc: '收藏 3 首歌',
    progress: (s) => [Math.min(s.songs, 3), 3],
  },
  {
    id: 'gamer',
    emoji: '🎮',
    title: '游戏高手',
    desc: '玩过任意一个小游戏',
    progress: (s) => [Math.min(s.games, 1), 1],
  },
  {
    id: 'lab-10',
    emoji: '🧪',
    title: '实验室常客',
    desc: '体验 10 个互动项目',
    progress: (s) => [Math.min(s.features.length, 10), 10],
  },
  {
    id: 'lab-30',
    emoji: '🔬',
    title: '实验室狂人',
    desc: '体验 30 个互动项目',
    progress: (s) => [Math.min(s.features.length, 30), 30],
  },
  {
    id: 'lab-all',
    emoji: '🏅',
    title: '全知者',
    desc: '体验全部 40 个互动项目',
    progress: (s) => [Math.min(s.features.length, 40), 40],
  },
  {
    id: 'talker',
    emoji: '💬',
    title: '话痨',
    desc: '在留言墙发布 3 条留言',
    progress: (s) => [Math.min(s.messages, 3), 3],
  },
  {
    id: 'liker',
    emoji: '❤️',
    title: '点赞狂魔',
    desc: '给留言点赞 10 次',
    progress: (s) => [Math.min(s.likes, 10), 10],
  },
  {
    id: 'searcher',
    emoji: '🔍',
    title: '搜索达人',
    desc: '使用过全站搜索',
    progress: (s) => [s.usedSearch ? 1 : 0, 1],
  },
  {
    id: 'keyboard',
    emoji: '⌨️',
    title: '键盘侠',
    desc: '用 Ctrl + K 打开命令面板',
    progress: (s) => [s.usedPalette ? 1 : 0, 1],
  },
  {
    id: 'eggs',
    emoji: '🎉',
    title: '彩蛋猎人',
    desc: '发现了隐藏彩蛋',
    progress: (s) => [s.triggeredEgg ? 1 : 0, 1],
  },
  {
    id: 'stylist',
    emoji: '🎨',
    title: '换肤达人',
    desc: '切换过一次主题配色',
    progress: (s) => [s.changedTheme ? 1 : 0, 1],
  },
  {
    id: 'night-owl',
    emoji: '🦉',
    title: '夜猫子',
    desc: '在凌晨 0-5 点访问本站',
    progress: (s) => [s.nightOwl ? 1 : 0, 1],
    secret: true,
  },
  {
    id: 'speed',
    emoji: '⚡',
    title: '手速之神',
    desc: 'CPS 达到 8 以上',
    progress: (s) => [Math.min(s.bestCps, 8), 8],
  },
  {
    id: 'pure',
    emoji: '🧬',
    title: '只因之神',
    desc: '纯度测试拿到 100 分',
    progress: (s) => [Math.min(s.bestPurity, 100), 100],
    secret: true,
  },
  {
    id: 'loyal',
    emoji: '📅',
    title: '三日忠实粉',
    desc: '累计 3 天访问本站',
    progress: (s) => [Math.min(s.days.length, 3), 3],
  },
  {
    id: 'completionist',
    emoji: '👑',
    title: 'IKUN 之神',
    desc: '解锁其他全部 19 个成就',
    progress: (s) => {
      const others = ACHIEVEMENTS.filter((a) => a.id !== 'completionist')
      const done = others.filter((a) => {
        const [cur, goal] = a.progress(s)
        return cur >= goal
      }).length
      return [done, others.length]
    },
    secret: true,
  },
]

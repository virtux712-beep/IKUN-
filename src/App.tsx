import { Loader2 } from 'lucide-react'
import { AnimatePresence, domAnimation, LazyMotion, m, useReducedMotion } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AchievementProvider, useAchievements } from '@/achievements'
import AchievementsPanel from '@/components/AchievementsPanel'
import type { PaletteCommand } from '@/components/CommandPalette'
import CommandPalette from '@/components/CommandPalette'
import CursorTrail from '@/components/CursorTrail'
import EasterEgg from '@/components/EasterEgg'
import ErrorBoundary from '@/components/ErrorBoundary'
import Footer from '@/components/Footer'
import KunPet from '@/components/KunPet'
import Navbar from '@/components/Navbar'
import ParticleBackground from '@/components/ParticleBackground'
import ScrollProgress from '@/components/ScrollProgress'
import SettingsPanel from '@/components/SettingsPanel'
import { ToastProvider, useToast } from '@/components/Toast'
import { useClickCounter, useHotkey } from '@/hooks'
import { useTypingCluck } from '@/hooks/useTypingCluck'
import { SettingsProvider, useSettings } from '@/settings'
import type { TabId } from '@/types'
import { isTabId } from '@/types'

/* 按需加载页面：首屏只下载首页，其余页面访问时再拉取 */
const Home = lazy(() => import('@/pages/Home'))
const Encyclopedia = lazy(() => import('@/pages/Encyclopedia'))
const MemeCenter = lazy(() => import('@/pages/MemeCenter'))
const MusicPlayer = lazy(() => import('@/pages/MusicPlayer'))
const Games = lazy(() => import('@/pages/Games'))
const Lab = lazy(() => import('@/pages/Lab'))
const Sandbox = lazy(() => import('@/pages/Sandbox'))
const MessageBoard = lazy(() => import('@/pages/MessageBoard'))
const SearchPage = lazy(() => import('@/pages/Search'))

const NAV_META: Record<TabId, { emoji: string; label: string; hint: string }> = {
  home: { emoji: '🏠', label: '首页', hint: '回到首页' },
  encyclopedia: { emoji: '📖', label: 'IKUN图鉴', hint: '查看角色图鉴' },
  memes: { emoji: '😱', label: '表情包', hint: '浏览表情包中心' },
  music: { emoji: '🎵', label: '音乐区', hint: '打开音乐播放器' },
  games: { emoji: '🎮', label: '小游戏', hint: '挑战小游戏与纯度测试' },
  lab: { emoji: '🧪', label: '互动实验室', hint: '40 个纯前端互动项目' },
  sandbox: { emoji: '🧲', label: '物理沙盒', hint: '拖动鸡和篮球的物理世界' },
  messages: { emoji: '💬', label: '留言墙', hint: '看看大家在说什么' },
  search: { emoji: '🔍', label: '搜索', hint: '搜索全站内容' },
}

function readTabFromHash(): TabId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return isTabId(raw) ? raw : 'home'
}

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 size={26} className="animate-spin text-ikun-yellow" aria-hidden="true" />
        <span className="text-sm">加载中…</span>
      </div>
    </div>
  )
}

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>(readTabFromHash)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [achOpen, setAchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const toast = useToast()
  const reducedMotion = useReducedMotion()
  const settings = useSettings()
  const { record, unlocked } = useAchievements()

  // 打字鸡叫（设置里默认关闭）
  useTypingCluck()

  const navigate = useCallback(
    (tab: TabId) => {
      setActiveTab(tab)
      if (window.location.hash !== `#/${tab}`) {
        window.location.hash = `#/${tab}`
      }
      window.scrollTo({ top: 0, behavior: 'auto' })
      record({ type: 'tab', tab })
    },
    [record],
  )

  // 浏览器前进 / 后退
  useEffect(() => {
    const onHashChange = () => {
      const tab = readTabFromHash()
      setActiveTab(tab)
      record({ type: 'tab', tab })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [record])

  // 首次进入也算一次访问
  useEffect(() => {
    record({ type: 'tab', tab: readTabFromHash() })
  }, [record])

  // 切换页面时同步文档标题
  useEffect(() => {
    const meta = NAV_META[activeTab]
    document.title =
      activeTab === 'home' ? 'IKUN之家 · 小黑子的专属精神家园' : `${meta.label} · IKUN之家`
  }, [activeTab])

  // 主题切换成就
  const themeRef = useRef(settings.theme)
  useEffect(() => {
    if (themeRef.current === settings.theme) return
    themeRef.current = settings.theme
    record({ type: 'theme' })
  }, [settings.theme, record])

  const triggerEasterEgg = useCallback(() => {
    setShowEasterEgg(true)
    record({ type: 'egg' })
  }, [record])
  const handleLogoClick = useClickCounter(5, triggerEasterEgg)
  const hideEasterEgg = useCallback(() => setShowEasterEgg(false), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  // 彩蛋：键盘输入 ikun
  useEffect(() => {
    let buffer = ''
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      if (e.key.length !== 1) return
      buffer = (buffer + e.key.toLowerCase()).slice(-8)
      if (buffer.includes('ikun')) {
        buffer = ''
        setShowEasterEgg(true)
        record({ type: 'egg' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [record])

  useHotkey({ key: 'k', ctrlOrMeta: true }, (e) => {
    e.preventDefault()
    setPaletteOpen((open) => !open)
    record({ type: 'palette' })
  })

  const commands = useMemo<PaletteCommand[]>(() => {
    const navCommands: PaletteCommand[] = (Object.keys(NAV_META) as TabId[]).map((tab) => ({
      id: `nav-${tab}`,
      label: NAV_META[tab].label,
      hint: NAV_META[tab].hint,
      emoji: NAV_META[tab].emoji,
      keywords: [tab],
      group: '页面导航',
      run: () => navigate(tab),
    }))

    return [
      ...navCommands,
      {
        id: 'achievements',
        label: '查看成就',
        hint: `已解锁 ${unlocked.length} 个徽章`,
        emoji: '🏆',
        keywords: ['achievement', 'badge', '成就', '徽章'],
        group: '趣味功能',
        run: () => setAchOpen(true),
      },
      {
        id: 'settings',
        label: '打开设置',
        hint: '主题 / 音效 / 特效',
        emoji: '⚙️',
        keywords: ['setting', 'theme', '设置', '主题'],
        group: '趣味功能',
        run: () => setSettingsOpen(true),
      },
      {
        id: 'easter-egg',
        label: '召唤彩蛋',
        hint: '鸡你太美！',
        emoji: '🎉',
        keywords: ['easter', 'egg', 'caidan', '彩蛋'],
        group: '趣味功能',
        run: triggerEasterEgg,
      },
      {
        id: 'copy-link',
        label: '复制当前页面链接',
        hint: '分享给其他小黑子',
        emoji: '🔗',
        keywords: ['share', 'url', 'link', '分享', '链接'],
        group: '趣味功能',
        run: () => {
          navigator.clipboard
            ?.writeText(window.location.href)
            .then(() => toast.success('链接已复制'))
            .catch(() => toast.error('复制失败，请手动复制地址栏'))
        },
      },
    ]
  }, [navigate, toast, unlocked.length, triggerEasterEgg])

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onTabChange={navigate} />
      case 'encyclopedia':
        return <Encyclopedia />
      case 'memes':
        return <MemeCenter />
      case 'music':
        return <MusicPlayer />
      case 'games':
        return <Games />
      case 'lab':
        return <Lab />
      case 'sandbox':
        return <Sandbox />
      case 'messages':
        return <MessageBoard />
      case 'search':
        return <SearchPage onTabChange={navigate} />
      default:
        return <Home onTabChange={navigate} />
    }
  }

  return (
    <div className="min-h-screen bg-ikun-black text-white font-sans">
      <ParticleBackground />
      <CursorTrail />
      <KunPet />

      <div className="ambient" aria-hidden="true" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-ikun-yellow focus:text-black focus:font-bold"
      >
        跳到主要内容
      </a>

      <ScrollProgress />

      <Navbar
        activeTab={activeTab}
        onTabChange={navigate}
        onLogoClick={handleLogoClick}
        onOpenSearch={() => setPaletteOpen(true)}
        onOpenAchievements={() => setAchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        unlockedCount={unlocked.length}
      />

      <main id="main-content" className="relative z-10">
        <LazyMotion features={domAnimation} strict>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <ErrorBoundary key={activeTab}>
                <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
              </ErrorBoundary>
            </m.div>
          </AnimatePresence>
        </LazyMotion>
      </main>

      <Footer onTabChange={navigate} />

      <EasterEgg show={showEasterEgg} onHide={hideEasterEgg} />
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
      <AchievementsPanel open={achOpen} onClose={() => setAchOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <AchievementProvider>
          <AppShell />
        </AchievementProvider>
      </ToastProvider>
    </SettingsProvider>
  )
}

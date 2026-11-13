import { Menu, Search, Settings, Trophy, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { TabId } from '@/types'

interface NavbarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onLogoClick?: () => void
  onOpenSearch?: () => void
  onOpenAchievements?: () => void
  onOpenSettings?: () => void
  unlockedCount?: number
}

const navItems: { id: TabId; label: string; emoji: string }[] = [
  { id: 'home', label: '首页', emoji: '🏠' },
  { id: 'encyclopedia', label: '图鉴', emoji: '📖' },
  { id: 'memes', label: '表情包', emoji: '😱' },
  { id: 'music', label: '音乐', emoji: '🎵' },
  { id: 'games', label: '游戏', emoji: '🎮' },
  { id: 'lab', label: '实验室', emoji: '🧪' },
  { id: 'sandbox', label: '沙盒', emoji: '🧲' },
  { id: 'messages', label: '留言', emoji: '💬' },
  { id: 'search', label: '搜索', emoji: '🔍' },
]

export default function Navbar({
  activeTab,
  onTabChange,
  onLogoClick,
  onOpenSearch,
  onOpenAchievements,
  onOpenSettings,
  unlockedCount = 0,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let frame = 0
    const handler = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setScrolled(window.scrollY > 40)
      })
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // 移动端菜单打开时锁定页面滚动
  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  // Esc 关闭移动端菜单
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const handleTabClick = useCallback(
    (id: TabId) => {
      onTabChange(id)
      setMobileOpen(false)
    },
    [onTabChange],
  )

  return (
    <>
      <header
        className={
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ' +
          (scrolled
            ? 'bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30'
            : 'bg-black/40 backdrop-blur-md border-b border-transparent')
        }
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6" aria-label="主导航">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo */}
            <button
              type="button"
              onClick={() => {
                onLogoClick?.()
                handleTabClick('home')
              }}
              className="flex items-center gap-2 shrink-0 rounded-lg px-1 cursor-pointer"
              aria-label="IKUN之家首页"
            >
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                🐔
              </span>
              <span className="font-bold text-lg hidden sm:inline">
                <span className="text-ikun-yellow">IKUN</span>
                <span className="text-white">之家</span>
              </span>
            </button>

            {/* 桌面导航：整行内容（Logo + 9 项 + 右侧操作）实测需约 1100px，
                lg(1024) 宽度带内会挤压换行，故断点上调到 xl(1280)，中间带走汉堡菜单 */}
            <ul className="hidden xl:flex items-center gap-0.5 shrink-0">
              {navItems.map((item) => {
                const active = activeTab === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={
                        'relative px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ' +
                        (active
                          ? 'text-ikun-yellow bg-ikun-yellow/10'
                          : 'text-gray-400 hover:text-white hover:bg-white/5')
                      }
                    >
                      <span className="mr-1" aria-hidden="true">
                        {item.emoji}
                      </span>
                      {item.label}
                      {active && (
                        <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-ikun-yellow" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* 右侧操作 */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenSearch}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="打开命令面板"
                title="搜索 / 快速跳转（Ctrl+K）"
              >
                <Search size={14} />
                <kbd className="text-[10px] font-mono opacity-70">Ctrl K</kbd>
              </button>

              <button
                type="button"
                onClick={onOpenAchievements}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-ikun-yellow transition-colors cursor-pointer"
                aria-label="查看成就"
                title="成就徽章"
              >
                <Trophy size={14} />
                <span className="text-[10px] font-bold tabular-nums">{unlockedCount}</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="打开设置"
                title="设置"
              >
                <Settings size={15} />
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="xl:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* 移动端菜单 */}
      <div
        id="mobile-menu"
        className={
          'fixed inset-0 z-40 xl:hidden transition-opacity duration-200 ' +
          (mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')
        }
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="absolute inset-0 w-full h-full bg-black/80 backdrop-blur-sm cursor-default"
          onClick={() => setMobileOpen(false)}
          aria-label="关闭菜单"
        />
        <div
          className={
            'absolute top-16 left-0 right-0 bg-ikun-dark/98 backdrop-blur-xl border-b border-white/10 transition-transform duration-300 ' +
            (mobileOpen ? 'translate-y-0' : '-translate-y-4')
          }
        >
          <div className="p-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {navItems.map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ' +
                    (active
                      ? 'bg-ikun-yellow/15 text-ikun-yellow'
                      : 'text-gray-300 hover:bg-white/5')
                  }
                >
                  <span className="text-xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

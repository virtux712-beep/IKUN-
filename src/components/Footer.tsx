import type { TabId } from '@/types'

interface FooterProps {
  onTabChange: (tab: TabId) => void
}

const quickLinks: { id: TabId; emoji: string; label: string }[] = [
  { id: 'encyclopedia', emoji: '📖', label: 'IKUN图鉴' },
  { id: 'memes', emoji: '😱', label: '表情包' },
  { id: 'music', emoji: '🎵', label: '音乐区' },
  { id: 'games', emoji: '🎮', label: '小游戏' },
  { id: 'lab', emoji: '🧪', label: '互动实验室' },
  { id: 'sandbox', emoji: '🧲', label: '物理沙盒' },
  { id: 'messages', emoji: '💬', label: '留言墙' },
  { id: 'search', emoji: '🔍', label: '搜索' },
]

export default function Footer({ onTabChange }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* 品牌 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl" aria-hidden="true">
                🐔
              </span>
              <span className="font-bold text-xl">
                <span className="text-ikun-yellow">IKUN</span>
                <span className="text-white">之家</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              小黑子的专属精神家园，在这里你可以尽情探索 ikun 文化的魅力。唱跳 rap
              篮球，一个都不能少！
            </p>
          </div>

          {/* 快捷导航 */}
          <nav aria-label="页脚导航">
            <h2 className="font-bold text-white mb-4 text-base">快速导航</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => onTabChange(link.id)}
                    className="text-gray-400 hover:text-ikun-yellow transition-colors cursor-pointer text-left"
                  >
                    <span className="mr-1" aria-hidden="true">
                      {link.emoji}
                    </span>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* 关于 */}
          <div>
            <h2 className="font-bold text-white mb-4 text-base">关于本站</h2>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>🌅 React 19 + TypeScript 构建</li>
              <li>🎨 Tailwind CSS 4 样式设计</li>
              <li>💾 LocalStorage 本地存储</li>
              <li>📱 完美适配移动端</li>
              <li>
                ⌨️ 按{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-white/15 text-[11px] font-mono">
                  Ctrl K
                </kbd>{' '}
                快速跳转
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-sm text-gray-500">
          <p>© {year} IKUN之家 · 小黑子的专属精神家园</p>
          <p className="mt-1">Made with 🐔 by IKUN · 纯属娱乐，请勿对号入座</p>
        </div>
      </div>
    </footer>
  )
}

import { Share2, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'
import { ACHIEVEMENTS, useAchievements } from '@/achievements'
import ShareSheet from '@/components/ShareSheet'
import { Bar } from '@/features/ui'

export default function AchievementsPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { stats, unlocked } = useAchievements()
  const [shareOpen, setShareOpen] = useState(false)
  const total = ACHIEVEMENTS.length
  const done = unlocked.length

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="成就列表"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <m.div
            className="relative glass rounded-3xl w-full max-w-lg max-h-[86vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
              <span className="text-2xl" aria-hidden="true">
                🏆
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-white">成就徽章</h2>
                <p className="text-xs text-gray-500">
                  已解锁 {done} / {total}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-ikun-yellow hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="生成成就分享图"
                title="分享我的成就"
              >
                <Share2 size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pt-4">
              <Bar value={done} max={total} />
            </div>

            <div className="p-5 overflow-y-auto space-y-2">
              {ACHIEVEMENTS.map((a) => {
                const isUnlocked = unlocked.includes(a.id)
                const [cur, goal] = a.progress(stats)
                const pct = goal === 0 ? 100 : Math.min(100, (cur / goal) * 100)
                return (
                  <div
                    key={a.id}
                    className={
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ' +
                      (isUnlocked
                        ? 'bg-ikun-yellow/10 border-ikun-yellow/25'
                        : 'bg-white/[0.03] border-white/5')
                    }
                  >
                    <span
                      className={`text-2xl shrink-0 ${isUnlocked ? '' : 'grayscale opacity-40'}`}
                    >
                      {isUnlocked ? a.emoji : '🔒'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            'text-sm font-bold truncate ' +
                            (isUnlocked ? 'text-white' : 'text-gray-400')
                          }
                        >
                          {a.title}
                        </span>
                        {a.secret && !isUnlocked && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-500 shrink-0">
                            隐藏
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{a.desc}</p>
                      {!isUnlocked && (
                        <div className="mt-1.5">
                          <Bar value={pct} max={100} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums shrink-0">
                      {Math.min(cur, goal)}/{goal}
                    </span>
                  </div>
                )
              })}
            </div>
          </m.div>
        </m.div>
      )}

      <ShareSheet
        open={shareOpen}
        data={{
          emoji: done >= total ? '👑' : '🏆',
          title: '我的 IKUN 成就',
          subtitle: '在小黑子的路上越走越远',
          badge: `${done} / ${total} 个徽章`,
          stats: [
            { label: '已解锁徽章', value: String(done) },
            { label: '体验互动项目', value: String(stats.features.length) },
            { label: '累计访问页面', value: String(stats.tabs.length) },
          ],
          footer: 'IKUN之家 · 成就徽章',
        }}
        onClose={() => setShareOpen(false)}
        filename="ikun-achievements.png"
      />
    </AnimatePresence>
  )
}

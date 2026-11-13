import { Search, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useMemo, useState } from 'react'
import { useAchievements } from '@/achievements'
import SectionHeader from '@/components/SectionHeader'
import { FEATURES } from '@/features/registry'
import type { FeatureCategory, FeatureDef } from '@/features/types'
import { CATEGORY_META } from '@/features/types'

type Filter = 'all' | FeatureCategory

export default function Lab() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<FeatureDef | null>(null)
  const { record } = useAchievements()

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FEATURES.filter((f) => {
      const matchCat = filter === 'all' || f.category === filter
      const matchQ =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      return matchCat && matchQ
    })
  }, [filter, query])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: FEATURES.length }
    for (const f of FEATURES) map[f.category] = (map[f.category] ?? 0) + 1
    return map
  }, [])

  const ActiveComponent = active?.Component

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-page">
        <SectionHeader
          index="05"
          eyebrow="互动实验室"
          title={FEATURES.length + ' 个纯前端互动项目'}
          description="反应、脑力、生成器、测试、音效、工具六大类，全部零后端、可离线运行。点开任意一张卡片即刻开玩。"
          className="mb-10"
        />

        {/* 搜索 + 分类 */}
        <div className="glass rounded-2xl p-4 mb-8">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索互动项目…"
              aria-label="搜索互动项目"
              className="w-full pl-12 pr-4 py-3 appearance-none bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors"
            />
          </div>

          <fieldset className="flex flex-wrap gap-2 border-0 p-0 m-0 min-w-0">
            <legend className="sr-only">按分类筛选</legend>
            <button
              type="button"
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ' +
                (filter === 'all'
                  ? 'bg-ikun-yellow/20 text-ikun-yellow border-ikun-yellow/30'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10')
              }
            >
              🎲 全部 {counts.all}
            </button>
            {(Object.keys(CATEGORY_META) as FeatureCategory[]).map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className={
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ' +
                  (filter === cat
                    ? 'bg-ikun-yellow/20 text-ikun-yellow border-ikun-yellow/30'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10')
                }
              >
                {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label} {counts[cat] ?? 0}
              </button>
            ))}
          </fieldset>
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {list.map((f) => (
            <button
              type="button"
              key={f.id}
              onClick={() => {
                setActive(f)
                record({ type: 'feature', id: f.id })
              }}
              className="group card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span
                  className="text-3xl shrink-0 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {f.emoji}
                </span>
                <div className="min-w-0">
                  <h2 className="font-bold text-white text-sm group-hover:text-ikun-yellow transition-colors truncate">
                    {f.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{f.desc}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 mt-3">
                <span className="badge-pill !px-2 !py-0.5 !text-[10px]">
                  {CATEGORY_META[f.category].emoji} {CATEGORY_META[f.category].label}
                </span>
                {f.tags.slice(0, 1).map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-500"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {list.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4" aria-hidden="true">
              🔍
            </div>
            <p className="text-gray-400">没有匹配的互动项目</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setFilter('all')
              }}
              className="mt-4 px-4 py-2 text-sm text-ikun-yellow hover:bg-ikun-yellow/10 rounded-lg transition-all cursor-pointer"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      {/* 弹层 */}
      <AnimatePresence>
        {active && ActiveComponent && (
          <m.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            onClick={() => setActive(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <m.div
              className="relative glass rounded-3xl w-full max-w-md max-h-[86vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
                <span className="text-2xl" aria-hidden="true">
                  {active.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white truncate">{active.title}</h2>
                  <p className="text-xs text-gray-500 truncate">{active.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="关闭"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto">
                <ActiveComponent />
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { Check, Copy, Download, Eye, Heart, Search, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAchievements } from '@/achievements'
import SectionHeader from '@/components/SectionHeader'
import { useToast } from '@/components/Toast'
import { memeCategories, memes } from '@/data/memes'
import { getMemeCollection, toggleMemeCollection } from '@/store'
import type { Meme } from '@/types'

export default function MemeCenter() {
  const toast = useToast()
  const { record } = useAchievements()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [onlyFav, setOnlyFav] = useState(false)
  const [collection, setCollection] = useState<string[]>(getMemeCollection)
  const [previewMeme, setPreviewMeme] = useState<Meme | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /* ---------------- 分类计数 ---------------- */
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: memes.length }
    for (const m of memes) map[m.category] = (map[m.category] ?? 0) + 1
    return map
  }, [])

  /* ---------------- 过滤 ---------------- */
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return memes.filter((m) => {
      if (onlyFav && !collection.includes(m.id)) return false
      if (activeCategory !== 'all' && m.category !== activeCategory) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [searchTerm, activeCategory, onlyFav, collection])

  /* ---------------- 预览弹层 Esc ---------------- */
  useEffect(() => {
    if (!previewMeme) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewMeme(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewMeme])

  /* ---------------- 操作 ---------------- */
  const handleCopy = useCallback(
    async (meme: Meme) => {
      const text = meme.emoji + ' ' + meme.name
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        setCopiedId(meme.id)
        toast.success('已复制：' + text)
        setTimeout(() => setCopiedId(null), 1800)
      } catch {
        toast.error('复制失败，请长按手动复制')
      }
    },
    [toast],
  )

  const handleDownload = useCallback(
    (meme: Meme) => {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 600
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const gradient = ctx.createLinearGradient(0, 0, 600, 600)
      gradient.addColorStop(0, '#141414')
      gradient.addColorStop(1, '#2a2410')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 600)

      ctx.strokeStyle = 'rgba(255,215,0,0.3)'
      ctx.lineWidth = 4
      ctx.strokeRect(20, 20, 560, 560)

      ctx.textAlign = 'center'
      ctx.font = '180px "Segoe UI Emoji", "Apple Color Emoji", serif'
      ctx.fillText(meme.emoji, 300, 260)

      ctx.font = 'bold 44px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#FFD700'
      ctx.fillText(meme.name, 300, 370, 500)

      ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#9a9a9a'
      ctx.fillText(meme.description, 300, 425, 500)

      ctx.font = '16px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#4a4a4a'
      ctx.fillText('🐔 IKUN之家 · ikun-home', 300, 530)

      const link = document.createElement('a')
      link.download = 'ikun-meme-' + meme.id + '.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('表情包已下载')
    },
    [toast],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = toggleMemeCollection(id)
      setCollection(next)
      record({ type: 'meme', count: next.length })
      toast.success(next.includes(id) ? '已加入收藏' : '已取消收藏')
    },
    [toast, record],
  )

  const isFav = (id: string) => collection.includes(id)

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-page">
        <SectionHeader
          index="04"
          eyebrow="表情包中心"
          title="一句一个梗，存满整个相册"
          description={
            '共 ' +
            memes.length +
            ' 个 ikun 专属表情包，覆盖经典、反应、舞蹈、篮球、文字、组合六大分类。一键复制、导出 PNG，也能加入收藏慢慢用。'
          }
          className="mb-10"
        />

        {/* 工具栏：吸顶 */}
        <div className="sticky top-16 z-30 py-3 mb-6 bg-ikun-black/85 backdrop-blur-xl border-b border-white/5">
          <div>
            <div className="relative mb-3">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="搜索表情包名称、描述或标签…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="搜索表情包"
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 focus:bg-white/[0.07] transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="清空搜索"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setOnlyFav((v) => !v)}
                aria-pressed={onlyFav}
                className={
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ' +
                  (onlyFav
                    ? 'bg-red-500/20 text-red-300 border-red-400/30'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10')
                }
              >
                <Heart size={12} fill={onlyFav ? 'currentColor' : 'none'} aria-hidden="true" />
                收藏 {collection.length}
              </button>

              <span className="w-px h-5 bg-white/10 shrink-0" aria-hidden="true" />

              {memeCategories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                  className={
                    'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ' +
                    (activeCategory === cat.id
                      ? 'bg-ikun-yellow/20 text-ikun-yellow border-ikun-yellow/30'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10')
                  }
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  {cat.label}
                  <span className="tabular-nums opacity-50">{counts[cat.id] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <p className="text-xs text-gray-500 mb-4 tabular-nums">
          共 <span className="text-ikun-yellow font-bold">{filtered.length}</span> 个结果
          {onlyFav && ' · 仅显示收藏'}
        </p>

        {/* 卡片网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((meme) => (
            <article
              key={meme.id}
              className={
                'card group overflow-hidden flex flex-col ' +
                (isFav(meme.id) ? 'ring-1 ring-red-400/40' : '')
              }
            >
              <button
                type="button"
                onClick={() => setPreviewMeme(meme)}
                className="flex-1 p-4 pb-3 text-center cursor-pointer"
                aria-label={'预览 ' + meme.name}
              >
                <div className="relative h-20 grid place-items-center mb-2">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.16), transparent 70%)',
                    }}
                    aria-hidden="true"
                  />
                  <span className="relative text-5xl transition-transform duration-300 group-hover:scale-110">
                    {meme.emoji}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm mb-1 truncate">{meme.name}</h3>
                <p className="text-[11px] leading-relaxed text-white/40 line-clamp-2 min-h-[2.4em]">
                  {meme.description}
                </p>

                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {meme.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-white/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>

              {/* 操作条 */}
              <div className="grid grid-cols-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setPreviewMeme(meme)}
                  className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-gray-500 hover:text-blue-400 hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="预览"
                >
                  <Eye size={14} aria-hidden="true" />
                  预览
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(meme)}
                  className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-gray-500 hover:text-green-400 hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="复制"
                >
                  {copiedId === meme.id ? (
                    <Check size={14} className="text-green-400" aria-hidden="true" />
                  ) : (
                    <Copy size={14} aria-hidden="true" />
                  )}
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(meme)}
                  className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-gray-500 hover:text-ikun-yellow hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="下载"
                >
                  <Download size={14} aria-hidden="true" />
                  下载
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(meme.id)}
                  aria-label={isFav(meme.id) ? '取消收藏' : '收藏'}
                  aria-pressed={isFav(meme.id)}
                  className={
                    'flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors cursor-pointer hover:bg-white/5 ' +
                    (isFav(meme.id) ? 'text-red-400' : 'text-gray-500 hover:text-red-400')
                  }
                >
                  <Heart
                    size={14}
                    fill={isFav(meme.id) ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                  {isFav(meme.id) ? '已藏' : '收藏'}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4" aria-hidden="true">
              {onlyFav ? '💔' : '🔍'}
            </div>
            <p className="text-white/50 mb-1">
              {onlyFav ? '还没有收藏任何表情包' : '没有找到匹配的表情包'}
            </p>
            <p className="text-xs text-gray-600 mb-6">
              {onlyFav ? '点卡片底部的爱心就能收藏' : '试试换个关键词或分类'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setActiveCategory('all')
                setOnlyFav(false)
              }}
              className="px-5 py-2.5 rounded-xl bg-ikun-yellow/15 text-ikun-yellow text-sm font-bold hover:bg-ikun-yellow/25 transition-colors cursor-pointer"
            >
              重置筛选
            </button>
          </div>
        )}
      </div>

      {/* 预览弹层 */}
      <AnimatePresence>
        {previewMeme && (
          <m.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={previewMeme.name}
            onClick={() => setPreviewMeme(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <m.div
              className="relative card rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <button
                type="button"
                onClick={() => setPreviewMeme(null)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="关闭预览"
              >
                <X size={18} />
              </button>
              <span className="text-8xl block mb-4" aria-hidden="true">
                {previewMeme.emoji}
              </span>
              <h2 className="text-xl font-bold text-white mb-2">{previewMeme.name}</h2>
              <p className="text-gray-400 mb-3">{previewMeme.description}</p>
              <div className="flex flex-wrap gap-1 justify-center mb-6">
                {previewMeme.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  type="button"
                  onClick={() => handleCopy(previewMeme)}
                  className="px-4 py-2 bg-ikun-yellow text-black rounded-xl font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
                >
                  {copiedId === previewMeme.id ? '✅ 已复制' : '📋 复制'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(previewMeme)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-all cursor-pointer"
                >
                  💾 下载
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(previewMeme.id)}
                  className={
                    'px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ' +
                    (isFav(previewMeme.id)
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20')
                  }
                >
                  ❤️ {isFav(previewMeme.id) ? '已收藏' : '收藏'}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { Check, Copy, Download, Eye, Heart, Search, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/Toast'
import { memeCategories, memes } from '@/data/memes'
import { getMemeCollection, toggleMemeCollection } from '@/store'
import type { Meme } from '@/types'

export default function MemeCenter() {
  const toast = useToast()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [collection, setCollection] = useState<string[]>(getMemeCollection)
  const [previewMeme, setPreviewMeme] = useState<Meme | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return memes.filter((m) => {
      const matchCategory = activeCategory === 'all' || m.category === activeCategory
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      return matchCategory && matchSearch
    })
  }, [activeCategory, searchTerm])

  // 预览弹层支持 Esc 关闭
  useEffect(() => {
    if (!previewMeme) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewMeme(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewMeme])

  const handleCopy = useCallback(
    async (meme: Meme) => {
      const text = `${meme.emoji} ${meme.name}`
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
        toast.success(`已复制：${text}`)
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
      canvas.height = 450
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const gradient = ctx.createLinearGradient(0, 0, 600, 450)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 600, 450)

      ctx.strokeStyle = 'rgba(255,215,0,0.25)'
      ctx.lineWidth = 3
      ctx.strokeRect(14, 14, 572, 422)

      ctx.textAlign = 'center'
      ctx.font = '130px "Segoe UI Emoji", "Apple Color Emoji", serif'
      ctx.fillText(meme.emoji, 300, 200)

      ctx.font = 'bold 40px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#FFD700'
      ctx.fillText(meme.name, 300, 285)

      ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#9a9a9a'
      ctx.fillText(meme.description, 300, 335)

      ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#4a4a4a'
      ctx.fillText('🐔 IKUN之家 · ikun-home', 300, 405)

      const link = document.createElement('a')
      link.download = `ikun-meme-${meme.id}.png`
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
      toast.success(next.includes(id) ? '已加入收藏' : '已取消收藏')
    },
    [toast],
  )

  const isFav = (id: string) => collection.includes(id)

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            😱 <span className="text-ikun-yellow">表情包</span>中心
          </h1>
          <p className="text-gray-400">海量 ikun 专属表情包，一键复制使用</p>
          <p className="text-sm text-gray-500 mt-2">
            已收藏 <span className="text-ikun-yellow tabular-nums">{collection.length}</span> 个
          </p>
        </div>

        {/* 搜索 + 分类 */}
        <div className="glass rounded-2xl p-4 mb-8">
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="搜索表情包..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="搜索表情包"
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors"
            />
          </div>
          <fieldset className="flex flex-wrap gap-2 border-0 p-0 m-0 min-w-0">
            <legend className="sr-only">表情包分类</legend>
            {memeCategories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ' +
                  (activeCategory === cat.id
                    ? 'bg-ikun-yellow text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10')
                }
              >
                <span aria-hidden="true">{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </fieldset>
        </div>

        {/* 列表 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((meme) => (
            <article
              key={meme.id}
              className="glass rounded-2xl p-4 transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5 group"
            >
              <button
                type="button"
                onClick={() => setPreviewMeme(meme)}
                className="w-full text-center mb-3 cursor-pointer"
                aria-label={`预览 ${meme.name}`}
              >
                <span className="text-5xl inline-block transition-transform group-hover:scale-110">
                  {meme.emoji}
                </span>
              </button>
              <h2 className="font-bold text-white text-sm text-center mb-1 truncate">
                {meme.name}
              </h2>
              <p className="text-xs text-gray-500 text-center mb-3 truncate">{meme.description}</p>
              <div className="flex flex-wrap gap-1 mb-3 justify-center">
                {meme.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setPreviewMeme(meme)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all cursor-pointer"
                  aria-label="预览"
                  title="预览"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(meme)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-all cursor-pointer"
                  aria-label="复制"
                  title="复制"
                >
                  {copiedId === meme.id ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(meme)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 transition-all cursor-pointer"
                  aria-label="下载"
                  title="下载"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(meme.id)}
                  aria-label={isFav(meme.id) ? '取消收藏' : '收藏'}
                  aria-pressed={isFav(meme.id)}
                  className={
                    'p-2 rounded-lg transition-all cursor-pointer ' +
                    (isFav(meme.id)
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400')
                  }
                  title="收藏"
                >
                  <Heart size={14} fill={isFav(meme.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4" aria-hidden="true">
              🔍
            </div>
            <p className="text-gray-400">没有找到匹配的表情包</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setActiveCategory('all')
              }}
              className="mt-4 px-4 py-2 text-sm text-ikun-yellow hover:bg-ikun-yellow/10 rounded-lg transition-all cursor-pointer"
            >
              清除筛选
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
              className="relative glass rounded-3xl p-8 max-w-sm w-full text-center"
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
                  className="px-4 py-2 bg-ikun-yellow text-black rounded-xl font-bold text-sm hover:bg-ikun-gold transition-all cursor-pointer"
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

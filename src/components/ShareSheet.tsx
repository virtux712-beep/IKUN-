import { Download, Share2, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/Toast'
import { previewShareCard, type ShareCardData, shareCard } from '@/share'

interface Props {
  open: boolean
  data: ShareCardData | null
  onClose: () => void
  filename?: string
}

export default function ShareSheet({ open, data, onClose, filename }: Props) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const preview = useMemo(() => {
    if (!open || !data) return ''
    try {
      return previewShareCard(data)
    } catch {
      return ''
    }
  }, [open, data])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleShare = async () => {
    if (!data || busy) return
    setBusy(true)
    try {
      const result = await shareCard(data, { filename })
      if (result === 'shared') toast.success('分享成功')
      else if (result === 'downloaded') toast.success('图片已保存到下载目录')
    } catch {
      toast.error('分享失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && data && (
        <m.div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="分享卡片"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <m.div
            className="relative glass rounded-3xl w-full max-w-sm flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
              <span className="text-lg" aria-hidden="true">
                🖼️
              </span>
              <h2 className="flex-1 font-bold text-white text-sm">分享卡片</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              {preview ? (
                <img
                  src={preview}
                  alt="分享卡片预览"
                  className="w-full rounded-xl border border-white/10"
                />
              ) : (
                <div className="aspect-[4/5] rounded-xl bg-white/5 grid place-items-center text-sm text-gray-500">
                  正在生成…
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 pt-0 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold text-sm transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                <Share2 size={16} aria-hidden="true" />
                {busy ? '处理中…' : '分享 / 保存'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!data) return
                  await shareCard(data, { filename })
                  toast.success('图片已保存到下载目录')
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all cursor-pointer"
                aria-label="下载图片"
              >
                <Download size={16} aria-hidden="true" />
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

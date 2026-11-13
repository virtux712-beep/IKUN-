import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'
import { FORTUNES, type Fortune, pickFortune } from '@/data/fortunes'

export default function FortuneDraw({ onBack }: { onBack: () => void }) {
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [drawCount, setDrawCount] = useState(0)

  const draw = useCallback(() => {
    setFortune((current) => {
      let next = pickFortune()
      // 连续抽到同一支签时顺延一支，避免「再抽一签」看起来没反应
      if (current && next.title === current.title && FORTUNES.length > 1) {
        const idx = FORTUNES.findIndex((f) => f.title === next.title)
        next = FORTUNES[(idx + 1) % FORTUNES.length]
      }
      return next
    })
    setDrawCount((n) => n + 1)
  }, [])

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🔮 今日坤签</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums">{drawCount}</div>
            <div className="text-xs text-gray-500">已抽签</div>
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          每天进门先抽一签，看看今天宜干什么。手气这东西，抽到什么全看缘分。
        </p>

        <div className="glass rounded-3xl p-6 sm:p-8">
          <div
            key={drawCount}
            className="rounded-2xl border border-ikun-gold/40 bg-gradient-to-br from-ikun-gold/15 to-rose-500/10 px-6 py-8 text-center min-h-[132px] flex flex-col items-center justify-center gap-2 animate-scaleIn"
            aria-live="polite"
          >
            {fortune ? (
              <>
                <div className="text-2xl font-black tracking-wider text-white">{fortune.title}</div>
                <p className="text-sm text-gray-300 leading-relaxed">{fortune.text}</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black tracking-wider text-white">尚未抽签</div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  点击下方按钮，抽取你今天的坤签。
                </p>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={draw}
              className="px-8 py-3 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-full hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              {fortune ? (
                <RefreshCw size={16} aria-hidden="true" />
              ) : (
                <Sparkles size={16} aria-hidden="true" />
              )}
              {fortune ? '再 抽 一 签' : '抽 一 签'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

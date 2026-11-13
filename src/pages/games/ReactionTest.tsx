import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type TestState = 'idle' | 'waiting' | 'ready' | 'result' | 'early'

const HS_KEY = 'ikun_reaction_hs'

function readBest(): number {
  try {
    return Number(localStorage.getItem(HS_KEY)) || 0
  } catch {
    return 0
  }
}

function gradeOf(time: number): { grade: string; color: string; label: string } {
  if (time < 200) return { grade: 'S', color: 'text-yellow-400', label: '闪电反应！ikun 之神！⚡' }
  if (time < 280)
    return { grade: 'A', color: 'text-green-400', label: '非常优秀！你是小黑子精英！🏆' }
  if (time < 380) return { grade: 'B', color: 'text-blue-400', label: '不错不错，属于正常水平！👍' }
  if (time < 500) return { grade: 'C', color: 'text-orange-400', label: '一般般，需要多练习！💪' }
  return { grade: 'D', color: 'text-red-400', label: '太慢了，鸡都跑了！🐔💨' }
}

export default function ReactionTest({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<TestState>('idle')
  const [reactionTime, setReactionTime] = useState(0)
  const [best, setBest] = useState(readBest)
  const [attempts, setAttempts] = useState<number[]>([])
  const [isNewRecord, setIsNewRecord] = useState(false)

  const startTimeRef = useRef(0)
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearReadyTimer = useCallback(() => {
    if (readyTimer.current) {
      clearTimeout(readyTimer.current)
      readyTimer.current = null
    }
  }, [])

  useEffect(() => clearReadyTimer, [clearReadyTimer])

  const startTest = useCallback(() => {
    clearReadyTimer()
    setState('waiting')
    setIsNewRecord(false)
    const delay = 900 + Math.random() * 3200
    readyTimer.current = setTimeout(() => {
      readyTimer.current = null
      setState('ready')
      startTimeRef.current = performance.now()
    }, delay)
  }, [clearReadyTimer])

  const handleTap = useCallback(() => {
    if (state === 'waiting') {
      // 抢跑：必须清掉待触发的定时器，否则几秒后还会莫名其妙变绿
      clearReadyTimer()
      setState('early')
      return
    }
    if (state !== 'ready') return

    const time = Math.round(performance.now() - startTimeRef.current)
    setReactionTime(time)
    setAttempts((prev) => [...prev.slice(-19), time])
    setState('result')

    const isRecord = best === 0 || time < best
    if (isRecord) {
      setBest(time)
      setIsNewRecord(true)
      try {
        localStorage.setItem(HS_KEY, String(time))
      } catch {
        /* 忽略 */
      }
    }
  }, [state, clearReadyTimer, best])

  // 空格 / 回车也能反应
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== 'Enter') return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (state === 'ready' || state === 'waiting') {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, handleTap])

  const avg =
    attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : 0

  const grade = gradeOf(reactionTime)

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">⚡ 反应测试</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums flex items-center gap-1 justify-end">
              <Trophy size={12} aria-hidden="true" />
              {best > 0 ? `${best}ms` : '--'}
            </div>
            <div className="text-xs text-gray-500">最佳</div>
          </div>
        </div>

        <div
          className="glass rounded-3xl overflow-hidden relative select-none touch-none"
          style={{ width: '100%', maxWidth: 400, height: 400, margin: '0 auto' }}
        >
          {state === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <div className="text-6xl mb-6" aria-hidden="true">
                ⚡
              </div>
              <h2 className="text-xl font-bold text-white mb-2">小黑子反应测试</h2>
              <p className="text-gray-400 text-sm mb-6">当屏幕变绿时尽快点击！</p>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  startTest()
                }}
                className="px-6 py-3 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <Play size={18} aria-hidden="true" /> 开始测试
              </button>
            </div>
          )}

          {state === 'waiting' && (
            <button
              type="button"
              onClick={handleTap}
              aria-label="等待屏幕变绿"
              className="absolute inset-0 w-full flex flex-col items-center justify-center bg-red-900/40 cursor-pointer"
            >
              <div className="text-5xl mb-4 animate-pulse" aria-hidden="true">
                🔴
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">等一下...</h2>
              <p className="text-gray-300 text-sm">等屏幕变绿再点击</p>
            </button>
          )}

          {state === 'ready' && (
            <button
              type="button"
              onClick={handleTap}
              aria-label="屏幕已变绿，立即点击"
              className="absolute inset-0 w-full flex flex-col items-center justify-center bg-green-600/50 animate-fadeIn cursor-pointer"
            >
              <div className="text-5xl mb-4" aria-hidden="true">
                🟢
              </div>
              <h2 className="text-2xl font-bold text-white">点击！</h2>
            </button>
          )}

          {state === 'early' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-900/40 animate-fadeIn">
              <div className="text-5xl mb-4" aria-hidden="true">
                😅
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">抢跑了！</h2>
              <p className="text-gray-300 text-sm mb-6">要等屏幕变绿再点哦</p>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  startTest()
                }}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={18} aria-hidden="true" /> 再来一次
              </button>
            </div>
          )}

          {state === 'result' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-scaleIn px-6">
              <div className={`text-6xl font-black mb-2 ${grade.color}`}>{grade.grade}</div>
              <div className="text-4xl font-black text-white mb-2 tabular-nums">
                {reactionTime}ms
              </div>
              <p className="text-gray-400 text-sm mb-3 text-center">{grade.label}</p>
              {isNewRecord && (
                <p className="text-ikun-yellow text-sm mb-3 animate-pulse">🎉 新纪录！</p>
              )}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  startTest()
                }}
                className="mt-2 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={18} aria-hidden="true" /> 再试一次
              </button>
            </div>
          )}
        </div>

        {attempts.length > 0 && (
          <div className="mt-6 glass rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-3">📊 测试记录</h2>
            <div className="flex flex-wrap gap-2">
              {attempts.map((time, i) => (
                <span
                  key={i}
                  className={
                    'px-3 py-1 rounded-lg text-xs font-mono ' +
                    (time < 200
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : time < 280
                        ? 'bg-green-500/20 text-green-400'
                        : time < 380
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400')
                  }
                >
                  {time}ms
                </span>
              ))}
            </div>
            {attempts.length > 1 && (
              <p className="text-xs text-gray-500 mt-3">
                平均反应时间：<span className="text-white tabular-nums">{avg}ms</span> · 共测试{' '}
                <span className="text-white tabular-nums">{attempts.length}</span> 次
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

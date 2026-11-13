import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Chicken {
  id: number
  x: number
  y: number
  emoji: string
  bornAt: number
}

interface PopEffect {
  id: number
  x: number
  y: number
}

const GAME_DURATION = 30
const MAX_CHICKENS = 7
const HS_KEY = 'ikun_chicken_hs'
const EMOJIS = ['🐔', '🐓', '🐤', '🐥']

function readHighScore(): number {
  try {
    return Number(localStorage.getItem(HS_KEY)) || 0
  } catch {
    return 0
  }
}

export default function CatchChicken({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [chickens, setChickens] = useState<Chicken[]>([])
  const [highScore, setHighScore] = useState(readHighScore)
  const [combo, setCombo] = useState(0)
  const [effects, setEffects] = useState<PopEffect[]>([])

  const scoreRef = useRef(0)
  const idRef = useRef(0)
  const spawnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const effectTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  const clearTimers = useCallback(() => {
    if (spawnTimer.current) {
      clearTimeout(spawnTimer.current)
      spawnTimer.current = null
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current)
      countdownTimer.current = null
    }
    effectTimers.current.forEach(clearTimeout)
    effectTimers.current.clear()
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const endGame = useCallback(() => {
    clearTimers()
    setGameState('over')
    setChickens([])
    setCombo(0)
    setHighScore((prev) => {
      const next = Math.max(prev, scoreRef.current)
      try {
        localStorage.setItem(HS_KEY, String(next))
      } catch {
        /* 忽略 */
      }
      return next
    })
  }, [clearTimers])

  const spawnChicken = useCallback(() => {
    setChickens((prev) => {
      const next = [
        ...prev,
        {
          id: idRef.current++,
          x: Math.random() * 76 + 6,
          y: Math.random() * 66 + 12,
          emoji: EMOJIS[(Math.random() * EMOJIS.length) | 0],
          bornAt: Date.now(),
        },
      ]
      return next.length > MAX_CHICKENS ? next.slice(next.length - MAX_CHICKENS) : next
    })
  }, [])

  const startGame = useCallback(() => {
    clearTimers()
    scoreRef.current = 0
    idRef.current = 0
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setChickens([])
    setCombo(0)
    setEffects([])
    setGameState('playing')

    // 用递归 setTimeout 让生成节奏随分数加快
    const loop = () => {
      spawnChicken()
      const delay = Math.max(520, 1150 - scoreRef.current * 12)
      spawnTimer.current = setTimeout(loop, delay)
    }
    spawnTimer.current = setTimeout(loop, 350)

    // 倒计时（只做纯更新，结束逻辑放到下面的 effect 里）
    countdownTimer.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
  }, [clearTimers, spawnChicken])

  // 时间归零时结束
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0) endGame()
  }, [gameState, timeLeft, endGame])

  const catchChicken = useCallback((chicken: Chicken, clientX: number, clientY: number) => {
    setChickens((prev) => prev.filter((c) => c.id !== chicken.id))
    scoreRef.current += 1
    setScore(scoreRef.current)
    setCombo((c) => c + 1)

    const effectId = idRef.current++
    setEffects((prev) => [...prev.slice(-5), { id: effectId, x: clientX, y: clientY }])
    const timer = setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== effectId))
      effectTimers.current.delete(timer)
    }, 800)
    effectTimers.current.add(timer)
  }, [])

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
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🐔 抓鸡大作战</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums">{score}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
              <Trophy size={10} aria-hidden="true" />
              {highScore}
            </div>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 tabular-nums">⏱️ {timeLeft}s</span>
              {combo > 2 && (
                <span className="text-xs text-ikun-yellow animate-pulse">🔥 连击 x{combo}</span>
              )}
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ikun-yellow to-ikun-gold rounded-full transition-[width] duration-1000 ease-linear"
                style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div
          className="glass rounded-2xl overflow-hidden relative select-none touch-none"
          style={{ width: '100%', maxWidth: 400, height: 500, margin: '0 auto' }}
        >
          {chickens.map((chicken) => (
            <button
              type="button"
              key={chicken.id}
              // 只监听 pointerdown：鼠标和触摸统一处理，不会重复计分
              onPointerDown={(e) => {
                e.stopPropagation()
                catchChicken(chicken, e.clientX, e.clientY)
              }}
              className="absolute cursor-pointer active:scale-90 transition-transform duration-100 will-change-transform"
              style={{ left: `${chicken.x}%`, top: `${chicken.y}%`, fontSize: 40, lineHeight: 1 }}
              aria-label="抓住这只鸡"
            >
              {chicken.emoji}
            </button>
          ))}

          {effects.map((effect) => (
            <div
              key={effect.id}
              className="fixed pointer-events-none text-ikun-yellow font-bold text-xl animate-fadeUp z-50 select-none"
              style={{ left: effect.x, top: effect.y }}
              aria-hidden="true"
            >
              +1
            </div>
          ))}

          {gameState !== 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
              <div className="text-center px-6">
                {gameState === 'over' ? (
                  <>
                    <div className="text-5xl mb-4" aria-hidden="true">
                      🏆
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">时间到！</h2>
                    <p className="text-gray-400 mb-1">
                      抓到{' '}
                      <span className="text-ikun-yellow font-bold text-2xl tabular-nums">
                        {score}
                      </span>{' '}
                      只鸡
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      最高记录：{highScore}
                      {score >= highScore && score > 0 && (
                        <span className="text-ikun-yellow ml-2">新纪录！</span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-4 animate-bounce-custom" aria-hidden="true">
                      🐔
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">抓鸡大作战</h2>
                    <p className="text-gray-400 mb-6 text-sm">
                      在 {GAME_DURATION} 秒内点击尽可能多的鸡
                    </p>
                  </>
                )}
                <button
                  type="button"
                  onClick={startGame}
                  className="px-6 py-3 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2 mx-auto"
                >
                  {gameState === 'over' ? (
                    <>
                      <RotateCcw size={18} aria-hidden="true" /> 重新开始
                    </>
                  ) : (
                    <>
                      <Play size={18} aria-hidden="true" /> 开始游戏
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

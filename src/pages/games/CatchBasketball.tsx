import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Ball {
  id: number
  x: number
  y: number
  emoji: string
  speed: number
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 500
const BASKET_WIDTH = 80
const BASKET_BOTTOM = 40
const BALL_SIZE = 30
const BASE_SPEED = 2.6
const MAX_LIVES = 3

const BALL_EMOJIS = ['🏀', '⚽', '🏐', '🎾']
const HS_KEY = 'ikun_basketball_hs'

function readHighScore(): number {
  try {
    return Number(localStorage.getItem(HS_KEY)) || 0
  } catch {
    return 0
  }
}

export default function CatchBasketball({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'over'>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [highScore, setHighScore] = useState(readHighScore)
  const [basketX, setBasketX] = useState(CANVAS_WIDTH / 2 - BASKET_WIDTH / 2)
  const [balls, setBalls] = useState<Ball[]>([])

  // 游戏循环内部状态全部走 ref，避免闭包过期与重复渲染
  const ballsRef = useRef<Ball[]>([])
  const basketRef = useRef(CANVAS_WIDTH / 2 - BASKET_WIDTH / 2)
  const scoreRef = useRef(0)
  const livesRef = useRef(MAX_LIVES)
  const spawnAccRef = useRef(0)
  const ballIdRef = useRef(0)

  const moveBasketTo = useCallback((x: number) => {
    const next = Math.max(0, Math.min(CANVAS_WIDTH - BASKET_WIDTH, x))
    basketRef.current = next
    setBasketX(next)
  }, [])

  const moveBasketBy = useCallback(
    (delta: number) => moveBasketTo(basketRef.current + delta),
    [moveBasketTo],
  )

  const finishGame = useCallback(() => {
    setGameState('over')
    setHighScore((prev) => {
      const next = Math.max(prev, scoreRef.current)
      try {
        localStorage.setItem(HS_KEY, String(next))
      } catch {
        /* 忽略写入失败 */
      }
      return next
    })
  }, [])

  const startGame = useCallback(() => {
    ballsRef.current = []
    scoreRef.current = 0
    livesRef.current = MAX_LIVES
    spawnAccRef.current = 0
    ballIdRef.current = 0
    setBalls([])
    setScore(0)
    setLives(MAX_LIVES)
    setGameState('playing')
  }, [])

  // 主循环：唯一的 requestAnimationFrame 驱动
  useEffect(() => {
    if (gameState !== 'playing') return

    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      // 用真实帧间隔做时间步长，掉帧时不会突然加速
      const dt = Math.min(now - last, 50) / 16.667
      last = now

      // 生成新球：分数越高越快
      spawnAccRef.current += dt
      const spawnInterval = Math.max(24, 48 - scoreRef.current * 0.6)
      if (spawnAccRef.current >= spawnInterval) {
        spawnAccRef.current = 0
        ballsRef.current.push({
          id: ballIdRef.current++,
          x: Math.random() * (CANVAS_WIDTH - BALL_SIZE),
          y: -BALL_SIZE,
          emoji: BALL_EMOJIS[(Math.random() * BALL_EMOJIS.length) | 0],
          speed: BASE_SPEED + Math.min(scoreRef.current * 0.06, 3),
        })
      }

      // 移动 + 判定
      const survivors: Ball[] = []
      let gained = 0
      let missed = 0

      for (const ball of ballsRef.current) {
        ball.y += ball.speed * dt

        const inBasketY =
          ball.y + BALL_SIZE >= CANVAS_HEIGHT - BASKET_BOTTOM &&
          ball.y <= CANVAS_HEIGHT - BASKET_BOTTOM + 30
        const inBasketX =
          ball.x + BALL_SIZE >= basketRef.current && ball.x <= basketRef.current + BASKET_WIDTH

        if (inBasketY && inBasketX) {
          gained += 1
        } else if (ball.y > CANVAS_HEIGHT) {
          missed += 1
        } else {
          survivors.push(ball)
        }
      }

      ballsRef.current = survivors

      if (gained > 0) {
        scoreRef.current += gained
        setScore(scoreRef.current)
      }

      if (missed > 0) {
        livesRef.current = Math.max(0, livesRef.current - missed)
        setLives(livesRef.current)
      }

      setBalls(survivors.slice())

      if (livesRef.current <= 0) {
        finishGame()
        return
      }

      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [gameState, finishGame])

  // 键盘操作
  useEffect(() => {
    if (gameState !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        moveBasketBy(-28)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        moveBasketBy(28)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gameState, moveBasketBy])

  const handlePointerMove = (clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const scale = CANVAS_WIDTH / rect.width
    moveBasketTo((clientX - rect.left) * scale - BASKET_WIDTH / 2)
  }

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
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🏀 接篮球</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums">{score}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
              <Trophy size={10} aria-hidden="true" />
              {highScore}
            </div>
          </div>
        </div>

        <div
          role="application"
          aria-label="接篮球游戏区域，可用鼠标、触摸或左右方向键控制"
          className="glass rounded-2xl overflow-hidden relative select-none touch-none"
          style={{
            width: '100%',
            maxWidth: CANVAS_WIDTH,
            aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
            margin: '0 auto',
          }}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.currentTarget)}
          onTouchMove={(e) => {
            const touch = e.touches[0]
            if (touch) handlePointerMove(touch.clientX, e.currentTarget)
          }}
        >
          {/* 生命值 */}
          <div
            className="absolute top-3 left-3 z-10 flex gap-1"
            role="status"
            aria-label={`剩余生命 ${lives}`}
          >
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span
                key={i}
                className={`text-lg transition-opacity ${i < lives ? 'opacity-100' : 'opacity-20'}`}
                aria-hidden="true"
              >
                ❤️
              </span>
            ))}
          </div>

          {/* 落下的球 */}
          {balls.map((ball) => (
            <div
              key={ball.id}
              className="absolute will-change-transform"
              style={{ left: ball.x, top: ball.y, fontSize: BALL_SIZE, lineHeight: 1 }}
              aria-hidden="true"
            >
              {ball.emoji}
            </div>
          ))}

          {/* 篮子 */}
          <div
            className="absolute will-change-transform"
            style={{ left: basketX, bottom: 8, width: BASKET_WIDTH }}
            aria-hidden="true"
          >
            <div className="text-4xl text-center leading-none">🧺</div>
          </div>

          {/* 开始 / 结束遮罩 */}
          {gameState !== 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-sm">
              <div className="text-center px-6">
                {gameState === 'over' ? (
                  <>
                    <div className="text-5xl mb-4" aria-hidden="true">
                      😭
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">游戏结束</h2>
                    <p className="text-gray-400 mb-1">
                      得分：<span className="text-ikun-yellow font-bold">{score}</span>
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
                      🏀
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">接篮球</h2>
                    <p className="text-gray-400 mb-2 text-sm">
                      移动鼠标 / 手指，或用 ← → 键接住掉落的球
                    </p>
                    <p className="text-gray-500 mb-6 text-xs">漏掉 3 个球就结束啦</p>
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

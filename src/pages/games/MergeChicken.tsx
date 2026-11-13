import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecord } from '@/features/ui'
import { JuiceLayer, useJuice } from '@/games/juice'
import { type Board, CHAIN, type Dir, EMPTY_BOARD, isDead, slide, spawn } from '@/games/merge'

export default function MergeChicken({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>(() => spawn(spawn(EMPTY_BOARD)))
  const [score, setScore] = useState(0)
  const [dead, setDead] = useState(false)
  const [maxLevel, setMaxLevel] = useState(0)
  const { record, submit } = useRecord('ikun_merge_best')
  const juice = useJuice()
  const boardRef = useRef<HTMLDivElement>(null)
  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const move = useCallback(
    (dir: Dir) => {
      setBoard((prev) => {
        const { board: moved, moved: didMove, gained } = slide(prev, dir)
        if (!didMove) {
          juice.shake()
          return prev
        }

        const withSpawn = spawn(moved)
        setScore((s) => s + gained)

        const peak = Math.max(...withSpawn.map((v) => v ?? 0))
        if (peak > maxLevel) {
          setMaxLevel(peak)
          const cell = CHAIN[peak]
          if (cell) {
            juice.burst(140, 140, cell.emoji, 10)
            juice.popText(120, 120, cell.name + '！')
          }
        } else if (gained > 0) {
          juice.popText(130, 130, '+' + gained)
        }

        if (isDead(withSpawn)) {
          setDead(true)
          submit(score + gained)
        }
        return withSpawn
      })
    },
    [juice, maxLevel, score, submit],
  )

  // 键盘
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        move(dir)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  const restart = () => {
    setBoard(spawn(spawn(EMPTY_BOARD)))
    setScore(0)
    setDead(false)
    setMaxLevel(0)
  }

  // 触摸滑动
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    if (t) touchRef.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current
    const t = e.changedTouches[0]
    if (!start || !t) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
    touchRef.current = null
  }

  const top = CHAIN[maxLevel]

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🧬 只因合成</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums">{score}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
              <Trophy size={10} aria-hidden="true" />
              {record}
            </div>
          </div>
        </div>

        {/* 最高级 */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          <span>
            当前最强：{' '}
            <span className="text-white font-bold">{top ? top.emoji + ' ' + top.name : '—'}</span>
          </span>
          <span className="tabular-nums">
            {maxLevel + 1}/{CHAIN.length}
          </span>
        </div>

        {/* 棋盘 */}
        <div
          key={juice.shakeKey}
          ref={boardRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-2 select-none touch-none"
          style={juice.shakeKey > 0 ? { animation: 'shake 0.24s ease-in-out' } : undefined}
        >
          <div className="grid grid-cols-4 gap-2">
            {board.map((level, i) => {
              const cell = level === null ? null : CHAIN[level]
              return (
                <div
                  key={i}
                  className={
                    'aspect-square rounded-xl grid place-items-center transition-all duration-100 ' +
                    (cell
                      ? 'bg-gradient-to-br ' + cell.color + ' border border-white/10'
                      : 'bg-white/[0.02]')
                  }
                >
                  {cell && (
                    <div className="text-center leading-none">
                      <div className="text-2xl sm:text-3xl">{cell.emoji}</div>
                      <div className={'text-[9px] mt-0.5 ' + cell.text}>{cell.name}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <JuiceLayer juice={juice} />
        </div>

        {/* 状态 / 操作 */}
        {dead ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-400 mb-3">没有可合并的格子了</p>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              <RotateCcw size={18} aria-hidden="true" /> 再来一局
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={restart}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors cursor-pointer"
          >
            <RotateCcw size={16} aria-hidden="true" /> 重新开始
          </button>
        )}

        <p className="text-xs text-gray-600 mt-5 text-center leading-relaxed">
          方向键 / WASD / 滑动合并同级单位，两个 👑 无法再合并。
          <br />
          合并链：🐣 → 🐔 → 🐓 → 🥚 → 🍗 → 🏀 → 🎤 → 👑
        </p>
      </div>
    </div>
  )
}

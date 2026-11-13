import { useCallback, useEffect, useRef, useState } from 'react'
import { SFX } from '@/features/ui'
import { useSettings } from '@/settings'

interface Action {
  emoji: string
  text: string
}

/** 9 种动作，参考 liyupi/dsh-kun-like-pet 的状态机思路 */
const ACTIONS: Action[] = [
  { emoji: '🐔', text: '你干嘛~ 哎哟' },
  { emoji: '🏀', text: '一起打球吗？' },
  { emoji: '🎤', text: '唱、跳、rap、篮球' },
  { emoji: '💪', text: '铁山靠！' },
  { emoji: '🍋', text: '大家要荔枝一点' },
  { emoji: '⏱️', text: '我练习时长两年半' },
  { emoji: '😤', text: '小黑子，露出鸡脚了吧' },
  { emoji: '👑', text: '只因你太美' },
  { emoji: '🥚', text: '下蛋中，请勿打扰' },
]

const SIZE = 64
const MARGIN = 16

export default function KunPet() {
  const { pet, reduceMotion } = useSettings()
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [bubble, setBubble] = useState<Action | null>(null)
  const [bouncing, setBouncing] = useState(false)
  const dragRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inited = useRef(false)

  // 初始位置：左下角（避开右下角的回到顶部按钮）
  useEffect(() => {
    if (inited.current) return
    inited.current = true
    setPos({ x: MARGIN, y: window.innerHeight - SIZE - MARGIN - 60 })
  }, [])

  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: Math.min(p.x, window.innerWidth - SIZE - MARGIN),
        y: Math.min(p.y, window.innerHeight - SIZE - MARGIN),
      }))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    }
  }, [])

  const say = useCallback((action: Action) => {
    setBubble(action)
    SFX.cluck()
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 2600)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current
    if (!d) return
    const nx = e.clientX - d.dx
    const ny = e.clientY - d.dy
    if (Math.abs(nx - pos.x) > 3 || Math.abs(ny - pos.y) > 3) d.moved = true
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - SIZE, nx)),
      y: Math.max(0, Math.min(window.innerHeight - SIZE, ny)),
    })
  }

  const onPointerUp = () => {
    const moved = dragRef.current?.moved
    dragRef.current = null
    if (moved) return
    // 点击（非拖拽）时随机说一句
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
    if (action) say(action)
    if (!reduceMotion) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 320)
    }
  }

  if (!pet) return null

  return (
    <div
      className="fixed z-[75] select-none touch-none"
      style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE }}
    >
      {bubble && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl bg-ikun-dark/95 border border-white/10 text-xs text-white whitespace-nowrap shadow-lg shadow-black/40 animate-popIn"
          role="status"
        >
          {bubble.text}
        </div>
      )}

      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="坤宠，点击互动，可拖动"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
            if (action) say(action)
          }
        }}
        className={
          'w-full h-full grid place-items-center text-4xl rounded-full bg-ikun-dark/80 backdrop-blur border border-ikun-yellow/25 shadow-lg shadow-black/50 cursor-grab active:cursor-grabbing transition-transform ' +
          (bouncing ? 'scale-110' : 'scale-100')
        }
      >
        <span className="pointer-events-none" aria-hidden="true">
          {bubble ? bubble.emoji : '🐔'}
        </span>
      </button>
    </div>
  )
}

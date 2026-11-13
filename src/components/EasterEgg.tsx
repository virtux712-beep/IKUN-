import { useCallback, useEffect, useState } from 'react'

interface EasterEggProps {
  show: boolean
  onHide: () => void
}

interface Confetti {
  id: number
  x: number
  delay: number
  color: string
  size: number
  round: boolean
}

const COLORS = [
  '#FFD700',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
]

function buildConfetti(): Confetti[] {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.6,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    size: Math.random() * 8 + 4,
    // 随机形状在生成时定下来，避免每次渲染都变
    round: Math.random() > 0.5,
  }))
}

export default function EasterEgg({ show, onHide }: EasterEggProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([])

  useEffect(() => {
    if (!show) return
    setConfetti(buildConfetti())
    const timer = setTimeout(onHide, 6000)
    return () => clearTimeout(timer)
  }, [show, onHide])

  // Esc 关闭
  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onHide()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, onHide])

  const handleBackdrop = useCallback(() => onHide(), [onHide])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="彩蛋">
      <button
        type="button"
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-[2px] cursor-default"
        onClick={handleBackdrop}
        aria-label="关闭彩蛋"
      />

      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: '-10%',
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: c.round ? '50%' : '2px',
            animation: `confetti-fall ${2.6 + c.delay}s linear ${c.delay}s forwards`,
          }}
          aria-hidden="true"
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="text-center animate-scaleIn">
          <div className="text-8xl mb-4 animate-bounce-custom" aria-hidden="true">
            🐔
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-ikun-yellow mb-4 animate-glow">
            你发现了彩蛋！
          </h2>
          <p className="text-xl text-white/80 mb-2">鸡你太美~ 哎呦~</p>
          <p className="text-sm text-gray-400 mb-6">你是一个真正的骨灰级 ikun！</p>
          <button
            type="button"
            onClick={onHide}
            className="px-6 py-2 bg-ikun-yellow/20 border border-ikun-yellow/50 rounded-full text-ikun-yellow text-sm hover:bg-ikun-yellow/30 transition-all cursor-pointer"
          >
            关闭彩蛋
          </button>
        </div>
      </div>
    </div>
  )
}

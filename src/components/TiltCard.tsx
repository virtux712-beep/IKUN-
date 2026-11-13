import { useRef } from 'react'
import { useSettings } from '@/settings'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** 最大倾斜角度 */
  max?: number
}

/**
 * 3D 倾斜卡片（思路参考 vanilla-tilt.js）。
 * 用 CSS transform 实现，不引入任何依赖；可通过设置关闭。
 */
export default function TiltCard({ children, className = '', max = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { tilt, reduceMotion } = useSettings()
  const enabled = tilt && !reduceMotion

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale(1.02)`
    ref.current.style.setProperty('--spot-x', `${(px * 100 + 50).toFixed(1)}%`)
    ref.current.style.setProperty('--spot-y', `${(py * 100 + 50).toFixed(1)}%`)
  }

  const handleLeave = () => {
    if (!ref.current) return
    ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`transition-transform duration-150 will-change-transform ${className}`}
    >
      {children}
    </div>
  )
}

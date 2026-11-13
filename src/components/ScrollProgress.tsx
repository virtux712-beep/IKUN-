import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

/** 顶部阅读进度条 + 回到顶部按钮 */
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
      setProgress(Math.min(1, Math.max(0, ratio)))
      setShowTop(window.scrollY > 600)
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-ikun-yellow via-ikun-gold to-ikun-golden origin-left transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="回到顶部"
        className={
          'fixed bottom-5 right-5 z-40 p-3 rounded-full glass text-ikun-yellow shadow-lg shadow-black/40 transition-all duration-300 cursor-pointer hover:bg-ikun-yellow hover:text-black ' +
          (showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none')
        }
      >
        <ArrowUp size={20} />
      </button>
    </>
  )
}

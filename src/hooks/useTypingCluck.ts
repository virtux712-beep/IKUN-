import { useEffect } from 'react'
import { SFX } from '@/features/ui'
import { useSettings } from '@/settings'

const IGNORE_KEYS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'Tab',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Backspace',
])

/**
 * 打字鸡叫（参考 ThanatosXingYu/iKun_Keyboard）。
 * 默认关闭，需在设置里手动开启。
 * 只在普通输入场景触发，并且有概率限制，避免变成噪音。
 */
export function useTypingCluck(): void {
  const { typing } = useSettings()

  useEffect(() => {
    if (!typing) return

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (IGNORE_KEYS.has(e.key)) return
      if (e.key.length !== 1) return

      // 输入框里打字也允许，但概率更低，避免干扰
      const target = e.target as HTMLElement | null
      const inField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true

      const chance = inField ? 0.08 : 0.18
      if (Math.random() > chance) return

      SFX.cluck()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [typing])
}

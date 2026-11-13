import { useCallback, useEffect, useRef, useState } from 'react'

/** 监听媒体查询，SSR 安全 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** 用户是否偏好减少动画（无障碍） */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let frame = 0
    const handler = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setScrollY(window.scrollY)
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return scrollY
}

export function useIntersectionObserver(
  threshold = 0.15,
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}

/** 数字滚动动画，尊重 reduced-motion */
export function useAnimatedNumber(target: number, duration = 2000, start = true): number {
  const [value, setValue] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!start) return
    if (reduced) {
      setValue(target)
      return
    }

    let frame = 0
    const startTime = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start, reduced])

  return value
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback(
    (newValue: T) => {
      setValue(newValue)
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch {
        /* 忽略写入失败 */
      }
    },
    [key],
  )

  return [value, setStoredValue]
}

export function useClickCounter(
  threshold: number,
  callback: () => void,
  timeout = 2000,
): () => void {
  const countRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return useCallback(() => {
    countRef.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)

    if (countRef.current >= threshold) {
      countRef.current = 0
      callback()
    } else {
      timerRef.current = setTimeout(() => {
        countRef.current = 0
      }, timeout)
    }
  }, [threshold, callback, timeout])
}

/** 点击外部区域时触发回调（用于下拉/弹层） */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener, { passive: true })
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, enabled])
}

/** 全局快捷键，支持 ctrl/meta 组合 */
export function useHotkey(
  combo: { key: string; ctrlOrMeta?: boolean },
  handler: (e: KeyboardEvent) => void,
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const keyMatches = e.key.toLowerCase() === combo.key.toLowerCase()
      const modMatches = combo.ctrlOrMeta ? e.ctrlKey || e.metaKey : true
      if (!keyMatches || !modMatches) return
      handlerRef.current(e)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [combo.key, combo.ctrlOrMeta])
}

/** Esc 键回调 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlerRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

/** 数字千分位格式化 */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN')
}

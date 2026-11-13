import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '@/components/Toast'

import { ACHIEVEMENTS, type AchievementDef, EMPTY, type PlayerStats } from './definitions'

export { ACHIEVEMENTS, type AchievementDef, type PlayerStats }

/* ------------------------------ 事件 ------------------------------ */

export type PlayerEvent =
  | { type: 'tab'; tab: string }
  | { type: 'feature'; id: string }
  | { type: 'message' }
  | { type: 'like' }
  | { type: 'meme'; count: number }
  | { type: 'song'; count: number }
  | { type: 'game' }
  | { type: 'search' }
  | { type: 'palette' }
  | { type: 'egg' }
  | { type: 'theme' }
  | { type: 'cps'; value: number }
  | { type: 'purity'; value: number }

const STORAGE_KEY = 'ikun_stats_v2'
const UNLOCK_KEY = 'ikun_unlocked_v2'

function todayKey(): string {
  const d = new Date()
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY, days: [todayKey()] }
    const parsed = { ...EMPTY, ...(JSON.parse(raw) as Partial<PlayerStats>) } as PlayerStats
    if (!parsed.days.includes(todayKey())) parsed.days = [...parsed.days, todayKey()].slice(-60)
    return parsed
  } catch {
    return { ...EMPTY, days: [todayKey()] }
  }
}

function loadUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/* ------------------------------ Provider ------------------------------ */

interface Api {
  stats: PlayerStats
  unlocked: string[]
  record: (event: PlayerEvent) => void
  reset: () => void
}

const Ctx = createContext<Api | null>(null)

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast()
  const [stats, setStats] = useState<PlayerStats>(loadStats)
  const [unlocked, setUnlocked] = useState<string[]>(loadUnlocked)
  const unlockedRef = useRef(unlocked)
  unlockedRef.current = unlocked

  // 记录凌晨访问
  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 0 && h < 5) setStats((s) => (s.nightOwl ? s : { ...s, nightOwl: true }))
  }, [])

  // 持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch {
      /* 忽略 */
    }
  }, [stats])

  useEffect(() => {
    try {
      localStorage.setItem(UNLOCK_KEY, JSON.stringify(unlocked))
    } catch {
      /* 忽略 */
    }
  }, [unlocked])

  // 检查解锁
  useEffect(() => {
    const newly = ACHIEVEMENTS.filter((a) => {
      if (unlockedRef.current.includes(a.id)) return false
      const [cur, goal] = a.progress(stats)
      return cur >= goal
    })
    if (newly.length === 0) return
    setUnlocked((prev) => [...prev, ...newly.map((a) => a.id)])
    for (const a of newly) {
      toast.success(`${a.emoji} 解锁成就：${a.title}`)
    }
  }, [stats, toast])

  const record = useCallback((event: PlayerEvent) => {
    setStats((s) => {
      switch (event.type) {
        case 'tab':
          return s.tabs.includes(event.tab) ? s : { ...s, tabs: [...s.tabs, event.tab] }
        case 'feature':
          return s.features.includes(event.id) ? s : { ...s, features: [...s.features, event.id] }
        case 'message':
          return { ...s, messages: s.messages + 1 }
        case 'like':
          return { ...s, likes: s.likes + 1 }
        case 'meme':
          return { ...s, memes: Math.max(s.memes, event.count) }
        case 'song':
          return { ...s, songs: Math.max(s.songs, event.count) }
        case 'game':
          return { ...s, games: s.games + 1 }
        case 'search':
          return { ...s, usedSearch: true }
        case 'palette':
          return { ...s, usedPalette: true }
        case 'egg':
          return { ...s, triggeredEgg: true }
        case 'theme':
          return { ...s, changedTheme: true }
        case 'cps':
          return { ...s, bestCps: Math.max(s.bestCps, event.value) }
        case 'purity':
          return { ...s, bestPurity: Math.max(s.bestPurity, event.value) }
        default:
          return s
      }
    })
  }, [])

  const reset = useCallback(() => {
    setStats({ ...EMPTY, days: [todayKey()] })
    setUnlocked([])
  }, [])

  const api = useMemo<Api>(
    () => ({ stats, unlocked, record, reset }),
    [stats, unlocked, record, reset],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useAchievements(): Api {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAchievements 必须在 AchievementProvider 内部使用')
  return ctx
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setMotionEnabled, setSoundEnabled } from './sound'
import { THEMES, type ThemeId } from './themes'

interface Settings {
  theme: ThemeId
  sound: boolean
  cursor: boolean
  tilt: boolean
  reduceMotion: boolean
  /** 打字时的鸡叫音效 */
  typing: boolean
  /** 右下角坤宠挂件 */
  pet: boolean
}

interface SettingsApi extends Settings {
  setTheme: (id: ThemeId) => void
  toggleSound: () => void
  toggleCursor: () => void
  toggleTilt: () => void
  toggleReduceMotion: () => void
  toggleTyping: () => void
  togglePet: () => void
}

const DEFAULTS: Settings = {
  theme: 'gold',
  sound: true,
  cursor: true,
  tilt: true,
  reduceMotion: false,
  typing: false,
  pet: true,
}

const STORAGE_KEY = 'ikun_settings_v2'

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      theme: (THEMES.some((t) => t.id === parsed.theme) ? parsed.theme : DEFAULTS.theme) as ThemeId,
      sound: parsed.sound ?? DEFAULTS.sound,
      cursor: parsed.cursor ?? DEFAULTS.cursor,
      tilt: parsed.tilt ?? DEFAULTS.tilt,
      reduceMotion: parsed.reduceMotion ?? DEFAULTS.reduceMotion,
      typing: parsed.typing ?? DEFAULTS.typing,
      pet: parsed.pet ?? DEFAULTS.pet,
    }
  } catch {
    return DEFAULTS
  }
}

const SettingsContext = createContext<SettingsApi | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  // 同步到 DOM 与模块级开关
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    setSoundEnabled(settings.sound)
    setMotionEnabled(!settings.reduceMotion)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* 忽略写入失败 */
    }
  }, [settings])

  // 系统级「减少动态效果」优先
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mql.matches) setSettings((s) => ({ ...s, reduceMotion: true }))
  }, [])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const api = useMemo<SettingsApi>(
    () => ({
      ...settings,
      setTheme: (id) => update({ theme: id }),
      toggleSound: () => update({ sound: !settings.sound }),
      toggleCursor: () => update({ cursor: !settings.cursor }),
      toggleTilt: () => update({ tilt: !settings.tilt }),
      toggleReduceMotion: () => update({ reduceMotion: !settings.reduceMotion }),
      toggleTyping: () => update({ typing: !settings.typing }),
      togglePet: () => update({ pet: !settings.pet }),
    }),
    [settings, update],
  )

  return <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsApi {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings 必须在 SettingsProvider 内部使用')
  return ctx
}

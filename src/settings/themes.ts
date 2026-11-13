export type ThemeId = 'gold' | 'sakura' | 'mint' | 'violet' | 'ocean'

export interface ThemeDef {
  id: ThemeId
  name: string
  emoji: string
  /** 主色 / 次色 / 深色，用于预览色块与 CSS 变量 */
  colors: [string, string, string]
}

export const THEMES: ThemeDef[] = [
  { id: 'gold', name: '经典金', emoji: '🐔', colors: ['#FFD700', '#F5C842', '#DAA520'] },
  { id: 'sakura', name: '樱花粉', emoji: '🌸', colors: ['#FF7EB6', '#FF9EC8', '#E56AA0'] },
  { id: 'mint', name: '薄荷绿', emoji: '🌿', colors: ['#3DDC97', '#6FE7B8', '#22A97B'] },
  { id: 'violet', name: '星云紫', emoji: '🔮', colors: ['#A78BFA', '#C4B5FD', '#7C3AED'] },
  { id: 'ocean', name: '深海蓝', emoji: '🌊', colors: ['#38BDF8', '#7DD3FC', '#0284C7'] },
]

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!
}

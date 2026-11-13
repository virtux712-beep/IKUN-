import { describe, expect, it } from 'vitest'
import { getTheme, THEMES } from './themes'

describe('主题定义', () => {
  it('共 5 套主题', () => {
    expect(THEMES).toHaveLength(5)
  })

  it('id 唯一', () => {
    const ids = THEMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每套主题都有三个合法色值', () => {
    for (const t of THEMES) {
      expect(t.colors).toHaveLength(3)
      for (const c of t.colors) {
        expect(c).toMatch(/^#[0-9a-fA-F]{6}$/)
      }
    }
  })

  it('getTheme 对未知 id 回退到第一套', () => {
    // @ts-expect-error 故意传入非法值
    expect(getTheme('nope').id).toBe(THEMES[0]!.id)
  })
})

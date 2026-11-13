import { describe, expect, it } from 'vitest'
import { FEATURES } from './registry'
import { CATEGORY_META } from './types'

describe('互动项目注册表', () => {
  it('总数为 40', () => {
    expect(FEATURES).toHaveLength(40)
  })

  it('id 唯一', () => {
    const ids = FEATURES.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每个项目的分类都是合法分类', () => {
    const valid = new Set(Object.keys(CATEGORY_META))
    for (const f of FEATURES) {
      expect(valid.has(f.category), `${f.id} 的分类 ${f.category} 不合法`).toBe(true)
    }
  })

  it('每个分类都至少有一个项目', () => {
    for (const cat of Object.keys(CATEGORY_META)) {
      const count = FEATURES.filter((f) => f.category === cat).length
      expect(count, `${cat} 分类为空`).toBeGreaterThan(0)
    }
  })

  it('文案与图标齐备', () => {
    for (const f of FEATURES) {
      expect(f.title.length).toBeGreaterThan(0)
      expect(f.desc.length).toBeGreaterThan(0)
      expect(f.emoji.length).toBeGreaterThan(0)
      expect(f.tags.length).toBeGreaterThan(0)
    }
  })

  it('每个项目都挂载了组件', () => {
    for (const f of FEATURES) {
      expect(typeof f.Component).toBe('function')
    }
  })
})

import { describe, expect, it } from 'vitest'
import { characters, rarityColors, rarityLabels } from '@/data/characters'
import { memeCategories, memes } from '@/data/memes'
import { playlist } from '@/data/music'
import { purityLevels, quizQuestions } from '@/data/quiz'
import { isTabId, TAB_IDS } from '@/types'

describe('IKUN图鉴数据', () => {
  it('id 唯一', () => {
    const ids = characters.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('稀有度合法且有对应文案与配色', () => {
    for (const c of characters) {
      expect(rarityColors[c.rarity]).toBeTruthy()
      expect(rarityLabels[c.rarity]).toBeTruthy()
    }
  })

  it('每个角色都有标签', () => {
    for (const c of characters) {
      expect(c.tags.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(10)
    }
  })
})
describe('表情包数据', () => {
  const categoryIds = new Set(memeCategories.map((c) => c.id))

  it('id 唯一', () => {
    const ids = memes.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('分类都能在分类表中找到', () => {
    for (const m of memes) {
      expect(categoryIds.has(m.category)).toBe(true)
    }
  })

  it('包含全部（all）分类', () => {
    expect(categoryIds.has('all')).toBe(true)
  })
})

describe('音乐数据', () => {
  it('id 唯一', () => {
    const ids = playlist.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('时长格式为 m:ss', () => {
    const pattern = /^[0-9]+:[0-9]{2}$/
    for (const s of playlist) {
      expect(pattern.test(s.duration)).toBe(true)
    }
  })
})
describe('题库数据', () => {
  it('id 唯一', () => {
    const ids = quizQuestions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('正确答案下标在选项范围内', () => {
    for (const q of quizQuestions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.options.length)
      expect(q.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('纯度等级覆盖 0 到 100 且区间不重叠', () => {
    const sorted = [...purityLevels].sort((a, b) => a.min - b.min)
    expect(sorted[0]!.min).toBe(0)
    expect(sorted[sorted.length - 1]!.max).toBe(100)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.min).toBe(sorted[i - 1]!.max + 1)
    }
  })

  it('任意分数都能命中且只命中一个等级', () => {
    for (let score = 0; score <= 100; score++) {
      const hit = purityLevels.filter((l) => score >= l.min && score <= l.max)
      expect(hit).toHaveLength(1)
    }
  })
})

describe('TabId 类型守卫', () => {
  it('接受合法标签页', () => {
    for (const id of TAB_IDS) expect(isTabId(id)).toBe(true)
  })

  it('拒绝非法输入', () => {
    expect(isTabId('database')).toBe(false)
    expect(isTabId('')).toBe(false)
    expect(isTabId('../etc')).toBe(false)
  })
})

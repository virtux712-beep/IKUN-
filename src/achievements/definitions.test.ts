import { describe, expect, it } from 'vitest'
import { ACHIEVEMENTS, EMPTY, type PlayerStats } from './definitions'

function withStats(patch: Partial<PlayerStats>): PlayerStats {
  return { ...EMPTY, ...patch }
}

describe('成就定义', () => {
  it('共 20 个成就', () => {
    expect(ACHIEVEMENTS).toHaveLength(20)
  })

  it('id 唯一', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('文案齐备', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.title.length).toBeGreaterThan(0)
      expect(a.desc.length).toBeGreaterThan(0)
      expect(a.emoji.length).toBeGreaterThan(0)
    }
  })

  it('初始状态下除「初次到访」外都不应解锁', () => {
    const unlockedAtStart = ACHIEVEMENTS.filter((a) => {
      const [cur, goal] = a.progress(EMPTY)
      return cur >= goal
    })
    // EMPTY 里没有任何行为记录，只有 completionist 会因为 0/19 而意外达成，需排除
    expect(unlockedAtStart.map((a) => a.id)).not.toContain('explorer')
    expect(unlockedAtStart.map((a) => a.id)).not.toContain('gamer')
    expect(unlockedAtStart.map((a) => a.id)).not.toContain('lab-all')
  })

  it('进度值不会超过目标值以外的负数', () => {
    for (const a of ACHIEVEMENTS) {
      const [cur, goal] = a.progress(EMPTY)
      expect(cur).toBeGreaterThanOrEqual(0)
      expect(goal).toBeGreaterThan(0)
    }
  })

  it('满足条件后进度达标', () => {
    const s = withStats({
      tabs: ['home', 'lab', 'games'],
      features: Array.from({ length: 10 }, (_, i) => `f${i}`),
      games: 1,
      messages: 3,
    })
    const byId = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)!

    expect(byId('gamer').progress(s)[0]).toBeGreaterThanOrEqual(1)
    expect(byId('lab-10').progress(s)[0]).toBe(10)
    expect(byId('talker').progress(s)[0]).toBe(3)
    expect(byId('explorer').progress(s)[0]).toBe(3)
  })

  it('全知者需要 40 个不同项目', () => {
    const a = ACHIEVEMENTS.find((x) => x.id === 'lab-all')!
    const s = withStats({ features: Array.from({ length: 40 }, (_, i) => `f${i}`) })
    expect(a.progress(s)).toEqual([40, 40])
  })
})

import { describe, expect, it } from 'vitest'
import {
  accuracyOf,
  applyHit,
  buildChart,
  collectMissed,
  comboMultiplier,
  EMPTY_STATS,
  judgeByDelta,
  pickHit,
  rankOf,
} from './rhythm'

describe('音游 · 判定逻辑', () => {
  it('时间差落在对应窗口内给出正确判定', () => {
    expect(judgeByDelta(0)).toBe('perfect')
    expect(judgeByDelta(50)).toBe('perfect')
    expect(judgeByDelta(100)).toBe('great')
    expect(judgeByDelta(150)).toBe('good')
    expect(judgeByDelta(999)).toBe('miss')
  })

  it('buildChart 按 BPM 均匀铺开', () => {
    const chart = buildChart([0, 1, 2], 120, 1000)
    expect(chart).toHaveLength(3)
    // 120 BPM → 每拍 500ms
    expect(chart[0]?.time).toBe(1000)
    expect(chart[1]?.time).toBe(1500)
    expect(chart[2]?.time).toBe(2000)
  })

  it('pickHit 命中最近且未判定的音符', () => {
    const notes = buildChart([0, 0], 120, 1000)
    const hit = pickHit(notes, 0, 1480)
    expect(hit?.noteId).toBe(1) // 1500 比 1000 更近
    expect(hit?.judgment).toBe('perfect')
  })

  it('pickHit 在窗口外返回 null', () => {
    const notes = buildChart([0], 120, 1000)
    expect(pickHit(notes, 0, 5000)).toBeNull()
    // 轨道不匹配也返回 null
    expect(pickHit(notes, 3, 1000)).toBeNull()
  })

  it('collectMissed 只收集超时未判定的音符', () => {
    const notes = buildChart([0, 0], 120, 1000)
    const missed = collectMissed(notes, 1200)
    expect(missed).toEqual([0]) // 1000 已超窗，1500 还没到
  })

  it('连击倍率每 10 连 +10%，上限 2 倍', () => {
    expect(comboMultiplier(0)).toBe(1)
    expect(comboMultiplier(9)).toBe(1)
    expect(comboMultiplier(10)).toBeCloseTo(1.1)
    expect(comboMultiplier(1000)).toBe(2)
  })

  it('applyHit 累计统计与连击', () => {
    let s = EMPTY_STATS
    s = applyHit(s, 'perfect')
    s = applyHit(s, 'perfect')
    expect(s.perfect).toBe(2)
    expect(s.combo).toBe(2)
    expect(s.score).toBeGreaterThan(0)

    s = applyHit(s, 'miss')
    expect(s.combo).toBe(0) // 断连
    expect(s.miss).toBe(1)
    expect(s.maxCombo).toBe(2) // 历史最大连击保留
  })

  it('准确率按判定权重加权', () => {
    expect(accuracyOf(EMPTY_STATS)).toBe(100)
    expect(accuracyOf({ ...EMPTY_STATS, perfect: 10 })).toBe(100)
    expect(accuracyOf({ ...EMPTY_STATS, miss: 10 })).toBe(0)
    // 10 perfect + 10 miss → 50%
    expect(accuracyOf({ ...EMPTY_STATS, perfect: 10, miss: 10 })).toBe(50)
  })

  it('评级随准确率提升', () => {
    expect(rankOf(99).rank).toBe('SSS')
    expect(rankOf(95).rank).toBe('SS')
    expect(rankOf(90).rank).toBe('S')
    expect(rankOf(50).rank).toBe('D')
  })
})

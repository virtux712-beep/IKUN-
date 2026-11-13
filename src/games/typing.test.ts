import { describe, expect, it } from 'vitest'
import { accuracy, compareChars, computeStats, gradeOf, PHRASES, pickPhrases, wpm } from './typing'

describe('只因打字 · 纯逻辑', () => {
  it('语录库非空且无重复拼音', () => {
    expect(PHRASES.length).toBeGreaterThan(10)
    const set = new Set(PHRASES.map((p) => p.pinyin))
    expect(set.size).toBe(PHRASES.length)
  })

  it('逐字符比对能区分正确/错误/未输入', () => {
    expect(compareChars('abc', 'ab')).toEqual(['correct', 'correct', 'pending'])
    expect(compareChars('abc', 'ax')).toEqual(['correct', 'wrong', 'pending'])
    expect(compareChars('abc', 'abcd')).toEqual(['correct', 'correct', 'correct'])
  })

  it('统计正确与错误字符数', () => {
    const s = computeStats('hello', 'helxo')
    expect(s.correct).toBe(4)
    expect(s.wrong).toBe(1)
    expect(s.typed).toBe(5)
  })

  it('WPM 按「正确字符 ÷ 5 ÷ 分钟」计算', () => {
    // 30 个正确字符，用时 1 分钟 → 30/5/1 = 6
    expect(wpm(30, 60000)).toBe(6)
    // 60 个正确字符，用时 30 秒 → 60/5/0.5 = 24
    expect(wpm(60, 30000)).toBe(24)
    // 时长为 0 时返回 0，不除零
    expect(wpm(10, 0)).toBe(0)
  })

  it('准确率：无输入时视为 100%，否则按比例', () => {
    expect(accuracy(0, 0)).toBe(100)
    expect(accuracy(9, 10)).toBe(90)
    expect(accuracy(10, 10)).toBe(100)
  })

  it('评级：准确率过低直接 D，不论速度', () => {
    expect(gradeOf(200, 50).grade).toBe('D')
    expect(gradeOf(90, 98).grade).toBe('S')
    expect(gradeOf(65, 96).grade).toBe('A')
    expect(gradeOf(10, 95).grade).toBe('D')
  })

  it('pickPhrases 取指定数量且不重复', () => {
    const picked = pickPhrases(5)
    expect(picked).toHaveLength(5)
    expect(new Set(picked.map((p) => p.pinyin)).size).toBe(5)
    // 请求超过总数时最多返回全部
    expect(pickPhrases(999)).toHaveLength(PHRASES.length)
  })
})

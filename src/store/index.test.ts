import { beforeEach, describe, expect, it } from 'vitest'
import { installStorageMock, resetStorage } from '@/test/mockStorage'

installStorageMock()

const {
  getVisitCount,
  recordVisit,
  getMessages,
  addMessage,
  likeMessage,
  addReaction,
  addComment,
  getFavorites,
  toggleFavorite,
  addPurityResult,
  getPurityHistory,
  getNickname,
  setNickname,
  getVolume,
  setVolume,
} = await import('@/store')

const BASE_VISIT_COUNT = 12580

function makeMessage(id: string) {
  return {
    id,
    nickname: '测试小黑子',
    content: '鸡你太美',
    timestamp: Date.now(),
    likes: 0,
    reactions: {},
    comments: [],
  }
}

beforeEach(() => {
  resetStorage()
})

describe('访问统计', () => {
  it('初始为基准值', () => {
    expect(getVisitCount()).toBe(BASE_VISIT_COUNT)
  })

  it('同一会话内只累加一次', () => {
    expect(recordVisit()).toBe(BASE_VISIT_COUNT + 1)
    expect(recordVisit()).toBe(BASE_VISIT_COUNT + 1)
    expect(getVisitCount()).toBe(BASE_VISIT_COUNT + 1)
  })

  it('新会话会再次累加', () => {
    recordVisit()
    globalThis.sessionStorage.clear()
    expect(recordVisit()).toBe(BASE_VISIT_COUNT + 2)
  })
})

describe('留言墙', () => {
  it('默认带有示例留言', () => {
    expect(getMessages().length).toBeGreaterThan(0)
  })

  it('新留言插入到最前面', () => {
    const before = getMessages().length
    const next = addMessage(makeMessage('new-1'))
    expect(next).toHaveLength(before + 1)
    expect(next[0]?.id).toBe('new-1')
    expect(getMessages()[0]?.id).toBe('new-1')
  })

  it('点赞不修改原数组（不可变更新）', () => {
    const original = getMessages()
    const target = original[0]!
    const snapshot = JSON.stringify(original)
    const next = likeMessage(target.id)
    expect(JSON.stringify(original)).toBe(snapshot)
    expect(next).not.toBe(original)
    expect(next[0]?.likes).toBe(target.likes + 1)
  })

  it('重复添加表情会累加计数', () => {
    const id = getMessages()[0]!.id
    addReaction(id, '🐔')
    const after = addReaction(id, '🐔')
    expect(after[0]?.reactions['🐔']).toBe(2)
  })

  it('评论会追加到对应留言', () => {
    const id = getMessages()[0]!.id
    const next = addComment(id, {
      id: 'c-test',
      nickname: '路人',
      content: '荔枝',
      timestamp: Date.now(),
    })
    expect(next[0]?.comments.some((c) => c.id === 'c-test')).toBe(true)
  })
})

describe('收藏', () => {
  it('toggle 支持添加与移除', () => {
    expect(toggleFavorite('m1')).toEqual(['m1'])
    expect(toggleFavorite('m2')).toEqual(['m1', 'm2'])
    expect(toggleFavorite('m1')).toEqual(['m2'])
    expect(getFavorites()).toEqual(['m2'])
  })
})

describe('纯度测试历史', () => {
  it('最多保留 20 条', () => {
    for (let i = 0; i < 25; i++) addPurityResult(i)
    const history = getPurityHistory()
    expect(history).toHaveLength(20)
    expect(history.at(-1)).toBe(24)
  })
})

describe('用户偏好', () => {
  it('昵称与音量可持久化', () => {
    expect(getNickname()).toBe('')
    setNickname('练习两年半')
    expect(getNickname()).toBe('练习两年半')

    expect(getVolume()).toBe(80)
    setVolume(35)
    expect(getVolume()).toBe(35)
  })
})

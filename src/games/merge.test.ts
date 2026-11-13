import { describe, expect, it } from 'vitest'
import { CHAIN, EMPTY_BOARD, isDead, SIZE, slide, spawn } from './merge'

/** 用可读方式构造棋盘：0 = 空，其余为等级 */
function boardFrom(rows: number[][]): (number | null)[] {
  const out: (number | null)[] = []
  for (const row of rows) {
    for (const v of row) out.push(v === 0 ? null : v - 1)
  }
  return out
}

function toRows(board: (number | null)[]): number[][] {
  const rows: number[][] = []
  for (let y = 0; y < SIZE; y++) {
    rows.push(board.slice(y * SIZE, y * SIZE + SIZE).map((v) => (v === null ? 0 : v + 1)))
  }
  return rows
}

describe('只因合成 · 纯逻辑', () => {
  it('向左滑动会合并相邻同级', () => {
    const board = boardFrom([
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { board: next, moved, gained } = slide(board, 'left')
    expect(moved).toBe(true)
    expect(gained).toBeGreaterThan(0)
    expect(toRows(next)[0]).toEqual([2, 0, 0, 0])
  })

  it('同一次滑动不会连锁合并（1,1,1,1 → 2,2）', () => {
    const board = boardFrom([
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { board: next } = slide(board, 'left')
    expect(toRows(next)[0]).toEqual([2, 2, 0, 0])
  })

  it('无变化时 moved 为 false', () => {
    const board = boardFrom([
      [1, 2, 3, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { moved } = slide(board, 'left')
    expect(moved).toBe(false)
  })

  it('最高级不再合并', () => {
    const max = CHAIN.length
    const board = boardFrom([
      [max, max, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { board: next } = slide(board, 'left')
    expect(toRows(next)[0]).toEqual([max, max, 0, 0])
  })

  it('向右滑动把单位压到右侧', () => {
    const board = boardFrom([
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
    const { board: next } = slide(board, 'right')
    expect(toRows(next)[0]).toEqual([0, 0, 0, 1])
  })

  it('spawn 只增加一个格子', () => {
    const next = spawn(EMPTY_BOARD)
    expect(next.filter((v) => v !== null)).toHaveLength(1)
  })

  it('棋盘已满且无相邻同级时判定为死局', () => {
    // 用 1/2 交替铺满，保证没有相邻相同
    const rows: number[][] = []
    for (let y = 0; y < SIZE; y++) {
      const row: number[] = []
      for (let x = 0; x < SIZE; x++) row.push((x + y) % 2 === 0 ? 1 : 2)
      rows.push(row)
    }
    expect(isDead(boardFrom(rows))).toBe(true)
  })

  it('有空位时不算死局', () => {
    expect(isDead(EMPTY_BOARD)).toBe(false)
  })
})

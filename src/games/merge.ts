/**
 * 只因合成的纯逻辑（2048 机制）。
 * 单独拆出来便于单元测试，也让组件只管渲染与交互。
 */

/** 合并链：两个同级合成下一级，最高级不可再合并 */
export const CHAIN = [
  { emoji: '🐣', name: '小鸡', color: 'from-slate-500/25 to-slate-600/10', text: 'text-slate-100' },
  {
    emoji: '🐔',
    name: '鸡',
    color: 'from-emerald-500/25 to-emerald-700/10',
    text: 'text-emerald-100',
  },
  { emoji: '🐓', name: '公鸡', color: 'from-cyan-500/25 to-cyan-700/10', text: 'text-cyan-100' },
  { emoji: '🥚', name: '蛋', color: 'from-amber-500/25 to-amber-700/10', text: 'text-amber-100' },
  {
    emoji: '🍗',
    name: '鸡腿',
    color: 'from-orange-500/30 to-orange-700/10',
    text: 'text-orange-100',
  },
  { emoji: '🏀', name: '篮球', color: 'from-red-500/30 to-red-700/10', text: 'text-red-100' },
  {
    emoji: '🎤',
    name: '麦克风',
    color: 'from-fuchsia-500/30 to-fuchsia-700/10',
    text: 'text-fuchsia-100',
  },
  {
    emoji: '👑',
    name: '只因之神',
    color: 'from-yellow-400/40 to-amber-600/15',
    text: 'text-yellow-100',
  },
]

export const SIZE = 4
export type Board = (number | null)[]
export type Dir = 'up' | 'down' | 'left' | 'right'

export const EMPTY_BOARD: Board = Array(SIZE * SIZE).fill(null)

export function idx(x: number, y: number): number {
  return y * SIZE + x
}

/** 取一行/列的索引序列（按移动方向从「远端」到「近端」） */
function lineIndices(dir: Dir, line: number): number[] {
  const out: number[] = []
  for (let i = 0; i < SIZE; i++) {
    if (dir === 'left') out.push(idx(i, line))
    else if (dir === 'right') out.push(idx(SIZE - 1 - i, line))
    else if (dir === 'up') out.push(idx(line, i))
    else out.push(idx(line, SIZE - 1 - i))
  }
  return out
}

/** 压缩 + 合并，返回新棋盘、是否移动、得分 */
export function slide(board: Board, dir: Dir): { board: Board; moved: boolean; gained: number } {
  const next = [...board]
  let moved = false
  let gained = 0

  for (let line = 0; line < SIZE; line++) {
    const positions = lineIndices(dir, line)
    const values = positions.map((i) => board[i]).filter((v): v is number => v !== null)

    const merged: number[] = []
    let i = 0
    while (i < values.length) {
      const cur = values[i] as number
      const nxt = values[i + 1]
      if (nxt !== undefined && nxt === cur && cur < CHAIN.length - 1) {
        const upgraded = cur + 1
        merged.push(upgraded)
        gained += 2 ** (upgraded + 1)
        i += 2
        moved = true
      } else {
        merged.push(cur)
        i += 1
      }
    }

    positions.forEach((pos, k) => {
      const v = merged[k] ?? null
      if (next[pos] !== v) moved = true
      next[pos] = v
    })
  }

  return { board: next, moved, gained }
}

export function spawn(board: Board): Board {
  const empty: number[] = []
  board.forEach((v, i) => {
    if (v === null) empty.push(i)
  })
  if (empty.length === 0) return board
  const target = empty[Math.floor(Math.random() * empty.length)] as number
  const next = [...board]
  next[target] = Math.random() < 0.88 ? 0 : 1
  return next
}

export function isDead(board: Board): boolean {
  if (board.some((v) => v === null)) return false
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cur = board[idx(x, y)]
      if (cur === null) return false
      if (x < SIZE - 1 && board[idx(x + 1, y)] === cur && cur < CHAIN.length - 1) return false
      if (y < SIZE - 1 && board[idx(x, y + 1)] === cur && cur < CHAIN.length - 1) return false
    }
  }
  return true
}

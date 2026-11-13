import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn, Hint, SFX, shuffle, useRecord } from './ui'

/* ================================================================
   9. 唱跳 rap 接龙（Simon Says）
   ================================================================ */
const SIMON = [
  { id: 0, label: '唱', emoji: '🎤', cls: 'from-pink-500/40 to-rose-500/20' },
  { id: 1, label: '跳', emoji: '💃', cls: 'from-blue-500/40 to-cyan-500/20' },
  { id: 2, label: 'rap', emoji: '🎧', cls: 'from-purple-500/40 to-indigo-500/20' },
  { id: 3, label: '篮球', emoji: '🏀', cls: 'from-orange-500/40 to-amber-500/20' },
]

export function SimonSays() {
  const [seq, setSeq] = useState<number[]>([])
  const [input, setInput] = useState<number[]>([])
  const [showing, setShowing] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [level, setLevel] = useState(0)
  const [msg, setMsg] = useState('点「开始」看接龙')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const { record, submit } = useRecord('ikun_f_simon')

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const playSequence = useCallback((s: number[]) => {
    setShowing(true)
    setMsg('看好了…')
    timers.current.forEach(clearTimeout)
    timers.current = []
    s.forEach((v, i) => {
      timers.current.push(
        setTimeout(
          () => {
            setFlash(v)
            SFX.pop()
          },
          600 * i + 300,
        ),
      )
      timers.current.push(setTimeout(() => setFlash(null), 600 * i + 650))
    })
    timers.current.push(
      setTimeout(
        () => {
          setShowing(false)
          setInput([])
          setMsg('轮到你了！')
        },
        600 * s.length + 500,
      ),
    )
  }, [])

  const nextRound = useCallback(() => {
    const next = [...seq, Math.floor(Math.random() * 4)]
    setSeq(next)
    setLevel(next.length)
    playSequence(next)
  }, [seq, playSequence])

  const start = () => {
    setSeq([])
    setInput([])
    setLevel(1)
    const first = [Math.floor(Math.random() * 4)]
    setSeq(first)
    playSequence(first)
  }

  const tap = (v: number) => {
    if (showing || seq.length === 0) return
    const next = [...input, v]
    setFlash(v)
    setTimeout(() => setFlash(null), 160)
    if (next[next.length - 1] !== seq[next.length - 1]) {
      SFX.fail()
      setMsg(`接错啦！你接上了 ${seq.length - 1} 个`)
      submit(seq.length - 1)
      setSeq([])
      setInput([])
      setLevel(0)
      return
    }
    SFX.ok()
    setInput(next)
    if (next.length === seq.length) {
      setMsg('接住了！继续加长')
      timers.current.push(setTimeout(nextRound, 700))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          第 <span className="text-ikun-yellow font-bold tabular-nums">{level}</span> 拍
        </span>
        <span className="text-gray-500">{msg}</span>
        <span className="text-gray-500 tabular-nums">最高 {record}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SIMON.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => tap(s.id)}
            disabled={showing || seq.length === 0}
            className={
              'aspect-[2/1] rounded-2xl grid place-items-center bg-gradient-to-br transition-all cursor-pointer ' +
              s.cls +
              ' ' +
              (flash === s.id ? 'scale-105 brightness-150 ring-2 ring-white/50' : 'opacity-70')
            }
          >
            <span className="text-3xl">{s.emoji}</span>
            <span className="text-xs text-white/80 mt-1">{s.label}</span>
          </button>
        ))}
      </div>

      <Btn className="w-full" onClick={start}>
        {seq.length === 0 ? '开始接龙' : '重新开始'}
      </Btn>
      <Hint>唱、跳、rap、篮球依次亮起，按相同顺序点击。每成功一次序列就加长一位。</Hint>
    </div>
  )
}

/* ================================================================
   10. 鸡窝翻牌
   ================================================================ */
const PAIR_EMOJI = ['🐔', '🐓', '🐤', '🐥', '🥚', '🍗']

export function MemoryPairs() {
  const [cards, setCards] = useState<{ id: number; emoji: string; open: boolean; done: boolean }[]>(
    [],
  )
  const [picked, setPicked] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [left, setLeft] = useState(45)
  const [playing, setPlaying] = useState(false)
  const { record, submit } = useRecord('ikun_f_pairs', 'low')

  const newGame = () => {
    const deck = shuffle(PAIR_EMOJI.flatMap((e) => [e, e]))
    setCards(deck.map((emoji, id) => ({ id, emoji, open: false, done: false })))
    setPicked([])
    setMoves(0)
    setLeft(45)
    setPlaying(true)
  }

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          setPlaying(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [playing])

  const allDone = cards.length > 0 && cards.every((c) => c.done)
  useEffect(() => {
    if (!allDone) return
    setPlaying(false)
    submit(moves, 'low')
  }, [allDone, moves, submit])

  const flip = (id: number) => {
    if (!playing || picked.length >= 2) return
    const card = cards[id]
    if (!card || card.open || card.done) return
    SFX.pop()
    const nextCards = cards.map((c) => (c.id === id ? { ...c, open: true } : c))
    setCards(nextCards)
    const nextPicked = [...picked, id]
    setPicked(nextPicked)

    if (nextPicked.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = nextPicked
      const ca = nextCards[a as number]
      const cb = nextCards[b as number]
      if (ca && cb && ca.emoji === cb.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === a || c.id === b ? { ...c, done: true } : c)))
          setPicked([])
          SFX.ok()
        }, 320)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === a || c.id === b ? { ...c, open: false } : c)),
          )
          setPicked([])
        }, 700)
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          步数 <span className="text-ikun-yellow font-bold tabular-nums">{moves}</span>
        </span>
        <span className="text-gray-400 tabular-nums">⏱ {left}s</span>
        <span className="text-gray-500 tabular-nums">
          {record === 0 ? '无记录' : `最少 ${record} 步`}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            type="button"
            key={card.id}
            onClick={() => flip(card.id)}
            className={
              'aspect-square rounded-xl grid place-items-center text-3xl transition-all cursor-pointer ' +
              (card.done
                ? 'bg-green-500/15 opacity-60'
                : card.open
                  ? 'bg-ikun-yellow/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10')
            }
            aria-label={card.open || card.done ? card.emoji : '未翻开的牌'}
          >
            {card.open || card.done ? card.emoji : '❓'}
          </button>
        ))}
      </div>

      {(!playing || allDone) && (
        <div className="space-y-2">
          {allDone && (
            <p className="text-center text-sm text-green-300">全部配对成功！用了 {moves} 步 🎉</p>
          )}
          <Btn className="w-full" onClick={newGame}>
            {allDone ? '再来一局' : '开始翻牌'}
          </Btn>
        </div>
      )}
      <Hint>翻开两张相同的鸡即为配对。用最少的步数、最短的时间清空所有牌。</Hint>
    </div>
  )
}

/* ================================================================
   11. 井字棋（人机）
   ================================================================ */
type Cell = 'X' | 'O' | null

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function winnerOf(b: Cell[]): Cell | 'draw' | null {
  for (const [a, c, d] of LINES) {
    if (b[a as number] && b[a as number] === b[c as number] && b[a as number] === b[d as number]) {
      return b[a as number] as Cell
    }
  }
  return b.every(Boolean) ? 'draw' : null
}

function bestMove(board: Cell[]): number {
  let bestScore = -Infinity
  let move = -1
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue
    const copy = [...board]
    copy[i] = 'O'
    const score = minimax(copy, 0, false)
    if (score > bestScore) {
      bestScore = score
      move = i
    }
  }
  return move
}

function minimax(board: Cell[], depth: number, maximizing: boolean): number {
  const w = winnerOf(board)
  if (w === 'O') return 10 - depth
  if (w === 'X') return depth - 10
  if (w === 'draw') return 0
  if (maximizing) {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue
      const copy = [...board]
      copy[i] = 'O'
      best = Math.max(best, minimax(copy, depth + 1, false))
    }
    return best
  }
  let best = Infinity
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue
    const copy = [...board]
    copy[i] = 'X'
    best = Math.min(best, minimax(copy, depth + 1, true))
  }
  return best
}

export function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null))
  const [msg, setMsg] = useState('你执 X，先手')
  const [wins, setWins] = useState(0)

  const result = winnerOf(board)

  const reset = () => {
    setBoard(Array(9).fill(null))
    setMsg('你执 X，先手')
  }

  const play = (i: number) => {
    if (board[i] || result) return
    const next = [...board]
    next[i] = 'X'
    const afterPlayer = winnerOf(next)
    if (afterPlayer) {
      setBoard(next)
      if (afterPlayer === 'X') {
        setMsg('你赢了！小黑子有点东西 🎉')
        setWins((w) => w + 1)
        SFX.ok()
      } else {
        setMsg('平局，势均力敌')
      }
      return
    }
    const ai = bestMove(next)
    if (ai >= 0) next[ai] = 'O'
    const afterAi = winnerOf(next)
    setBoard(next)
    if (afterAi === 'O') {
      setMsg('坤坤赢了，再练两年半吧 😏')
      SFX.fail()
    } else if (afterAi === 'draw') {
      setMsg('平局，势均力敌')
    } else {
      setMsg('轮到你了')
      SFX.pop()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{msg}</span>
        <span className="text-gray-500 tabular-nums">胜场 {wins}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => (
          <button
            type="button"
            key={i}
            onClick={() => play(i)}
            disabled={Boolean(cell) || Boolean(result)}
            className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 grid place-items-center text-4xl font-black transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label={`第 ${i + 1} 格`}
          >
            <span className={cell === 'X' ? 'text-ikun-yellow' : 'text-pink-400'}>
              {cell === 'X' ? '🐔' : cell === 'O' ? '🏀' : ''}
            </span>
          </button>
        ))}
      </div>

      <Btn className="w-full" kind="ghost" onClick={reset}>
        重开一局
      </Btn>
      <Hint>
        你是 🐔（先手），对手是 🏀。对手使用完整 minimax 搜索，理论上你赢不了，但可以争取平局。
      </Hint>
    </div>
  )
}

/* ================================================================
   12. 只因迷宫
   ================================================================ */
const MAZE = [
  '#########',
  '#S..#...#',
  '#.#.#.#.#',
  '#.#...#.#',
  '#.#####.#',
  '#.......#',
  '#.#####G#',
  '#########',
]
const MAZE_H = MAZE.length

function findChar(ch: string): [number, number] {
  for (let y = 0; y < MAZE_H; y++) {
    const x = (MAZE[y] ?? '').indexOf(ch)
    if (x >= 0) return [x, y]
  }
  return [1, 1]
}

export function MazeGame() {
  const [start] = useState(() => findChar('S'))
  const [goal] = useState(() => findChar('G'))
  const [pos, setPos] = useState<[number, number]>(start)
  const [steps, setSteps] = useState(0)
  const [won, setWon] = useState(false)
  const { record, submit } = useRecord('ikun_f_maze', 'low')

  const move = useCallback((dx: number, dy: number) => {
    setPos(([x, y]) => {
      const nx = x + dx
      const ny = y + dy
      const row = MAZE[ny]
      if (!row || row[nx] === undefined || row[nx] === '#') return [x, y]
      setSteps((s) => s + 1)
      if (row[nx] === 'G') {
        setWon(true)
        SFX.ok()
      }
      return [nx, ny]
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      }
      const d = map[e.key]
      if (d) {
        e.preventDefault()
        move(d[0], d[1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  useEffect(() => {
    if (won) submit(steps, 'low')
  }, [won, steps, submit])

  const reset = () => {
    setPos(start)
    setSteps(0)
    setWon(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          步数 <span className="text-ikun-yellow font-bold tabular-nums">{steps}</span>
        </span>
        <span className="text-gray-500 tabular-nums">
          {record === 0 ? '无记录' : `最少 ${record} 步`}
        </span>
      </div>

      <div className="mx-auto" style={{ maxWidth: 320 }}>
        {MAZE.map((row, y) => (
          <div key={y} className="flex">
            {[...row].map((ch, x) => {
              const isPlayer = pos[0] === x && pos[1] === y
              const isGoal = goal[0] === x && goal[1] === y
              return (
                <div
                  key={x}
                  className={
                    'aspect-square flex-1 grid place-items-center text-sm ' +
                    (ch === '#' ? 'bg-white/15' : 'bg-white/[0.03]')
                  }
                >
                  {isPlayer ? '🐔' : isGoal ? '🏀' : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        <div />
        <Btn kind="ghost" onClick={() => move(0, -1)}>
          ↑
        </Btn>
        <div />
        <Btn kind="ghost" onClick={() => move(-1, 0)}>
          ←
        </Btn>
        <Btn kind="ghost" onClick={() => move(0, 1)}>
          ↓
        </Btn>
        <Btn kind="ghost" onClick={() => move(1, 0)}>
          →
        </Btn>
      </div>

      {won && <p className="text-center text-sm text-green-300">到达球场！用了 {steps} 步 🏀</p>}
      <Btn className="w-full" kind="ghost" onClick={reset}>
        重新走一遍
      </Btn>
      <Hint>用方向键或 WASD 移动，从 🐔 走到 🏀。撞墙不算步数。</Hint>
    </div>
  )
}

/* ================================================================
   13. 只因华容道（数字滑块）
   ================================================================ */
export function SlidePuzzle() {
  const [tiles, setTiles] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState(false)
  const { record, submit } = useRecord('ikun_f_slide', 'low')

  const shuffleBoard = useCallback(() => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 0]
    for (let i = 0; i < 200; i++) {
      const z = arr.indexOf(0)
      const opts = [z - 3, z + 3, z % 3 === 0 ? -1 : z - 1, z % 3 === 2 ? -1 : z + 1].filter(
        (n) => n >= 0 && n < 9,
      )
      const pickIdx = opts[Math.floor(Math.random() * opts.length)] as number
      const tmp = arr[z] as number
      arr[z] = arr[pickIdx] as number
      arr[pickIdx] = tmp
    }
    setTiles(arr)
    setMoves(0)
    setSolved(false)
  }, [])

  useEffect(() => {
    shuffleBoard()
  }, [shuffleBoard])

  const slide = (i: number) => {
    if (solved) return
    const z = tiles.indexOf(0)
    const adjacent =
      Math.abs(i - z) === 3 || (Math.abs(i - z) === 1 && Math.floor(i / 3) === Math.floor(z / 3))
    if (!adjacent) return
    const next = [...tiles]
    const tmp = next[z] as number
    next[z] = next[i] as number
    next[i] = tmp
    setTiles(next)
    setMoves((m) => m + 1)
    SFX.tick()
    const isSolved = next.every((v, idx) => (idx === 8 ? v === 0 : v === idx + 1))
    if (isSolved) {
      setSolved(true)
      submit(moves + 1, 'low')
      SFX.ok()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          步数 <span className="text-ikun-yellow font-bold tabular-nums">{moves}</span>
        </span>
        <span className="text-gray-500 tabular-nums">
          {record === 0 ? '无记录' : `最少 ${record} 步`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((v, i) => (
          <button
            type="button"
            key={i}
            onClick={() => slide(i)}
            className={
              'aspect-square rounded-xl grid place-items-center text-2xl font-black transition-all cursor-pointer ' +
              (v === 0
                ? 'bg-transparent'
                : 'bg-gradient-to-br from-ikun-yellow/25 to-ikun-gold/10 text-white hover:from-ikun-yellow/35')
            }
            aria-label={v === 0 ? '空位' : `数字 ${v}`}
          >
            {v === 0 ? '' : v}
          </button>
        ))}
      </div>

      {solved && <p className="text-center text-sm text-green-300">拼好啦！用了 {moves} 步 🎉</p>}
      <Btn className="w-full" kind="ghost" onClick={shuffleBoard}>
        重新打乱
      </Btn>
      <Hint>点击空格旁边的方块即可滑动，把 1~8 按顺序排好就算成功。</Hint>
    </div>
  )
}

/* ================================================================
   14. 猜数字
   ================================================================ */
export function GuessNumber() {
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [guess, setGuess] = useState('')
  const [tries, setTries] = useState(0)
  const [history, setHistory] = useState<{ v: number; hint: string }[]>([])
  const [done, setDone] = useState(false)
  const { record, submit } = useRecord('ikun_f_guess', 'low')

  const submitGuess = () => {
    const v = Number(guess)
    if (!v || v < 1 || v > 100 || done) return
    const n = tries + 1
    setTries(n)
    let hint = ''
    if (v === target) {
      hint = '猜中了！'
      setDone(true)
      submit(n, 'low')
      SFX.ok()
    } else if (v < target) {
      hint = '小了'
      SFX.pop()
    } else {
      hint = '大了'
      SFX.pop()
    }
    setHistory((h) => [{ v, hint }, ...h].slice(0, 8))
    setGuess('')
  }

  const restart = () => {
    setTarget(Math.floor(Math.random() * 100) + 1)
    setGuess('')
    setTries(0)
    setHistory([])
    setDone(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          已猜 <span className="text-ikun-yellow font-bold tabular-nums">{tries}</span> 次
        </span>
        <span className="text-gray-500 tabular-nums">
          {record === 0 ? '无记录' : `最少 ${record} 次`}
        </span>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={100}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
          placeholder="1 ~ 100"
          disabled={done}
          aria-label="输入你猜的数字"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50"
        />
        <Btn onClick={submitGuess} disabled={done}>
          猜
        </Btn>
      </div>

      <div className="space-y-1 min-h-[120px]">
        {done && (
          <p className="text-center text-green-300 text-sm py-2">
            答案就是 {target}，你用了 {tries} 次 🎉
          </p>
        )}
        {history.map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-white/5"
          >
            <span className="text-white tabular-nums">{h.v}</span>
            <span className={h.hint === '猜中了！' ? 'text-green-400' : 'text-gray-400'}>
              {h.hint}
            </span>
          </div>
        ))}
      </div>

      <Btn className="w-full" kind="ghost" onClick={restart}>
        换一个数字
      </Btn>
      <Hint>心里想的是 1~100 的整数。二分法 7 次以内必中，看看你要几次。</Hint>
    </div>
  )
}

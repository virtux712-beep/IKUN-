import { useCallback, useEffect, useRef, useState } from 'react'
import { useAchievements } from '@/achievements'
import { Bar, Btn, Hint, Row, SFX, useRecord } from './ui'

/* ================================================================
   1. 铁山靠格挡
   ================================================================ */
interface BlockPrompt {
  dir: 'L' | 'R'
  life: number
}

export function TieShanKao() {
  const [playing, setPlaying] = useState(false)
  const [, setV] = useState(0)
  const g = useRef({ prompt: null as BlockPrompt | null, score: 0, hp: 3, combo: 0 })
  const { record, submit } = useRecord('ikun_f_tsk')
  const render = useCallback(() => setV((v) => v + 1), [])

  const start = () => {
    g.current = { prompt: null, score: 0, hp: 3, combo: 0 }
    setPlaying(true)
    render()
  }

  const block = useCallback(
    (dir: 'L' | 'R') => {
      const s = g.current
      if (!s.prompt) return
      if (s.prompt.dir === dir) {
        s.score += 1
        s.combo += 1
        SFX.ok()
      } else {
        s.hp -= 1
        s.combo = 0
        SFX.fail()
      }
      s.prompt = null
      if (s.hp <= 0) {
        setPlaying(false)
        submit(s.score)
      }
      render()
    },
    [submit, render],
  )

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const s = g.current
      if (!s.prompt) {
        s.prompt = { dir: Math.random() < 0.5 ? 'L' : 'R', life: 100 }
      } else {
        s.prompt.life -= 7
        if (s.prompt.life <= 0) {
          s.prompt = null
          s.hp -= 1
          s.combo = 0
          SFX.fail()
          if (s.hp <= 0) {
            setPlaying(false)
            submit(s.score)
          }
        }
      }
      render()
    }, 60)
    return () => clearInterval(id)
  }, [playing, submit, render])

  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'a' || e.key === 'ArrowLeft') block('L')
      if (k === 'd' || e.key === 'ArrowRight') block('R')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, block])

  const s = g.current

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          得分 <span className="text-ikun-yellow font-bold tabular-nums">{s.score}</span>
        </span>
        <span className="text-gray-400">
          连击 <span className="text-white tabular-nums">{s.combo}</span>
        </span>
        <span role="img" aria-label={`剩余生命 ${s.hp}`}>
          {'❤️'.repeat(Math.max(0, s.hp))}
        </span>
      </div>

      <div className="relative h-44 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center">
        {s.prompt ? (
          <>
            <div
              className={
                'text-6xl font-black transition-transform ' +
                (s.prompt.dir === 'L' ? '-translate-x-16' : 'translate-x-16')
              }
            >
              {s.prompt.dir === 'L' ? '⬅️' : '➡️'}
            </div>
            <div className="absolute bottom-3 left-6 right-6">
              <Bar value={s.prompt.life} tone={s.prompt.life < 40 ? 'red' : 'gold'} />
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">
            {playing ? '准备…' : '按开始，用 A / D 或左右键格挡'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Btn kind="ghost" onClick={() => block('L')} disabled={!playing}>
          ⬅️ 靠（A）
        </Btn>
        <Btn kind="ghost" onClick={() => block('R')} disabled={!playing}>
          ➡️ 靠（D）
        </Btn>
      </div>

      {!playing && (
        <div className="flex items-center justify-between">
          <Row label="最高分" value={record} />
          <Btn onClick={start}>{s.score > 0 || record > 0 ? '再来一次' : '开始'}</Btn>
        </div>
      )}
      <Hint>方块出现后要在进度条走完前按对方向，按错或超时都会掉血，共 3 条命。</Hint>
    </div>
  )
}

/* ================================================================
   2. 鸡你太美 · 节奏点击
   ================================================================ */
export function RhythmTap() {
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [score, setScore] = useState(0)
  const [judge, setJudge] = useState('')
  const [combo, setCombo] = useState(0)
  const { record, submit } = useRecord('ikun_f_rhythm')
  const dirRef = useRef(1)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPos((p) => {
        let next = p + dirRef.current * 3.2
        if (next >= 100) {
          next = 100
          dirRef.current = -1
        }
        if (next <= 0) {
          next = 0
          dirRef.current = 1
        }
        return next
      })
    }, 16)
    return () => clearInterval(id)
  }, [playing])

  const tap = () => {
    const dist = Math.abs(pos - 50)
    let text = '差一点 😅'
    let gain = 0
    if (dist <= 4) {
      text = '完美！✨'
      gain = 100
    } else if (dist <= 10) {
      text = '很棒 👏'
      gain = 60
    } else if (dist <= 20) {
      text = '还行 👍'
      gain = 30
    }
    setJudge(text)
    setScore((s) => s + gain)
    setCombo((c) => (gain > 0 ? c + 1 : 0))
    if (gain >= 60) SFX.ok()
    else if (gain === 0) SFX.fail()
    else SFX.pop()
  }

  const finish = () => {
    setPlaying(false)
    submit(score)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          得分 <span className="text-ikun-yellow font-bold tabular-nums">{score}</span>
        </span>
        <span className="text-gray-400">
          连击 <span className="text-white tabular-nums">{combo}</span>
        </span>
        <span className="text-gray-500 tabular-nums">最高 {record}</span>
      </div>

      <div className="relative h-24 rounded-2xl bg-white/5 overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-ikun-yellow/40" />
        <div className="absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 border-x border-ikun-yellow/20 bg-ikun-yellow/5" />
        <div
          className="absolute top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ikun-yellow shadow-lg shadow-ikun-yellow/50"
          style={{ left: `${pos}%` }}
        />
        <div className="absolute bottom-2 inset-x-0 text-center text-xs text-gray-500">
          {judge || '在黄线处点击'}
        </div>
      </div>

      <div className="flex gap-3">
        {playing ? (
          <>
            <Btn className="flex-1" onClick={tap}>
              咚！
            </Btn>
            <Btn kind="ghost" onClick={finish}>
              结束
            </Btn>
          </>
        ) : (
          <Btn className="flex-1" onClick={() => setPlaying(true)}>
            开始节奏
          </Btn>
        )}
      </div>
      <Hint>光点来回移动，经过中央黄线时点击。越准分越高，连续命中会累积连击。</Hint>
    </div>
  )
}

/* ================================================================
   3. 两年半精准计时
   ================================================================ */
export function TwoAndHalf() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const startRef = useRef(0)
  const { record, submit } = useRecord('ikun_f_25', 'low')

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed(performance.now() - startRef.current), 33)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    setResult(null)
    setElapsed(0)
    startRef.current = performance.now()
    setRunning(true)
  }

  const stop = () => {
    const ms = performance.now() - startRef.current
    setRunning(false)
    setElapsed(ms)
    setResult(ms)
    submit(Math.round(Math.abs(ms - 2500)))
    if (Math.abs(ms - 2500) < 80) SFX.ok()
    else SFX.fail()
  }

  const diff = result === null ? 0 : Math.round(result - 2500)

  return (
    <div className="space-y-4 text-center">
      <div className="text-6xl font-black tabular-nums text-white">
        {(elapsed / 1000).toFixed(2)}
        <span className="text-2xl text-gray-500">s</span>
      </div>
      <div className="text-sm text-gray-500">目标：精确停在 2.50 秒（练习时长两年半）</div>

      {result !== null && (
        <div
          className={
            'rounded-xl p-3 text-sm ' +
            (Math.abs(diff) < 80 ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-gray-300')
          }
        >
          {Math.abs(diff) < 80
            ? `神级手感！误差仅 ${Math.abs(diff)}ms，你就是练习时长两年半的练习生 🐔`
            : diff > 0
              ? `慢了 ${diff}ms，鸡都跑啦`
              : `快了 ${Math.abs(diff)}ms，再稳一点`}
        </div>
      )}

      <div className="flex justify-center gap-3">
        {running ? <Btn onClick={stop}>停！</Btn> : <Btn onClick={start}>开始计时</Btn>}
      </div>
      <Row label="最佳误差" value={record === 0 ? '暂无' : `${record}ms`} />
      <Hint>按下开始后凭感觉在 2.5 秒时点击停止。误差越小越强。</Hint>
    </div>
  )
}

/* ================================================================
   4. 打柠檬
   ================================================================ */
interface Lemon {
  id: number
  x: number
  y: number
  born: number
}

export function SmashLemon() {
  const [playing, setPlaying] = useState(false)
  const [lemons, setLemons] = useState<Lemon[]>([])
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(15)
  const idRef = useRef(0)
  const { record, submit } = useRecord('ikun_f_lemon')

  useEffect(() => {
    if (!playing) return
    const spawn = setInterval(() => {
      setLemons((prev) => [
        ...prev.slice(-8),
        {
          id: idRef.current++,
          x: 8 + Math.random() * 78,
          y: 8 + Math.random() * 72,
          born: Date.now(),
        },
      ])
    }, 520)
    const timer = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          clearInterval(spawn)
          setPlaying(false)
          setLemons([])
          setScore((s) => {
            submit(s)
            return s
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      clearInterval(spawn)
      clearInterval(timer)
    }
  }, [playing, submit])

  const smash = (id: number) => {
    setLemons((prev) => prev.filter((l) => l.id !== id))
    setScore((s) => s + 1)
    SFX.pop()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ikun-yellow font-bold tabular-nums">🍋 {score}</span>
        <span className="text-gray-400 tabular-nums">⏱ {left}s</span>
        <span className="text-gray-500 tabular-nums">最高 {record}</span>
      </div>

      <div className="relative h-64 rounded-2xl bg-white/5 overflow-hidden select-none">
        {lemons.map((l) => (
          <button
            type="button"
            key={l.id}
            onPointerDown={() => smash(l.id)}
            className="absolute text-4xl transition-transform active:scale-75 cursor-pointer"
            style={{ left: `${l.x}%`, top: `${l.y}%` }}
            aria-label="打柠檬"
          >
            🍋
          </button>
        ))}
        {!playing && (
          <div className="absolute inset-0 grid place-items-center bg-black/40">
            <Btn
              onClick={() => {
                setScore(0)
                setLeft(15)
                setLemons([])
                setPlaying(true)
              }}
            >
              {score > 0 ? '再来一次' : '开始打柠檬'}
            </Btn>
          </div>
        )}
      </div>
      <Hint>柠檬代表「酸」，15 秒内能打多少打多少。手速与眼力的双重考验。</Hint>
    </div>
  )
}

/* ================================================================
   5. 只因打地鼠
   ================================================================ */
export function WhackChicken() {
  const [playing, setPlaying] = useState(false)
  const [hole, setHole] = useState(-1)
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(20)
  const [miss, setMiss] = useState(0)
  const { record, submit } = useRecord('ikun_f_whack')

  useEffect(() => {
    if (!playing) return
    const show = setInterval(() => setHole(Math.floor(Math.random() * 9)), 720)
    const timer = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          clearInterval(show)
          setPlaying(false)
          setHole(-1)
          setScore((s) => {
            submit(s)
            return s
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      clearInterval(show)
      clearInterval(timer)
    }
  }, [playing, submit])

  const hit = (i: number) => {
    if (i === hole) {
      setScore((s) => s + 1)
      setHole(-1)
      SFX.pop()
    } else {
      setMiss((m) => m + 1)
      SFX.fail()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ikun-yellow font-bold tabular-nums">🐔 {score}</span>
        <span className="text-gray-400 tabular-nums">⏱ {left}s</span>
        <span className="text-gray-500 tabular-nums">空挥 {miss}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => playing && hit(i)}
            disabled={!playing}
            className={
              'aspect-square rounded-xl grid place-items-center text-4xl transition-all cursor-pointer ' +
              (hole === i ? 'bg-ikun-yellow/20 scale-105' : 'bg-white/5 hover:bg-white/10')
            }
            aria-label={`第 ${i + 1} 个洞`}
          >
            {hole === i ? '🐔' : '🕳️'}
          </button>
        ))}
      </div>

      {!playing && (
        <Btn
          className="w-full"
          onClick={() => {
            setScore(0)
            setMiss(0)
            setLeft(20)
            setPlaying(true)
          }}
        >
          {score > 0 ? '再来一次' : '开始打地鼠'}
        </Btn>
      )}
      <Row label="最高分" value={record} />
      <Hint>鸡会在随机洞口冒出来，20 秒内尽量多打。点错洞会记一次空挥。</Hint>
    </div>
  )
}

/* ================================================================
   6. 手速测试
   ================================================================ */
export function CpsTest() {
  const { record: track } = useAchievements()
  const [playing, setPlaying] = useState(false)
  const [count, setCount] = useState(0)
  const [left, setLeft] = useState(5)
  const [cps, setCps] = useState(0)
  const { record, submit } = useRecord('ikun_f_cps')

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

  useEffect(() => {
    if (playing || left !== 0) return
    const value = count / 5
    setCps(value)
    submit(Math.round(value * 10))
    track({ type: 'cps', value })
  }, [playing, left, count, submit, track])

  const tap = () => {
    if (!playing) return
    setCount((c) => c + 1)
    SFX.tick()
  }

  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl font-black text-ikun-yellow tabular-nums">{count}</div>
      <div className="text-sm text-gray-500">
        {playing ? `剩余 ${left}s` : cps > 0 ? `${cps.toFixed(1)} 次/秒` : '5 秒内疯狂点击'}
      </div>

      <button
        type="button"
        onClick={tap}
        className={
          'w-full h-40 rounded-2xl text-2xl font-black transition-all cursor-pointer ' +
          (playing
            ? 'bg-gradient-to-br from-ikun-yellow/30 to-ikun-gold/10 text-ikun-yellow active:scale-[0.98]'
            : 'bg-white/5 text-gray-400')
        }
      >
        {playing ? '点我！' : cps > 0 ? `CPS ${cps.toFixed(1)}` : '点击开始'}
      </button>

      <Btn
        onClick={() => {
          setCount(0)
          setCps(0)
          setLeft(5)
          setPlaying(true)
        }}
      >
        开始测试
      </Btn>
      <Row label="最高 CPS ×10" value={record} />
      <Hint>5 秒内点击次数除以 5 就是 CPS。人类极限约 10-15，超过 8 已经很猛了。</Hint>
    </div>
  )
}

/* ================================================================
   7. 找不同的鸡
   ================================================================ */
export function FindDifferent() {
  const [round, setRound] = useState(0)
  const [odd, setOdd] = useState(-1)
  const [size, setSize] = useState(9)
  const [left, setLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const { record, submit } = useRecord('ikun_f_find')

  const newRound = (n: number) => {
    setSize(n < 3 ? 9 : n < 6 ? 16 : 25)
    setOdd(Math.floor(Math.random() * (n < 3 ? 9 : n < 6 ? 16 : 25)))
    setRound(n + 1)
  }

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          setPlaying(false)
          setRound((r) => {
            submit(r - 1)
            return 0
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [playing, submit])

  const click = (i: number) => {
    if (i === odd) {
      SFX.ok()
      newRound(round)
    } else {
      SFX.fail()
      setLeft((t) => Math.max(0, t - 2))
    }
  }

  const cells = size

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          第 <span className="text-ikun-yellow font-bold tabular-nums">{round}</span> 关
        </span>
        <span className="text-gray-400 tabular-nums">⏱ {left}s</span>
        <span className="text-gray-500 tabular-nums">最高 {record}</span>
      </div>

      <div
        className={
          'grid gap-1 ' +
          (cells === 9 ? 'grid-cols-3' : cells === 16 ? 'grid-cols-4' : 'grid-cols-5')
        }
      >
        {Array.from({ length: cells }, (_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => playing && click(i)}
            disabled={!playing}
            className="aspect-square grid place-items-center text-2xl rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`第 ${i + 1} 格`}
          >
            {i === odd ? '🐓' : '🐔'}
          </button>
        ))}
      </div>

      {!playing && (
        <Btn
          className="w-full"
          onClick={() => {
            setLeft(30)
            setPlaying(true)
            newRound(0)
          }}
        >
          {round > 1 ? '再来一次' : '开始找不同'}
        </Btn>
      )}
      <Hint>每关只有一只鸡与众不同（是公鸡）。找错会扣 2 秒，30 秒内能过几关？</Hint>
    </div>
  )
}

/* ================================================================
   8. 罚球挑战
   ================================================================ */
export function FreeThrow() {
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  const [shots, setShots] = useState<{ id: number; hit: boolean }[]>([])
  const [made, setMade] = useState(0)
  const [total, setTotal] = useState(0)
  const dirRef = useRef(1)
  const idRef = useRef(0)
  const { record, submit } = useRecord('ikun_f_ft')

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPos((p) => {
        let next = p + dirRef.current * 2.6
        if (next >= 100) {
          next = 100
          dirRef.current = -1
        }
        if (next <= 0) {
          next = 0
          dirRef.current = 1
        }
        return next
      })
    }, 16)
    return () => clearInterval(id)
  }, [playing])

  const posRef = useRef(pos)
  posRef.current = pos

  const shoot = useCallback(() => {
    const dist = Math.abs(posRef.current - 50)
    const hit = dist <= 12
    setShots((s) => [...s.slice(-9), { id: idRef.current++, hit }])
    setTotal((t) => t + 1)
    if (hit) {
      setMade((m) => m + 1)
      SFX.ok()
    } else {
      SFX.fail()
    }
  }, [])

  const finish = () => {
    setPlaying(false)
    submit(made)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          命中 <span className="text-ikun-yellow font-bold tabular-nums">{made}</span>/{total}
        </span>
        <span className="text-gray-500 tabular-nums">最高 {record}</span>
      </div>

      <div className="relative h-32 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent overflow-hidden">
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-2 rounded-full bg-white/10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-6 rounded bg-green-500/25 border border-green-400/40" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-ikun-yellow rounded"
            style={{ left: `${pos}%` }}
          />
        </div>
        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
          {shots.map((s) => (
            <span key={s.id} className="text-lg">
              {s.hit ? '🏀' : '💨'}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {playing ? (
          <>
            <Btn className="flex-1" onClick={shoot}>
              出手！（空格）
            </Btn>
            <Btn kind="ghost" onClick={finish}>
              结束
            </Btn>
          </>
        ) : (
          <Btn className="flex-1" onClick={() => setPlaying(true)}>
            开始罚球
          </Btn>
        )}
      </div>

      <ShotKey playing={playing} shoot={shoot} />
      <Hint>力度条来回摆动，指针落在中央绿区时出手才算命中。连续命中很考验节奏感。</Hint>
    </div>
  )
}

function ShotKey({ playing, shoot }: { playing: boolean; shoot: () => void }) {
  useEffect(() => {
    if (!playing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        shoot()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing, shoot])
  return null
}

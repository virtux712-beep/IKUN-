import { ArrowLeft, Music2, Play, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRecord } from '@/features/ui'
import {
  accuracyOf,
  applyHit,
  buildChart,
  collectMissed,
  EMPTY_STATS,
  type Note,
  type PlayStats,
  pickHit,
  rankOf,
} from '@/games/rhythm'
import { useSynth } from '@/hooks'

interface PianoKey {
  word: string
  note: string
  freq: number
  sub: string
  accent: string
}

const KEYS: PianoKey[] = [
  { word: '鸡', note: 'C5', freq: 523.25, sub: '开嗓', accent: 'rgba(255, 93, 143, 0.55)' },
  { word: '你', note: 'D5', freq: 587.33, sub: '起范', accent: 'rgba(255, 138, 93, 0.55)' },
  { word: '太', note: 'E5', freq: 659.25, sub: '入戏', accent: 'rgba(255, 201, 77, 0.55)' },
  { word: '美', note: 'G5', freq: 783.99, sub: '上头', accent: 'rgba(77, 255, 160, 0.45)' },
  { word: '哇', note: 'A5', freq: 880.0, sub: '封神', accent: 'rgba(77, 216, 255, 0.55)' },
]

const DEMO_SEQUENCE = [0, 1, 2, 3, 4, 3, 2, 1, 2, 4]
const DEMO_INTERVAL = 230

/** 音游谱面：只因你太美主旋律的简化节奏 */
const CHART_PATTERN = [0, 1, 2, 1, 3, 2, 4, 3, 2, 1, 0, 2, 1, 3, 4, 2, 0, 1, 2, 3]
const CHART_BPM = 132
const APPROACH_MS = 2000

type Mode = 'free' | 'rhythm'
type RhythmStage = 'idle' | 'playing' | 'result'

export default function KunPiano({ onBack }: { onBack: () => void }) {
  const { playTone } = useSynth()
  const [mode, setMode] = useState<Mode>('free')

  /* ---------------- 自由弹奏 ---------------- */
  const [activeKey, setActiveKey] = useState<number | null>(null)
  const [demoPlaying, setDemoPlaying] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms))
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const t of timers) clearTimeout(t)
    }
  }, [])

  const hitKey = useCallback(
    (index: number) => {
      const key = KEYS[index]
      if (!key) return
      playTone(key.freq)
      setActiveKey(index)
      later(() => setActiveKey((cur) => (cur === index ? null : cur)), 160)
    },
    [playTone, later],
  )

  const playDemo = () => {
    if (demoPlaying) return
    setDemoPlaying(true)
    DEMO_SEQUENCE.forEach((lane, i) => {
      later(() => hitKey(lane), i * DEMO_INTERVAL)
    })
    later(() => setDemoPlaying(false), DEMO_SEQUENCE.length * DEMO_INTERVAL + 200)
  }

  /* ---------------- 音游模式 ---------------- */
  const [stage, setStage] = useState<RhythmStage>('idle')
  const [notes, setNotes] = useState<Note[]>([])
  const [stats, setStats] = useState<PlayStats>(EMPTY_STATS)
  const [now, setNow] = useState(0)
  const [flash, setFlash] = useState<{ lane: number; text: string; tone: string } | null>(null)
  const startRef = useRef(0)
  const notesRef = useRef<Note[]>([])
  const { record, submit } = useRecord('ikun_rhythm_score')

  const chart = useMemo(() => buildChart(CHART_PATTERN, CHART_BPM), [])
  const chartEnd = chart.length > 0 ? (chart[chart.length - 1]?.time ?? 0) + 900 : 0

  // rAF 驱动时间
  useEffect(() => {
    if (stage !== 'playing') return
    let raf = 0
    const loop = () => {
      const t = performance.now() - startRef.current
      setNow(t)

      // 漏击判定
      const missed = collectMissed(notesRef.current, t)
      if (missed.length > 0) {
        const set = new Set(missed)
        notesRef.current = notesRef.current.map((n) =>
          set.has(n.id) ? { ...n, judged: true, result: 'miss' as const } : n,
        )
        setNotes([...notesRef.current])
        setStats((prev) => missed.reduce((acc, _) => applyHit(acc, 'miss'), prev))
      }

      // 结束
      if (t > chartEnd) {
        setStage('result')
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [stage, chartEnd])

  // 结算时提交最高分
  useEffect(() => {
    if (stage !== 'result') return
    submit(stats.score)
  }, [stage, stats.score, submit])

  const startRhythm = () => {
    notesRef.current = chart.map((n) => ({ ...n }))
    setNotes([...notesRef.current])
    setStats(EMPTY_STATS)
    setNow(0)
    startRef.current = performance.now()
    setStage('playing')
  }

  const pressLane = useCallback(
    (lane: number) => {
      const key = KEYS[lane]
      if (key) playTone(key.freq, 0.18)
      if (stage !== 'playing') return

      const t = performance.now() - startRef.current
      const result = pickHit(notesRef.current, lane, t)
      if (!result) return

      notesRef.current = notesRef.current.map((n) =>
        n.id === result.noteId ? { ...n, judged: true, result: result.judgment } : n,
      )
      setNotes([...notesRef.current])
      setStats((prev) => applyHit(prev, result.judgment))

      const label =
        result.judgment === 'perfect' ? 'PERFECT' : result.judgment === 'great' ? 'GREAT' : 'GOOD'
      const tone =
        result.judgment === 'perfect'
          ? 'text-yellow-400'
          : result.judgment === 'great'
            ? 'text-green-400'
            : 'text-blue-400'
      setFlash({ lane, text: label, tone })
      later(() => setFlash(null), 320)
    },
    [stage, playTone, later],
  )

  // 键盘 1-5（自由模式） / D F J K L（音游模式）
  useEffect(() => {
    const RHYTHM_KEYS = ['d', 'f', ' ', 'j', 'k']
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      if (mode === 'free') {
        const direct = Number(e.key) - 1
        if (e.key >= '1' && e.key <= '5' && direct >= 0 && direct < KEYS.length) {
          e.preventDefault()
          hitKey(direct)
        }
        return
      }

      const lane = RHYTHM_KEYS.indexOf(e.key.toLowerCase())
      if (lane >= 0) {
        e.preventDefault()
        pressLane(lane)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, hitKey, pressLane])

  const acc = accuracyOf(stats)
  const rank = rankOf(acc)

  /* ---------------- 音游结果页 ---------------- */
  if (mode === 'rhythm' && stage === 'result') {
    return (
      <div className="relative z-10 min-h-screen pt-24 pb-20">
        <div className="container-narrow">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-8"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>

          <div className="card p-8 text-center animate-scaleIn">
            <div className={'text-6xl font-black mb-2 ' + rank.color}>{rank.rank}</div>
            <p className="text-sm text-gray-400 mb-6">准确率 {acc}%</p>

            <div className="grid grid-cols-2 gap-3 mb-5 text-left">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-xs text-gray-500">得分</div>
                <div className="text-xl font-black text-ikun-yellow tabular-nums">
                  {stats.score}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-xs text-gray-500">最大连击</div>
                <div className="text-xl font-black text-white tabular-nums">{stats.maxCombo}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6 text-xs">
              <div className="rounded-lg bg-yellow-400/10 py-2">
                <div className="text-yellow-400 font-bold tabular-nums">{stats.perfect}</div>
                <div className="text-gray-500">PERFECT</div>
              </div>
              <div className="rounded-lg bg-green-400/10 py-2">
                <div className="text-green-400 font-bold tabular-nums">{stats.great}</div>
                <div className="text-gray-500">GREAT</div>
              </div>
              <div className="rounded-lg bg-blue-400/10 py-2">
                <div className="text-blue-400 font-bold tabular-nums">{stats.good}</div>
                <div className="text-gray-500">GOOD</div>
              </div>
              <div className="rounded-lg bg-red-400/10 py-2">
                <div className="text-red-400 font-bold tabular-nums">{stats.miss}</div>
                <div className="text-gray-500">MISS</div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 tabular-nums flex items-center justify-center gap-1">
              <Trophy size={12} aria-hidden="true" /> 最高分 {record}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startRhythm}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                <RotateCcw size={16} aria-hidden="true" /> 再来
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage('idle')
                  setMode('free')
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors cursor-pointer"
              >
                回到自由弹奏
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- 主界面 ---------------- */
  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-narrow">
        <div className="flex items-center justify-between mb-6 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">🎹 坤坤琴键</h1>
          <div className="w-[64px]" aria-hidden="true" />
        </div>

        {/* 模式切换 */}
        <div className="flex gap-2 mb-4">
          {(['free', 'rhythm'] as Mode[]).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMode(m)
                setStage('idle')
              }}
              aria-pressed={mode === m}
              className={
                'flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ' +
                (mode === m
                  ? 'bg-ikun-yellow/20 text-ikun-yellow border border-ikun-yellow/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10')
              }
            >
              {m === 'free' ? '🎹 自由弹奏' : '🎼 音游模式'}
            </button>
          ))}
        </div>

        {mode === 'free' ? (
          <>
            <div className="card p-6 sm:p-8">
              <p className="text-center text-sm text-gray-400 mb-8">
                点击琴键，或按键盘 <span className="text-white font-bold">1 – 5</span> 弹奏
              </p>

              <fieldset className="grid grid-cols-5 gap-2 sm:gap-3 border-0 p-0 m-0 min-w-0">
                <legend className="sr-only">坤坤琴键</legend>
                {KEYS.map((key, index) => (
                  <button
                    type="button"
                    key={key.word}
                    onClick={() => hitKey(index)}
                    aria-label={'弹奏 ' + key.word + '（键盘 ' + (index + 1) + '）'}
                    className={
                      'flex flex-col items-center justify-center gap-1 py-8 sm:py-10 rounded-2xl border transition-all duration-100 cursor-pointer active:scale-95 ' +
                      (activeKey === index
                        ? 'bg-ikun-yellow/30 border-ikun-yellow/60 shadow-lg shadow-ikun-yellow/25 scale-[1.03]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-ikun-yellow/30')
                    }
                  >
                    <span
                      className={
                        'text-2xl sm:text-3xl font-black transition-colors ' +
                        (activeKey === index ? 'text-ikun-yellow' : 'text-white/80')
                      }
                    >
                      {key.word}
                    </span>
                    <span className="text-[10px] text-white/30">{key.note}</span>
                  </button>
                ))}
              </fieldset>

              <button
                type="button"
                onClick={playDemo}
                disabled={demoPlaying}
                className="mt-7 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer"
              >
                <Play size={16} aria-hidden="true" />
                {demoPlaying ? '示范中…' : '听示范'}
              </button>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-600 mt-5">
              <Music2 size={12} aria-hidden="true" />
              双振荡器实时合成（三角基音 + 正弦泛音），无任何音频文件
            </p>
          </>
        ) : (
          <>
            {/* 音游区 */}
            <div className="card p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3 tabular-nums">
                <span>
                  得分 <span className="text-ikun-yellow font-bold">{stats.score}</span>
                </span>
                <span>
                  连击 <span className="text-white font-bold">{stats.combo}</span>
                </span>
                <span>
                  准确 <span className="text-white font-bold">{acc}%</span>
                </span>
              </div>

              {/* 下落区 */}
              <div className="relative h-[340px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
                {/* 判定线 */}
                <div className="absolute bottom-[80px] left-0 right-0 h-1 bg-ikun-yellow/60 shadow-[0_0_12px_rgba(255,215,0,0.6)]" />

                {/* 音符 */}
                {notes.map((n) => {
                  if (n.judged) return null
                  const dt = n.time - now
                  if (dt > APPROACH_MS) return null
                  const progress = 1 - dt / APPROACH_MS
                  const top = progress * (340 - 80)
                  return (
                    <div
                      key={n.id}
                      className="absolute w-[18%] flex justify-center"
                      style={{ left: n.lane * 20 + '%', top: top }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ikun-yellow to-ikun-gold shadow-lg shadow-ikun-yellow/30 grid place-items-center text-lg">
                        {KEYS[n.lane]?.word}
                      </div>
                    </div>
                  )
                })}

                {/* 判定闪烁 */}
                {flash && (
                  <div
                    className={
                      'absolute bottom-[90px] w-[18%] text-center font-black text-sm animate-fadeUp ' +
                      flash.tone
                    }
                    style={{ left: flash.lane * 20 + '%' }}
                  >
                    {flash.text}
                  </div>
                )}

                {/* 开始遮罩 */}
                {stage === 'idle' && (
                  <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-1">音符落到黄线时按下对应键</p>
                      <p className="text-xs text-gray-500 mb-4">键盘 D F 空格 J K</p>
                      <button
                        type="button"
                        onClick={startRhythm}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold hover:brightness-110 transition-all cursor-pointer"
                      >
                        开始演奏
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 五个按键 */}
              <fieldset className="grid grid-cols-5 gap-2 mt-3 border-0 p-0 m-0 min-w-0">
                <legend className="sr-only">演奏按键</legend>
                {KEYS.map((key, lane) => (
                  <button
                    type="button"
                    key={key.word}
                    onPointerDown={() => pressLane(lane)}
                    disabled={stage !== 'playing'}
                    aria-label={'轨道 ' + (lane + 1) + '：' + key.word}
                    className="py-5 rounded-xl bg-white/5 border border-white/10 text-lg font-black text-white/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                    style={{ borderBottomColor: key.accent }}
                  >
                    {key.word}
                  </button>
                ))}
              </fieldset>
            </div>

            <p className="text-xs text-gray-600 mt-5 text-center leading-relaxed">
              判定窗口：PERFECT ±55ms · GREAT ±110ms · GOOD ±180ms
              <br />
              连击每满 10 次得分 ×1.1，最高 2 倍
            </p>
          </>
        )}
      </div>
    </div>
  )
}

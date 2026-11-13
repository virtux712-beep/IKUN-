import { ArrowLeft, Keyboard, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SFX, useRecord } from '@/features/ui'
import {
  accuracy as calcAccuracy,
  wpm as calcWpm,
  compareChars,
  computeStats,
  gradeOf,
  pickPhrases,
} from '@/games/typing'

const DURATION = 60
const ROUND_SIZE = 10

type Stage = 'idle' | 'typing' | 'done'

export default function TypingChallenge({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>('idle')
  const [phrases, setPhrases] = useState(() => pickPhrases(ROUND_SIZE))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [startAt, setStartAt] = useState(0)
  const [now, setNow] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [totalTyped, setTotalTyped] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { record, submit } = useRecord('ikun_typing_wpm')

  // 进入页面自动聚焦输入框（替代 autoFocus，避免 a11y 规则）
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const current = phrases[index]
  const target = current?.pinyin ?? ''
  const states = useMemo(() => compareChars(target, input), [target, input])

  /* ---------------- 计时 ---------------- */
  useEffect(() => {
    if (stage !== 'typing') return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [stage])

  const elapsedMs = stage === 'typing' ? now - startAt : 0
  const remaining = Math.max(0, DURATION - Math.floor(elapsedMs / 1000))
  const liveStats = computeStats(target, input)
  const liveWpm = calcWpm(totalCorrect + liveStats.correct, elapsedMs)
  const liveAcc = calcAccuracy(totalTyped + liveStats.typed, totalTyped + liveStats.typed)

  const finish = useCallback(() => {
    setStage('done')
    const w = calcWpm(totalCorrect, Date.now() - startAt)
    submit(w)
    SFX.ok()
  }, [startAt, submit, totalCorrect])

  /* ---------------- 倒计时结束 ---------------- */
  useEffect(() => {
    if (stage !== 'typing') return
    if (remaining > 0) return
    finish()
  }, [stage, remaining, finish])

  /* ---------------- 打字输入 ---------------- */
  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (stage === 'done') return
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (stage === 'idle') return
        setInput((prev) => prev.slice(0, -1))
        return
      }
      if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
      e.preventDefault()

      // 首次输入时启动计时
      if (stage === 'idle') {
        setStage('typing')
        setStartAt(Date.now())
        setNow(Date.now())
      }

      setInput((prev) => {
        if (prev.length >= target.length) return prev
        const next = prev + e.key
        const ok = e.key === target[prev.length]
        if (ok) SFX.tick()
        else SFX.fail()

        // 整句输完：结算并进入下一句
        if (next.length === target.length) {
          const stats = computeStats(target, next)
          setTotalCorrect((c) => c + stats.correct)
          setTotalTyped((t) => t + stats.typed)
          if (index + 1 >= phrases.length) {
            // 打完全部句子，也算结束
            setTimeout(() => finish(), 60)
          } else {
            setTimeout(() => {
              setIndex((i) => i + 1)
              setInput('')
            }, 60)
          }
        }
        return next
      })
    },
    [stage, target, index, phrases.length, finish],
  )

  const restart = () => {
    setPhrases(pickPhrases(ROUND_SIZE))
    setIndex(0)
    setInput('')
    setTotalCorrect(0)
    setTotalTyped(0)
    setStartAt(0)
    setNow(0)
    setStage('idle')
    setTimeout(() => inputRef.current?.focus(), 30)
  }

  const start = () => {
    restart()
  }

  const finalWpm =
    stage === 'done' ? calcWpm(totalCorrect, Math.max(1, startAt ? now - startAt : 1)) : 0
  const finalAcc = calcAccuracy(totalCorrect, totalTyped)
  const grade = gradeOf(finalWpm, finalAcc)

  /* ---------------- 结束页 ---------------- */
  if (stage === 'done') {
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
            <div className={'text-6xl font-black mb-2 ' + grade.color}>{grade.grade}</div>
            <p className="text-sm text-gray-400 mb-6">{grade.label}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-3xl font-black text-ikun-yellow tabular-nums">{finalWpm}</div>
                <div className="text-xs text-gray-500 mt-1">WPM（字/分）</div>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="text-3xl font-black text-white tabular-nums">{finalAcc}%</div>
                <div className="text-xs text-gray-500 mt-1">准确率</div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 tabular-nums">
              正确 {totalCorrect} 字符 · 最高纪录 {record} WPM
            </p>

            <button
              type="button"
              onClick={start}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              <RotateCcw size={18} aria-hidden="true" /> 再来一次
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- 打字页 ---------------- */
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
          <h1 className="text-lg sm:text-xl font-bold text-white text-center">⌨️ 只因打字</h1>
          <div className="text-right shrink-0 min-w-[64px]">
            <div className="text-ikun-yellow font-bold text-lg tabular-nums">
              {stage === 'typing' ? remaining : DURATION}
            </div>
            <div className="text-xs text-gray-500">秒</div>
          </div>
        </div>

        {/* 实时数据 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 tabular-nums">
          <span>
            WPM <span className="text-white font-bold">{liveWpm}</span>
          </span>
          <span>
            准确率 <span className="text-white font-bold">{liveAcc}%</span>
          </span>
          <span>
            {index + 1} / {phrases.length}
          </span>
        </div>

        <div className="card p-6 sm:p-8">
          {/* 中文提示 */}
          <p className="text-center text-xs text-gray-500 mb-4">
            提示：<span className="text-ikun-yellow">{current?.cn}</span>
          </p>

          {/* 待输入文本 */}
          <div className="text-center leading-relaxed mb-6 font-mono text-xl sm:text-2xl tracking-wide break-all">
            {target.split('').map((ch, i) => {
              const state = states[i]
              const isCursor = i === input.length
              return (
                <span
                  key={i}
                  className={
                    (state === 'correct'
                      ? 'text-green-400'
                      : state === 'wrong'
                        ? 'text-red-400 bg-red-500/15 rounded'
                        : 'text-gray-500') +
                    (isCursor ? ' border-b-2 border-ikun-yellow animate-pulse' : '')
                  }
                >
                  {ch === ' ' ? '␣' : ch}
                </span>
              )
            })}
          </div>

          {/* 输入框 */}
          <input
            ref={inputRef}
            value={input}
            onChange={() => undefined}
            onKeyDown={handleKey}
            placeholder={stage === 'idle' ? '点击这里开始打字…' : ''}
            aria-label="打字输入"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-center text-white font-mono tracking-wider placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* 开始提示 */}
          {stage === 'idle' && (
            <button
              type="button"
              onClick={() => {
                inputRef.current?.focus()
                setStage('typing')
                setStartAt(Date.now())
                setNow(Date.now())
              }}
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              <Keyboard size={18} aria-hidden="true" /> 开始打字（{DURATION} 秒）
            </button>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-5 text-center leading-relaxed">
          输入上方拼音，回车不需要按，整句输完自动跳下一句。
          <br />
          退格可修正错字，WPM 按「正确字符 ÷ 5 ÷ 分钟」计算。
        </p>
      </div>
    </div>
  )
}

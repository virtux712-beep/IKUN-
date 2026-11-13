import { ArrowLeft, ChevronRight, RotateCcw, Share2, Trophy } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useAchievements } from '@/achievements'
import ShareSheet from '@/components/ShareSheet'
import { purityLevels, quizQuestions } from '@/data/quiz'
import { SFX } from '@/features/ui'
import type { ShareCardData } from '@/share'
import { addPurityResult } from '@/store'

type Stage = 'intro' | 'quiz' | 'result'

export default function PurityTest({ onBack }: { onBack: () => void }) {
  const { record } = useAchievements()
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [shareOpen, setShareOpen] = useState(false)

  const total = quizQuestions.length
  const question = quizQuestions[index]

  const correctCount = useMemo(
    () =>
      answers.reduce<number>(
        (acc, a, i) => acc + (a === quizQuestions[i]?.correctIndex ? 1 : 0),
        0,
      ),
    [answers],
  )
  const score = answers.length === total ? Math.round((correctCount / total) * 100) : 0
  const level = useMemo(
    () => purityLevels.find((l) => score >= l.min && score <= l.max) ?? purityLevels[0],
    [score],
  )

  const start = () => {
    setStage('quiz')
    setIndex(0)
    setPicked(null)
    setAnswers([])
  }

  const choose = (optionIndex: number) => {
    if (picked !== null) return
    setPicked(optionIndex)
    const next = [...answers]
    next[index] = optionIndex
    setAnswers(next)
    if (optionIndex === question?.correctIndex) SFX.ok()
    else SFX.fail()
  }

  const next = useCallback(() => {
    if (index + 1 >= total) {
      const finalAnswers = [...answers]
      const right = finalAnswers.reduce<number>(
        (acc, a, i) => acc + (a === quizQuestions[i]?.correctIndex ? 1 : 0),
        0,
      )
      const finalScore = Math.round((right / total) * 100)
      addPurityResult(finalScore)
      record({ type: 'purity', value: finalScore })
      setStage('result')
      SFX.ok()
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }, [index, answers, record])

  const shareData: ShareCardData | null = useMemo(() => {
    if (stage !== 'result') return null
    return {
      emoji: score >= 80 ? '👑' : score >= 60 ? '🏆' : score >= 40 ? '🐔' : '🌱',
      title: 'IKUN 纯度测试',
      subtitle: '看看你是萌新还是骨灰级小黑子',
      badge: level?.level ?? '',
      stats: [
        { label: '纯度得分', value: `${score}%` },
        { label: '答对题数', value: `${correctCount} / ${total}` },
        { label: '评级', value: level?.level ?? '' },
      ],
      footer: 'IKUN之家 · 纯度测试',
    }
  }, [stage, score, correctCount, level])

  /* ------------------------------ 首页 ------------------------------ */
  if (stage === 'intro') {
    return (
      <div className="relative z-10 min-h-screen px-4 py-24 flex items-center justify-center">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-8"
          >
            <ArrowLeft size={20} aria-hidden="true" /> 返回
          </button>

          <div className="glass rounded-3xl p-8 text-center">
            <div className="text-7xl mb-6" aria-hidden="true">
              🧪
            </div>
            <h1 className="text-2xl font-black text-white mb-3">IKUN 纯度测试</h1>
            <p className="text-gray-400 text-sm mb-2">共 {total} 道题，单题单屏作答</p>
            <p className="text-gray-500 text-xs mb-8">看看你是萌新还是骨灰级小黑子</p>
            <button
              type="button"
              onClick={start}
              className="w-full px-8 py-4 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-2xl text-lg transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
            >
              🚀 开始测试
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">答完可生成分享卡片</p>
        </div>
      </div>
    )
  }

  /* ------------------------------ 答题 ------------------------------ */
  if (stage === 'quiz' && question) {
    const answered = picked !== null
    const isRight = picked === question.correctIndex

    return (
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-20">
        {/* 顶部进度 */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="tabular-nums">
              第 {index + 1} / {total} 题
            </span>
            <span className="tabular-nums">{Math.round(((index + 1) / total) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ikun-yellow to-ikun-gold transition-[width] duration-300"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* 题干 */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-8">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, i) => {
              let cls = 'bg-white/5 border-white/10 hover:bg-white/10'
              if (answered) {
                if (i === question.correctIndex) cls = 'bg-green-500/20 border-green-500/50'
                else if (i === picked) cls = 'bg-red-500/20 border-red-500/50'
                else cls = 'bg-white/[0.03] border-white/5 opacity-50'
              }
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={
                    'w-full flex items-start gap-3 px-4 py-4 rounded-2xl border text-left transition-all cursor-pointer disabled:cursor-default ' +
                    cls
                  }
                >
                  <span className="w-7 h-7 rounded-full bg-white/10 grid place-items-center text-xs font-bold shrink-0 mt-0.5">
                    {answered
                      ? i === question.correctIndex
                        ? '✓'
                        : i === picked
                          ? '✗'
                          : String.fromCharCode(65 + i)
                      : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-white leading-relaxed">{option}</span>
                </button>
              )
            })}
          </div>

          {/* 解析 */}
          {answered && (
            <div className="mt-6 rounded-2xl bg-white/5 p-4 animate-fadeUp">
              <p
                className={`text-xs font-bold mb-1 ${isRight ? 'text-green-400' : 'text-red-400'}`}
              >
                {isRight ? '回答正确' : '回答错误'}
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">💡 {question.explanation}</p>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="w-full max-w-md mx-auto mt-6">
          <button
            type="button"
            onClick={next}
            disabled={!answered}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] cursor-pointer"
          >
            {index + 1 >= total ? '查看结果' : '下一题'}
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  /* ------------------------------ 结果 ------------------------------ */
  return (
    <div className="relative z-10 min-h-screen px-4 py-24 flex items-center justify-center">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft size={20} aria-hidden="true" /> 返回
        </button>

        <div className="glass rounded-3xl p-8 text-center animate-scaleIn">
          <div className="text-6xl mb-4" aria-hidden="true">
            🏆
          </div>
          <h1 className="text-xl font-bold text-white mb-6">测试完成</h1>

          {/* 环形分数 */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 100 100"
              role="img"
              aria-label={`纯度得分 ${score} 分`}
            >
              <title>{`纯度得分 ${score} 分`}</title>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#purityGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.83} ${283 - score * 2.83}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="purityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#F5C842" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-3xl font-black text-ikun-yellow tabular-nums">{score}%</span>
            </div>
          </div>

          <span className="inline-block px-4 py-2 rounded-full bg-ikun-yellow/15 text-ikun-yellow font-bold text-sm mb-3">
            {level?.level}
          </span>
          <p className="text-sm text-gray-400 mb-2">{level?.comment}</p>
          <p className="text-xs text-gray-600 mb-6 tabular-nums">
            答对 {correctCount} / {total} 题
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={start}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all cursor-pointer"
            >
              <RotateCcw size={16} aria-hidden="true" /> 再测一次
            </button>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
            >
              <Share2 size={16} aria-hidden="true" /> 分享成绩
            </button>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 text-sm hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Trophy size={14} aria-hidden="true" /> 返回游戏中心
          </button>
        </div>
      </div>

      <ShareSheet
        open={shareOpen}
        data={shareData}
        onClose={() => setShareOpen(false)}
        filename="ikun-purity.png"
      />
    </div>
  )
}

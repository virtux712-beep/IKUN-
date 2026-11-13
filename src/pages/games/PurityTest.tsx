import { ArrowLeft, ChevronRight, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useState } from 'react'
import { purityLevels, quizQuestions } from '@/data/quiz'
import { addPurityResult } from '@/store'

type TestState = 'intro' | 'answering' | 'result'

export default function PurityTest({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<TestState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [result, setResult] = useState<{ score: number; level: string; comment: string } | null>(
    null,
  )
  const [history, setHistory] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ikun_purity_history') || '[]')
    } catch {
      return []
    }
  })

  const question = quizQuestions[currentQuestion]
  const totalQuestions = quizQuestions.length

  const selectAnswer = useCallback(
    (index: number) => {
      if (showExplanation) return
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestion] = index
      setSelectedAnswers(newAnswers)
      setShowExplanation(true)
    },
    [selectedAnswers, currentQuestion, showExplanation],
  )

  const nextQuestion = useCallback(() => {
    setShowExplanation(false)
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate result
      let correct = 0
      selectedAnswers.forEach((answer, index) => {
        if (answer === quizQuestions[index].correctIndex) correct++
      })
      const score = Math.round((correct / totalQuestions) * 100)
      const level = purityLevels.find((l) => score >= l.min && score <= l.max) || purityLevels[0]
      setResult({ score, level: level.level, comment: level.comment })
      setState('result')
      addPurityResult(score)
      setHistory((prev) => [...prev, score])
    }
  }, [currentQuestion, selectedAnswers])

  const startTest = () => {
    setState('answering')
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setShowExplanation(false)
    setResult(null)
  }

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'from-ikun-yellow to-ikun-gold'
    if (score >= 60) return 'from-green-400 to-emerald-400'
    if (score >= 40) return 'from-blue-400 to-cyan-400'
    if (score >= 20) return 'from-orange-400 to-yellow-400'
    return 'from-red-400 to-pink-400'
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} /> 返回
          </button>
          <h2 className="text-xl font-bold text-white">🧪 纯度测试</h2>
          <div className="w-20" />
        </div>

        {/* Intro */}
        {state === 'intro' && (
          <div className="glass rounded-3xl p-8 text-center animate-fadeUp">
            <div className="text-7xl mb-6">🧪</div>
            <h3 className="text-2xl font-bold text-white mb-3">IKUN纯度测试</h3>
            <p className="text-gray-400 mb-6">
              共 {totalQuestions} 道题目，测试你对ikun文化的了解程度。
              <br />
              看看你是萌新还是骨灰级小黑子！
            </p>
            <button
              type="button"
              onClick={startTest}
              className="px-8 py-4 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-2xl text-lg hover:scale-105 transition-all cursor-pointer"
            >
              🚀 开始测试
            </button>

            {/* History */}
            {history.length > 0 && (
              <div className="mt-8 text-left">
                <h4 className="text-sm font-bold text-gray-400 mb-3">📊 历史记录</h4>
                <div className="flex flex-wrap gap-2">
                  {history.slice(-5).map((score, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white/5 text-gray-400"
                    >
                      {score}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Answering */}
        {state === 'answering' && (
          <div className="animate-fadeUp">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>
                  第 {currentQuestion + 1}/{totalQuestions} 题
                </span>
                <span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ikun-yellow to-ikun-gold rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="glass rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-6">{question.question}</h3>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion] === index
                  const isCorrect = index === question.correctIndex
                  const showResult = showExplanation

                  let optionStyle = 'bg-white/5 border-white/10 hover:bg-white/10'
                  if (showResult) {
                    if (isCorrect) {
                      optionStyle = 'bg-green-500/20 border-green-500/50'
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-red-500/20 border-red-500/50'
                    } else {
                      optionStyle = 'bg-white/5 border-white/5 opacity-50'
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-ikun-yellow/20 border-ikun-yellow/50'
                  }

                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${optionStyle} ${
                        showExplanation ? 'cursor-default' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {showResult
                            ? isCorrect
                              ? '✓'
                              : isSelected
                                ? '✗'
                                : String.fromCharCode(65 + index)
                            : String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-white">{option}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl animate-fadeUp">
                  <p className="text-sm text-gray-300">💡 {question.explanation}</p>
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="mt-4 px-6 py-2 bg-ikun-yellow text-black font-bold rounded-xl text-sm hover:bg-ikun-gold transition-all cursor-pointer flex items-center gap-1"
                  >
                    {currentQuestion < totalQuestions - 1 ? (
                      <>
                        下一题 <ChevronRight size={16} />
                      </>
                    ) : (
                      <>查看结果 🏆</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {state === 'result' && result && (
          <div className="glass rounded-3xl p-8 text-center animate-scaleIn">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">测试完成！</h3>

            {/* Score Circle */}
            <div className="relative w-40 h-40 mx-auto my-6">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 100 100"
                role="img"
                aria-label={`纯度得分 ${result.score} 分`}
              >
                <title>{`纯度得分 ${result.score} 分`}</title>
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
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${result.score * 2.83} ${283 - result.score * 2.83}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#F5C842" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-ikun-yellow">{result.score}%</span>
              </div>
            </div>

            <div className="mb-4">
              <span
                className={`inline-block px-4 py-2 rounded-full font-bold text-sm bg-gradient-to-r ${getGradeColor(result.score)} text-black`}
              >
                {result.level}
              </span>
            </div>
            <p className="text-gray-400 mb-6">{result.comment}</p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={startTest}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={18} /> 再测一次
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <Trophy size={18} /> 返回首页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

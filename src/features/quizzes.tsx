import { useMemo, useState } from 'react'
import { Bar, Btn, Hint, Row, SFX } from './ui'

/* ================================================================
   23. 你是哪种 ikun
   ================================================================ */
const PQ = [
  {
    q: '朋友喊你打篮球，你第一反应是？',
    opts: [
      { t: '立刻上场，先来一个中分头', k: 'A' },
      { t: '在旁边默默练习两年半', k: 'B' },
      { t: '掏出手机拍照发朋友圈', k: 'C' },
      { t: '我只想安静地当个观众', k: 'D' },
    ],
  },
  {
    q: '听到「鸡你太美」，你会？',
    opts: [
      { t: '跟着哼唱并摇摆', k: 'A' },
      { t: '面无表情，内心狂喜', k: 'B' },
      { t: '立刻分享给所有朋友', k: 'C' },
      { t: '假装没听见', k: 'D' },
    ],
  },
  {
    q: '你的手机壁纸最可能是？',
    opts: [
      { t: '坤坤的篮球照', k: 'A' },
      { t: '一只鸡的图片', k: 'B' },
      { t: '满屏表情包', k: 'C' },
      { t: '纯色或风景', k: 'D' },
    ],
  },
  {
    q: '遇到黑你的人，你会？',
    opts: [
      { t: '直接开麦对线', k: 'A' },
      { t: '用铁山靠格挡回去', k: 'B' },
      { t: '截图发群里一起乐', k: 'C' },
      { t: '荔枝一点，懒得理', k: 'D' },
    ],
  },
  {
    q: '你练习时长的真实情况是？',
    opts: [
      { t: '两年半，一分不多一秒不少', k: 'A' },
      { t: '刚入门，还在学唱跳', k: 'B' },
      { t: '主要负责在场边喊加油', k: 'C' },
      { t: '我只玩梗，不练习', k: 'D' },
    ],
  },
]

const PQ_RESULT: Record<string, { title: string; emoji: string; desc: string }> = {
  A: {
    title: '骨灰级 ikun',
    emoji: '👑',
    desc: '你已经把唱跳 rap 篮球刻进 DNA，走到哪都是全场焦点。',
  },
  B: {
    title: '沉稳型练习生',
    emoji: '🎧',
    desc: '低调内敛但功底扎实，属于那种一开口就惊到所有人的类型。',
  },
  C: { title: '气氛组担当', emoji: '🎉', desc: '你是群里的快乐源泉，负责把每个梗传播到宇宙尽头。' },
  D: { title: '佛系路人', emoji: '🍋', desc: '你保持理智，但关键时刻总能精准抛出一个梗。' },
}

export function PersonalityQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const pickAnswer = (k: string) => {
    const next = [...answers, k]
    setAnswers(next)
    SFX.pop()
    if (next.length === PQ.length) setDone(true)
    else setStep(step + 1)
  }

  const result = useMemo(() => {
    if (!done) return null
    const tally: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
    answers.forEach((a) => {
      tally[a] = (tally[a] ?? 0) + 1
    })
    const top = Object.entries(tally).sort((x, y) => y[1] - x[1])[0]?.[0] ?? 'A'
    return PQ_RESULT[top] ?? PQ_RESULT.A!
  }, [done, answers])

  if (done && result) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-6xl">{result.emoji}</div>
        <h3 className="text-xl font-black text-ikun-yellow">{result.title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{result.desc}</p>
        <Btn
          className="w-full"
          onClick={() => {
            setStep(0)
            setAnswers([])
            setDone(false)
          }}
        >
          再测一次
        </Btn>
      </div>
    )
  }

  const q = PQ[step]
  if (!q) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bar value={step + 1} max={PQ.length} />
        <span className="text-xs text-gray-500 tabular-nums shrink-0">
          {step + 1}/{PQ.length}
        </span>
      </div>
      <p className="text-base font-bold text-white">{q.q}</p>
      <div className="space-y-2">
        {q.opts.map((o) => (
          <button
            type="button"
            key={o.k}
            onClick={() => pickAnswer(o.k)}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-ikun-yellow/30 transition-all text-sm text-gray-200 cursor-pointer"
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   24. 小黑子段位测试
   ================================================================ */
const RANK_Q = [
  {
    q: '「练习时长两年半」的下一句是？',
    a: ['唱跳 rap 篮球', '我是一只小小鸟', '只因你太美'],
    correct: 0,
  },
  { q: '「荔枝」在梗里谐音是什么？', a: ['理智', '历史', '力量'], correct: 0 },
  { q: '铁山靠是一种什么？', a: ['防御姿势', '篮球战术', '舞蹈动作'], correct: 0 },
  { q: '「你干嘛~」的经典语气是？', a: ['撒娇式', '愤怒式', '疑问式'], correct: 0 },
  { q: '中分头属于谁的代表造型？', a: ['坤坤', '鸡哥', '只因'], correct: 0 },
]

const RANKS = [
  { min: 0, name: '路人甲', emoji: '🌱' },
  { min: 2, name: '青铜小黑子', emoji: '🥉' },
  { min: 3, name: '白银小黑子', emoji: '🥈' },
  { min: 4, name: '黄金小黑子', emoji: '🥇' },
  { min: 5, name: '王者 ikun', emoji: '👑' },
]

export function RankTest() {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState('')

  const answer = (i: number) => {
    const q = RANK_Q[step]
    if (!q) return
    const ok = i === q.correct
    if (ok) {
      setScore((s) => s + 1)
      SFX.ok()
      setFeedback('✅ 正确！')
    } else {
      SFX.fail()
      setFeedback('❌ 错啦')
    }
    setTimeout(() => {
      setFeedback('')
      if (step + 1 >= RANK_Q.length) setDone(true)
      else setStep(step + 1)
    }, 600)
  }

  if (done) {
    const rank = [...RANKS].reverse().find((r) => score >= r.min) ?? RANKS[0]!
    return (
      <div className="space-y-4 text-center">
        <div className="text-6xl">{rank.emoji}</div>
        <h3 className="text-xl font-black text-ikun-yellow">{rank.name}</h3>
        <p className="text-sm text-gray-400">
          答对 {score}/{RANK_Q.length} 题
        </p>
        <Btn
          className="w-full"
          onClick={() => {
            setStep(0)
            setScore(0)
            setDone(false)
          }}
        >
          再来一次
        </Btn>
      </div>
    )
  }

  const q = RANK_Q[step]
  if (!q) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          第 {step + 1}/{RANK_Q.length} 题
        </span>
        <span className="text-ikun-yellow">{feedback}</span>
      </div>
      <Bar value={step + 1} max={RANK_Q.length} />
      <p className="text-base font-bold text-white">{q.q}</p>
      <div className="space-y-2">
        {q.a.map((opt, i) => (
          <button
            type="button"
            key={opt}
            onClick={() => answer(i)}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-gray-200 cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
      <Hint>5 道快问快答，测测你的小黑子段位。</Hint>
    </div>
  )
}

/* ================================================================
   25. ikun 成分分析（雷达图）
   ================================================================ */
const RADAR = ['唱', '跳', 'rap', '篮球', '玩梗', '荔枝']

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function ComponentRadar() {
  const [name, setName] = useState('')
  const [analyzed, setAnalyzed] = useState(false)

  const values = useMemo(() => {
    if (!analyzed) return RADAR.map(() => 0)
    const h = hashStr(name || 'ikun')
    return RADAR.map((_, i) => 45 + ((h >> (i * 3)) % 55))
  }, [name, analyzed])

  const size = 220
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 28

  const points = values
    .map((v, i) => {
      const ang = (Math.PI * 2 * i) / RADAR.length - Math.PI / 2
      const rad = (v / 100) * r
      return `${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`
    })
    .join(' ')

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入你的名字"
          aria-label="输入名字"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
        />
        <Btn onClick={() => setAnalyzed(true)}>分析</Btn>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] mx-auto"
        role="img"
        aria-label="ikun 成分雷达图"
      >
        <title>ikun 成分雷达图</title>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <polygon
            key={k}
            points={RADAR.map((_, i) => {
              const ang = (Math.PI * 2 * i) / RADAR.length - Math.PI / 2
              return `${cx + Math.cos(ang) * r * k},${cy + Math.sin(ang) * r * k}`
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
          />
        ))}
        {analyzed && (
          <polygon points={points} fill="rgba(255,215,0,0.25)" stroke="#FFD700" strokeWidth="2" />
        )}
        {RADAR.map((label, i) => {
          const ang = (Math.PI * 2 * i) / RADAR.length - Math.PI / 2
          const x = cx + Math.cos(ang) * (r + 16)
          const y = cy + Math.sin(ang) * (r + 16)
          return (
            <text
              key={label}
              x={x}
              y={y}
              fill="#9ca3af"
              fontSize="11"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          )
        })}
      </svg>

      {analyzed && (
        <div className="space-y-1.5">
          {RADAR.map((label, i) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-8 text-gray-400">{label}</span>
              <Bar value={values[i] ?? 0} />
              <span className="w-8 text-right text-white tabular-nums">{values[i]}</span>
            </div>
          ))}
        </div>
      )}
      <Hint>根据名字哈希生成六维成分，纯属娱乐，输入同样的名字结果固定。</Hint>
    </div>
  )
}

/* ================================================================
   26. 只因指数计算器
   ================================================================ */
export function ZhiYinIndex() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('2000-01-01')
  const [result, setResult] = useState<{ score: number; tag: string } | null>(null)

  const calc = () => {
    const h = hashStr(name + date)
    const score = 30 + (h % 71)
    const tag =
      score >= 95
        ? '只因之神'
        : score >= 80
          ? '重度小黑子'
          : score >= 60
            ? '标准 ikun'
            : score >= 45
              ? '轻度爱好者'
              : '路人围观'
    setResult({ score, tag })
    SFX.ok()
  }

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="你的名字"
        aria-label="输入名字"
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="选择生日"
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
      />
      <Btn className="w-full" onClick={calc}>
        计算只因指数
      </Btn>
      {result && (
        <div className="text-center space-y-2">
          <div className="text-5xl font-black text-ikun-yellow tabular-nums">{result.score}</div>
          <div className="text-sm text-gray-300">{result.tag}</div>
          <Bar value={result.score} />
        </div>
      )}
      <Hint>用名字和生日做哈希，得到 30~100 的只因指数。纯属娱乐。</Hint>
    </div>
  )
}

/* ================================================================
   27. 今日运势
   ================================================================ */
const FORTUNE_LEVEL = ['大吉 🐔', '中吉 🏀', '小吉 🎵', '平 🍋', '小凶 💨']
const FORTUNE_TIPS = [
  '今天适合打篮球，命中率 +30%',
  '会遇到一个懂你梗的人',
  '记得说「荔枝」，能避开一次争吵',
  '练习时长建议再加半小时',
  '不要在公共场合外放鸡你太美',
  '今天的中分头格外好看',
  '有人会请你吃鸡腿',
  '适合发一条朋友圈，点赞会破纪录',
]

function daySeed(): number {
  const d = new Date()
  return hashStr(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
}

export function DailyFortune() {
  const [revealed, setRevealed] = useState(false)
  const seed = daySeed()
  const level = FORTUNE_LEVEL[seed % FORTUNE_LEVEL.length] ?? FORTUNE_LEVEL[0]
  const tip = FORTUNE_TIPS[(seed >> 3) % FORTUNE_TIPS.length] ?? FORTUNE_TIPS[0]
  const lucky = ['🏀', '🐔', '🎤', '💪', '🍗', '🎧'][(seed >> 6) % 6] ?? '🏀'

  return (
    <div className="space-y-4 text-center">
      <div className="text-5xl">{revealed ? level : '🎁'}</div>
      {revealed ? (
        <>
          <p className="text-sm text-gray-300">{tip}</p>
          <Row label="今日幸运物" value={lucky} />
          <p className="text-xs text-gray-600">每天 0 点刷新，同一天结果固定</p>
        </>
      ) : (
        <Btn
          onClick={() => {
            setRevealed(true)
            SFX.ok()
          }}
        >
          查看今日运势
        </Btn>
      )}
      <Hint>根据当天日期生成，同一天多次查看结果一致。</Hint>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn, downloadCanvas, Hint, pick, Row, randInt, roundRect } from './ui'

/* ================================================================
   15. 只因体生成器
   ================================================================ */
const SUFFIX = ['只因', '是吧', '啊这', '你干嘛', '哎呦', '嘿嘿', '坤坤', '荔枝']

export function ZhiYinStyle() {
  const [input, setInput] = useState('今天天气不错，我们去打篮球吧')
  const [output, setOutput] = useState('')

  const generate = () => {
    const chars = [...input.trim()]
    const parts: string[] = []
    chars.forEach((ch, i) => {
      parts.push(ch)
      if (i > 0 && i % 3 === 0) parts.push(pick(SUFFIX))
      if (/[，。！？,.!?]/.test(ch)) parts.push('只因')
    })
    setOutput(parts.join('') + (Math.random() > 0.5 ? '🐔' : '🏀'))
  }

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        maxLength={80}
        aria-label="输入原文"
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 resize-none"
      />
      <Btn className="w-full" onClick={generate}>
        只因化！
      </Btn>
      {output && (
        <div className="rounded-xl bg-white/5 p-4 text-sm leading-relaxed text-gray-200 break-all">
          {output}
        </div>
      )}
      <Hint>把普通句子注入「只因」基因，生成浓郁的小黑子风味文本。</Hint>
    </div>
  )
}

/* ================================================================
   16. 表情包生成器
   ================================================================ */
const MEME_EMOJI = ['🐔', '🏀', '💪', '🎤', '😤', '🤣', '🍋', '🕺']

export function MemeCanvas() {
  const [top, setTop] = useState('鸡你太美')
  const [bottom, setBottom] = useState('哎呦你干嘛')
  const [emoji, setEmoji] = useState('🐔')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const W = 600
    const H = 600
    c.width = W
    c.height = H

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#141414')
    grad.addColorStop(1, '#2a2410')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(255,215,0,0.35)'
    ctx.lineWidth = 6
    roundRect(ctx, 18, 18, W - 36, H - 36, 28)
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.font = '260px "Segoe UI Emoji", "Apple Color Emoji", serif'
    ctx.fillText(emoji, W / 2, H / 2 + 60)

    ctx.font = 'bold 56px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#FFD700'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 8
    ctx.lineJoin = 'round'
    if (top) {
      ctx.strokeText(top, W / 2, 110, W - 80)
      ctx.fillText(top, W / 2, 110, W - 80)
    }
    if (bottom) {
      ctx.strokeText(bottom, W / 2, H - 60, W - 80)
      ctx.fillText(bottom, W / 2, H - 60, W - 80)
    }

    ctx.font = '20px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillText('IKUN之家', W / 2, H - 22)
  }, [top, bottom, emoji])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-white/10" />
      <div className="flex gap-2">
        <input
          value={top}
          onChange={(e) => setTop(e.target.value)}
          maxLength={10}
          placeholder="上排文字"
          aria-label="上排文字"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
        />
        <input
          value={bottom}
          onChange={(e) => setBottom(e.target.value)}
          maxLength={10}
          placeholder="下排文字"
          aria-label="下排文字"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {MEME_EMOJI.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => setEmoji(e)}
            className={
              'w-10 h-10 rounded-lg text-xl transition-all cursor-pointer ' +
              (emoji === e
                ? 'bg-ikun-yellow/25 ring-1 ring-ikun-yellow/50'
                : 'bg-white/5 hover:bg-white/10')
            }
            aria-label={`选择表情 ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
      <Btn
        className="w-full"
        onClick={() => {
          const c = canvasRef.current
          if (c) downloadCanvas(c, 'ikun-meme.png')
        }}
      >
        下载表情包 PNG
      </Btn>
      <Hint>输入上下两排文字、选一个表情，实时生成 600×600 的表情包并下载。</Hint>
    </div>
  )
}

/* ================================================================
   17. IKUN 昵称生成器
   ================================================================ */
const NICK_PREFIX = ['爱坤', '只因', '荔枝', '练习', '铁山', '小黑', '鸡你', '篮球', '唱跳', 'rap']
const NICK_MID = ['的', '小', '大', '超', '真', '野', '萌', '硬核']
const NICK_SUFFIX = [
  '坤坤',
  '两年半',
  '练习生',
  '小黑子',
  '荔枝人',
  '铁山靠',
  '中分头',
  '背带裤',
  '只因哥',
  '篮球少年',
]

export function NicknameGen() {
  const [name, setName] = useState('')
  const [list, setList] = useState<string[]>([])

  const gen = () => {
    setName(pick(NICK_PREFIX) + pick(NICK_MID) + pick(NICK_SUFFIX))
    setList((prev) => [name, ...prev].filter(Boolean).slice(0, 6))
  }

  return (
    <div className="space-y-3 text-center">
      <div className="h-20 grid place-items-center rounded-xl bg-gradient-to-br from-ikun-yellow/15 to-transparent border border-ikun-yellow/20">
        <span className="text-xl font-black text-ikun-yellow">{name || '？ ？ ？'}</span>
      </div>
      <Btn className="w-full" onClick={gen}>
        生成昵称
      </Btn>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {list.map((n, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
              {n}
            </span>
          ))}
        </div>
      )}
      <Hint>随机组合前缀 + 中缀 + 后缀，生成独一无二的 ikun 昵称。</Hint>
    </div>
  )
}

/* ================================================================
   18. 小黑子身份证
   ================================================================ */
export function IdCardGen() {
  const [name, setName] = useState('练习时长两年半')
  const [id] = useState(() => `IK${randInt(100000, 999999)}`)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const W = 640
    const H = 400
    c.width = W
    c.height = H

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#1b1b1b')
    grad.addColorStop(1, '#2b2410')
    ctx.fillStyle = grad
    roundRect(ctx, 0, 0, W, H, 24)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,215,0,0.4)'
    ctx.lineWidth = 3
    roundRect(ctx, 12, 12, W - 24, H - 24, 18)
    ctx.stroke()

    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 28px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('小黑子身份证', 40, 70)
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('IKUN CERTIFICATE', 40, 96)

    ctx.font = '120px "Segoe UI Emoji", "Apple Color Emoji", serif'
    ctx.textAlign = 'center'
    ctx.fillText('🐔', 520, 230)

    ctx.textAlign = 'left'
    const rows: [string, string][] = [
      ['昵称', name || '匿名小黑子'],
      ['编号', id],
      ['段位', '骨灰级 ikun'],
      ['特长', '唱 · 跳 · rap · 篮球'],
    ]
    rows.forEach(([k, v], i) => {
      const y = 150 + i * 52
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '16px sans-serif'
      ctx.fillText(k, 40, y)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px "PingFang SC", "Microsoft YaHei", sans-serif'
      ctx.fillText(v, 120, y)
    })

    ctx.fillStyle = 'rgba(255,215,0,0.5)'
    ctx.font = '14px sans-serif'
    ctx.fillText('纯属娱乐 · 请勿对号入座', 40, H - 40)
  }, [name, id])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-white/10" />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={12}
        placeholder="输入你的昵称"
        aria-label="输入昵称"
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
      />
      <Btn
        className="w-full"
        onClick={() => {
          const c = canvasRef.current
          if (c) downloadCanvas(c, 'ikun-idcard.png')
        }}
      >
        下载身份证
      </Btn>
      <Hint>输入昵称即可生成专属小黑子身份证，可直接下载分享。</Hint>
    </div>
  )
}

/* ================================================================
   19. 坤坤语录生成器
   ================================================================ */
const QUOTE_A = ['我练习时长', '你干嘛', '哎呦', '鸡你', '只因你', '我是', '这个', '他们']
const QUOTE_B = ['两年半', '太美', '你干嘛', '真的', '小黑子', '篮球', '铁山靠', '中分头']
const QUOTE_C = ['，唱跳 rap 篮球。', '，啊这。', '，你懂的吧？', '，是吧。', '，嘿嘿。', '！']

export function QuoteGen() {
  const [quote, setQuote] = useState('我练习时长两年半，唱跳 rap 篮球。')

  return (
    <div className="space-y-3">
      <div className="min-h-[110px] grid place-items-center rounded-xl bg-gradient-to-br from-ikun-yellow/10 to-transparent border border-white/10 p-5">
        <p className="text-center text-lg leading-relaxed text-white">「{quote}」</p>
      </div>
      <div className="flex gap-2">
        <Btn
          className="flex-1"
          onClick={() => setQuote(pick(QUOTE_A) + pick(QUOTE_B) + pick(QUOTE_C))}
        >
          来一句
        </Btn>
        <Btn
          kind="ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(quote)
          }}
        >
          复制
        </Btn>
      </div>
      <Hint>从词库里随机拼装，生成一句「坤味」十足的语录。</Hint>
    </div>
  )
}

/* ================================================================
   20. 只因翻译器
   ================================================================ */
const DICT: [RegExp, string][] = [
  [/厉害/g, '只因'],
  [/真的/g, '荔枝'],
  [/是的/g, '是滴'],
  [/为什么/g, '为森么'],
  [/什么/g, '神魔'],
  [/非常/g, '贼'],
  [/好看/g, '真好看'],
  [/篮球/g, '🏀'],
  [/鸡/g, '🐔'],
  [/喜欢/g, '稀罕'],
  [/朋友/g, '老铁'],
  [/谢谢/g, '蟹蟹'],
]

export function ZhiYinTranslator() {
  const [src, setSrc] = useState('你真的很厉害，我们一起打篮球吧')
  const [out, setOut] = useState('')

  const translate = () => {
    let text = src
    for (const [re, rep] of DICT) text = text.replace(re, rep)
    setOut(`${text} 🐔`)
  }

  return (
    <div className="space-y-3">
      <textarea
        value={src}
        onChange={(e) => setSrc(e.target.value)}
        rows={2}
        maxLength={60}
        aria-label="输入原文"
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-ikun-yellow/50 resize-none"
      />
      <Btn className="w-full" onClick={translate}>
        翻译成只因语
      </Btn>
      {out && <div className="rounded-xl bg-white/5 p-4 text-gray-200 break-all">{out}</div>}
      <Hint>按词库替换成小黑子黑话，越翻越离谱。</Hint>
    </div>
  )
}

/* ================================================================
   21. 打篮球头像生成器
   ================================================================ */
const AVATAR_BG = [
  ['#FFD700', '#B8860B'],
  ['#FF6B6B', '#8B0000'],
  ['#4ECDC4', '#006666'],
  ['#A78BFA', '#4C1D95'],
  ['#34D399', '#065F46'],
]

export function AvatarGen() {
  const [seed, setSeed] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const draw = useCallback(() => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const S = 400
    c.width = S
    c.height = S
    const [a, b] = AVATAR_BG[seed % AVATAR_BG.length] ?? ['#FFD700', '#B8860B']

    const grad = ctx.createLinearGradient(0, 0, S, S)
    grad.addColorStop(0, a as string)
    grad.addColorStop(1, b as string)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, S, S)

    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#000'
    for (let i = 0; i < 12; i++) {
      ctx.beginPath()
      ctx.arc(randInt(0, S), randInt(0, S), randInt(20, 90), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1

    ctx.textAlign = 'center'
    ctx.font = '190px "Segoe UI Emoji", "Apple Color Emoji", serif'
    ctx.fillText('🏀', S / 2, S / 2 + 40)
    ctx.font = '70px "Segoe UI Emoji", "Apple Color Emoji", serif'
    ctx.fillText('🐔', S / 2 + 90, S / 2 + 110)
  }, [seed])

  useEffect(() => {
    draw()
  }, [draw])

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        className="w-full max-w-[280px] mx-auto rounded-full border-2 border-white/10"
      />
      <div className="flex gap-2">
        <Btn className="flex-1" onClick={() => setSeed((s) => s + 1)}>
          换一个
        </Btn>
        <Btn
          kind="ghost"
          onClick={() => {
            const c = canvasRef.current
            if (c) downloadCanvas(c, 'ikun-avatar.png')
          }}
        >
          下载
        </Btn>
      </div>
      <Hint>随机生成 400×400 的篮球主题头像，可直接用作社交平台头像。</Hint>
    </div>
  )
}

/* ================================================================
   22. 鸡窝签名生成器
   ================================================================ */
const SIGN_STYLE = [
  { name: '霸气', tpl: (n: string) => `${n}：球场见，不服来单挑 🏀` },
  { name: '文艺', tpl: (n: string) => `${n}：练习两年半，只为一句鸡你太美 🐔` },
  { name: '沙雕', tpl: (n: string) => `${n}：我不是小黑子，我是大黑子 😤` },
  { name: '佛系', tpl: (n: string) => `${n}：荔枝一点，天下太平 🍋` },
]

export function SignatureGen() {
  const [name, setName] = useState('ikun小王子')
  const [style, setStyle] = useState(0)
  const sig = (SIGN_STYLE[style]?.tpl ?? ((n: string) => n))(name || '匿名小黑子')

  return (
    <div className="space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={12}
        aria-label="输入昵称"
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-ikun-yellow/50"
      />
      <div className="flex flex-wrap gap-2">
        {SIGN_STYLE.map((s, i) => (
          <button
            type="button"
            key={s.name}
            onClick={() => setStyle(i)}
            className={
              'px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ' +
              (style === i ? 'bg-ikun-yellow text-black font-bold' : 'bg-white/5 text-gray-400')
            }
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-white/5 p-4 text-gray-200 break-all">{sig}</div>
      <Btn className="w-full" kind="ghost" onClick={() => void navigator.clipboard?.writeText(sig)}>
        复制签名
      </Btn>
      <Hint>选一个风格，生成专属个性签名。</Hint>
    </div>
  )
}

/* ================================================================
   23. 只因时间戳（复用给工具页）
   ================================================================ */
export function useRandomSeed() {
  const [seed, setSeed] = useState(() => randInt(0, 9999))
  return { seed, next: () => setSeed(randInt(0, 9999)) }
}

export function StatLine({ label, value }: { label: string; value: string | number }) {
  return <Row label={label} value={value} />
}

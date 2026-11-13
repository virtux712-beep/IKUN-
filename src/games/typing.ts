/**
 * 只因打字挑战的数据与纯逻辑。
 * 设计参考 GitHub 热门打字游戏（qwerty-learner 23.7k★ / ttyper / gittype）：
 * 用拼音代替汉字，规避中文 IME 输入法的兼容问题，同时保留 ikun 味。
 */

export interface Phrase {
  /** 需要输入的拼音（小写，可含空格分词） */
  pinyin: string
  /** 对应的中文，仅作提示展示 */
  cn: string
}

export const PHRASES: Phrase[] = [
  { pinyin: 'jinitai mei', cn: '鸡你太美' },
  { pinyin: 'niganma', cn: '你干嘛' },
  { pinyin: 'tie shan kao', cn: '铁山靠' },
  { pinyin: 'lianxi shichang liang nian ban', cn: '练习时长两年半' },
  { pinyin: 'chang tiao rap lanqiu', cn: '唱跳 rap 篮球' },
  { pinyin: 'zhongfen tou', cn: '中分头' },
  { pinyin: 'beidai ku', cn: '背带裤' },
  { pinyin: 'dajia yao lizhi', cn: '大家要荔枝' },
  { pinyin: 'heizi lu chu jijiao le ba', cn: '小黑子露出鸡脚了吧' },
  { pinyin: 'aiyou ni ganma', cn: '哎呦你干嘛' },
  { pinyin: 'kun kun zhi yin', cn: '坤坤只因' },
  { pinyin: 'lanqiu shaonian', cn: '篮球少年' },
  { pinyin: 'jijiao ni tai mei', cn: '鸡脚你太美' },
  { pinyin: 'zhi yin ni tai mei', cn: '只因你太美' },
  { pinyin: 'wo shi lianxi sheng', cn: '我是练习生' },
  { pinyin: 'shuai qi de zhongfen', cn: '帅气的中分' },
]

export type CharState = 'pending' | 'correct' | 'wrong'

export interface TypedStats {
  /** 已输入字符数（含错误） */
  typed: number
  /** 正确字符数 */
  correct: number
  /** 错误字符数 */
  wrong: number
}

/** 逐字符比对，返回每个目标字符的状态 */
export function compareChars(target: string, input: string): CharState[] {
  const out: CharState[] = []
  for (let i = 0; i < target.length; i++) {
    if (i >= input.length) out.push('pending')
    else out.push(input[i] === target[i] ? 'correct' : 'wrong')
  }
  return out
}

/** 统计：以目标串为准计算正确/错误 */
export function computeStats(target: string, input: string): TypedStats {
  let correct = 0
  let wrong = 0
  for (let i = 0; i < input.length; i++) {
    if (i < target.length && input[i] === target[i]) correct++
    else wrong++
  }
  return { typed: correct + wrong, correct, wrong }
}

/**
 * WPM（words per minute）：业界标准按「5 个字符 = 1 词」折算。
 * 只统计正确字符，错误越多分数越低。
 */
export function wpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  return Math.round(correctChars / 5 / minutes)
}

/** 准确率百分比（0-100） */
export function accuracy(correct: number, typed: number): number {
  if (typed <= 0) return 100
  return Math.round((correct / typed) * 1000) / 10
}

/** 评级：按 WPM 与准确率综合 */
export function gradeOf(w: number, acc: number): { grade: string; label: string; color: string } {
  if (acc < 80) return { grade: 'D', label: '准确率太低，慢一点反而更快', color: 'text-red-400' }
  if (w >= 80 && acc >= 97)
    return { grade: 'S', label: '键盘之神！手速与准确度双绝', color: 'text-yellow-400' }
  if (w >= 60 && acc >= 95)
    return { grade: 'A', label: '非常熟练，小黑子里的打字机', color: 'text-green-400' }
  if (w >= 40 && acc >= 90)
    return { grade: 'B', label: '不错，已经能盲打了', color: 'text-blue-400' }
  if (w >= 25) return { grade: 'C', label: '还行，多练两年半就好', color: 'text-orange-400' }
  return { grade: 'D', label: '慢慢来，先找找键位', color: 'text-red-400' }
}

/** 洗牌取 n 条（避免每次顺序一样） */
export function pickPhrases(count: number, rng: () => number = Math.random): Phrase[] {
  const pool = [...PHRASES]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = pool[i] as Phrase
    pool[i] = pool[j] as Phrase
    pool[j] = tmp
  }
  return pool.slice(0, Math.min(count, pool.length))
}

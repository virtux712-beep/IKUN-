/**
 * 音游（下落式）核心逻辑。
 * 参考 GitHub 网页音游（bemuse 1.2k★ / webosu 649★）的判定模型：
 * 固定时间窗分级判定 + 连击加成，逻辑与渲染分离便于单测。
 */

export const LANES = 5

export type Judgment = 'perfect' | 'great' | 'good' | 'miss'

/** 判定时间窗（毫秒，绝对值） */
export const WINDOWS: Record<Exclude<Judgment, 'miss'>, number> = {
  perfect: 55,
  great: 110,
  good: 180,
}

/** 单次判定得分 */
export const SCORES: Record<Judgment, number> = {
  perfect: 100,
  great: 60,
  good: 30,
  miss: 0,
}

export interface Note {
  id: number
  lane: number
  /** 该音符应当被击中的时间（毫秒，相对谱面起点） */
  time: number
  /** 是否已被判定（含 miss） */
  judged: boolean
  result?: Judgment
}

/** 谱面：用 0-4 的 lane 序列按固定间隔铺开 */
export function buildChart(pattern: number[], bpm: number, leadIn = 1200): Note[] {
  const beat = 60000 / bpm
  return pattern.map((lane, i) => ({
    id: i,
    lane,
    time: leadIn + i * beat,
    judged: false,
  }))
}

/** 按时间差给出判定：超出 good 窗口即 miss */
export function judgeByDelta(absDelta: number): Judgment {
  if (absDelta <= WINDOWS.perfect) return 'perfect'
  if (absDelta <= WINDOWS.great) return 'great'
  if (absDelta <= WINDOWS.good) return 'good'
  return 'miss'
}

export interface HitResult {
  noteId: number
  judgment: Judgment
  /** 时间差，正数表示点早了 */
  delta: number
}

/**
 * 在某个轨道上找「离当前时刻最近、且尚未判定」的音符并出判定。
 * 只考虑 good 窗口允许范围内；完全没有可判音符时返回 null。
 */
export function pickHit(notes: Note[], lane: number, now: number): HitResult | null {
  let best: Note | null = null
  let bestAbs = Number.POSITIVE_INFINITY

  for (const n of notes) {
    if (n.judged || n.lane !== lane) continue
    const abs = Math.abs(n.time - now)
    if (abs <= WINDOWS.good && abs < bestAbs) {
      best = n
      bestAbs = abs
    }
  }

  if (!best) return null
  const delta = best.time - now
  return { noteId: best.id, judgment: judgeByDelta(Math.abs(delta)), delta }
}

/** 把已经超过 good 窗口仍未判定的音符标为 miss */
export function collectMissed(notes: Note[], now: number): number[] {
  const ids: number[] = []
  for (const n of notes) {
    if (n.judged) continue
    if (now - n.time > WINDOWS.good) ids.push(n.id)
  }
  return ids
}

/** 连击加成：每 10 连击 +10% 上限 2 倍 */
export function comboMultiplier(combo: number): number {
  return Math.min(2, 1 + Math.floor(combo / 10) * 0.1)
}

export interface PlayStats {
  perfect: number
  great: number
  good: number
  miss: number
  score: number
  combo: number
  maxCombo: number
}

export const EMPTY_STATS: PlayStats = {
  perfect: 0,
  great: 0,
  good: 0,
  miss: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
}

/** 应用一次判定，返回新统计（不可变） */
export function applyHit(stats: PlayStats, judgment: Judgment): PlayStats {
  const isHit = judgment !== 'miss'
  const nextCombo = isHit ? stats.combo + 1 : 0
  return {
    perfect: stats.perfect + (judgment === 'perfect' ? 1 : 0),
    great: stats.great + (judgment === 'great' ? 1 : 0),
    good: stats.good + (judgment === 'good' ? 1 : 0),
    miss: stats.miss + (judgment === 'miss' ? 1 : 0),
    score: stats.score + Math.round(SCORES[judgment] * comboMultiplier(nextCombo - 1)),
    combo: nextCombo,
    maxCombo: Math.max(stats.maxCombo, nextCombo),
  }
}

/** 准确率：按判定权重加权（perfect=100%, great=70%, good=40%, miss=0） */
export function accuracyOf(stats: PlayStats): number {
  const total = stats.perfect + stats.great + stats.good + stats.miss
  if (total === 0) return 100
  const weighted = stats.perfect * 1 + stats.great * 0.7 + stats.good * 0.4
  return Math.round((weighted / total) * 1000) / 10
}

/** 评级 */
export function rankOf(acc: number): { rank: string; color: string } {
  if (acc >= 98) return { rank: 'SSS', color: 'text-yellow-400' }
  if (acc >= 95) return { rank: 'SS', color: 'text-yellow-300' }
  if (acc >= 90) return { rank: 'S', color: 'text-green-400' }
  if (acc >= 80) return { rank: 'A', color: 'text-blue-400' }
  if (acc >= 70) return { rank: 'B', color: 'text-cyan-400' }
  if (acc >= 60) return { rank: 'C', color: 'text-orange-400' }
  return { rank: 'D', color: 'text-red-400' }
}

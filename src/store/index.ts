import type { GameScore, Message, MessageComment } from '@/types'

const STORAGE_KEYS = {
  MESSAGES: 'ikun_messages',
  FAVORITES: 'ikun_favorites',
  FAVORITE_SONGS: 'ikun_favorite_songs',
  GAME_SCORES: 'ikun_game_scores',
  VISIT_COUNT: 'ikun_visit_count',
  MEME_COLLECTION: 'ikun_meme_collection',
  PURITY_HISTORY: 'ikun_purity_history',
  NICKNAME: 'ikun_nickname',
  VOLUME: 'ikun_volume',
} as const

const SESSION_VISIT_KEY = 'ikun_session_visited'

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 隐私模式 / 配额写满时静默降级，不影响页面使用
  }
}

function getSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function setSessionFlag(key: string): void {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* 访问统计                                                            */
/* ------------------------------------------------------------------ */

const BASE_VISIT_COUNT = 12580

export function getVisitCount(): number {
  return getStorage(STORAGE_KEYS.VISIT_COUNT, BASE_VISIT_COUNT)
}

/**
 * 记录一次访问。
 * 同一个浏览器会话内只累加一次，避免在标签页之间来回切换时疯狂刷量。
 */
export function recordVisit(): number {
  const current = getVisitCount()
  if (getSessionFlag(SESSION_VISIT_KEY)) return current
  setSessionFlag(SESSION_VISIT_KEY)
  const next = current + 1
  setStorage(STORAGE_KEYS.VISIT_COUNT, next)
  return next
}

/* ------------------------------------------------------------------ */
/* 留言墙                                                              */
/* ------------------------------------------------------------------ */

function createDefaultMessages(): Message[] {
  const now = Date.now()
  return [
    {
      id: 'msg1',
      nickname: 'ikun小王子',
      content: '鸡你太美！今天又是做小黑子的一天 🐔',
      timestamp: now - 86400000 * 3,
      likes: 42,
      reactions: { '❤️': 15, '😂': 23, '🔥': 8 },
      comments: [
        { id: 'c1', nickname: '黑子一号', content: '你干嘛~', timestamp: now - 86400000 * 2 },
      ],
    },
    {
      id: 'msg2',
      nickname: '练习两年半',
      content: '我练习时长两年半，擅长唱跳rap篮球',
      timestamp: now - 86400000 * 2,
      likes: 38,
      reactions: { '💪': 20, '😂': 12, '👍': 6 },
      comments: [],
    },
    {
      id: 'msg3',
      nickname: '荔枝人',
      content: '大家说话要荔枝啊！不要太激动',
      timestamp: now - 86400000,
      likes: 56,
      reactions: { '😂': 30, '❤️': 10, '👍': 16 },
      comments: [
        { id: 'c2', nickname: 'ikun战士', content: '荔枝！必须荔枝！', timestamp: now - 43200000 },
        { id: 'c3', nickname: '小黑子大佬', content: '好的我荔枝一下', timestamp: now - 36000000 },
      ],
    },
    {
      id: 'msg4',
      nickname: '篮球少年',
      content: '今天在球场模仿了坤坤的投篮，虽然没进但很开心 🏀',
      timestamp: now - 7200000,
      likes: 28,
      reactions: { '🏀': 12, '😂': 10, '👍': 6 },
      comments: [],
    },
  ]
}

export function getMessages(): Message[] {
  return getStorage(STORAGE_KEYS.MESSAGES, createDefaultMessages())
}

export function saveMessages(messages: Message[]): void {
  setStorage(STORAGE_KEYS.MESSAGES, messages)
}

/** 所有写操作都返回新数组，保证 React 一定能感知到变化 */
function updateMessage(id: string, updater: (message: Message) => Message): Message[] {
  const messages = getMessages()
  const next = messages.map((m) => (m.id === id ? updater(m) : m))
  saveMessages(next)
  return next
}

export function addMessage(msg: Message): Message[] {
  const next = [msg, ...getMessages()]
  saveMessages(next)
  return next
}

export function likeMessage(id: string): Message[] {
  return updateMessage(id, (m) => ({ ...m, likes: m.likes + 1 }))
}

export function addReaction(id: string, emoji: string): Message[] {
  return updateMessage(id, (m) => ({
    ...m,
    reactions: { ...m.reactions, [emoji]: (m.reactions[emoji] ?? 0) + 1 },
  }))
}

export function addComment(id: string, comment: MessageComment): Message[] {
  return updateMessage(id, (m) => ({ ...m, comments: [...m.comments, comment] }))
}

export function deleteMessage(id: string): Message[] {
  const next = getMessages().filter((m) => m.id !== id)
  saveMessages(next)
  return next
}

/* ------------------------------------------------------------------ */
/* 收藏                                                                */
/* ------------------------------------------------------------------ */

function toggleInList(key: string, id: string): string[] {
  const list = getStorage<string[]>(key, [])
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
  setStorage(key, next)
  return next
}

export function getFavorites(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.FAVORITES, [])
}

export function toggleFavorite(id: string): string[] {
  return toggleInList(STORAGE_KEYS.FAVORITES, id)
}

export function getFavoriteSongs(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.FAVORITE_SONGS, [])
}

export function toggleFavoriteSong(id: string): string[] {
  return toggleInList(STORAGE_KEYS.FAVORITE_SONGS, id)
}

/* ------------------------------------------------------------------ */
/* 表情包收藏                                                          */
/* ------------------------------------------------------------------ */

export function getMemeCollection(): string[] {
  return getStorage<string[]>(STORAGE_KEYS.MEME_COLLECTION, [])
}

export function toggleMemeCollection(id: string): string[] {
  return toggleInList(STORAGE_KEYS.MEME_COLLECTION, id)
}

/* ------------------------------------------------------------------ */
/* 游戏分数                                                            */
/* ------------------------------------------------------------------ */

export function getGameScores(): GameScore[] {
  return getStorage<GameScore[]>(STORAGE_KEYS.GAME_SCORES, [])
}

export function addGameScore(score: GameScore): GameScore[] {
  const next = [...getGameScores(), score].slice(-50)
  setStorage(STORAGE_KEYS.GAME_SCORES, next)
  return next
}

/* ------------------------------------------------------------------ */
/* 纯度测试历史                                                        */
/* ------------------------------------------------------------------ */

export function getPurityHistory(): number[] {
  return getStorage<number[]>(STORAGE_KEYS.PURITY_HISTORY, [])
}

export function addPurityResult(score: number): number[] {
  const next = [...getPurityHistory(), score].slice(-20)
  setStorage(STORAGE_KEYS.PURITY_HISTORY, next)
  return next
}

/* ------------------------------------------------------------------ */
/* 用户偏好                                                            */
/* ------------------------------------------------------------------ */

export function getNickname(): string {
  return getStorage<string>(STORAGE_KEYS.NICKNAME, '')
}

export function setNickname(nickname: string): void {
  setStorage(STORAGE_KEYS.NICKNAME, nickname)
}

export function getVolume(): number {
  return getStorage<number>(STORAGE_KEYS.VOLUME, 80)
}

export function setVolume(volume: number): void {
  setStorage(STORAGE_KEYS.VOLUME, volume)
}

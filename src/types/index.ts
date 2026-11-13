export interface Character {
  id: string
  name: string
  title: string
  description: string
  emoji: string
  tags: string[]
  rarity: 'common' | 'rare' | 'legendary' | 'mythic'
}

export interface Meme {
  id: string
  name: string
  category: string
  emoji: string
  tags: string[]
  description: string
}

export interface Song {
  id: string
  title: string
  artist: string
  duration: string
  emoji: string
  isFavorite?: boolean
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface MessageComment {
  id: string
  nickname: string
  content: string
  timestamp: number
}

export interface Message {
  id: string
  nickname: string
  content: string
  timestamp: number
  likes: number
  reactions: Record<string, number>
  comments: MessageComment[]
}

export interface GameScore {
  game: string
  score: number
  date: number
}

export interface PurityResult {
  score: number
  level: string
  comment: string
}

/** 站点所有可导航的标签页 */
export type TabId =
  | 'home'
  | 'encyclopedia'
  | 'memes'
  | 'music'
  | 'games'
  | 'lab'
  | 'sandbox'
  | 'messages'
  | 'search'

export const TAB_IDS: readonly TabId[] = [
  'home',
  'encyclopedia',
  'memes',
  'music',
  'games',
  'lab',
  'sandbox',
  'messages',
  'search',
] as const

export function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value)
}

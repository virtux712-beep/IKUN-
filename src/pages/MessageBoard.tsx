import { Heart, MessageCircle, Send, SmilePlus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/Toast'
import { generateId, useOnClickOutside } from '@/hooks'
import {
  addComment,
  addMessage,
  addReaction,
  getMessages,
  getNickname,
  likeMessage,
  setNickname as persistNickname,
} from '@/store'
import type { Message } from '@/types'

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '👍', '💪', '🐔', '🏀', '✨']
const QUICK_CONTENT = [
  { label: '🐔 鸡你太美', text: '鸡你太美' },
  { label: '💪 铁山靠', text: '铁山靠' },
  { label: '🏀 打篮球', text: '打篮球' },
  { label: '🧠 荔枝', text: '大家说话要荔枝啊' },
]

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}天前`
  return new Date(timestamp).toLocaleDateString('zh-CN')
}

export default function MessageBoard() {
  const toast = useToast()
  const [messages, setMessages] = useState<Message[]>(getMessages)
  const [nickname, setNickname] = useState(getNickname)
  const [content, setContent] = useState('')
  const [commentingId, setCommentingId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [pickerId, setPickerId] = useState<string | null>(null)

  const pickerRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(pickerRef, () => setPickerId(null), pickerId !== null)

  // 昵称自动记忆
  useEffect(() => {
    const timer = setTimeout(() => persistNickname(nickname.trim()), 400)
    return () => clearTimeout(timer)
  }, [nickname])

  const handlePost = useCallback(() => {
    const nick = nickname.trim()
    const text = content.trim()
    if (!nick || !text) return

    const msg: Message = {
      id: generateId(),
      nickname: nick,
      content: text,
      timestamp: Date.now(),
      likes: 0,
      reactions: {},
      comments: [],
    }
    setMessages(addMessage(msg))
    setContent('')
    toast.success('留言发布成功')
  }, [nickname, content, toast])

  const handleLike = useCallback((id: string) => {
    setMessages(likeMessage(id))
  }, [])

  const handleReaction = useCallback((id: string, emoji: string) => {
    setMessages(addReaction(id, emoji))
    setPickerId(null)
  }, [])

  const handleComment = useCallback(
    (id: string) => {
      const text = commentText.trim()
      if (!text) return
      const comment = {
        id: generateId(),
        nickname: nickname.trim() || '匿名小黑子',
        content: text,
        timestamp: Date.now(),
      }
      setMessages(addComment(id, comment))
      setCommentText('')
      setCommentingId(null)
      toast.success('评论已发送')
    },
    [commentText, nickname, toast],
  )

  const canPost = nickname.trim().length > 0 && content.trim().length > 0

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            💬 <span className="text-ikun-yellow">留言</span>墙
          </h1>
          <p className="text-gray-400">与其他小黑子交流互动</p>
          <p className="text-sm text-gray-500 mt-2">
            共 <span className="text-ikun-yellow">{messages.length}</span> 条留言
          </p>
        </div>

        {/* 发布框 */}
        <div className="glass rounded-2xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              type="text"
              placeholder="你的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="shrink-0 w-full sm:w-36 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors text-sm"
              maxLength={16}
              aria-label="昵称"
            />
            <input
              type="text"
              placeholder="说点什么吧..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) handlePost()
              }}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors text-sm"
              maxLength={200}
              aria-label="留言内容"
            />
            <button
              type="button"
              onClick={handlePost}
              disabled={!canPost}
              className="px-6 py-3 bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold rounded-xl hover:scale-[1.03] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <Send size={16} aria-hidden="true" /> 发送
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_CONTENT.map((quick) => (
              <button
                type="button"
                key={quick.label}
                onClick={() => setContent(quick.text)}
                className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              >
                {quick.label}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-600 tabular-nums">{content.length}/200</span>
          </div>
        </div>

        {/* 留言列表 */}
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="glass rounded-2xl p-5 animate-fadeUp">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-ikun-yellow/70 to-ikun-golden/40 flex items-center justify-center text-lg font-bold text-black shrink-0"
                  aria-hidden="true"
                >
                  {msg.nickname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{msg.nickname}</div>
                  <div className="text-xs text-gray-500">{formatTime(msg.timestamp)}</div>
                </div>
              </div>

              <p className="text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </p>

              {/* 表情反应 */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {Object.entries(msg.reactions).map(([emoji, count]) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => handleReaction(msg.id, emoji)}
                    className="px-2 py-1 bg-white/5 rounded-full text-xs hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span aria-hidden="true">{emoji}</span>
                    <span className="text-gray-400 tabular-nums">{count}</span>
                  </button>
                ))}

                <div className="relative" ref={pickerId === msg.id ? pickerRef : undefined}>
                  <button
                    type="button"
                    onClick={() => setPickerId(pickerId === msg.id ? null : msg.id)}
                    aria-label="添加表情反应"
                    aria-expanded={pickerId === msg.id}
                    className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <SmilePlus size={14} className="text-gray-400" />
                  </button>
                  {pickerId === msg.id && (
                    <div className="absolute bottom-full left-0 mb-2 glass rounded-xl p-2 flex gap-1 animate-slideDown z-20 shadow-xl shadow-black/40">
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer text-lg"
                          aria-label={`添加反应 ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleLike(msg.id)}
                  aria-label="点赞"
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Heart size={16} aria-hidden="true" />
                  <span className="tabular-nums">{msg.likes}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCommentingId(commentingId === msg.id ? null : msg.id)}
                  aria-expanded={commentingId === msg.id}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  <span className="tabular-nums">{msg.comments.length}</span>
                </button>
              </div>

              {msg.comments.length > 0 && (
                <ul className="mt-4 pl-4 border-l-2 border-white/10 space-y-3">
                  {msg.comments.map((comment) => (
                    <li key={comment.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-ikun-yellow">
                          {comment.nickname}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 break-words">{comment.content}</p>
                    </li>
                  ))}
                </ul>
              )}

              {commentingId === msg.id && (
                <div className="mt-3 flex gap-2 animate-slideDown">
                  <input
                    type="text"
                    placeholder="写评论..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleComment(msg.id)
                    }}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors"
                    maxLength={200}
                    aria-label="评论内容"
                  />
                  <button
                    type="button"
                    onClick={() => handleComment(msg.id)}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-ikun-yellow text-black font-bold rounded-lg text-sm hover:bg-ikun-gold transition-all cursor-pointer disabled:opacity-40"
                  >
                    发送
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

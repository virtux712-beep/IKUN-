import { Search as SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { characters } from '@/data/characters'
import { memes } from '@/data/memes'
import { playlist } from '@/data/music'
import type { TabId } from '@/types'

interface SearchProps {
  onTabChange: (tab: TabId) => void
}

export default function SearchPage({ onTabChange }: SearchProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return { characters: [], memes: [], songs: [] }
    const q = query.toLowerCase()
    return {
      characters: characters.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.includes(q)),
      ),
      memes: memes.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.includes(q)),
      ),
      songs: playlist.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q),
      ),
    }
  }, [query])

  const totalResults = results.characters.length + results.memes.length + results.songs.length

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            🔍 <span className="text-ikun-yellow">搜索</span>
          </h1>
          <p className="text-gray-400">搜索ikun之家的所有内容</p>
        </div>

        {/* Search Input */}
        <div className="glass rounded-2xl p-4 mb-8">
          <div className="relative">
            <SearchIcon
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索角色、表情包、音乐..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors"
            />
          </div>
          {query.trim() && (
            <p className="text-sm text-gray-500 mt-3 px-1">
              找到 <span className="text-ikun-yellow">{totalResults}</span> 个结果
            </p>
          )}
        </div>

        {/* Results */}
        {!query.trim() && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">输入关键词开始搜索</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['小黑子', '篮球', '鸡', 'rap', '荔枝'].map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {query.trim() && totalResults === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-400">没有找到相关内容</p>
            <p className="text-sm text-gray-500 mt-1">试试其他关键词？</p>
          </div>
        )}

        {/* Characters */}
        {results.characters.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
              📖 IKUN图鉴 ({results.characters.length})
            </h3>
            <div className="space-y-2">
              {results.characters.map((char) => (
                <button
                  type="button"
                  key={char.id}
                  onClick={() => onTabChange('encyclopedia')}
                  className="w-full glass rounded-xl p-4 text-left hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3"
                >
                  <span className="text-2xl">{char.emoji}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{char.name}</div>
                    <div className="text-xs text-gray-400">{char.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Memes */}
        {results.memes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
              😱 表情包 ({results.memes.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {results.memes.map((meme) => (
                <button
                  type="button"
                  key={meme.id}
                  onClick={() => onTabChange('memes')}
                  className="glass rounded-xl p-4 text-center hover:bg-white/10 transition-all cursor-pointer"
                >
                  <div className="text-3xl mb-1">{meme.emoji}</div>
                  <div className="text-sm font-bold text-white">{meme.name}</div>
                  <div className="text-xs text-gray-500">{meme.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Songs */}
        {results.songs.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
              🎵 音乐 ({results.songs.length})
            </h3>
            <div className="space-y-2">
              {results.songs.map((song) => (
                <button
                  type="button"
                  key={song.id}
                  onClick={() => onTabChange('music')}
                  className="w-full glass rounded-xl p-4 text-left hover:bg-white/10 transition-all cursor-pointer flex items-center gap-3"
                >
                  <span className="text-2xl">{song.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{song.title}</div>
                    <div className="text-xs text-gray-400">{song.artist}</div>
                  </div>
                  <span className="text-xs text-gray-500">{song.duration}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

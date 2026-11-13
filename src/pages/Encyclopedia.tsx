import { Filter, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { characters, rarityColors, rarityLabels } from '@/data/characters'
import type { Character } from '@/types'

const ALL_TAGS = [...new Set(characters.flatMap((c) => c.tags))]
const RARITIES = ['all', 'common', 'rare', 'legendary', 'mythic'] as const

type Rarity = (typeof RARITIES)[number]

export default function Encyclopedia() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return characters.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      const matchRarity = selectedRarity === 'all' || c.rarity === selectedRarity
      const matchTag = !selectedTag || c.tags.includes(selectedTag)
      return matchSearch && matchRarity && matchTag
    })
  }, [searchTerm, selectedRarity, selectedTag])

  const hasFilters = searchTerm !== '' || selectedRarity !== 'all' || selectedTag !== null

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedRarity('all')
    setSelectedTag(null)
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            📖 <span className="text-ikun-yellow">IKUN</span>图鉴
          </h1>
          <p className="text-gray-400">探索小黑子宇宙中的传奇角色</p>
        </div>

        {/* 筛选面板 */}
        <div className="glass rounded-2xl p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="搜索角色、称号或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="搜索角色"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ikun-yellow/50 transition-colors"
              />
            </div>
            <fieldset className="flex items-center gap-2 flex-wrap border-0 p-0 m-0 min-w-0">
              <legend className="sr-only">按稀有度筛选</legend>
              <Filter size={16} className="text-gray-400" aria-hidden="true" />
              {RARITIES.map((rarity) => (
                <button
                  type="button"
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity)}
                  aria-pressed={selectedRarity === rarity}
                  className={
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ' +
                    (selectedRarity === rarity
                      ? 'bg-ikun-yellow/20 text-ikun-yellow border-ikun-yellow/30'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10')
                  }
                >
                  {rarity === 'all' ? '全部' : rarityLabels[rarity]}
                </button>
              ))}
            </fieldset>
          </div>

          <fieldset className="flex flex-wrap gap-2 mt-3 border-0 p-0 m-0 min-w-0">
            <legend className="sr-only">按标签筛选</legend>
            {ALL_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                aria-pressed={selectedTag === tag}
                className={
                  'px-3 py-1 rounded-full text-xs transition-all cursor-pointer ' +
                  (selectedTag === tag
                    ? 'bg-ikun-yellow text-black font-bold'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10')
                }
              >
                #{tag}
              </button>
            ))}
          </fieldset>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500">
              共 <span className="text-ikun-yellow">{filtered.length}</span> / {characters.length}{' '}
              个角色
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-ikun-yellow transition-colors cursor-pointer"
              >
                <X size={12} aria-hidden="true" /> 清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 角色网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              expanded={expandedId === char.id}
              onToggle={() => setExpandedId(expandedId === char.id ? null : char.id)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4" aria-hidden="true">
              🔍
            </div>
            <p className="text-gray-400">没有找到匹配的角色</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm text-ikun-yellow hover:bg-ikun-yellow/10 rounded-lg transition-all cursor-pointer"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CharacterCard({
  character,
  expanded,
  onToggle,
}: {
  character: Character
  expanded: boolean
  onToggle: () => void
}) {
  const color = rarityColors[character.rarity]

  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className="w-full text-left glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
      style={{
        borderColor: expanded ? color : undefined,
        boxShadow: expanded ? `0 0 0 1px ${color}, 0 12px 32px -12px ${color}66` : undefined,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl shrink-0 mt-1" aria-hidden="true">
          {character.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white truncate">{character.name}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {rarityLabels[character.rarity]}
            </span>
          </div>
          <p className="text-sm text-gray-400">{character.title}</p>

          {expanded && (
            <div className="mt-3 animate-fadeUp">
              <p className="text-sm text-gray-300 leading-relaxed mb-3">{character.description}</p>
              <div className="flex flex-wrap gap-2">
                {character.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-white/5 rounded-full text-xs text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

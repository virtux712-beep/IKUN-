import {
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAchievements } from '@/achievements'
import SectionHeader from '@/components/SectionHeader'
import { useToast } from '@/components/Toast'
import { playlist } from '@/data/music'
import {
  getFavoriteSongs,
  getVolume,
  setVolume as persistVolume,
  toggleFavoriteSong,
} from '@/store'

const parseDuration = (d: string): number => {
  const [min, sec] = d.split(':').map(Number)
  return (min || 0) * 60 + (sec || 0)
}

const formatTime = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function MusicPlayer() {
  const toast = useToast()
  const { record } = useAchievements()
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [volume, setVolume] = useState(getVolume)
  const [isMuted, setIsMuted] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(getFavoriteSongs)
  const [shuffle, setShuffle] = useState(false)

  const tickRef = useRef(0)

  const song = playlist[index]
  const totalSeconds = useMemo(() => parseDuration(song.duration), [song.duration])
  const progress = totalSeconds > 0 ? Math.min(100, (elapsed / totalSeconds) * 100) : 0

  const goTo = useCallback((next: number) => {
    setIndex(((next % playlist.length) + playlist.length) % playlist.length)
    setElapsed(0)
  }, [])

  const nextSong = useCallback(() => {
    if (shuffle && playlist.length > 1) {
      let candidate = index
      while (candidate === index) candidate = Math.floor(Math.random() * playlist.length)
      goTo(candidate)
      return
    }
    goTo(index + 1)
  }, [index, shuffle, goTo])

  const prevSong = useCallback(() => goTo(index - 1), [index, goTo])

  // 用真实时间差推进进度，避免 setInterval 累积漂移
  useEffect(() => {
    if (!isPlaying) return
    tickRef.current = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const delta = (now - tickRef.current) / 1000
      tickRef.current = now
      setElapsed((prev) => prev + delta)
    }, 250)
    return () => clearInterval(id)
  }, [isPlaying])

  // 播放结束自动切歌（在 effect 里处理，保证是纯更新）
  useEffect(() => {
    if (!isPlaying) return
    if (elapsed < totalSeconds) return
    nextSong()
  }, [elapsed, totalSeconds, isPlaying, nextSong])

  // 空格键播放/暂停（输入框内不拦截）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const changeVolume = (value: number) => {
    setVolume(value)
    setIsMuted(value === 0)
    persistVolume(value)
  }

  const seekTo = (clientX: number, rect: DOMRect) => {
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setElapsed(ratio * totalSeconds)
  }

  const onToggleFavorite = (id: string) => {
    const next = toggleFavoriteSong(id)
    setFavorites(next)
    record({ type: 'song', count: next.length })
    toast.success(next.includes(id) ? '已收藏到歌单' : '已取消收藏')
  }

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="container-page">
        <SectionHeader
          index="10"
          eyebrow="音乐播放器"
          title="聆听 ikun 专属 BGM"
          description="播放进度基于真实时间差推进，不会因掉帧漂移。空格键播放 / 暂停，进度条支持点击与左右方向键。曲目为氛围演示，不含真实音源。"
          className="mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主播放器 */}
          <section className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8" aria-label="播放器">
            <div className="relative mb-8 flex justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-ikun-yellow/25 to-ikun-golden/5 flex items-center justify-center relative overflow-hidden ring-1 ring-white/10">
                <div
                  className={
                    'text-7xl sm:text-8xl transition-transform duration-500 ' +
                    (isPlaying ? 'animate-spin-slow' : '')
                  }
                  aria-hidden="true"
                >
                  {song.emoji}
                </div>
                <div className="absolute inset-0 rounded-full border border-white/5" />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-full border-2 border-ikun-yellow/25 animate-pulse" />
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{song.title}</h2>
              <p className="text-gray-400">{song.artist}</p>
            </div>

            {/* 进度条 */}
            <div className="mb-6">
              <div
                role="slider"
                tabIndex={0}
                aria-label="播放进度"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                aria-valuetext={`${formatTime(elapsed)} / ${song.duration}`}
                className="relative w-full h-2 bg-white/10 rounded-full cursor-pointer group focus-visible:outline-none"
                onClick={(e) => seekTo(e.clientX, e.currentTarget.getBoundingClientRect())}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault()
                    setElapsed((v) => Math.min(totalSeconds, v + 5))
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault()
                    setElapsed((v) => Math.max(0, v - 5))
                  }
                }}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-ikun-yellow to-ikun-gold rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 w-3.5 h-3.5 bg-ikun-yellow rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow-lg shadow-ikun-yellow/40"
                  style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 tabular-nums">
                <span>{formatTime(elapsed)}</span>
                <span>{song.duration}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShuffle((s) => !s)}
                aria-pressed={shuffle}
                aria-label="随机播放"
                className={
                  'p-2.5 rounded-full transition-all cursor-pointer ' +
                  (shuffle
                    ? 'bg-ikun-yellow/20 text-ikun-yellow'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400')
                }
              >
                <Shuffle size={17} />
              </button>
              <button
                type="button"
                onClick={prevSong}
                aria-label="上一首"
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                <SkipBack size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? '暂停' : '播放'}
                className="p-4 rounded-full bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black transition-all hover:scale-105 cursor-pointer shadow-lg shadow-ikun-yellow/30"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button
                type="button"
                onClick={nextSong}
                aria-label="下一首"
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                <SkipForward size={20} />
              </button>
              <div className="w-[38px]" aria-hidden="true" />
            </div>

            {/* 音量 */}
            <div className="flex items-center gap-3 mt-6 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                aria-label={isMuted ? '取消静音' : '静音'}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="音量"
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-9 text-right tabular-nums">
                {isMuted ? 0 : volume}%
              </span>
            </div>
          </section>

          {/* 播放列表 */}
          <section className="glass rounded-3xl p-4" aria-label="播放列表">
            <div className="flex items-center gap-2 mb-4 px-2">
              <ListMusic size={18} className="text-ikun-yellow" aria-hidden="true" />
              <h3 className="font-bold text-white">播放列表</h3>
              <span className="text-xs text-gray-500">({playlist.length})</span>
            </div>
            <ul className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
              {playlist.map((item, i) => {
                const active = index === i
                return (
                  <li key={item.id}>
                    <div
                      className={
                        'group flex items-center gap-2 rounded-xl transition-colors ' +
                        (active
                          ? 'bg-ikun-yellow/15 ring-1 ring-ikun-yellow/30'
                          : 'hover:bg-white/5')
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          goTo(i)
                          setIsPlaying(true)
                        }}
                        aria-current={active ? 'true' : undefined}
                        className="flex-1 flex items-center gap-3 p-3 text-left cursor-pointer min-w-0"
                      >
                        <span className="text-xl shrink-0" aria-hidden="true">
                          {item.emoji}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className={
                              'block text-sm font-medium truncate ' +
                              (active ? 'text-ikun-yellow' : 'text-white')
                            }
                          >
                            {active && isPlaying && (
                              <span className="inline-block mr-1 animate-pulse" aria-hidden="true">
                                ♪
                              </span>
                            )}
                            {item.title}
                          </span>
                          <span className="block text-xs text-gray-500 truncate">
                            {item.artist}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500 shrink-0 tabular-nums">
                          {item.duration}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(item.id)}
                        aria-label={favorites.includes(item.id) ? '取消收藏' : '收藏'}
                        aria-pressed={favorites.includes(item.id)}
                        className="p-2 mr-1 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        <Heart
                          size={14}
                          className={favorites.includes(item.id) ? 'text-red-400' : 'text-gray-600'}
                          fill={favorites.includes(item.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="flex items-center gap-1.5 text-xs text-gray-600 mt-3 px-2">
              <Music2 size={12} aria-hidden="true" />
              已收藏 {favorites.length} 首
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

import { Check, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useSettings } from '@/settings'
import { THEMES } from '@/settings/themes'

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string
  desc: string
  value: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={value}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <span
        className={
          'w-10 h-5 rounded-full relative shrink-0 transition-colors ' +
          (value ? 'bg-ikun-yellow' : 'bg-white/15')
        }
      >
        <span
          className={
            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ' +
            (value ? 'left-[22px]' : 'left-0.5')
          }
        />
      </span>
    </button>
  )
}

export default function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useSettings()

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[85] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="设置"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <m.div
            className="relative glass rounded-3xl w-full max-w-md max-h-[86vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
              <span className="text-2xl" aria-hidden="true">
                ⚙️
              </span>
              <h2 className="flex-1 font-bold text-white">设置</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 mb-2">主题配色</h3>
                <div className="grid grid-cols-5 gap-2">
                  {THEMES.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => s.setTheme(t.id)}
                      aria-pressed={s.theme === t.id}
                      title={t.name}
                      className={
                        'relative aspect-square rounded-xl border-2 transition-all cursor-pointer ' +
                        (s.theme === t.id
                          ? 'border-white scale-105'
                          : 'border-transparent hover:scale-105')
                      }
                      style={{
                        background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[2]})`,
                      }}
                    >
                      <span className="absolute inset-0 grid place-items-center text-lg">
                        {t.emoji}
                      </span>
                      {s.theme === t.id && (
                        <Check size={14} className="absolute bottom-1 right-1 text-black" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-600 mt-2">
                  当前：{THEMES.find((t) => t.id === s.theme)?.name}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 mb-1">体验</h3>
                <Toggle
                  label="音效"
                  desc="互动项目的合成音效"
                  value={s.sound}
                  onChange={s.toggleSound}
                />
                <Toggle
                  label="鼠标拖尾"
                  desc="桌面端的光标粒子特效"
                  value={s.cursor}
                  onChange={s.toggleCursor}
                />
                <Toggle
                  label="卡片倾斜"
                  desc="鼠标悬停时的 3D 效果"
                  value={s.tilt}
                  onChange={s.toggleTilt}
                />
                <Toggle
                  label="打字鸡叫"
                  desc="键盘输入时随机发出鸡叫（参考 iKun_Keyboard）"
                  value={s.typing}
                  onChange={s.toggleTyping}
                />
                <Toggle
                  label="坤宠挂件"
                  desc="屏幕右下角的小坤宠，可拖动、可互动"
                  value={s.pet}
                  onChange={s.togglePet}
                />
                <Toggle
                  label="减少动态效果"
                  desc="关闭大部分动画，适合晕动敏感人群"
                  value={s.reduceMotion}
                  onChange={s.toggleReduceMotion}
                />
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

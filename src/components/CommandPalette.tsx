import { Command } from 'cmdk'
import { CornerDownLeft, Search } from 'lucide-react'

export interface PaletteCommand {
  id: string
  label: string
  hint?: string
  emoji: string
  keywords?: string[]
  group?: string
  run: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  commands: PaletteCommand[]
}

/**
 * 命令面板基于 cmdk（GitHub 热点项目，周下载量 4600 万+）。
 * Command.Dialog 底层是 Radix Dialog：焦点陷阱、Esc 关闭、
 * 背景滚动锁定、aria 语义都由它负责，这里只做样式与命令注册。
 */
export default function CommandPalette({ open, onClose, commands }: Props) {
  const groups: Record<string, PaletteCommand[]> = {}
  for (const cmd of commands) {
    const key = cmd.group ?? '导航'
    if (!groups[key]) groups[key] = []
    groups[key].push(cmd)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      label="命令面板"
      loop
      className="ikun-cmdk"
    >
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
        <Search size={18} className="text-gray-500 shrink-0" aria-hidden="true" />
        <Command.Input
          placeholder="搜索页面或功能..."
          className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
        />
        <kbd className="hidden sm:inline-flex items-center rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-gray-500 font-mono">
          ESC
        </kbd>
      </div>

      <Command.List className="max-h-[52vh] overflow-y-auto py-2">
        <Command.Empty className="px-4 py-8 text-center text-sm text-gray-500">
          没有匹配的命令
        </Command.Empty>

        {Object.entries(groups).map(([group, items]) => (
          <Command.Group
            key={group}
            heading={group}
            className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-gray-500"
          >
            {items.map((cmd) => (
              <Command.Item
                key={cmd.id}
                value={[cmd.label, cmd.hint, ...(cmd.keywords ?? [])].filter(Boolean).join(' ')}
                onSelect={() => {
                  onClose()
                  requestAnimationFrame(() => cmd.run())
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer text-sm text-gray-200 data-[selected=true]:bg-ikun-yellow/15 data-[selected=true]:text-white rounded-lg mx-2"
              >
                <span className="text-lg w-6 text-center shrink-0" aria-hidden="true">
                  {cmd.emoji}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{cmd.label}</span>
                  {cmd.hint && (
                    <span className="block text-xs text-gray-500 truncate">{cmd.hint}</span>
                  )}
                </span>
                <CornerDownLeft
                  size={14}
                  className="text-ikun-yellow shrink-0 opacity-0 group-data-[selected=true]:opacity-100"
                  aria-hidden="true"
                />
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>

      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/10 text-[11px] text-gray-500">
        <span>↑↓ 选择</span>
        <span>↵ 打开</span>
        <span className="ml-auto">Ctrl K</span>
      </div>
    </Command.Dialog>
  )
}

interface SectionHeaderProps {
  /** 章节序号，如 "01" */
  index?: string
  /** 章节分类名，如 "文化档案" */
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

/**
 * 统一的章节标题：序号 + 分类 + 大标题 + 说明。
 * 对应设计稿里的「01 / 文化档案」那一组。
 */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <header className={(centered ? 'text-center ' : '') + className}>
      <div className={'eyebrow mb-4 ' + (centered ? 'justify-center' : '')}>
        {index && (
          <>
            <span className="eyebrow-index">{index}</span>
            <span className="text-white/25">/</span>
          </>
        )}
        <span>{eyebrow}</span>
      </div>

      <h2 className="display-title mb-4">{title}</h2>

      {description && (
        <p className={'lede text-pretty ' + (centered ? 'mx-auto' : '')}>{description}</p>
      )}
    </header>
  )
}

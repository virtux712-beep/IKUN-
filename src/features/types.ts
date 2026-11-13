import type { ComponentType } from 'react'

export type FeatureCategory = 'reaction' | 'memory' | 'generator' | 'quiz' | 'audio' | 'tool'

export interface FeatureDef {
  id: string
  emoji: string
  title: string
  desc: string
  category: FeatureCategory
  tags: string[]
  Component: ComponentType
}

export const CATEGORY_META: Record<FeatureCategory, { label: string; emoji: string }> = {
  reaction: { label: '反应挑战', emoji: '⚡' },
  memory: { label: '脑力对决', emoji: '🧠' },
  generator: { label: '只因生成器', emoji: '🎨' },
  quiz: { label: '灵魂测试', emoji: '📊' },
  audio: { label: '音效怪谈', emoji: '🎵' },
  tool: { label: '沙雕工具', emoji: '🔧' },
}

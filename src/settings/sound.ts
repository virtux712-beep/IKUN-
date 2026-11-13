/**
 * 全局音效开关。
 * 放在模块作用域，方便 UI 工具层（features/ui.tsx）在合成音效前直接判断，
 * 避免为了一个布尔值引入 React 上下文依赖。
 */
let soundEnabled = true
let motionEnabled = true

export function isSoundEnabled(): boolean {
  return soundEnabled
}

export function setSoundEnabled(value: boolean): void {
  soundEnabled = value
}

export function isMotionEnabled(): boolean {
  return motionEnabled
}

export function setMotionEnabled(value: boolean): void {
  motionEnabled = value
}

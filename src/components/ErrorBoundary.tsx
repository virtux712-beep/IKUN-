import { Home, RotateCcw } from 'lucide-react'
import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 顶层错误边界：任何页面渲染异常时给出可恢复的界面，
 * 而不是让用户面对一片白屏。
 */
export default class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[IKUN之家] 页面渲染异常:', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ error: null })
  }

  private handleHome = () => {
    window.location.hash = '#/home'
    this.setState({ error: null })
  }

  override render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-ikun-black text-white">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🐔💥</div>
          <h1 className="text-xl font-bold mb-2">页面出了点小状况</h1>
          <p className="text-sm text-gray-400 mb-1">别慌，鸡还在锅里。</p>
          <p className="text-xs text-gray-500 font-mono break-all mb-6">
            {error.message || '未知错误'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ikun-yellow text-black font-bold text-sm hover:bg-ikun-gold transition-colors cursor-pointer"
            >
              <RotateCcw size={16} /> 重试
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors cursor-pointer"
            >
              <Home size={16} /> 回首页
            </button>
          </div>
        </div>
      </div>
    )
  }
}

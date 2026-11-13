import { toast as sonner, Toaster } from 'sonner'

/**
 * Toast 基于 sonner（GitHub 热点项目，周下载量 5700 万+）。
 * 保留原有的 useToast() 调用方式，业务代码无需改动。
 */

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastApi {
  toast: (message: string, kind?: ToastKind) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const api: ToastApi = {
  toast: (message, kind = 'info') => {
    if (kind === 'success') sonner.success(message)
    else if (kind === 'error') sonner.error(message)
    else sonner.info(message)
  },
  success: (message) => sonner.success(message),
  error: (message) => sonner.error(message),
  info: (message) => sonner.info(message),
}

export function useToast(): ToastApi {
  return api
}

/** 全局唯一的 Toast 容器，挂在应用根部 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="bottom-center"
        closeButton
        richColors
        duration={2400}
        gap={8}
        offset={20}
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 20, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '12px',
          },
        }}
      />
    </>
  )
}

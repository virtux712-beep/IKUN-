/**
 * 分享卡片：纯 Canvas 绘制 + Web Share API。
 * 不依赖任何图片资源，也不上传到服务器——图片完全在本地生成。
 */

export interface ShareStat {
  label: string
  value: string
}

export interface ShareCardData {
  emoji: string
  title: string
  subtitle?: string
  badge?: string
  stats: ShareStat[]
  footer?: string
}

const W = 1080
const H = 1350

function roundRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", serif'
const CN_FONT = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'

export function drawShareCard(data: ShareCardData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  // 背景渐变
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0d0d0d')
  bg.addColorStop(0.55, '#171208')
  bg.addColorStop(1, '#2a2008')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 顶部光晕
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.26, 0, W * 0.5, H * 0.26, 640)
  glow.addColorStop(0, 'rgba(255,215,0,0.20)')
  glow.addColorStop(1, 'rgba(255,215,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // 边框
  ctx.strokeStyle = 'rgba(255,215,0,0.32)'
  ctx.lineWidth = 4
  roundRect(ctx, 40, 40, W - 80, H - 80, 44)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 大 emoji
  ctx.font = `200px ${EMOJI_FONT}`
  ctx.fillText(data.emoji, W / 2, 330)

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 78px ${CN_FONT}`
  ctx.fillText(data.title, W / 2, 520, W - 180)

  // 副标题
  if (data.subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = `34px ${CN_FONT}`
    ctx.fillText(data.subtitle, W / 2, 600, W - 220)
  }

  // 徽章
  if (data.badge) {
    ctx.font = `bold 40px ${CN_FONT}`
    const tw = ctx.measureText(data.badge).width
    const bw = tw + 96
    const bx = (W - bw) / 2
    const by = 660
    ctx.fillStyle = 'rgba(255,215,0,0.16)'
    roundRect(ctx, bx, by, bw, 92, 46)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,215,0,0.45)'
    ctx.lineWidth = 3
    roundRect(ctx, bx, by, bw, 92, 46)
    ctx.stroke()
    ctx.fillStyle = '#FFD700'
    ctx.textBaseline = 'middle'
    ctx.fillText(data.badge, W / 2, by + 48)
  }

  // 数据行
  const startY = 830
  const rowH = 96
  data.stats.slice(0, 4).forEach((stat, i) => {
    const y = startY + i * rowH
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = `34px ${CN_FONT}`
    ctx.fillText(stat.label, 150, y)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#FFD700'
    ctx.font = `bold 42px ${CN_FONT}`
    ctx.fillText(stat.value, W - 150, y)

    if (i < data.stats.length - 1 && i < 3) {
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(150, y + 46)
      ctx.lineTo(W - 150, y + 46)
      ctx.stroke()
    }
  })

  // 底部分隔线
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(150, H - 190)
  ctx.lineTo(W - 150, H - 190)
  ctx.stroke()

  // 页脚
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = `30px ${CN_FONT}`
  ctx.fillText(data.footer ?? 'IKUN之家 · 小黑子的专属精神家园', W / 2, H - 130)

  ctx.fillStyle = 'rgba(255,215,0,0.55)'
  ctx.font = `26px ${CN_FONT}`
  ctx.fillText('🐔 ikun-home', W / 2, H - 78)

  return canvas
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

function download(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

/**
 * 优先调起系统分享面板（移动端体验最好），
 * 不支持时降级为直接下载 PNG。
 */
export async function shareCard(
  data: ShareCardData,
  options: { filename?: string; text?: string } = {},
): Promise<ShareResult> {
  const canvas = drawShareCard(data)
  const filename = options.filename ?? 'ikun-share.png'
  const text = options.text ?? data.title

  try {
    const blob = await toBlob(canvas)
    if (blob && typeof navigator.canShare === 'function' && typeof navigator.share === 'function') {
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: data.title, text })
        return 'shared'
      }
    }
  } catch (err) {
    // 用户取消分享会抛 AbortError，这里不当作失败
    if (err instanceof Error && err.name === 'AbortError') return 'cancelled'
  }

  download(canvas, filename)
  return 'downloaded'
}

export function previewShareCard(data: ShareCardData): string {
  return drawShareCard(data).toDataURL('image/png')
}

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // 相对路径：同时适配 GitHub Pages 的 /<repo>/ 子路径、Nginx 根路径和本地 file:// 预览
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // PWA：离线可用 + 可安装 + 自动更新
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'IKUN之家 · 小黑子的专属精神家园',
        short_name: 'IKUN之家',
        description: '图鉴、表情包、音乐、小游戏、纯度测试、留言墙，唱跳 rap 篮球一个都不能少。',
        lang: 'zh-CN',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        categories: ['entertainment', 'games'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // 使用 hash 路由，所有导航都落在 index.html，无需 SPA 回退
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        // 单页应用：把按需加载的页面 chunk 也一起预缓存
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // 把不常变的第三方库拆成独立 chunk，发版时用户只需重新下载业务代码
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion-vendor'
          if (id.includes('sonner') || id.includes('cmdk') || id.includes('@radix-ui')) {
            return 'ui-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
})

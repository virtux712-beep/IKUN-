# 🐔 IKUN之家

> **小黑子的专属精神家园**

[![CI](https://github.com/virtux712-beep/IKUN-/actions/workflows/ci.yml/badge.svg)](https://github.com/virtux712-beep/IKUN-/actions/workflows/ci.yml)
[![Deploy](https://github.com/virtux712-beep/IKUN-/actions/workflows/deploy.yml/badge.svg)](https://github.com/virtux712-beep/IKUN-/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

React 19 + TypeScript + Vite 8 + Tailwind CSS 4 构建的深色玻璃拟态单页应用。离线可用（PWA）、可安装、带单元测试与 CI 级代码检查。

🌐 **线上演示**：[ikunzhijia.byethost5.com](http://ikunzhijia.byethost5.com/) · [GitHub Pages 镜像](https://virtux712-beep.github.io/IKUN-/)
📦 **最新发行版**：[v1.1.0](https://github.com/virtux712-beep/IKUN-/releases/tag/v1.1.0)（更新日志见 [CHANGELOG.md](./CHANGELOG.md)）

---

## 🚀 快速开始

```bash
pnpm install        # 或 npm install

pnpm dev            # 开发      → http://localhost:5173
pnpm build          # 类型检查 + 生产构建
pnpm preview        # 预览生产构建
pnpm test           # 单元测试（Vitest）
pnpm lint           # Biome 检查（lint + 格式）
pnpm lint:fix       # 自动修复
```

### 🌐 部署到 GitHub Pages

仓库已内置 `.github/workflows/deploy.yml`，推到 `main` 就会自动构建并发布。

本仓库已启用 Pages（Settings → Pages → Source 选择 **GitHub Actions**），推送 `main` 后自动构建发布：

👉 **https://virtux712-beep.github.io/IKUN-/**

（Fork 本仓库自部署时，把上面链接换成你自己的用户名与仓库名即可。）

> 项目使用 **hash 路由**（`#/memes`）且 `base: './'`，所以部署在任意子路径下都不会白屏，无需额外配置 404 回退。

### 🐳 Docker 部署

```bash
docker compose up -d          # → http://localhost:3000

# 或手动
docker build -t ikun-home .
docker run -d -p 3000:80 ikun-home
```

---

## 🧭 技术选型：参考 GitHub / npm 热点项目

选型依据是 npm 真实周下载量，而不是「看起来流行」。

| 能力 | 选用 | 周下载量 | 替代了什么 | 收益 |
| --- | --- | --- | --- | --- |
| 动画 | **motion** (Framer Motion) | 3380 万 | 手写 CSS keyframes | `AnimatePresence` 支持**退出动画**（CSS 做不到）、弹簧物理过渡、`useReducedMotion` 无障碍 |
| 轻提示 | **sonner** | 5737 万 | 手写 Toast 组件（约 120 行） | 自动堆叠、关闭按钮、aria-live、Promise 态 |
| 命令面板 | **cmdk** | 4671 万 | 手写键盘导航（约 180 行） | 基于 Radix Dialog：**焦点陷阱 / Esc / 滚动锁定 / 模糊匹配**开箱即用 |
| 离线与安装 | **vite-plugin-pwa** | 736 万 | 无 | Service Worker 预缓存 30 个资源，断网可用、可添加到桌面、自动更新 |
| 单元测试 | **vitest** | 1.79 亿 | 无 | 27 个测试覆盖存储层、数据完整性与坤签数据 |
| Lint + 格式 | **Biome** | 2646 万 | oxlint（仅 lint） | 一个工具同时管 lint 与格式化，比 ESLint+Prettier 快一个数量级 |

**没有采纳的**：`zustand`（9112 万下载）——本项目状态只有「当前标签页」一层，用 props 传递比引入全局 store 更简单，属于过度设计。

---

## ✨ 功能

### 🏠 首页
- Canvas 粒子网络背景：DPR 适配、按视口面积自适应粒子数、页面隐藏自动暂停
- 网格底纹 + 浮动装饰层 + 数字滚动数据看板
- 功能卡片网格与主 CTA

### 📖 IKUN 图鉴
- 12 个角色，稀有度 / 标签 / 关键词三重筛选
- 卡片即 `<button>`，键盘 Enter / Space 可展开
- 实时显示命中数，一键清除筛选

### 😱 表情包中心
- 18 个表情包、7 个分类，复制 / Canvas 生成 PNG 下载 / 收藏
- 预览弹层用 motion 做**进入 + 退出**动画，Esc 关闭

### 🎵 音乐播放器
- 基于真实时间差推进进度（掉帧不漂移），进度条支持点击与键盘左右键
- 随机播放、收藏持久化、音量记忆、全局空格键控制

### 🎮 小游戏
| 游戏 | 关键实现 |
| --- | --- |
| 🏀 接篮球 | 单一 `requestAnimationFrame` 循环 + ref 状态，时间步长归一化 |
| 🐔 抓鸡 | Pointer Events 统一鼠标/触摸，递归定时器随分数加速 |
| ⚡ 反应测试 | 定时器完整生命周期，抢跑判定，S~D 评级 |
| 🧪 纯度测试 | 15 题，SVG 环形进度条出分 |
| 🎯 投篮挑战 | rAF + delta 时间跑针（帧率无关），绿区 / 完美球判定，最佳连进 localStorage 持久化，空格出手 |
| 🎹 坤坤琴键 | WebAudio 双振荡器合成音色（零音频资源），五声音阶五键，键盘 1–5 + 示范弹奏 |
| 🔮 今日坤签 | 8 支签文数据与逻辑分离（可注入随机源，已单测），连抽同签自动顺延，aria-live 播报 |

### 💬 留言墙
发布 / 点赞 / 8 种表情反应 / 评论，昵称记忆，选择器点击外部关闭，中文输入法回车不误触发。

### ⌨️ 全局能力
- **`Ctrl / Cmd + K`** 命令面板（cmdk）：模糊搜索页面、复制链接、召唤彩蛋
- **`Esc`** 关闭任意弹层 / 游戏返回菜单
- 顶部阅读进度条 + 回到顶部
- Hash 路由（`#/memes`），支持刷新保持与前进后退，自动同步 `document.title`

### 🎉 隐藏彩蛋
连续点击 Logo 5 次，或键盘依次输入 `ikun`（输入框内不触发）。

---

## 📈 优化升级记录

### 第一轮：正确性与性能
- **修复接篮球无限渲染循环**：碰撞检测 effect 依赖 `balls` 又在内部 `setBalls`，且存在在 updater 中 setState 的违规写法 → 重写为单一 rAF 循环
- **修复抓鸡移动端重复计分**（`touchstart` + `click` 双触发）、特效定时器泄漏
- **修复反应测试「幽灵变绿」**：抢跑后定时器未清理，几秒后屏幕莫名变绿
- **修复音乐播放器非法 DOM**：播放列表 `<button>` 内嵌 `<button>`
- **修复访问量刷量**：切回首页就 +1 → 改为每会话只计一次
- 路由级代码分割，移除 Google Fonts 外链（消除国内首屏阻塞）

### 第二轮：接入热点项目
- motion 页面转场 + 弹层退出动画
- sonner 替换手写 Toast，cmdk 替换手写命令面板
- PWA：Service Worker 预缓存、可安装、离线可用、自动更新
- Vitest 27 个单元测试（存储层 + 数据完整性 + 坤签数据）
- Biome 统一 lint 与格式化，**0 error 0 warning**
- 按 vendor 拆包：`react-vendor` / `motion-vendor` / `ui-vendor`，发版只失效业务代码

### 第三轮：内容扩展（v1.1.0，2026-11-13）
- 小游戏中心 +3：投篮挑战、坤坤琴键、今日坤签（原型为单页小游戏，移植为 React 组件并入发行版）
- 坤签数据抽为 `src/data/fortunes.ts` 并补单元测试（25 → 27 个）
- 线上演示站同步升级 v1.1.0；GitHub Pages 镜像启用

### ♿️ 无障碍
- 全站 `type="button"`、`:focus-visible` 焦点环、跳过导航链接
- `role="group"` → `<fieldset>` + `<legend class="sr-only">`
- `aria-current` / `aria-pressed` / `aria-expanded` / `aria-modal` / `aria-live`
- 完整 `prefers-reduced-motion` 降级
- 游戏区 `role="application"`，生命值 `role="status"`，SVG 补 `<title>`

### 🔧 工程化
- TypeScript `strict` + `noImplicitOverride`
- Biome 同时承担 lint 与格式化（替代 oxlint）
- Vitest + 27 个测试
- Dockerfile 改用 pnpm + `--frozen-lockfile`，修复健康检查缺 `curl` 的问题
- nginx：HTML 不缓存 / 静态资源 immutable、CSP 等安全头
- 补齐 `robots.txt`、`sitemap.xml`、OG/Twitter 卡片、JSON-LD

---

## 📊 产物体积

```
react-vendor  121.4 kB gz   React 运行时（长缓存）
index.css      11.9 kB gz   Tailwind + 自定义样式
Games          11.8 kB gz   小游戏中心（7 款游戏，按需加载）
index           9.3 kB gz   业务代码
vendor          5.1 kB gz   motion / sonner / cmdk 等第三方库
其他页面 chunk  0.8 ~ 3.5 kB gz   按需加载
```

（v1.1.0 生产构建实测，gzip 后大小。）

首屏约 **148 kB gz**，PWA 预缓存后二次访问接近 0 请求。

---

## 📁 项目结构

```
ikun-home/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # lint + typecheck + test + build
│   │   └── deploy.yml            # 自动发布到 GitHub Pages
│   └── dependabot.yml            # 依赖自动升级
├── docs/
│   ├── IKUN之家-运行教程.docx
│   └── IKUN之家-运行教程.md            # 同上（Markdown 版）
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png / pwa-512x512.png / pwa-maskable-512x512.png
│   ├── apple-touch-icon.png
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── Navbar.tsx            # 导航栏（移动端菜单、Esc、滚动锁）
│   │   ├── Footer.tsx
│   │   ├── ParticleBackground.tsx
│   │   ├── StatsCounter.tsx
│   │   ├── EasterEgg.tsx
│   │   ├── Toast.tsx             # sonner 封装
│   │   ├── ErrorBoundary.tsx
│   │   ├── ScrollProgress.tsx
│   │   └── CommandPalette.tsx    # cmdk
│   ├── pages/
│   │   ├── Home.tsx / Encyclopedia.tsx / MemeCenter.tsx
│   │   ├── MusicPlayer.tsx / Games.tsx / MessageBoard.tsx / Search.tsx
│   │   └── games/{CatchBasketball,CatchChicken,ReactionTest,PurityTest,ShootingChallenge,KunPiano,FortuneDraw}.tsx
│   ├── data/                     # 角色 / 表情包 / 音乐 / 题库
│   ├── store/                    # LocalStorage 封装（+ 单元测试）
│   ├── hooks/                    # useHotkey / useOnClickOutside / ...
│   ├── test/mockStorage.ts       # 测试用存储桩
│   ├── types/                    # 类型与 TabId 守卫
│   ├── App.tsx                   # 布局 + 懒加载路由 + motion 转场
│   ├── main.tsx
│   └── index.css
├── biome.json
├── .editorconfig
├── vitest.config.ts
├── vite.config.ts                # PWA + 拆包配置
├── nginx.conf
├── Dockerfile / docker-compose.yml / .dockerignore
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

---

## 🎨 设计规范

- **主题色**：`#0a0a0a` 深黑底 + `#FFD700` 主黄 + 金色渐变
- **玻璃质感**：`backdrop-filter: blur(20px) saturate(140%)`，不支持的浏览器降级为不透明
- **圆角**：卡片 `rounded-2xl`，容器 `rounded-3xl`
- **动效**：统一 `cubic-bezier(0.22, 1, 0.36, 1)`，入场 stagger 0.05s 递增
- **响应式**：`sm / lg` 双断点，移动端输入框字号 ≥16px 防 iOS 缩放

---

## 🔧 后续可扩展

数据全部落在本地存储，接后端时只需替换 `src/store/index.ts`：

- 用户注册 / 登录（JWT / OAuth）
- 后端 API（Node.js / Go / Python）
- 数据库（PostgreSQL / MongoDB）
- WebSocket 实时留言
- 真实音频源与歌词同步

---

## 📄 License

MIT License - 纯属娱乐，请勿对号入座 🐔
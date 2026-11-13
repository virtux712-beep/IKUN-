# 🐔 IKUN之家

> **小黑子的专属精神家园**

[![CI](https://github.com/USERNAME/ikun-home/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/ikun-home/actions/workflows/ci.yml)
[![Deploy](https://github.com/USERNAME/ikun-home/actions/workflows/deploy.yml/badge.svg)](https://github.com/USERNAME/ikun-home/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

React 19 + TypeScript + Vite 8 + Tailwind CSS 4 构建的深色玻璃拟态单页应用。离线可用（PWA）、可安装、带单元测试与 CI 级代码检查。

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

首次使用需要在 GitHub 上做两件事：

1. **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
2. 把本 README 顶部徽章里的 `USERNAME` 换成你的 GitHub 用户名（可选，只是徽章链接）

之后访问 `https://<用户名>.github.io/<仓库名>/` 即可。

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
| 离线与安装 | **vite-plugin-pwa** | 736 万 | 无 | Service Worker 预缓存 33 个资源，断网可用、可添加到桌面、自动更新 |
| 单元测试 | **vitest** | 1.79 亿 | 无 | 44 个测试覆盖存储层、数据完整性、互动项目注册表、成就定义与坤签逻辑 |
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
| 🎯 投篮挑战 | rAF 跑针 + 区间命中判定（绿区 / 完美球），最佳连进持久化 |
| 🎹 坤坤琴键 | WebAudio 双振荡器合成音色，五声音阶 + 示范弹奏 |
| 🔮 今日坤签 | 签文数据与抽签逻辑分离，同签连抽自动顺延 |

### 💬 留言墙
发布 / 点赞 / 8 种表情反应 / 评论，昵称记忆，选择器点击外部关闭，中文输入法回车不误触发。

### 🖼️ v2.2 分享与借鉴

| 能力 | 说明 |
| --- | --- |
| **分享卡片** | Canvas 生成 1080×1350 分享图，走 `navigator.share`，不支持时下载 PNG |
| **全屏答题** | 纯度测试改为移动端单题单屏 + 即时反馈 |
| **打字鸡叫** | 键盘输入随机触发鸡叫（默认关闭） |
| **坤宠挂件** | 右下角可拖动的小坤宠，9 种动作与台词 |
| **60 个表情包** | 从 18 个扩充到 60 个，覆盖 6 大分类 |

同题材项目调研见 [`docs/BENCHMARK.md`](./docs/BENCHMARK.md)，设计令牌见 [`docs/DESIGN-TOKENS.md`](./docs/DESIGN-TOKENS.md)。

### 🎨 v2.0 全局系统

参考 GitHub 上的趣味项目，给整个站点加了一层「元游戏」与氛围层：

| 系统 | 说明 |
| --- | --- |
| 🏆 **成就徽章** | 20 个可解锁成就，贯穿全站行为（浏览、收藏、游戏、实验室、彩蛋…），导航栏实时显示进度 |
| 🎨 **主题换肤** | 5 套配色（经典金 / 樱花粉 / 薄荷绿 / 星云紫 / 深海蓝），CSS 变量驱动，持久化 |
| ✨ **光标拖尾** | 桌面端金色粒子拖尾，参考 `tholman/cursor-effects`，触屏自动禁用 |
| 🃏 **3D 倾斜卡片** | 鼠标悬停卡片跟随倾斜 + 高光，参考 `vanilla-tilt.js`，零依赖 |
| 🧲 **物理沙盒** | 自研圆体物理引擎：重力积分、墙壁反弹、圆-圆弹性碰撞、质量冲量解算，可拖拽投掷 |
| ⚙️ **设置面板** | 主题 / 音效 / 拖尾 / 倾斜 / 减少动效，统一开关并持久化 |

**成就列表（20 个）**

初次到访 · 全站通 · 图鉴学者 · 表情包收藏家 · 音乐发烧友 · 游戏高手 · 实验室常客 · 实验室狂人 · 全知者 · 话痨 · 点赞狂魔 · 搜索达人 · 键盘侠 · 彩蛋猎人 · 换肤达人 · 夜猫子 · 手速之神 · 只因之神 · 三日忠实粉 · IKUN 之神

### 🧪 互动实验室（40 个）

全部纯前端实现，**零外部资源、零后端**，断网也能玩。入口：导航栏「实验室」。

| 分类 | 数量 | 项目 |
| --- | --- | --- |
| ⚡ 反应挑战 | 8 | 铁山靠格挡 · 鸡你太美节奏点击 · 两年半精准计时 · 打柠檬 · 只因打地鼠 · 手速测试 CPS · 找不同的鸡 · 罚球挑战 |
| 🧠 脑力对决 | 6 | 唱跳 rap 接龙 · 鸡窝翻牌 · 井字棋（minimax AI）· 只因迷宫 · 只因华容道 · 猜数字 |
| 🎨 只因生成器 | 8 | 只因体生成器 · 表情包生成器 · IKUN 昵称生成器 · 小黑子身份证 · 坤坤语录生成器 · 只因翻译器 · 篮球头像生成器 · 鸡窝签名生成器 |
| 📊 灵魂测试 | 5 | 你是哪种 ikun · 小黑子段位测试 · ikun 成分分析（雷达图）· 只因指数计算器 · 今日运势 |
| 🎵 音效怪谈 | 6 | 鸡叫模拟器 · 铁山靠音效板 · 只因时钟 · 功德木鱼 · 鸡头稳定器 · 篮球弹跳 |
| 🔧 沙雕工具 | 7 | 只因计算器 · 鸡你太美打字机 · 反小黑子检测器 · 鸡腿转盘 · 今日鸡腿 · 只因倒计时 · 弹幕鸡窝 |

技术要点：

- **音效全部用 Web Audio API 实时合成**，没有任何 mp3 / wav 文件，加载零成本
- **Canvas 生成器**（表情包 / 身份证 / 头像）可直接导出 PNG 下载
- 游戏类统一用「ref 存状态 + 单一 rAF 循环」，避免 React 高频 setState 抖动
- 实验室整体路由懒加载，独立 chunk 仅 **23.5 kB gz**，不影响首页

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
- Vitest 25 个单元测试（存储层 + 数据完整性 + 类型守卫）
- Biome 统一 lint 与格式化，**0 error 0 warning**
- 按 vendor 拆包：`react-vendor` / `motion-vendor` / `ui-vendor`，发版只失效业务代码

### ♿️ 无障碍
- 全站 `type="button"`、`:focus-visible` 焦点环、跳过导航链接
- `role="group"` → `<fieldset>` + `<legend class="sr-only">`
- `aria-current` / `aria-pressed` / `aria-expanded` / `aria-modal` / `aria-live`
- 完整 `prefers-reduced-motion` 降级
- 游戏区 `role="application"`，生命值 `role="status"`，SVG 补 `<title>`

### 🔧 工程化
- TypeScript `strict` + `noImplicitOverride`
- Biome 同时承担 lint 与格式化（替代 oxlint）
- Vitest + 25 个测试
- Dockerfile 改用 pnpm + `--frozen-lockfile`，修复健康检查缺 `curl` 的问题
- nginx：HTML 不缓存 / 静态资源 immutable、CSP 等安全头
- 补齐 `robots.txt`、`sitemap.xml`、OG/Twitter 卡片、JSON-LD

---

## 📊 产物体积

```
react-vendor   79.2 kB gz   React 运行时（长缓存）
motion-vendor  34.6 kB gz   动画引擎（长缓存）
ui-vendor       9.1 kB gz   sonner + cmdk + Radix Dialog
index           9.0 kB gz   业务代码
index.css      11.5 kB gz   Tailwind + 自定义样式
其他页面 chunk  0.8 ~ 8.5 kB gz   按需加载
```

首屏约 **148 kB gz**，PWA 预缓存后二次访问接近 0 请求。

> 💡 如果只需要淡入淡出、不想要退出动画，可以把 motion 换成浏览器原生 **View Transitions API**，能省下 34.6 kB gz。

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
│   └── IKUN之家-运行教程.docx
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
│   ├── settings/                 # 主题 / 音效 / 特效设置
│   │   ├── themes.ts             # 5 套配色定义
│   │   ├── index.tsx             # SettingsProvider
│   │   └── sound.ts              # 模块级音效开关
│   ├── achievements/             # 20 个成就定义与追踪
│   │   └── index.tsx
│   ├── features/                 # 40 个互动项目
│   │   ├── types.ts              # 分类与定义类型
│   │   ├── ui.tsx                # 共享按钮/进度条/音效合成/计时 Hook
│   │   ├── registry.ts           # 40 项注册表
│   │   ├── reaction.tsx          # 反应挑战 ×8
│   │   ├── memory.tsx            # 脑力对决 ×6
│   │   ├── generators.tsx        # 只因生成器 ×8
│   │   ├── quizzes.tsx           # 灵魂测试 ×5
│   │   ├── audio.tsx             # 音效怪谈 ×6
│   │   └── tools.tsx             # 沙雕工具 ×7
│   ├── pages/
│   │   ├── Home.tsx / Encyclopedia.tsx / MemeCenter.tsx
│   │   ├── MusicPlayer.tsx / Games.tsx / MessageBoard.tsx / Search.tsx
│   │   ├── Lab.tsx               # 互动实验室（40 项网格 + 弹层）
│   │   ├── Sandbox.tsx           # 鸡窝物理沙盒
│   │   └── games/{CatchBasketball,CatchChicken,ReactionTest,PurityTest}.tsx
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

## 🤖 AI 协作（Vibe Coding 就绪）

本仓库按「AI 可直接接手」的标准组织，主流编码工具都能拿到准确的上下文：

| 文件 | 适配的工具 |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | 通用标准（Codex / Jules / Cursor / Windsurf 等） |
| [`CLAUDE.md`](./CLAUDE.md) | Claude Code |
| [`.cursor/rules/ikun.mdc`](./.cursor/rules/ikun.mdc) | Cursor |
| [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) | GitHub Copilot |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 人 + AI 都适用的架构说明 |

**一个命令验证所有改动：**

```bash
pnpm verify   # biome check → tsc -b → vitest run → vite build
```

CI（`.github/workflows/ci.yml`）跑的就是同一条命令，本地绿了线上就绿。

**为什么这样组织：**

- **约定写进可执行检查**，而不是只写在文档里 —— `type="button"`、`div` 不许挂 `onClick`、禁止 `any`，全部由 Biome 拦截
- **结构自检** —— `registry.test.ts` 校验 40 个互动项目的 id 唯一、分类合法、组件已挂载；新增项目忘了注册会直接测试失败
- **纯数据与 UI 分离** —— `achievements/definitions.ts`、`settings/themes.ts`、`features/types.ts` 都不依赖 React，AI 检索和单测都不需要理解组件上下文
- **单一事实来源** —— 本地 `pnpm verify` 与 CI 完全一致，避免「本地过了线上挂」

---

## 📄 License

MIT License - 纯属娱乐，请勿对号入座 🐔
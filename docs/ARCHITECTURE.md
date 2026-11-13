# 架构说明

## 1. 总体形态

```
浏览器
  └─ index.html
       └─ main.tsx
            └─ <App>
                 ├─ SettingsProvider     主题 / 音效 / 特效
                 │    └─ ToastProvider    sonner
                 │         └─ AchievementProvider   成就追踪
                 │              └─ <AppShell>      布局 + 路由
                 │                   ├─ ParticleBackground    Canvas 粒子
                 │                   ├─ CursorTrail           光标粒子
                 │                   ├─ Navbar / Footer
                 │                   ├─ <main>  ← 懒加载页面（Hash 路由）
                 │                   ├─ CommandPalette / AchievementsPanel / SettingsPanel
                 │                   └─ EasterEgg
                 └─ Service Worker（PWA，生产环境注册）
```

**没有后端。** 所有数据落在 `localStorage`，所有音效由 Web Audio API 实时合成，没有音频文件。

---

## 2. 路由

自定义 **Hash 路由**，不用 React Router。

| 位置 | 职责 |
| --- | --- |
| `src/types/index.ts` | `TabId` 联合类型 + `TAB_IDS` 数组 + `isTabId()` 守卫 |
| `src/App.tsx` | `readTabFromHash()` 解析、`navigate()` 写入、`hashchange` 监听 |
| `src/App.tsx` 的 `renderPage()` | `switch (activeTab)` 映射到页面组件 |

新增页面必须三处同步，否则 `#/xxx` 会被降级成 `home`。

**为什么用 Hash 路由**：纯静态托管时，`/memes` 这类路径需要服务器配合 `try_files` 回退；`#/memes` 永远只请求 `index.html`，可以丢到任意静态托管（含 GitHub Pages 子目录）而不 404。

---

## 3. 状态管理

没有引入 Redux / Zustand，分三层：

| 层 | 位置 | 用途 |
| --- | --- | --- |
| 组件内 | `useState` / `useRef` | 页面局部状态、游戏循环 |
| 跨组件 | React Context | `SettingsProvider`、`AchievementProvider`、`ToastProvider` |
| 持久化 | `src/store/index.ts` | localStorage 读写，全部 try/catch 兜底 |

**localStorage 键位一览**

| 键 | 内容 |
| --- | --- |
| `ikun_messages` | 留言墙数据 |
| `ikun_favorites` | 通用收藏 |
| `ikun_favorite_songs` | 收藏歌曲 |
| `ikun_meme_collection` | 收藏表情包 |
| `ikun_game_scores` | 游戏分数 |
| `ikun_purity_history` | 纯度测试历史 |
| `ikun_visit_count` | 访问计数（sessionStorage 控制每会话只 +1） |
| `ikun_nickname` / `ikun_volume` | 用户偏好 |
| `ikun_settings_v2` | 主题与开关 |
| `ikun_stats_v2` | 成就统计 |
| `ikun_unlocked_v2` | 已解锁成就 |

---

## 4. 样式系统

Tailwind CSS 4，主题令牌定义在 `src/index.css` 的 `@theme` 块：

```css
@theme {
  --color-ikun-yellow: #ffd700;
  --color-ikun-gold: #f5c842;
  --color-ikun-golden: #daa520;
  ...
}
```

Tailwind 会把这些编译成 `var(--color-ikun-yellow)`，所以**换肤只需覆盖变量**：

```css
html[data-theme='sakura'] { --color-ikun-yellow: #ff7eb6; ... }
```

`html[data-theme]`（特异性 0,1,1）高于 `:root`（0,1,0），因此必然生效，且不需要重新构建样式。

自定义工具类：`.glass`（毛玻璃）、`.text-gradient-gold`、`.bg-grid`、`.mask-fade-b`、`.tilt-spot`、`.no-scrollbar`。

---

## 5. 互动项目（features）

40 个项目共享一套轻量框架：

```
features/
├── types.ts      FeatureDef { id, emoji, title, desc, category, tags, Component }
├── ui.tsx        Btn / Bar / Row / Hint / Chip / useRecord / useRaf / useCountdown / tone / sweep / SFX
├── registry.ts   40 条注册项
└── *.tsx         按分类分组的具体实现
```

`Lab.tsx` 负责网格展示与弹层外壳，**每个项目组件只管自己的内容区**。

**性能约定**：实时游戏一律采用

```ts
const state = useRef({ ... })        // 状态放 ref，避免闭包过期
useEffect(() => {
  const id = setInterval(() => {
    // 改 state.current
    forceRender()                     // 手动触发一次渲染
  }, 16)
  return () => clearInterval(id)
}, [deps])
```

而不是每帧 `setState` 一个新对象——后者会带来大量无谓的 React 协调开销。

---

## 6. 成就系统

```
definitions.ts   纯数据：PlayerStats / AchievementDef / ACHIEVEMENTS[20]
index.tsx        Provider：统计持久化、解锁判定、Toast 提示、record(event)
```

- `progress(stats)` 返回 `[当前值, 目标值]`，统一驱动进度条与解锁判定
- 埋点分散在各页面：`const { record } = useAchievements()` → `record({ type: 'game' })`
- `definitions.ts` 刻意**不依赖 React**，因此可以在 Node 环境直接单测

---

## 7. 构建与部署

| 项 | 配置 |
| --- | --- |
| `base: './'` | 产物用相对路径，可部署到任意子目录 |
| 路由级懒加载 | 每个页面独立 chunk |
| vendor 拆包 | `react-vendor` / `motion-vendor` / `ui-vendor` |
| PWA | `vite-plugin-pwa`，`autoUpdate`，预缓存全部产物 |
| CI | `.github/workflows/ci.yml` 跑 `pnpm verify` 同款四步 |
| Pages | `.github/workflows/deploy.yml` 构建后发布 `dist` |
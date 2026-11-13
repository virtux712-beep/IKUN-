# AGENTS.md

> 给 AI 编码助手（Cursor / Claude Code / Copilot / Codex / Windsurf 等）的项目说明。
> 人类贡献者请同时阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 1. 这是什么

「IKUN之家」是一个**纯静态、零后端**的单页应用：React 19 + TypeScript + Vite 8 + Tailwind CSS 4。
包含图鉴、表情包、音乐播放器、小游戏、40 个互动项目、物理沙盒、留言墙等模块，并支持 PWA 离线访问。

**改完代码后必须跑：**

```bash
pnpm verify
```

它会依次执行 `biome check` → `tsc -b` → `vitest run` → `vite build`，**四项全绿才算完成**。

---

## 2. 命令速查

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 开发服务器 http://localhost:5173 |
| `pnpm verify` | **提交前必跑**：lint + 类型 + 测试 + 构建 |
| `pnpm lint` | Biome 检查（lint + 格式），不加 `--write` |
| `pnpm lint:fix` | 自动修复绝大多数问题 |
| `pnpm typecheck` | `tsc -b`（strict 模式） |
| `pnpm test` | Vitest 单测 |
| `pnpm build` | 生产构建（含类型检查） |

---

## 3. 目录结构

```
src/
├── App.tsx              # 唯一的路由中心：懒加载 + Hash 路由 + Provider 装配
├── main.tsx             # 挂载入口
├── index.css            # Tailwind @theme 变量 / 全局样式 / 动画 / 主题覆盖
├── types/index.ts       # 全局类型，TabId 是路由白名单
├── store/index.ts       # LocalStorage 封装（留言、收藏、访问量…）
├── hooks/index.ts       # 通用 Hook（useHotkey / useOnClickOutside / useLocalStorage…）
├── settings/            # 全局设置
│   ├── themes.ts        #   5 套配色定义（纯数据）
│   ├── sound.ts         #   模块级音效开关（供非 React 层读取）
│   └── index.tsx        #   SettingsProvider + useSettings
├── achievements/
│   ├── definitions.ts   #   20 个成就定义（纯数据，可单测）
│   └── index.tsx        #   AchievementProvider + useAchievements
├── features/            # 40 个互动项目
│   ├── ui.tsx           #   共享按钮/进度条/音效合成/计时 Hook
│   ├── types.ts         #   FeatureDef 与分类元数据
│   ├── registry.ts      #   40 项注册表（id → 组件）
│   └── {reaction,memory,generators,quizzes,audio,tools}.tsx
├── pages/               # 页面级组件，每个对应一个 TabId
│   └── games/           #   7 个独立小游戏
├── components/          # 跨页面组件（导航、页脚、Toast、命令面板、成就/设置面板…）
└── data/                # 静态内容数据（角色、表情包、音乐、题库）
```

**依赖方向**（不要反向引用，否则会循环依赖）：

```
App.tsx  →  pages/  →  components/ · features/ · store/ · hooks/ · data/
                              ↓
                        settings/ · achievements/  （叶子层，不依赖 pages）
```

---

## 4. 硬性约定（Biome 会拦）

1. **所有 `<button>` 必须写 `type="button"`**，否则会触发 `useButtonType` 错误。
2. **不要给 `div` 挂 `onClick`**。用 `<button>`；需要分组用 `<fieldset>` + `<legend className="sr-only">`。
3. **TypeScript 严格模式**，不允许 `any`（会以 warning 提示），不允许未使用的变量/参数。
4. **格式化由 Biome 统一**：单引号、无分号、2 空格、行宽 100、LF 换行。不要手写与它冲突的风格。
5. **字符串拼接优先用模板字符串**（`useTemplate` 规则）。

> 遇到规则冲突时用 `pnpm lint:fix`，不要手工对抗格式化器。

---

## 5. 常见任务怎么做

### 5.1 新增一个页面

1. `src/types/index.ts`：给 `TabId` 联合类型和 `TAB_IDS` 数组**同时**加 id
2. `src/pages/Xxx.tsx`：默认导出组件
3. `src/App.tsx`：
   - 加 `const Xxx = lazy(() => import('@/pages/Xxx'))`
   - 在 `NAV_META` 加 `{ emoji, label, hint }`
   - 在 `renderPage()` 的 `switch` 加 `case`
4. `src/components/Navbar.tsx` 的 `navItems`、`src/components/Footer.tsx` 的 `quickLinks` 补导航
5. 页脚/首页入口按需补

> 漏掉第 1 步会导致 Hash 路由把 `#/xxx` 当作 `home`。

### 5.2 新增一个互动项目（实验室）

1. 在对应的分类文件里写组件（`src/features/{reaction,memory,generators,quizzes,audio,tools}.tsx`）
2. 在 `src/features/registry.ts` 里 import 并追加一条 `FeatureDef`
3. 跑 `pnpm test`——`registry.test.ts` 会校验 id 唯一、分类合法、组件已挂载、总数

**组件规范：**

- 根节点用 `<div className="space-y-4">`，弹层外壳由 `Lab.tsx` 提供，**不要自带 padding / 关闭按钮**
- 复用 `src/features/ui.tsx` 的 `Btn` / `Bar` / `Row` / `Hint` / `useRecord` / `useCountdown` / `SFX`
- 需要音效就调 `SFX.ok()` / `SFX.fail()` / `tone()` / `sweep()`，**不要引入音频文件**（全局音效开关已接在 `tone/sweep` 里）
- 实时游戏**必须**用「`useRef` 存状态 + 单一 `requestAnimationFrame`/`setInterval` 循环 + 手动触发渲染」的模式，不要在循环里高频 `setState`
- 记录最高分用 `useRecord(key)`，key 前缀 `ikun_f_`

### 5.3 新增一个成就

在 `src/achievements/definitions.ts` 的 `ACHIEVEMENTS` 里追加：

```ts
{ id: 'xxx', emoji: '🎯', title: '标题', desc: '描述',
  progress: (s) => [Math.min(s.某字段, 目标), 目标] }
```

- 需要新统计字段时，同时改 `PlayerStats` 接口、`EMPTY` 初始值、`index.tsx` 里 `record()` 的 `switch` 和 `PlayerEvent` 联合类型
- 埋点调用：`const { record } = useAchievements()` → `record({ type: 'xxx' })`
- **不要**在 `definitions.ts` 里 import React

### 5.4 新增一套主题

在 `src/settings/themes.ts` 的 `THEMES` 加一条，并在 `src/index.css` 加：

```css
html[data-theme='新id'] {
  --color-ikun-yellow: #...;
  --color-ikun-gold: #...;
  --color-ikun-golden: #...;
}
```

原理：Tailwind `@theme` 把颜色编译成 `var(--color-ikun-yellow)`，`html[data-theme=…]` 特异性高于 `:root`，所以覆盖即生效。

---

## 6. 关键实现细节（容易踩坑）

| 主题 | 说明 |
| --- | --- |
| **路由** | 用 **Hash 路由**（`#/lab`），不是 React Router。原因是纯静态托管在任意子路径都不会 404 |
| **懒加载** | 每个页面都是 `React.lazy`，`base: './'`，产物是相对路径，可部署到 GitHub Pages 子目录 |
| **PWA** | `vite-plugin-pwa` 的 `autoUpdate`；改了 `public/` 或构建配置要重新 `pnpm build` 才会更新 Service Worker |
| **Provider 顺序** | `SettingsProvider` → `ToastProvider` → `AchievementProvider` → `AppShell`。`AchievementProvider` 内部用了 `useToast()`，顺序不能乱 |
| **音效开关** | 模块级 `settings/sound.ts`，不是 React state。`features/ui.tsx` 的 `tone/sweep` 开头会检查 |
| **主题色硬编码** | Canvas 绘制（表情包/身份证/头像）里写死了 `#FFD700`，换肤时**不会**跟着变，属于已知限制 |
| **减少动效** | 系统 `prefers-reduced-motion` 会强制打开设置里的 `reduceMotion`；CSS 也有全局兜底 |

---

## 7. 不要做的事

- ❌ 不要引入 `react-router-dom`（已移除，用 Hash 路由）
- ❌ 不要新增后端请求 / `fetch` 外部 API（项目定位是纯静态离线可用）
- ❌ 不要用 `localStorage` 裸读写，统一走 `src/store/index.ts`（异常已兜底）
- ❌ 不要给已有组件加 `useEffect` 依赖时省略数组项（`useExhaustiveDependencies` 会报错）
- ❌ 不要在 `setState` 的更新函数里调用其它 `setState`（会在 StrictMode 下双跑）
- ❌ 不要删除 `public/sw.js` 相关产物或关掉 PWA

---

## 8. 自检清单

改完代码，逐条确认：

- [ ] `pnpm verify` 四项全绿
- [ ] 新页面已加进 `TabId` + `TAB_IDS` + `NAV_META` + `renderPage`
- [ ] 新互动项目已注册且 `registry.test.ts` 通过
- [ ] 没有新增 `any`、没有未使用变量
- [ ] 交互元素可键盘操作，有 `aria-label`
- [ ] 动画考虑了 `prefers-reduced-motion`
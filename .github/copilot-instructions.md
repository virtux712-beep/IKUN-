# Copilot 指令 · IKUN之家

详细规范见仓库根目录 `AGENTS.md`。

## 项目概要
React 19 + TypeScript(strict) + Vite 8 + Tailwind CSS 4 构建的**纯静态**单页应用。
Hash 路由、PWA 离线可用、无后端、无外部请求。

## 生成代码时请遵守

- 组件用函数式 + Hooks，TypeScript 严格类型，不要出现 `any`
- 每个 `<button>` 都要写 `type="button"`
- 不要给 `div` / `span` 绑定 `onClick`，改用 `<button>`
- 样式用 Tailwind 工具类 + 项目已有的 `glass` / `text-gradient-gold` 等自定义类
- 颜色用主题变量（`text-ikun-yellow`、`bg-ikun-card`），不要写死十六进制
- 交互元素要有 `aria-label`，弹层要有 `role="dialog"` + `aria-modal`
- 动画要兼容 `prefers-reduced-motion`
- 注释解释「为什么」，不要复述「做了什么」

## 新增页面
同步更新 `src/types/index.ts` 的 `TabId` 与 `TAB_IDS`，再在 `src/App.tsx` 注册懒加载路由与 `NAV_META`。

## 新增互动项目
写在 `src/features/` 下并在 `src/features/registry.ts` 注册，`registry.test.ts` 会校验完整性。

## 提交前
运行 `pnpm verify`（lint + typecheck + test + build）。
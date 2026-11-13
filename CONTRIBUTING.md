# 贡献指南

感谢你想为 IKUN之家 出一份力 🐔

## 本地开发

```bash
pnpm install
pnpm dev
```

## 提交前自检

CI 会跑这四项，本地先过一遍能省一次来回：

```bash
pnpm lint       # Biome：lint + 格式
pnpm typecheck  # tsc --strict
pnpm test       # Vitest
pnpm build      # 生产构建
```

`pnpm lint:fix` 可以自动修掉绝大多数问题。

## 代码约定

- **TypeScript 严格模式**，不要用 `any` 绕过去
- **所有 `<button>` 必须写 `type="button"`**（Biome 会拦）
- 交互元素优先用语义标签（`<button>` / `<fieldset>`），不要给 `div` 挂 `onClick`
- 动画需尊重 `prefers-reduced-motion`，CSS 已全局兜底
- 文案用中文，注释解释「为什么」而不是「做了什么」

## 新增页面的步骤

1. 在 `src/types/index.ts` 的 `TabId` 中加一个 id
2. 在 `src/pages/` 下新建组件
3. 在 `src/App.tsx` 里 `lazy()` 引入并加到 `renderPage()` 的 switch
4. 在 `src/App.tsx` 的 `NAV_META` 和 `src/components/Navbar.tsx` 的 `navItems` 补上导航项
5. 如果是可搜索内容，顺手加到 `src/pages/Search.tsx`

## 提交信息

建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新增 XX 页面
fix: 修复抓鸡游戏重复计分
perf: 粒子背景改用 rAF 节流
docs: 更新部署说明
```

## 免责声明

本项目纯属娱乐与技术演示，与任何真实人物无关，请勿对号入座。
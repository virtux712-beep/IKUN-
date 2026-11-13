# CLAUDE.md

本文件为 Claude Code 提供上下文。**完整规范见 [AGENTS.md](./AGENTS.md)，请先读它。**

## 一句话

IKUN之家：React 19 + TS(strict) + Vite 8 + Tailwind 4 的**纯静态**单页应用，Hash 路由，PWA 离线可用，无后端。

## 必跑命令

```bash
pnpm verify   # biome check + tsc -b + vitest run + vite build，四项全绿才算完成
```

## 最容易出错的 5 件事

1. 新增页面必须**同时**改 `src/types/index.ts` 的 `TabId` 与 `TAB_IDS`，否则路由失效
2. 所有 `<button>` 必须带 `type="button"`（Biome 会拦）
3. 互动项目必须在 `src/features/registry.ts` 注册，否则 `registry.test.ts` 失败
4. 游戏类组件用「ref + 单一循环」模式，禁止在循环里高频 `setState`
5. Provider 顺序固定：`SettingsProvider → ToastProvider → AchievementProvider → AppShell`

## 不要做

- 不要引入 `react-router-dom`（已移除）
- 不要加任何外部网络请求
- 不要绕过 `src/store/index.ts` 直接读写 localStorage
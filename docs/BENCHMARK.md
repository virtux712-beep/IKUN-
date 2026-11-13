# 同题材项目调研（全网聚合）

> 检索方式：GitHub Search API，`topic:` 与 `in:name` 检索，按 Star 降序。
> 数据为检索时快照，Star 数会随时间变化。
> 已过滤同名噪声（如 CVPR 论文 `iKUN`、图书管理系统 `IKUN_Library`、`iKUNet` 等非同类项目）。

---

## 1. 同题材项目总览

| 项目 | Star | 语言 | 形态 | 与本项目的关系 |
| --- | ---: | --- | --- | --- |
| [ikun-svelte/ikun-ui](https://github.com/ikun-svelte/ikun-ui) | 1473 | TypeScript | Svelte + UnoCSS 组件库 | 设计体系参考 |
| [SyMind/ji](https://github.com/SyMind/ji) | 119 | TypeScript | 🐔🏀 只因你太美 | 同题材站点 |
| [liyupi/dsh-kun-like-pet](https://github.com/liyupi/dsh-kun-like-pet) | 113 | JavaScript | 坤坤桌宠插件（9 种动作 + 音效） | 角色互动参考 |
| [liyupi/ikun-test](https://github.com/liyupi/ikun-test) | 107 | JavaScript | 移动端答题站（Vue3 + Node） | **对标：纯度测试** |
| [laine001/ikun-ui](https://github.com/laine001/ikun-ui) | 104 | Vue | Vue3 + Vite 组件库 | 设计体系参考 |
| [lyryblog/Jilehe](https://github.com/lyryblog/Jilehe) | 62 | HTML | 鸡乐盒（网页小工具集合） | **对标：互动实验室** |
| [ThanatosXingYu/iKun_Keyboard](https://github.com/ThanatosXingYu/iKun_Keyboard) | 51 | Python | 鸡音键盘（按键触发鸡叫） | **对标：音效系统** |
| [wzwtt/ikun](https://github.com/wzwtt/ikun) | 50 | Vue | IKUN 表情包大全 | **对标：表情包中心** |
| [Wing900/ikunKChat](https://github.com/Wing900/ikunKChat) | 39 | TypeScript | AI 聊天应用，玻璃拟态，React + Gemini | 技术栈 + 视觉最接近 |
| [Macrohard0001/lx-ikun-music-sources](https://github.com/Macrohard0001/lx-ikun-music-sources) | 2925 | JavaScript | 音乐音源收集 | 仅题材相关，形态不同 |

---

## 2. 逐个对比

### 2.1 `ikun-svelte/ikun-ui`（1473★）—— 生态里最成熟的

**是什么**：基于 Svelte + UnoCSS 的 IKUN 主题组件库，有完整的组件文档站。

**值得学**：

- 把「主题」做成了**可复用的设计系统**，而不是一次性页面
- 组件 API 统一（props 命名、尺寸档位、状态变体）
- 有独立的文档站，降低上手成本

**我们的差距**：我们有 `@theme` 令牌 + 5 套配色，但**没有组件文档**，设计令牌散落在 `index.css` 和 Tailwind 工具类里。

### 2.2 `liyupi/ikun-test`（107★）—— 直接对标「纯度测试」

**是什么**：Vue3 + Node 实现的移动端答题站，测「你是真爱坤还是小黑子」。

**值得学**：

- **移动端优先**的全屏答题体验，单题单屏，没有侧边栏干扰
- 结果页有分享引导（社交裂变）
- 后端记录了答题数据（我们目前纯本地）

**我们的差距**：我们的纯度测试是嵌在弹层/卡片里的，移动端体验不如全屏单题；且没有分享卡片。

### 2.3 `lyryblog/Jilehe`（62★）—— 直接对标「互动实验室」

**是什么**：鸡乐盒，网页小工具集合（HTML 单页）。

**值得学**：

- 工具型小玩意儿的**极简交互**：点开即用，没有多余步骤
- 分类清晰，一眼能找到想要的

**我们的优势**：40 个项目 + 成就系统 + 统一 UI 框架，工程化程度远高于它。

### 2.4 `ThanatosXingYu/iKun_Keyboard`（51★）—— 直接对标「音效系统」

**是什么**：Python 桌面工具，敲键盘触发鸡叫音效。

**值得学**：

- **全局键盘音效**这个点子很适合网页版——我们已经有 Web Audio 合成层，加一个「打字鸡叫」开关成本极低
- 音效与动作的绑定要克制（不是每个键都响）

### 2.5 `wzwtt/ikun`（50★）—— 直接对标「表情包中心」

**是什么**：Vue 实现的 IKUN 表情包大全。

**值得学**：

- 表情包**内容量**是核心竞争力，我们的 18 个偏少
- 分类与搜索的粒度

**我们的优势**：我们有 Canvas 生成器（自定义文字导出 PNG）、收藏、预览，功能更完整。

### 2.6 `Wing900/ikunKChat`（39★）—— 技术栈最接近

**是什么**：React + Gemini 的 AI 聊天应用，玻璃拟态界面。

**值得学**：

- 玻璃拟态 + 深色主题的**具体参数**（模糊半径、透明度层次）
- 会话持久化的交互细节

**注意**：它依赖外部 AI API，而我们坚持**纯静态、零后端、可离线**——这是刻意的取舍，不是差距。

---

## 3. 结论：我们处在什么位置

### 优势（明显领先）

| 维度 | 情况 |
| --- | --- |
| **功能覆盖面** | 9 个页面 + 40 个互动项目 + 4 个独立游戏 + 物理沙盒，同类项目里最广 |
| **工程化** | TS strict、42 个单测、Biome、CI、PWA 离线、AGENTS.md —— 同类项目普遍没有 |
| **元游戏** | 20 个成就徽章贯穿全站，同类项目未见 |
| **技术亮点** | 自研圆体物理、Web Audio 实时合成（零音频文件）、5 套主题换肤 |

### 差距（可补）

| 差距 | 严重度 | 说明 |
| --- | --- | --- |
| **表情包内容量** | 中 | 18 个 vs 专业站点的数百个 |
| **移动端答题体验** | 中 | 纯度测试应做成全屏单题 |
| **组件文档站** | 低 | 有设计令牌但没文档 |
| **分享裂变** | 中 | 缺结果分享卡片（Canvas 生成 + Web Share API） |
| **社区影响力** | — | 新项目，Star 为 0，需要推广 |

---

## 4. 下一步建议（按性价比排序）

1. **结果分享卡片**：纯度测试/成就页生成 Canvas 分享图，接 `navigator.share`。参考 `ikun-test` 的裂变思路，我们有现成的 Canvas 能力，成本低收益高。
2. **全屏答题模式**：把纯度测试改成移动端单题单屏 + 手势滑动，对标 `ikun-test`。
3. **全局打字鸡叫**：参考 `iKun_Keyboard`，复用已有 `tone()`，加一个默认关闭的开关。
4. **扩充表情包**：18 → 60+，内容量是这个品类的护城河。
5. **设计令牌文档**：把 `@theme` 变量、间距、圆角、动效曲线整理成 `docs/DESIGN-TOKENS.md`，对标 `ikun-ui` 的设计系统思路。
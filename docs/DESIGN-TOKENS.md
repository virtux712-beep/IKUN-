# 设计令牌（Design Tokens）

> 所有令牌定义在 `src/index.css` 的 `@theme` 块中，Tailwind CSS 4 会把它们编译成 CSS 变量，
> 因此可以直接在任意工具类里使用（如 `text-ikun-yellow`、`bg-ikun-card`、`from-ikun-gold`）。

---

## 1. 色彩

### 1.1 品牌色

| 令牌 | 变量 | 默认值 | 用途 |
| --- | --- | --- | --- |
| 主黄 | `--color-ikun-yellow` | `#FFD700` | 主按钮、强调文字、进度条、焦点环 |
| 次金 | `--color-ikun-gold` | `#F5C842` | 渐变终点、次级强调 |
| 深金 | `--color-ikun-golden` | `#DAA520` | 阴影、深色渐变 |

### 1.2 中性色

| 令牌 | 变量 | 值 | 用途 |
| --- | --- | --- | --- |
| 背景 | `--color-ikun-black` | `#0a0a0a` | 页面底色 |
| 深色 | `--color-ikun-dark` | `#141414` | 弹层、面板底色 |
| 卡片 | `--color-ikun-card` | `#1a1a1a` | 实心卡片 |
| 边框 | `--color-ikun-border` | `#333333` | 分隔线 |
| 浅色 | `--color-ikun-light` | `#2a2a2a` | 悬停底色 |
| 灰字 | `--color-ikun-gray` | `#888888` | 次要文字 |

### 1.3 玻璃层

| 令牌 | 值 |
| --- | --- |
| `--color-ikun-glass` | `rgba(255,255,255,0.05)` |
| `--color-ikun-glass-border` | `rgba(255,255,255,0.1)` |
| `--color-ikun-glass-hover` | `rgba(255,255,255,0.1)` |

### 1.4 语义色

直接使用 Tailwind 默认色板：`green-400`（成功）、`red-400`（危险）、`blue-400`（信息）、`orange-400`（警告）。

---

## 2. 主题换肤

换肤通过覆盖上述品牌色变量实现，选择器为 `html[data-theme=…]`（特异性高于 `:root`）。

| 主题 | id | 主黄 | 次金 | 深金 |
| --- | --- | --- | --- | --- |
| 经典金 | `gold` | `#FFD700` | `#F5C842` | `#DAA520` |
| 樱花粉 | `sakura` | `#FF7EB6` | `#FF9EC8` | `#E56AA0` |
| 薄荷绿 | `mint` | `#3DDC97` | `#6FE7B8` | `#22A97B` |
| 星云紫 | `violet` | `#A78BFA` | `#C4B5FD` | `#7C3AED` |
| 深海蓝 | `ocean` | `#38BDF8` | `#7DD3FC` | `#0284C7` |

**新增主题**：在 `src/settings/themes.ts` 加一条定义，并在 `src/index.css` 加对应的 `html[data-theme='新id']` 覆盖块。

---

## 3. 字体

| 令牌 | 值 |
| --- | --- |
| `--font-sans` | `"PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", "Noto Sans SC", system-ui, …` |
| `--font-mono` | `"JetBrains Mono", "SFMono-Regular", Consolas, …` |

**不使用外部字体 CDN**（避免国内网络阻塞首屏）。数字统一加 `tabular-nums` 防止跳动。

---

## 4. 圆角

| 档位 | 类名 | 用途 |
| --- | --- | --- |
| 小 | `rounded-lg` | 标签、图标按钮 |
| 中 | `rounded-xl` | 输入框、次级按钮 |
| 大 | `rounded-2xl` | 卡片、主按钮 |
| 特大 | `rounded-3xl` | 弹层、页面容器 |
| 全圆 | `rounded-full` | 胶囊按钮、头像 |

---

## 5. 动效

### 5.1 缓动曲线

| 用途 | 曲线 |
| --- | --- |
| 标准过渡 | `cubic-bezier(0.22, 1, 0.36, 1)` |
| 弹性（motion 弹簧） | `stiffness: 380, damping: 30` |
| 线性循环 | `linear` |

### 5.2 时长

| 场景 | 时长 |
| --- | --- |
| 微交互（悬停、按下） | `150ms` |
| 常规过渡 | `250–300ms` |
| 页面切换 | `260ms` |
| 弹层进出 | `160–220ms` |
| 数字滚动 | `1600ms` |

### 5.3 预置动画类

`animate-fadeUp` · `animate-fadeIn` · `animate-scaleIn` · `animate-slideDown` · `animate-popIn` · `animate-float` · `animate-spin-slow` · `animate-glow` · `animate-shimmer` · `stagger-children`

**所有动画必须兼容 `prefers-reduced-motion`**，CSS 已做全局兜底（时长归零）。

---

## 6. 阴影与光效

| 类名 | 用途 |
| --- | --- |
| `shadow-lg shadow-black/30` | 卡片悬停 |
| `shadow-xl shadow-black/40` | 弹层 |
| `shadow-ikun-yellow/30` | 主按钮发光 |
| `text-gradient-gold` | 金色渐变文字 |
| `.tilt-spot` | 跟随鼠标的径向高光 |

---

## 7. 自定义工具类

| 类名 | 说明 |
| --- | --- |
| `.glass` | 毛玻璃：`blur(20px) saturate(140%)` + 半透明白底 + 1px 边框 |
| `.glass-hover` | 毛玻璃悬停态 |
| `.text-gradient-gold` | 金色渐变文字（`background-clip: text`） |
| `.bg-grid` | 56px 网格底纹 |
| `.mask-fade-b` | 底部渐隐遮罩 |
| `.tilt-spot` | 3D 卡片高光层 |
| `.no-scrollbar` | 隐藏滚动条 |
| `.tooltip` | 基于 `data-tooltip` 的纯 CSS 提示 |

---

## 8. 使用示例

```tsx
// 主按钮
<button type="button" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-ikun-yellow to-ikun-gold text-black font-bold">
  开始
</button>

// 玻璃卡片
<div className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
  内容
</div>

// 渐变标题
<h1 className="text-4xl font-black text-gradient-gold">IKUN之家</h1>

// 强调数字
<span className="text-ikun-yellow font-bold tabular-nums">{count}</span>
```

---

## 9. 约束

- **不要写死十六进制颜色**，一律用 `ikun-*` 令牌，否则换肤会失效
- **Canvas 绘制是例外**：`src/share/` 与生成器里的 `#FFD700` 是硬编码的，换肤时不会跟随（已知限制）
- **不要引入外部字体或图标 CDN**，图标统一用 `lucide-react`
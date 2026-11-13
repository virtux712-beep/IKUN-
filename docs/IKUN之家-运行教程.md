# 🐔 IKUN之家 — 完整运行教程
> 本文件为发行包中《IKUN之家-运行教程.docx》的 Markdown 版（内容一致，便于在仓库内直接阅读）；docx 原件在 v1.0.0 发行附件中。

方式一：使用完整包（推荐，最简单）

第一步：解压文件

1. 找到 ikun-home-full.zip 文件（在 D:\下载\ 目录下）

2. 右键 → 全部解压缩 → 选择解压到 D:\下载\ikun-home-full\

3. 等待解压完成（约74MB）

第二步：安装 Node.js（如果还没装）

1. 打开浏览器，访问 https://nodejs.org/

2. 下载 LTS 版本（长期支持版，当前是 v20.x）

3. 双击下载的 .msi 安装包，一路点 Next 安装即可

4. 安装完成后，按 Win + R，输入 cmd，回车打开命令行

5. 输入以下命令验证安装成功：

```

node -v

```

如果显示类似 v20.x.x 就说明安装成功了

第三步：启动网站

1. 按 Win + R，输入 cmd，回车打开命令行（或用 PowerShell）

2. 输入以下命令进入项目目录：

```

cd /d 下载\ikun-home-full

```

> 注意：如果你解压到了别的路径，把路径换成你自己的。

> 如果你解压出来外面还有一层文件夹，可能需要多加一层：

> ```

> cd /d 下载\ikun-home-full\ikun-home-full

> ```

3.  输入启动命令：

npm run dev

```

```

4. 等待几秒，当看到类似下面的输出时，说明启动成功：

```

VITE v8.x.x  ready in xxx ms

➜  Local:   http://localhost:见下面/

➜  Network: http://xxx.xxx.xxx.xxx:见下面/

```

第四步：打开网站

1. 打开浏览器（Chrome / Edge / Firefox 均可）

2. 在地址栏输入：http://localhost:5174

3. 按回车，就能看到 IKUN之家 了！🎉

第五步：停止网站

1. 回到命令行窗口

2. 按 Ctrl + C

3. 输入 y 确认，即可停止

---

方式二：使用源码包（需要额外安装依赖）

第一步：解压文件

1. 找到 ikun-home.zip 文件

2. 右键 → 全部解压缩 → 选择解压位置

第二步：安装 Node.js

（同方式一的第二步）

第三步：安装项目依赖

1. 打开命令行，进入项目目录：

```

cd /d 下载\ikun-home

```

2. 安装依赖包（只需执行一次，约1-2分钟）：

```

npm install

```

3. 等待出现 added xx packages 就表示安装完成

第四步：启动网站

1. 输入：

```

npm run dev

```

2. 看到 Local: http://localhost:5174/ 就启动成功了

第五步：打开网站

浏览器访问 http://localhost:5174即可

---

常见问题

❌ 'npm' 不是内部或外部命令

原因：Node.js 没有安装，或者安装后没有重启命令行

解决：

1. 确认已安装 Node.js（访问 https://nodejs.org/ 下载安装）

2. 关掉当前命令行窗口，重新打开一个

3. 再输入 node -v 验证

❌ 'cd' 不是内部或外部命令

原因：你可能用了 PowerShell 而不是 cmd

解决：在 PowerShell 中用以下命令：

```powershell

cd "D:\下载\ikun-home-full"

```

❌ Port 5173 is already in use

原因：端口被占用了

解决：

• 关掉其他占端口的程序，或者

• 使用其他端口启动：

```

更改端口名称：npm run dev -- --port 3000

```

然后浏览器访问 http://localhost:3000

❌ 启动后浏览器打开是空白页

原因：可能是旧的缓存

解决：按 Ctrl + Shift + R 强制刷新，或者清除浏览器缓存

❌ npm install 很慢 / 超时

原因：网络问题

解决：设置国内镜像源：

```

npm config set registry https://registry.npmmirror.com

```

然后重新执行 npm install

---

功能说明

| 页面 | 功能 | 操作方式 |

|------|------|----------|

| 🏠 首页 | 粒子动画、数据统计、快捷入口 | 浏览即可 |

| 📖 IKUN图鉴 | 12个角色卡片、搜索、筛选 | 点击卡片查看详情 |

| 😱 表情包 | 18个表情包、复制/下载/收藏 | 点击操作按钮 |

| 🎵 音乐播放器 | 播放/暂停/切歌/音量 | 点击播放按钮 |

| 🎮 小游戏 | 接篮球/抓鸡/反应测试 | 点击开始游戏 |

| 🧪 纯度测试 | 15道题测试你的ikun纯度 | 点击选项答题 |

| 💬 留言墙 | 发帖/评论/点赞/表情反应 | 填写内容发送 |

| 🔍 搜索 | 搜索所有内容 | 输入关键词 |

🎉 彩蛋

• 在键盘上打字输入 ikun 会触发彩蛋动画！

• 连续快速点击左上角🐔 Logo 5次也会触发！

---

技术信息

• 技术栈：React + TypeScript + Vite + Tailwind CSS

• 数据存储：LocalStorage（本地保存，刷新不丢失）

• 兼容浏览器：Chrome、Edge、Firefox、Safari

• 支持设备：手机、平板、电脑（自适应布局）

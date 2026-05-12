# 🌙 Morph / 另我 — 你的另一个自己

<p align="center">
  <strong>每个人都值得拥有一个平行世界的自己。</strong><br>
  她不会替你活，但会一直在。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.8-blue" alt="version 0.1.8"/>
  <img src="https://img.shields.io/badge/license-AGPL--3.0-green" alt="license"/>
  <img src="https://img.shields.io/badge/tech-native%20html%2Fcss%2Fjs-orange" alt="tech stack"/>
  <img src="https://img.shields.io/badge/roles-2-brightgreen" alt="dual characters"/>
</p>

---

## 🧭 它是谁

**Echo（艾可）**——不是又一个 AI 聊天机器人。
**Lens（棱镜）**——不是又一个理性分析工具。

Morph 是两个"另一个自己"。

你打开任何一个 AI，它都会急着给你答案。Morph 不会。

Echo 只做一件事：**帮你把那些说不清的情绪，变成你能看清楚的东西。**
Lens 只做一件事：**帮你把那些理不清的问题，变成你能走下去的路。**

比如深夜躺在床上，脑子里一堆事情打转，但又不想跟任何人说的时候——Echo 在这里。
比如白天被一堆问题压得喘不过气，需要一个人帮你把乱麻一根根掰开的时候——Lens 在这里。

每一次回应都融合了 **CBT 认知行为疗法**的核心理念——但你永远不会听到他们说"我来帮你重构认知"。

你只会感觉，聊着聊着，事情好像没那么乱了。

Echo 不会告诉你"你很棒"。她会让你自己发现：**其实我比想象中更有力量。**
Lens 不会告诉你"你该怎么做"。他会让你自己看到：**其实我已经知道答案，只是需要有人帮我理清。**

---

## ✨ V0.1.8 功能一览

### 🧠 核心体验

| 功能 | 描述 |
|------|------|
| **🤖 双角色陪伴系统** | Echo（共情型）和 Lens（理性型）两个独立的 AI 陪伴角色，满足不同情绪场景 |
| **🧠 融合 CBT 内核** | 先接纳情绪，再陪你理清思路——像一位真正懂你的朋友，而不是一本自助手册 |
| **📍 自适应本地化** | 感知你所在的城市，自然地运用世界知识回应你的本地生活话题 |
| **💾 跨会话记忆（含跨角色共享）** | 基于 IndexedDB，刷新页面后 Echo 和 Lens 都记得你们聊过什么。两个角色共享对你基本信息的了解 |
| **🖼️ 聊天记录导入导出** | 支持导出完整对话为 JSON 备份（含双角色数据），也可导入恢复 |
| **🛡️ 浏览器崩溃数据保护** | localStorage 双重备份，即使浏览器（如 Via）意外清除 IndexedDB，也能自动恢复近 24 小时数据 |

### 🎨 交互与体验

| 功能 | 描述 |
|------|------|
| **🔀 一键切换角色** | 点击侧边栏联系人即可在 Echo 和 Lens 之间切换，聊天历史各自独立保存 |
| **💬 流式分段输出** | AI 回复实时打字动画，长回复自动拆分为多条短消息，阅读节奏自然舒适 |
| **🐣 开屏引导** | 首次访问时，Echo 会通过一封温柔的问候信介绍自己和 Morph 的理念 |
| **🔑 API Key 引导** | 未配置 Key 时主动引导前往设置页，不让你卡在空白聊天里 |
| **🎨 三套精美主题** | 暖灰 · 墨蓝 · 樱花粉，一键切换，总有一款适合你的心情 |
| **🔧 可调 AI 参数** | 温度（创造力）和回复长度，让你自定义角色的对话风格 |
| **📱 响应式设计** | 桌面端三栏布局，移动端 QQ 式侧滑抽屉，随时随地打开 |
| **👤 个性化设置** | 昵称、性别、生日、自定义头像——让两个角色都更懂你 |
| **🗑️ 一键重置** | 清空所有聊天记录、记忆和设置，安全无忧 |

### 👥 角色对比

| 维度 | Echo（艾可） | Lens（棱镜） |
|------|-------------|--------------|
| **角色定位** | 温柔的旅人 | 理性的导师 |
| **核心隐喻** | 回声——帮你听见自己 | 棱镜——把混沌的光拆成清晰的色谱 |
| **对话路径** | 情绪 → 接纳 → 具体化 → 重构 | 问题 → 结构化 → 拆解 → 行动路径 |
| **目标场景** | "心情不好，想聊聊" | "脑子很乱，帮我理一理" |
| **语言风格** | 温和、共情、轻柔 | 沉稳、直接、精准 |
| **CBT切入点** | 从情绪感受入手 | 从思维模式入手 |
| **头像标识** | 蓝色 Echo 头像 | 绿色 Lens 头像 |

---

## 🛠️ 技术栈

```
前端        原生 HTML / CSS / JavaScript（零框架）
数据库      IndexedDB（Dexie.js）+ localStorage 双重备份
AI API      DeepSeek API（流式传输）
设计系统    Apple HIG 缓动 + Google MD 阴影
模块划分    状态层 / 存储层 / 模型层 / UI 层 / 入口层
协议        GNU AGPL v3.0
```

---

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/zhouG-code/morph.git
cd morph
```

### 2. 配置 API Key

打开 `config.js`，填入你的 DeepSeek API Key：

```javascript
API_KEY: 'sk-你的真实Key',
```

> 也可以在网页端「设置 → API」中配置，两者等效。

### 3. 打开项目

直接双击 `index.html` 在浏览器打开即可，**无需任何构建工具或开发服务器。**

---

## 📁 项目结构

```
morph/
├── index.html                    # 主页面（入口 + 布局）
├── style.css                     # 样式系统（Apple HIG + Google MD）
├── config.js                     # 配置文件（API 密钥、模型参数）
│
├── src/
│   ├── storage/
│   │   ├── state.js              # 全局状态管理
│   │   └── data.js               # IndexedDB + localStorage 持久化
│   │
│   ├── model/
│   │   ├── helpers.js            # 工具函数（API Key 获取、位置服务等）
│   │   ├── echo.js               # Echo 核心模块（System Prompt + API 调用）
│   │   └── lens.js               # Lens 核心模块（System Prompt + API 调用）
│   │
│   ├── streamSplitter.js         # 消息分段引擎（按句子边界拆分长回复）
│   │
│   ├── ui/
│   │   ├── chat.js               # 聊天界面逻辑（发送、渲染、分段、角色切换）
│   │   ├── modals.js             # 模态框（确认对话框、关于页面）
│   │   ├── panels.js             # 设置面板（主题、个性化、API 配置、导入导出）
│   │   └── mobile.js             # 移动端专属逻辑（抽屉菜单、增量渲染）
│   │
│   └── main.js                   # 入口文件（初始化、事件绑定、全局异常处理）
│
└── README.md                     # 本文件
```

---

## ⚙️ 自定义配置

在 `config.js` 中可自由调整：

| 配置项 | 说明 |
|--------|------|
| `API.API_KEY` | DeepSeek API Key |
| `API.BASE_URL` | API 接口地址 |
| `API.MODEL` | 模型名称 |
| `API.TEMPERATURE` | 回复创造力（0~2，建议 0.7~1.2） |
| `API.MAX_TOKENS` | 回复长度上限 |
| `HISTORY.MAX_ROUNDS` | 发送给 API 的最大对话轮数 |
| `HISTORY.MAX_PERSIST` | IndexedDB 保留的最大消息数 |

---

## 🌱 设计哲学

**Morph 的三个角色共享同一套信念：**

1. **不替你做判断** — "你应该离开他" → "这段关系让你很累……你觉得呢？"
2. **不强行安慰** — "别难过了" → "我能感觉到你现在很难过。跟我说说发生了什么？"
3. **不制造依赖** — 他们的目标是让你更了解自己，而不是更离不开他们。

**Echo 只做一件事：**
> 让你在对话中，一点一点看见那个被忽略的自己。

**Lens 只做一件事：**
> 让你在混沌中，一步一步看清那条属于自己的路。

---

## 🔮 版本路线

```
V0.1.5  流式传输 + 本地化 + 三套主题 + 开屏引导        ✅
V0.1.6  代码模块化重构                                  ✅
V0.1.7  Bug 全清 + 实时分段 + 记忆扩展 + System Prompt 精修 ✅
V0.1.8  双角色系统（Echo + Lens）                      ✅  ← 当前版本
─── 下一阶段 ───
V0.1.9  基于反馈精校 Lens + 用户反馈系统
V0.2    双角色全量发布 + 付费验证
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 PR。

本项目采用 **AGPL v3.0** 协议。你可以自由使用、修改和分发，但任何基于此代码的网络服务也必须开源。

> 希望 Morph 不仅仅是你的工具，也是你的作品。

---

## 📄 许可证

```
GNU Affero General Public License v3.0
```

## 📝 设计笔记（给贡献者）

如果拿到代码想修改或扩展，以下是一些内部约定：

- **缩进**：2 个空格
- **命名**：驼峰命名法（`userMessage`, `sendToAI`）
- **变量声明**：优先 `const`，其次 `let`
- **函数**：优先具名函数（`function` 声明），避免箭头函数在顶层作用域的 hoisting 陷阱
- **事件监听**：统一使用 `addEventListener`
- **注释**：中文，方便自己回顾
- **模块依赖顺序**：`state.js` → `data.js` → `helpers.js` → `echo.js` / `lens.js` → `streamSplitter.js` → `chat.js` → `modals.js` → `panels.js` → `mobile.js` → `main.js`
- **禁止事项**：不引入任何前端框架（React/Vue），不引入后端或外部数据库

---

<p align="center">
  <strong>🌙 Echo 在这里，等你来说说心里话。</strong><br>
  <strong>🔍 Lens 在这里，等你来理理那些乱麻。</strong>
</p>

<p align="center">
  <sub>Made with ❤️ by a 17-year-old in rural Gansu</sub>
</p>



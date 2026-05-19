# 🌿 树洞情绪站

> 多模块心理测评 + AI 情绪树洞 + 八字命理分析 Web 应用
> 已部署上线，免费使用

---

## 📖 概述

树洞情绪站是一个全栈 Web 应用，集成了心理学测评、AI 情绪疏导对话、以及传统八字命理分析三大模块。后端调用 DeepSeek LLM 生成个性化解读，数据持久化存储在 Supabase。

---

## 🧩 功能模块

### 🧠 心理测评

| 模块 | 页面 | 说明 |
|:----|:----|:------|
| 😰 **焦虑评估** | nxiety-assessment.html | GAD-7 改良版 + 12 题焦虑模式识别 |
| 💕 **亲密关系** | 
elationship-assessment.html | ECR 量表 + 14 题依恋风格分析 |
| 🧩 **大五人格** | personality-assessment.html | 大五人格简化版（外向性/宜人性/尽责性/神经质/开放性） |
| 💘 **情人匹配图鉴** | love-radar.html | 17 题情景判断 + 16 种人格类型匹配（含隐藏人格） |
| 📊 所有测评结果在 **个人中心** (dashboard.html) 中可视化展示 | | |

### 💬 AI 情绪树洞
- 	reehole.html — 多会话管理，独立对话
- 注入用户画像数据，AI 个性化回复
- 支持历史记录回顾

### 🔮 八字命理
| 模块 | 页面 | 说明 |
|:----|:----|:------|
| 🪐 **八字排盘** | azi.html | 基于生辰的流年/大运/十神分析，SSE 流式输出 |
| 💑 **八字合婚** | azi-match.html | 双人八字六维衡量（五行/生肖/日柱/十神/大运/综合），等级制评分 |

### 👤 用户系统
- **注册/登录** (uth.html)：JWT 鉴权，密码 pbkdf2_hmac 加密
- **个人中心** (dashboard.html)：测评历史、画像编辑、数据管理
- **隐私保护**：完整账号注销 + 清除数据 API

---

## 🛠️ 技术栈

| 层 | 技术 | 说明 |
|:--|:-----|:------|
| 🖥️ **后端** | Python FastAPI + Uvicorn | REST API + SSE 流式输出 |
| 🤖 **LLM** | DeepSeek V4 Flash（推理模式） | 树洞对话 + 八字解读 + 合婚分析 |
| 🗄️ **数据库** | Supabase PostgreSQL | 用户、会话、测评结果持久化 |
| 🎨 **前端** | 原生 HTML/CSS/JS（无框架） | 单页应用，Chart.js 图表 |
| 🔮 **排盘引擎** | lunar-javascript（同源） | 前端八字排盘，不含网络请求 |
| 🚀 **部署** | Render（Web Service） | 自动部署，绑定 emotion-treehole 仓库 |

---

## 🚀 快速开始

### 本地开发

`ash
git clone https://github.com/shen-xm22/emotion-treehole.git
cd emotion-treehole
pip install -r requirements.txt
`

### 环境变量

创建 .env 文件：

`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
DEEPSEEK_API_KEY=your_deepseek_api_key
JWT_SECRET=your_jwt_secret
`

### 运行

`ash
python server.py
# 浏览器访问 http://localhost:8000
`

### 部署

项目配置了 Render 自动部署。推送 master 分支后，Render 会自动重新构建并部署最新版本。

---

## 📂 项目结构

`
emotion-treehole/
├── server.py                    # FastAPI 后端（路由/LLM调用/数据库）
├── index.html                   # 首页
├── auth.html                    # 注册/登录
├── dashboard.html               # 个人中心
├── treehole.html                # 情绪树洞聊天
├── love-radar.html              # 情人匹配图鉴
├── anxiety-assessment.html      # 焦虑评估
├── relationship-assessment.html # 亲密关系评估
├── personality-assessment.html  # 大五人格评估
├── bazi.html                    # 八字排盘
├── bazi-match.html              # 八字合婚
├── static/
│   └── lunar.js                 # 八字排盘引擎（同源）
├── requirements.txt             # Python 依赖
├── .env.example                 # 环境变量模板
└── README.md
`

---

## ⚠️ 免责声明

- 心理测评结果**不构成医疗诊断**。如有严重心理困扰，请寻求专业心理咨询师帮助
- 八字命理分析由 AI 生成，**仅供娱乐参考**
- 用户原始出生日期不存储，仅存储衍生的八字排盘数据

---

## 📄 许可

本项目仅供个人学习与参考。

---

> 🌱 **每个人心里都有一片森林。偶尔进来坐坐，跟自己的情绪聊聊天。**
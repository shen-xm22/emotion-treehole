# 🌿 树洞情绪站

> 多模块心理测评 + AI 情绪树洞 + 八字命理分析 Web 应用
> 已部署上线，免费使用

---

## 📖 概述

树洞情绪站是一个全栈 Web 应用，集成了心理学测评、AI 情绪疏导对话、以及传统八字命理分析三大模块。后端调用 DeepSeek LLM 生成个性化解读，数据持久化存储在 Supabase。

---

## 🧩 功能模块

### 🧠 心理测评

| 模块 | 说明 |
|:----|:------|
| 😰 **焦虑评估** | GAD-7 改良版 + 12 题焦虑模式识别 |
| 💕 **亲密关系** | ECR 量表 + 14 题依恋风格分析 |
| 🧩 **大五人格** | 大五人格简化版（外向性/宜人性/尽责性/神经质/开放性） |
| 💘 **情人匹配图鉴** | 17 题情景判断 + 16 种人格类型匹配（含隐藏人格） |
| 📊 所有测评结果在**个人中心**中可视化展示 | |

### 💬 AI 情绪树洞
- 多会话管理，独立对话
- 注入用户画像数据，AI 个性化回复
- 支持历史记录回顾

### 🔮 八字命理
| 模块 | 说明 |
|:----|:------|
| 🪐 **八字排盘** | 基于生辰的流年/大运/十神分析，SSE 流式输出 |
| 💑 **八字合婚** | 双人八字六维衡量（五行/生肖/日柱/十神/大运/综合），等级制评分 |

### 👤 用户系统
- **注册/登录**：JWT 鉴权，密码 pbkdf2_hmac 加密
- **个人中心**：测评历史、画像编辑、数据管理
- **隐私保护**：完整账号注销 + 清除数据 API

---

## 🛠️ 技术栈

| 层 | 技术 |
|:--|:-----|
| 🖥️ **后端** | Python FastAPI + Uvicorn |
| 🤖 **LLM** | DeepSeek V4 Flash（推理模式） |
| 🗄️ **数据库** | Supabase PostgreSQL |
| 🎨 **前端** | 原生 HTML/CSS/JS（无框架），Chart.js 图表 |
| 🔮 **排盘引擎** | lunar-javascript（同源） |
| 🚀 **部署** | Render（Web Service） |

---

## 🚀 本地开发

`ash
# 克隆
git clone https://github.com/shen-xm22/emotion-treehole.git
cd emotion-treehole

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（创建 .env 文件）
# SUPABASE_URL=xxx
# SUPABASE_SERVICE_KEY=xxx
# DEEPSEEK_API_KEY=xxx
# JWT_SECRET=xxx

# 启动开发服务器
uvicorn server:app --reload --port 8000
`

浏览器访问 http://localhost:8000

> ⚠️ python server.py 无法启动，必须用 uvicorn server:app 命令。

### 部署

项目部署在 Render。推送 master 分支后自动构建部署。

---

## 📂 项目结构

`
emotion-treehole/
├── server.py                    # FastAPI 后端
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
│   └── lunar.js                 # 八字排盘引擎
├── requirements.txt
├── .env.example
└── README.md
`

---

## ⚠️ 免责声明

- 心理测评结果**不构成医疗诊断**，如有严重心理困扰请寻求专业帮助
- 八字命理分析由 AI 生成，**仅供娱乐参考**
- 用户原始出生日期不存储，仅存储衍生的八字排盘数据

---

## 📄 许可

本项目仅供个人学习与参考。

---

> 🌱 **每个人心里都有一片森林。偶尔进来坐坐，跟自己的情绪聊聊天。**
# 🌿 树洞情绪站

一个集心理测评、AI 情绪陪伴、八字命理分析于一体的轻量级 Web 应用。

🔗 **体验地址**：[emotion-treehole.onrender.com](https://emotion-treehole.onrender.com)

---

## ✨ 功能

### 🧠 心理测评
四套独立测评体系，基于经典心理学量表改良设计：
- **焦虑评估** — 基于 GAD-7
- **亲密关系评估** — 基于 ECR 依恋风格
- **大五人格评估** — 简化版大五人格
- **情人匹配图鉴** — 情景判断 + 人格匹配

结果可视化展示在个人中心，支持历史回顾。

### 💬 情绪树洞
AI 驱动的匿名倾诉空间，支持多会话管理，回复结合用户画像，更个性化。

### 🔮 八字命理
- **八字排盘**：输入生日时辰，自动排盘 + AI 流年解读
- **八字合婚**：双人八字六维分析，等级制评分

### 👤 用户系统
注册登录、个人主页、测评历史、画像编辑、账户数据管理。

---

## 🛠 技术栈

**后端**：Python FastAPI · Uvicorn · LLM：DeepSeek V4 Flash  
**数据库**：Supabase PostgreSQL  
**前端**：原生 HTML/CSS/JS · Chart.js  
**部署**：Render

---

## 🚀 本地运行

```bash
git clone https://github.com/shen-xm22/emotion-treehole.git
cd emotion-treehole
pip install -r requirements.txt
# 配置环境变量后
uvicorn server:app --reload --port 8000
```

环境变量配置参考 .env.example。

---

## 📁 项目结构

```
emotion-treehole/
├── server.py             # 后端入口
├── index.html            # 首页
├── auth.html             # 注册 / 登录
├── dashboard.html        # 个人中心
├── treehole.html         # 情绪树洞
├── love-radar.html       # 情人匹配图鉴
├── anxiety-assessment.html
├── relationship-assessment.html
├── personality-assessment.html
├── bazi.html             # 八字排盘
├── bazi-match.html       # 八字合婚
└── static/
    └── lunar.js          # 排盘引擎
```

---

## ⚠️ 说明

- 测评结果不构成医疗诊断，如有需要请寻求专业帮助
- 八字命理内容由 AI 生成，仅供娱乐参考
- 用户原始出生日期不存储，仅存储衍生八字数据

---

> 🌱 每个人心里都有一片森林。偶尔进来坐坐，跟自己的情绪聊聊天。
# 📚 雅思单词学习 - IELTS Vocabulary Learning App

一个功能完整的雅思单词学习网页应用，内置 **1200 个高质量核心词条**（准确释义、音标、英中对照情景例句），支持多用户账户与学习进度云端（本地数据库）同步。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 核心功能

### 👤 账户系统
- 邮箱 + 密码注册/登录（next-auth Credentials，JWT 会话）
- 密码 bcrypt 加密，存储于本地 SQLite（better-sqlite3）
- 学习状态、每日进度、用户设置按账户持久化（`/api/word-records`、`/api/progress`、`/api/settings`）
- 未登录访问受保护页面自动跳转登录页（middleware）

### 📖 学习模式
- 卡片式界面：点击翻转查看翻译、音标和例句
- 学习位置记忆：下次登录从上次的单词继续
- 每日学习量可自定义（25/50/100 个单词）

### 🔊 语音与跟读
- Web Speech API 标准朗读，英式/美式口音切换
- 例句朗读；MediaRecorder 跟读录音、即时回放对比

### 🔄 智能复习
- 基于艾宾浩斯遗忘曲线，复习间隔 1/3/7/15/30 天
- 不认识的单词优先，支持随机打乱

### 📝 测验模式
- 英译中、中译英、拼写三种题型自动组卷
- 自动评分与评级

### 📊 统计分析
- 学习日历、累计/连续天数、今日时长
- recharts 掌握率曲线、数据导出 JSON

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **认证**: next-auth 4（Credentials + JWT）
- **数据库**: better-sqlite3（`data/app.db`，首次运行自动建表）
- **图表/图标**: Recharts / Lucide React
- **语音/录音**: Web Speech API / MediaRecorder API
- **测试**: Vitest（`npm test`，17 个单元测试）

## 📦 安装和运行

### 前置要求
- Node.js 18+（better-sqlite3 为原生模块，安装时需要可编译环境或预编译包）

### 步骤

```bash
cp .env.example .env.local   # 修改 NEXTAUTH_SECRET（openssl rand -base64 32）
npm install
npm run dev                  # 开发模式，http://localhost:3000
```

```bash
npm run build && npm start   # 生产构建与启动
npm test                     # 运行单元测试
```

> 注意：better-sqlite3 依赖本地文件系统，**不适用于 Vercel 等 serverless 平台**，
> 适合自托管（node / docker）。详见 `docs/UPGRADE_NOTES.md`。

## 📁 项目结构

```
ielts-vocabulary-app/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 主学习页面
│   ├── login/ register/      # 登录 / 注册
│   ├── review/ exam/ stats/  # 复习 / 测验 / 统计
│   ├── settings/ onboarding/ # 设置 / 引导
│   └── api/                  # register、auth、word-records、progress、settings
├── components/               # WordCard、WordQuiz、RecordButton 等
├── hooks/                    # useWordRecords、useProgress、useSpeech 等
├── lib/                      # db.ts(SQLite)、auth.ts、spaced-repetition、exam、statistics
├── data/words.json           # 词库：1200 个不重复词条
├── scripts/                  # apply-example-patches.js + patches/（词库批量修订）
├── tests/                    # Vitest 单元测试
├── types/                    # TypeScript 类型定义
└── docs/UPGRADE_NOTES.md     # 数据库/部署说明与遗留事项
```

## 📊 数据结构

### 单词数据格式（data/words.json）

```typescript
{
  "id": 1,
  "word": "copy",
  "translation": "复印",
  "phonetic": "/ˈkɒpi/",
  "example": {
    "en": "Please make a copy of this document for the meeting.",
    "zh": "请为会议复印一份这个文件。"
  },
  "day": 1        // 按天分组（每天约 43 词）
}
```

### 词库质量保证

- 1200 个词条全部不重复，字段完整（`npm test` 自动质检）
- 例句均为人工撰写的雅思听力/阅读情景句，含准确中文对照
- 扩充词库：向 `scripts/patches/` 放入 patch JSON 后运行
  `node scripts/apply-example-patches.js`

## 📝 当前进度

- ✅ 1200 个高质量词条（Day 1-28）
- ✅ 账户系统 + SQLite 学习进度持久化
- ✅ 学习/复习/测验/统计完整闭环
- ✅ Vitest 单元测试
- 🔄 词库继续扩充至 2200 词（见 docs/UPGRADE_NOTES.md）

## 🔮 未来计划

- [ ] 扩充剩余约 1000 个词条
- [ ] 录音与考试历史入库（目前仍在 localStorage）
- [ ] 单词搜索 / 收藏夹
- [ ] 离线 PWA 支持

## 📄 许可证

MIT License

---

**快乐学习，雅思加油！** 🎓✨

# 📚 雅思单词学习 - IELTS Vocabulary Learning App

一个功能完整的雅思单词学习网页应用，帮助你掌握雅思2200核心词汇。

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 核心功能

### 📖 学习模式
- **卡片式界面**：点击翻转查看单词翻译和例句
- **左右切换**：流畅的单词导航体验
- **进度追踪**：实时显示学习进度
- **每日学习量**：可自定义（25/50/100个单词）

### 🔊 语音功能
- **标准朗读**：使用 Web Speech API 实现
- **口音选择**：支持英式/美式发音切换
- **例句朗读**：所有例句都可朗读
- **发音清晰**：优化的语速和音调

### 🎤 跟读录音
- **实时录音**：使用 MediaRecorder API
- **播放对比**：录音后可立即播放
- **多次录音**：每个单词可录制多次
- **本地存储**：录音保存在 localStorage

### ✅ 学习状态
- **认识**：标记已掌握的单词
- **不认识**：需要重点学习
- **需复习**：定期复习巩固
- **自动记录**：学习时间、次数等数据

### 📊 统计分析
- **学习日历**：可视化学习历史
- **累计天数**：追踪学习坚持情况
- **连续天数**：激励持续学习
- **今日时长**：实时统计学习时长
- **掌握率曲线**：使用 recharts 图表展示
- **数据导出**：支持导出 JSON 格式

### 🔄 复习模式
- **智能复习**：基于艾宾浩斯遗忘曲线
- **优先级排序**：不认识的单词优先显示
- **随机打乱**：支持随机复习顺序
- **复习间隔**：1天、3天、7天、15天、30天

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **图标**: Lucide React
- **语音**: Web Speech API
- **录音**: MediaRecorder API
- **存储**: localStorage
- **响应式**: Mobile-first 设计

## 📦 安装和运行

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
ielts-vocabulary-app/
├── app/                      # Next.js App Router 页面
│   ├── page.tsx             # 主学习页面
│   ├── stats/               # 统计页面
│   ├── review/              # 复习模式
│   ├── settings/            # 设置页面
│   ├── onboarding/          # 引导页面
│   ├── layout.tsx           # 全局布局
│   └── globals.css          # 全局样式
├── components/              # React 组件
│   ├── WordCard.tsx         # 单词卡片
│   ├── RecordButton.tsx     # 录音按钮
│   ├── StatusButtons.tsx    # 状态标记
│   ├── ProgressChart.tsx    # 进度图表
│   └── Navigation.tsx       # 底部导航
├── lib/                     # 工具函数
│   ├── storage.ts           # localStorage 操作
│   ├── speech.ts            # 语音功能
│   ├── statistics.ts        # 统计计算
│   └── spaced-repetition.ts # 复习算法
├── hooks/                   # 自定义 Hooks
│   ├── useLocalStorage.ts   # localStorage hook
│   ├── useSpeech.ts         # 语音 hook
│   └── useRecorder.ts       # 录音 hook
├── data/                    # 数据文件
│   └── words.json           # 单词数据（100个）
└── types/                   # TypeScript 类型
    └── index.ts             # 类型定义
```

## 📊 数据结构

### 单词数据格式

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
  "day": 1
}
```

### 学习记录格式

```typescript
{
  "wordId": 1,
  "status": "known" | "unknown" | "review",
  "learnCount": 3,
  "lastReviewTime": "2024-11-14T10:30:00Z",
  "recordings": ["base64_audio_data"],
  "firstLearnTime": "2024-11-10T09:00:00Z"
}
```

## 🎨 功能特性

### 🌓 暗色模式
- 完整的暗色主题支持
- 可在设置中切换
- 自适应系统偏好

### 📱 响应式设计
- 手机优先设计理念
- 完美支持平板和桌面
- 流畅的触摸手势

### 💾 数据管理
- 所有数据存储在浏览器本地
- 支持导出学习数据
- 可清除学习记录或所有数据
- 显示存储使用情况

### 🎯 个性化设置
- 每日学习量：25/50/100 单词
- 发音口音：英式/美式
- 暗色模式开关
- 清除数据功能

## 🚀 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 自动部署完成

```bash
# 或使用 Vercel CLI
npm install -g vercel
vercel
```

## 📝 当前进度

- ✅ 100个雅思单词（Day 1-2）
- ✅ 所有核心功能实现
- ✅ 完整的用户界面
- ✅ 生产环境就绪
- 🔄 待扩展至2200个单词

## 🔮 未来计划

- [ ] 添加剩余2100个单词
- [ ] 单词搜索功能
- [ ] 单词收藏夹
- [ ] 学习提醒功能
- [ ] 社区分享功能
- [ ] 离线PWA支持
- [ ] 更多图表和分析
- [ ] 单词测验模式

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

如有问题或建议，欢迎通过 GitHub Issues 联系。

---

**快乐学习，雅思加油！** 🎓✨

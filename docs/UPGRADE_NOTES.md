# 升级说明（2026-08-28）

## 账户与数据库现状

仓库里同时存在两套数据库痕迹，实际情况如下：

- **正在使用**：`better-sqlite3`（`lib/db.ts`）+ next-auth Credentials 登录。
  注册、登录、学习进度（word_records / daily_progress）、用户设置全部走
  `app/api/*` 路由并持久化到 `data/app.db`（已加入 .gitignore）。
  本次升级中已通过端到端冒烟测试验证：注册 → CSRF → credentials 登录 →
  JWT 会话 → progress / word-records / settings 读写全部正常。
- **未使用**：`prisma/schema.prisma` 是早期规划的 Prisma 数据模型，代码中
  从未引用。为避免误导，已从 package.json 移除 `prisma` / `@prisma/client`
  依赖；schema 文件保留作为将来迁移的参考。

表结构由 `lib/db.ts` 在首次连接时自动 `CREATE TABLE IF NOT EXISTS` 创建，
无需手工迁移。若将来要迁回 Prisma：schema 与现有表字段基本一一对应
（User / WordRecord / DailyProgress / UserSettings），主要工作是把
`lib/user.ts`、`lib/word-record.ts`、`lib/daily-progress.ts`、
`lib/user-settings.ts` 的 SQL 换成 Prisma Client 调用。

注意：`better-sqlite3` 是原生模块，Vercel 等 serverless 平台不适用；
如需部署到 Vercel，需换成 Turso/libSQL、Postgres + Prisma 或退回
localStorage 模式。自托管（node / docker）则开箱即用。

## 本地运行

```bash
cp .env.example .env.local   # 修改 NEXTAUTH_SECRET
npm install
npm run dev
```

## 词库

`data/words.json` 现有 **1200 个不重复词条**。原 201-1200 号词条的例句为
脚本模板生成的垃圾句（如 "The X is an important part of university life"），
本次已全部人工重写为准确的英中对照情景例句，并替换了 76 个重复单词。
批量修订流程：把 `{id: {translation?, en, zh, word?, phonetic?}}` 格式的
patch 文件放进 `scripts/patches/`，运行
`node scripts/apply-example-patches.js` 合并进 words.json，
`npm test` 中的 words-data 测试会自动质检。

## 遗留事项

- 词库距离"雅思 2200 核心词"还差约 1000 词，可按上述 patch 流程继续扩充
  （注意 `day` 字段按每天约 43 词递增分组）。
- `hooks/useLocalStorage.ts`、`lib/storage.ts`、`lib/daily-plan.ts` 仍是
  localStorage 方案（学习记录/录音/考试结果），与数据库方案并存：
  登录用户的进度走数据库，录音与考试历史仍在本地。可考虑后续统一。
- 录音数据以 base64 存 localStorage，容量有限，建议后续入库或改用 IndexedDB。

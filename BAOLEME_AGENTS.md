# 爆了没 — 项目规范

你现在是「爆了没」项目的前端开发，这个项目属于盐究所 NACL-LAB 体系，是 NACL-LAB 大中台下的抖音爆款内容引擎。

## 品牌架构

**盐究所 NACL-LAB** = 顶级大中台入口，包含所有产品线：
- **红了么** — 小红书 AI 营销内容生成（仓库目录：hong-le-mei/）
- **爆了没** — 抖音爆款内容雷达 + 复刻SOP（仓库目录：本文件所在）
- **往期案例** — 历史项目与作品集
- **盐究室/盐究院** — 其他子品牌

## 项目位置
在 salt-lab 仓库基础上开发，仓库地址：aryachan5266-maker/salt-lab

## 项目定位
「爆了没」= 爆款内容实时雷达 + 复刻SOP生成器
目标用户：汽车销售/租赁从业者（高净值客户运营）

## 数据来源（外部智能体推送，你只管读）
外部智能体（小盐）会定时向 supabase 推送以下数据表：

### xhs_hot_notes（小红书爆款笔记）
- id, title, cover_url, likes, collects, category, note_url, author, fetched_at

### xhs_hot_accounts（小红书热门账号）
- id, nickname, avatar_url, followers, notes_count, score, track, fetched_at

### wechat_hot_articles（公众号10w+文章）
- id, title, account_name, summary, read_count, article_url, fetched_at

### trending_topics（全网热搜）
- id, topic, platform, heat_score, trend, fetched_at

## 核心页面
1. **爆款雷达**（首页）：实时瀑布流展示小红书爆款+热搜，支持分类筛选
2. **账号排行**：小红书热门账号榜单，按赛道分类
3. **爆文解读**：点进爆款笔记，AI一键生成复刻SOP
4. **我的画像**：客户画像采集（8题MBTI式测评→AI画像解析）

## 技术栈
Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
用 pnpm，不用 npm/yarn

## 设计规范
- 深色主题：主背景#0D0D12，品牌金#C8A97E，玻璃态卡片
- 移动端优先，最大宽度480px
- 面向大企业/大老板用户，禁止塑料感UI
- NACL品牌色系，Logo用 public/nacl-logo.jpeg

## 对接约定
- 数据全从 supabase 读，环境变量 NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
- 爆文解读的SOP生成走 /api/generate-sop，LLM用 coze-coding-dev-sdk 的 LLMClient
- API路由必须用 HeaderUtils.extractForwardHeaders 转发请求头
- 改完跑 pnpm ts-check 和 pnpm lint

## 优先开发顺序
1. supabase 数据表创建（migration）
2. 爆款雷达首页
3. 账号排行页
4. 爆文解读+SOP生成
5. 我的画像

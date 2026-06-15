# AGENTS.md — 抖音爆款复制机

## 项目概览

抖音爆款复制机 — 运营能力平权工具，让不会运营的普通人拿到专业运营的结果。通过"客户画像倒推内容策略"的核心逻辑，AI替用户分析、规划、写方案，用户只需确认和微调。

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (LLM SDK)
- **模型**: doubao-seed-2-0-lite-260215 (默认)

## 目录结构

```
├── public/                 # 静态资源
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/
│   │   │   ├── analyze-profile/  # 客户画像解析API
│   │   │   ├── generate-sop/     # SOP生成API
│   │   │   └── recommend/        # 爆款推荐API
│   │   ├── globals.css     # 全局样式
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页入口
│   ├── components/
│   │   ├── layout/         # 布局组件 (AppShell, BottomNav)
│   │   ├── onboarding/     # 客户画像采集组件
│   │   ├── discover/       # 爆款发现页组件
│   │   ├── sop/            # SOP生成器组件
│   │   ├── brand/          # 品牌运营中心组件
│   │   ├── insights/       # 数据洞察组件
│   │   ├── profile/        # 个人设置组件
│   │   └── ui/             # shadcn/ui 组件库
│   ├── hooks/              # 自定义 Hooks
│   └── lib/
│       ├── types.ts        # TypeScript 类型定义
│       ├── store.tsx       # 全局状态管理 (React Context + localStorage)
│       ├── helpers.ts      # 工具函数
│       └── utils.ts        # 通用工具函数 (cn)
```

## 核心交互流程

3步流：想触达谁 → 照着做就行 → 一键出方案

1. **客户画像采集** (Onboarding): 3个核心问题 + AI画像解析
2. **爆款发现** (Discover): AI行动卡片流 + 核心数据展示
3. **爆款复刻SOP** (SOP Generator): 5步执行清单，每步有"你的版本"

## 构建与测试命令

- 开发: `pnpm dev`
- 构建: `pnpm build`
- TypeScript检查: `pnpm ts-check`
- Lint: `pnpm lint`
- 生产启动: `pnpm start`

## 编码规范

- 仅使用 pnpm 作为包管理器
- TypeScript strict 模式
- 禁止隐式 any 和 as any
- 所有 API 路由使用 LLM SDK (coze-coding-dev-sdk)
- API 必须使用 HeaderUtils.extractForwardHeaders 转发请求头
- 前端状态管理使用 React Context + localStorage
- 移动端优先设计，最大宽度 480px

## 设计规范

参见 DESIGN.md — 核心色调: 活力红 #FF4757，浅灰白背景 #FAFAFA，卡片白色

## API 路由

1. `/api/analyze-profile` - POST: 客户画像解析，返回内容策略/调性/格式建议
2. `/api/generate-sop` - POST: 生成5步SOP执行清单
3. `/api/recommend` - POST: 基于画像推荐爆款视频方向

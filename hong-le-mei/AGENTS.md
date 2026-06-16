# AGENTS.md · 红了么

## 项目概览

红了么是盐究所 NACL-LAB 体系下的小红书 AI 营销结果工具，核心理念是"按人+目标组织，不按功能组织"。用户选角色+说一句话，一键产出可直接发布的笔记+预览图+营销逻辑说明。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI SDK**: coze-coding-dev-sdk (LLM / Image / TTS)
- **字体**: Orbitron(标题) + Share Tech Mono(HUD数据) + Noto Sans SC(中文)

## 目录结构

```
├── public/prototype/          # 原型 HTML 预览
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页(角色/一句话入口)
│   │   ├── generate/page.tsx  # 生成结果页(三件套)
│   │   ├── brand-assets/      # 品牌资产空间
│   │   ├── topic-engine/      # 选题引擎
│   │   ├── content-factory/   # 内容工厂
│   │   ├── publish/           # 发布管理
│   │   ├── data-review/       # 数据复盘
│   │   ├── knowledge-base/    # 知识库
│   │   ├── settings/          # 系统设置
│   │   ├── api/
│   │   │   ├── generate/
│   │   │   │   ├── copy/route.ts   # 文案生成(流式SSE)
│   │   │   │   ├── image/route.ts  # 生图(豆包)
│   │   │   │   └── tts/route.ts    # TTS语音合成
│   │   │   └── capabilities/route.ts # 能力探测
│   │   ├── layout.tsx         # 根布局(侧边栏+顶栏)
│   │   └── globals.css        # 设计Token + 全局样式
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   └── store.tsx          # 全局状态(Zustand)
│   └── lib/
│       ├── roles.ts           # 角色配置+差异化prompt
│       ├── sdk.ts             # SDK客户端
│       └── utils.ts           # 工具函数
├── .cozeproj/prototype/web/   # 设计原型
├── DESIGN.md                  # 设计规范
└── AGENTS.md                  # 本文件
```

## 构建与测试命令

- 安装依赖: `pnpm install`
- 开发: `pnpm run dev` (端口 5000)
- 构建: `pnpm run build`
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/generate/copy` | POST | 流式文案生成(SSE)，参数: role, input, gender, industry |
| `/api/generate/image` | POST | 文生图，参数: prompt, size |
| `/api/generate/tts` | POST | TTS语音合成，参数: text, voiceId |
| `/api/capabilities` | GET | 能力探测，返回各模块可用状态 |

## 编码规范

- 严格 TypeScript，禁止隐式 any
- 包管理仅用 pnpm
- 前端用 shadcn/ui 组件 + Tailwind class
- 视觉风格: 金属枪灰 HUD (参照 DESIGN.md)
- 后端 AI 调用全部走 coze-coding-dev-sdk，不放密钥到前端
- 流式输出优先: 文案生成用 SSE，前端打字机渲染

## 角色差异化 Prompt

5 个角色各有独立 system prompt (见 `src/lib/roles.ts`):
- **老板(boss)**: 全局视角、战略口径、数据说话
- **运营(operator)**: 选题钩子、内容结构、节奏
- **销售(sales)**: 获客转化话术、强 CTA、加微/到店引导
- **实体店主(shop-owner)**: 同城引流、到店转化、本地生活
- **个人IP(personal-ip)**: 人设打造、涨粉钩子、记忆点

## 能力状态

| 能力 | 状态 | 模型 | 备注 |
|------|------|------|------|
| 文案生成 | ✅ 已打通 | doubao-seed-2-0-lite-260215 | 流式 SSE |
| 文生图 | ✅ 已打通 | doubao-seedream-5-0-260128 | 中文不乱码 |
| TTS | ✅ 已打通 | 扣子 TTS | 多音色 |
| 数字人/对口型 | ❌ 未开放 | - | SDK无此接口，降级为图片+配音 |

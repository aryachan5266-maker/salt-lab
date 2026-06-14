# 红了没 · HONG LE MEI

> **小红书 AI 营销结果工具** — 属于「盐究室 · Salt Lab」体系

用户选角色 + 说一句话，一键产出「可直接发布的笔记 + 已发布态预览图 + 营销逻辑说明」。

## 核心差异化

1. **按"人 + 目标"组织**，不按功能组织 — 入口是"你是谁、你要什么结果"
2. **输出是成品**，不是半成品 — 直接给可发布的笔记 + 已发布态预览图
3. **每条内容附"营销逻辑"** — 说清钩子是什么、想打动/转化谁
4. **全行业通用**，不锁垂类

## 技术栈

| 层 | 技术 |
|---|------|
| Framework | Next.js 16 (App Router) |
| Core | React 19 |
| Language | TypeScript 5 |
| UI | shadcn/ui + Tailwind CSS 4 |
| AI SDK | coze-coding-dev-sdk |
| 状态管理 | Zustand |
| 字体 | Orbitron / Share Tech Mono / Noto Sans SC |

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 首页（角色/一句话入口）
│   ├── generate/page.tsx     # 生成结果页（三件套）
│   ├── brand-assets/         # 品牌资产空间
│   ├── topic-engine/         # 选题引擎
│   ├── content-factory/      # 内容工厂
│   ├── publish/              # 发布管理
│   ├── data-review/          # 数据复盘
│   ├── knowledge-base/       # 知识库
│   ├── settings/             # 系统设置
│   └── api/
│       ├── generate/copy/    # 文案生成（流式 SSE）
│       ├── generate/image/   # 文生图（豆包 Seedream）
│       ├── generate/tts/     # TTS 语音合成
│       └── capabilities/     # 能力探测
├── components/
│   ├── ui/                   # shadcn/ui 组件
│   └── store.tsx             # Zustand 全局状态
└── lib/
    ├── roles.ts              # 5个角色差异化 prompt
    ├── sdk.ts                # SDK 客户端初始化
    └── utils.ts              # 工具函数
```

## 已实现能力

| 能力 | 状态 | 模型 | 说明 |
|------|------|------|------|
| 文案生成 | ✅ 已打通 | doubao-seed-2-0-lite-260215 | 流式 SSE，5角色差异化 prompt |
| 文生图 | ✅ 已打通 | doubao-seedream-5-0-260128 | 中文不乱码，小红书3:4/抖音9:16 |
| TTS 语音 | ✅ 已打通 | 扣子 TTS | 多音色（龙小春/龙小白等） |
| 数字人/对口型 | ❌ 未开放 | — | SDK 无此接口，降级为图片+配音+字幕 |

### 角色差异化 Prompt

| 角色 | 输出侧重 |
|------|---------|
| 老板 (boss) | 全局视角、战略口径、数据说话、思想领导力 |
| 运营 (operator) | 选题钩子、内容结构、节奏、可复用模板 |
| 销售 (sales) | 获客转化话术、强 CTA、加微/到店引导 |
| 实体店主 (shop-owner) | 同城引流、到店转化、本地生活属性 |
| 个人IP (personal-ip) | 人设打造、涨粉钩子、记忆点 |

## 本地开发

```bash
pnpm install
pnpm run dev    # 端口 5000
```

## 部署

```bash
pnpm run build
pnpm run start  # 端口由 DEPLOY_RUN_PORT 环境变量决定
```

## 盐究室 · Salt Lab

本项目是「盐究室」体系下的第一个子项目。盐究室的目标是构建多平台 AI 营销智能体矩阵：

- **咸聊 AI**（本项目）— 小红书 + 抖音营销内容生成
- **抖音专项**（规划中）— 抖音热点抓取 + 视频脚本 + 数字人口播
- **公众号/视频号**（预留）— 微信生态内容生成
- **统一智能体**（远期）— 多平台汇总的完整营销智能体

## License

Private — Salt Lab

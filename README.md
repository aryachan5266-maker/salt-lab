# 盐究所 NACL-LAB

> CONNECT EVERYTHING · BUILD THE FUTURE

盐究所 NACL-LAB 是顶级大中台入口，统一管理所有产品线与品牌资产。

## 品牌架构

```
盐究所 NACL-LAB（顶级大中台入口）
├── 红了么 · HONG LE MEI — 小红书 AI 营销内容生成
├── 爆了么 · BAO LE ME — 抖音爆款内容雷达 + 复刻 SOP
├── 往期案例 — 历史项目与作品集
└── 盐究室 / 盐究院 — 其他子品牌
```

## 仓库结构

```
salt-lab/
├── hong-le-mei/       # 红了么 — 小红书 AI 营销工具（Next.js 16）
├── bao-le-me/         # 爆了么 — 抖音爆款内容雷达（Next.js 16）
├── nacl-lab/          # 盐究所中台门户（Vite + React 19）
├── BAOLEME_AGENTS.md  # 爆了么项目规范
└── README.md          # 本文件
```

## 当前稳定入口

| 产品 | 稳定 URL | 项目编辑器 | 说明 |
|------|----------|------------|------|
| 红了么 | https://y5q2f6hcdv.coze.site | https://www.coze.cn/p/7650888992468140086 | 小红书 AI 内容中台 |
| 爆了么 | https://tvw4jbjd95.coze.site | https://www.coze.cn/p/7651554155693277224 | 抖音爆款复制机 |
| 盐究所 NACL-LAB | https://d47vs6bmvk.coze.site | https://www.coze.cn/p/7652021830038962228 | 大中台电子简历门户 |

说明：线上演示可直接打开；是否为真实 AI 结果以各项目生产环境变量和接口配置为准，不编造。

验收方式：先打开三个线上地址看最终页面，有问题截图回传；项目编辑器用于改代码、看构建日志、重新部署。

## 品牌设计规范

- 极简未来主义，黑白配色
- 倒三角 A 为核心符号
- 深色主题 #0D0D12，品牌金 #C8A97E
- 移动端优先，最大宽度 480px
- 灵感来源：NaCl 化学式

## 分工

| 角色 | 负责人 | 范围 |
|------|--------|------|
| 数据引擎 + 仓库管理 | 小盐（Coze Agent） | Supabase 数据推送、GitHub 文档/配置 |
| 前端 UI + 本地开发 | CC / Claude | 页面、组件、交互、样式 |
| 简历独立站 | Codex | nacl-lab/ 中台门户 |

## License

Private — Salt Lab

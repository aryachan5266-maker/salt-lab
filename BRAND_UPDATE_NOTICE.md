# 🔔 品牌更新通知

> 2026-06-15 · 盐究所 NACL-LAB 品牌架构调整

## 变更内容

### 1. 名称修正：「红了没」→「红了么」

小红书产品线正式名称为 **红了么**，此前文档中误写为"红了没"，现已全部修正。

### 2. 品牌架构层级明确

盐究所 NACL-LAB 不是与其他产品平级的品牌，而是**顶级大中台入口**，所有产品线都归属其下：

```
盐究所 NACL-LAB（顶级大中台入口）
├── 红了么 · HONG LE ME — 小红书 AI 营销内容生成
├── 爆了没 · BAO LE ME — 抖音爆款内容雷达 + 复刻SOP
├── 往期案例 — 历史项目与作品集
└── 盐究室 / 盐究院 — 其他子品牌
```

### 3. 仓库结构

```
salt-lab/
├── nacl-lab/          # 盐究所中台门户（Vite + React 19）
├── hong-le-mei/       # 红了么 — 小红书 AI 营销工具（Next.js 16）
├── BAOLEME_AGENTS.md  # 爆了没项目规范
├── README.md          # 仓库总入口
└── BRAND_UPDATE_NOTICE.md  # 本文件
```

### 4. 已修改的文件

| 文件 | 变更 |
|------|------|
| `README.md` | 新建，展示完整品牌架构与仓库结构 |
| `hong-le-mei/README.md` | "红了没"→"红了么"，品牌归属改为 NACL-LAB 体系 |
| `BAOLEME_AGENTS.md` | 加入品牌架构说明，明确层级关系 |
| `nacl-lab/` | 新增，中台门户完整项目源码 |

---

**涉及协作方**：CC/Claude、Codex、小盐（Coze Agent）
**请各协作方拉取最新代码**：`git pull origin main`

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  CircleDollarSign,
  Contact,
  Copy,
  ExternalLink,
  FileSearch,
  GitBranch,
  Layers3,
  LockKeyhole,
  MonitorPlay,
  Orbit,
  PlayCircle,
  Rocket,
  ShieldCheck,
  X,
  Workflow,
} from "lucide-react";

type ProjectLink = {
  label: string;
  href?: string;
  disabled?: boolean;
};

type EvidenceFragment = {
  src: string;
  label: string;
  note: string;
};

type Category = "经营系统" | "营销智能体" | "本地自动化";

// 实测模式：live/embed=已部署可在站内点测；prototype=自托管静态原型；
// external=外部可跳转入口；gallery=私有系统仅打码截图；planned=规划中尚未开发。
type DemoMode = "live" | "embed" | "prototype" | "external" | "gallery" | "planned";

type Demo = {
  mode: DemoMode;
  url?: string;
  cta?: string;
};

type Project = {
  title: string;
  label: string;
  category: Category;
  summary: string;
  image: string;
  gallery: string[];
  evidence: EvidenceFragment[];
  demo: Demo;
  role: string;
  what: string;
  value: string;
  proof: string;
  status: string;
  links: ProjectLink[];
};

type SkillNode = {
  name: string;
  title: string;
  copy: string;
  className: string;
};

const projects: Project[] = [
  {
    title: "FleetFlow",
    label: "租车连锁经营管理系统",
    category: "经营系统",
    summary: "把租车业务的客户、订单、车辆、财务、风险规则拆成可运行系统。",
    image: "/assets/projects/data-vault-wide.webp",
    gallery: [
      "/assets/projects/data-vault-wide.webp",
      "/assets/projects/logic-lab-wide.webp",
      "/assets/projects/archive-hall-wide.webp",
    ],
    evidence: [],
    demo: { mode: "prototype", url: "/demos/fleetflow/index.html", cta: "本地预览" },
    role: "出业务框架、订单/财务逻辑、经营规则拆解",
    what: "React + Vite + Node + MySQL 的租车经营系统，覆盖客户、订单、车辆、财务、合同、会员、销售与 AI 营销工具，框架用 base44 搭建。",
    value:
      "把散落在表格、流程和人工经验里的经营规则，整理成可交付、可协同、可继续产品化的系统资产。",
    proof:
      "本页只接入脱敏本地预览，不公开源码仓库；完整系统包含订单生命周期、资金流向、结算规则库、数据字典、经营指标字典和风险规则库。",
    status: "本地预览已接入",
    links: [{ label: "源码不公开 · 看本地预览", disabled: true }],
  },
  {
    title: "盐究室会员 CRM",
    label: "客户分层与会员运营系统",
    category: "经营系统",
    summary: "围绕客户 360 看板、会员分层、跟进节奏和转化漏斗设计的经营系统。",
    image: "/assets/projects/ai-engine-wide.webp",
    gallery: ["/assets/projects/ai-engine-wide.webp"],
    evidence: [],
    demo: { mode: "prototype", url: "/demos/saltlab-crm/index.html", cta: "看系统" },
    role: "主导 CRM 结构、客户分层、跟进节奏与会员运营逻辑",
    what: "围绕客户 360 看板、会员分层、销售跟进、复盘和转化漏斗设计的经营系统（HTML 主程序 + Python 后端同步脚本）。",
    value: "不是记录客户，而是让线索被跟进、问题被发现、成交动作被管理。",
    proof: "自建系统，主程序与后端同步脚本已成型；公开实测版本将用脱敏 / 演示数据接入，真实客户数据不公开。",
    status: "自建系统",
    links: [{ label: "源码不公开 · 本地演示", disabled: true }],
  },
  {
    title: "Z 财务",
    label: "经营财务系统",
    category: "经营系统",
    summary: "把资金流、结算口径、系统健康和财务执行环境放到同一张经营视图。",
    image: "/assets/projects/archive-hall-wide.webp",
    gallery: ["/assets/redacted/money-dashboard-redacted.webp"],
    evidence: [
      {
        src: "/assets/evidence/money-nav-fragment.webp",
        label: "中台入口",
        note: "模块切换与角色入口",
      },
      {
        src: "/assets/evidence/money-health-fragment.webp",
        label: "运行检查",
        note: "系统健康与配置核验",
      },
      {
        src: "/assets/evidence/money-rules-fragment.webp",
        label: "财务规则",
        note: "规则区已打码处理",
      },
    ],
    demo: { mode: "gallery" },
    role: "定义财务口径、资金流、结算与风险视角",
    what: "围绕租车业务的收款、付款、押金、退款、挂靠/同行结算、异常与风险追踪建立后台视图。",
    value: "目标是让老板、财务、销售和交付团队看同一套经营事实，而不是各说各的表格。",
    proof: "已只读登录并采集首页系统健康截图；上线使用范围和真实效率数据需候选人确认后公开。",
    status: "只读截图已打码",
    links: [{ label: "内部系统 · 截图见详情", disabled: true }],
  },
  {
    title: "Trial System",
    label: "试岗系统",
    category: "经营系统",
    summary: "把试岗、任务、候选人跟进和面聊记录变成可复盘的组织流程。",
    image: "/assets/projects/operator-console-wide.webp",
    gallery: ["/assets/redacted/hr-dashboard-redacted.webp"],
    evidence: [
      {
        src: "/assets/evidence/hr-nav-fragment.webp",
        label: "流程入口",
        note: "试岗与资料模块",
      },
      {
        src: "/assets/evidence/hr-metrics-fragment.webp",
        label: "状态指标",
        note: "候选流程概览",
      },
      {
        src: "/assets/evidence/hr-workflow-fragment.webp",
        label: "跟进记录",
        note: "记录内容已打码",
      },
    ],
    demo: { mode: "gallery" },
    role: "把招聘判断拆成流程、任务和可复盘节点",
    what: "用于试岗流程管理、候选人跟进、任务推进和组织协同的管理系统。",
    value: "把靠感觉的招人判断，转成可记录、可比较、可沉淀的流程资产。",
    proof: "已只读登录并采集管理后台截图；真实使用对象和完整流程节点需候选人确认后公开。",
    status: "只读截图已打码",
    links: [{ label: "内部系统 · 截图见详情", disabled: true }],
  },
  {
    title: "红了么",
    label: "小红书产品线",
    category: "营销智能体",
    summary: "覆盖选题引擎、内容工厂、知识库、品牌资产、发布与数据复盘的小红书营销产品线。",
    image: "/assets/projects/logic-lab-wide.webp",
    gallery: ["/assets/projects/logic-lab-wide.webp"],
    evidence: [],
    demo: {
      mode: "external",
      url: "https://6b29c3af-3804-4ab6-a217-b1365cda298d.dev.coze.site",
      cta: "全屏实测",
    },
    role: "定义内容工厂、选题引擎、品牌资产与发布闭环的产品框架",
    what: "覆盖选题引擎、内容工厂、知识库、品牌资产、发布与数据复盘的小红书营销智能体（Coze + Next.js）。文案、配图和语音生成已真实打通，角色差异化与行业上下文知识库持续迭代。",
    value: "把『写小红书』从灵感活，变成有选题、有素材库、可批量产出和复盘的流水线。",
    proof: "线上 Demo 已接入，可直接点开实测：选角色 → 一句话 → 出可发布笔记 + 配图 + 营销逻辑拆解。持续迭代中；正式发布前按品牌协议替换为稳定部署地址。",
    status: "活 Demo 已接入",
    links: [
      {
        label: "全屏实测",
        href: "https://6b29c3af-3804-4ab6-a217-b1365cda298d.dev.coze.site",
      },
    ],
  },
  {
    title: "爆了么",
    label: "抖音短视频产品线",
    category: "营销智能体",
    summary: "把已验证的内容工厂模式迁移到抖音 / 短视频，生成可复制的爆款执行方案。",
    image: "/assets/projects/concrete-grid-square.webp",
    gallery: ["/assets/projects/concrete-grid-square.webp"],
    evidence: [],
    demo: {
      mode: "external",
      url: "https://0ed6e1df-d2d6-4baa-a7e3-f4bf3643df5c.dev.coze.site",
      cta: "全屏实测",
    },
    role: "把小红书跑通的内容工厂模式迁移到短视频平台",
    what: "抖音 / 短视频内容营销智能体，复用选题—产出—发布—复盘的内容闭环，生成可复制的爆款执行方案。",
    value: "把已跑通的内容流水线模式，复制到第二个流量平台。",
    proof: "首版线上 Demo 已接入，可点开实测；持续迭代中。正式发布前按品牌协议替换为稳定部署地址。",
    status: "活 Demo 已接入（迭代中）",
    links: [
      {
        label: "全屏实测",
        href: "https://0ed6e1df-d2d6-4baa-a7e3-f4bf3643df5c.dev.coze.site",
      },
    ],
  },
  {
    title: "Local Automation",
    label: "客资监测 / 销售质量监测",
    category: "本地自动化",
    summary: "把客户资源流转、销售响应和异常信号变成可触发的本地自动化。",
    image: "/assets/projects/command-table-wide.webp",
    gallery: ["/assets/projects/command-table-wide.webp"],
    evidence: [],
    demo: { mode: "gallery" },
    role: "把销售现场判断拆成可触发的监测规则",
    what: "监控客户资源流转、销售质量、响应节奏和异常信号，辅助管理层复盘。",
    value: "把业务经验从个人脑子里拿出来，变成公司可以持续运行的自动化机制。",
    proof: "当前作为本地自动化案例呈现；规则截图和业务结果需候选人确认后开放。",
    status: "内部自动化",
    links: [{ label: "内部系统 · 截图见详情", disabled: true }],
  },
];

const categories = ["全部", "经营系统", "营销智能体", "本地自动化"] as const;
type Filter = (typeof categories)[number];

const interactiveModes: DemoMode[] = ["live", "embed", "prototype", "external"];

function isLiveProduct(project: Project) {
  return project.category === "营销智能体" && project.demo.mode === "external";
}

function agentStatus(demo: Demo): { text: string; tone: string } {
  switch (demo.mode) {
    case "live":
    case "embed":
      return demo.url
        ? { text: "可实测", tone: "live" }
        : { text: "待接入", tone: "pending" };
    case "prototype":
      return demo.url
        ? { text: "原型实测", tone: "live" }
        : { text: "原型可看", tone: "proto" };
    case "external":
      return demo.url
        ? { text: "可跳转", tone: "live" }
        : { text: "待接入", tone: "pending" };
    case "gallery":
      return { text: "内部 · 截图", tone: "internal" };
    case "planned":
      return { text: "建设中", tone: "planned" };
  }
}

const navItems = [
  { label: "指挥舱", href: "#command" },
  { label: "知识星球", href: "#asset" },
  { label: "工作正面", href: "#journey" },
  { label: "总看板", href: "#cases" },
  { label: "联系", href: "#contact" },
];

const pyramid = [
  {
    title: "用透 AI",
    subtitle: "不止会用 · 用到极致",
    copy: "技术最不值钱，稀缺的是判断：哪种 AI、用在哪、怎么接进真实业务。",
  },
  {
    title: "拆得开生意",
    subtitle: "任何行业 · 拆到底层",
    copy: "钱怎么进、怎么出、卡在哪、风险在哪——换个行业，照样拆成能管的结构。",
  },
  {
    title: "让它赚到钱",
    subtitle: "闭环 · 最难也最值钱",
    copy: "找客户、交付、收钱、复购、转介绍，跑通完整的变现闭环。",
  },
];

const skillNodes: SkillNode[] = [
  {
    name: "Framework",
    title: "产品框架",
    copy: "先定义业务闭环，再决定技术实现。",
    className: "node-a",
  },
  {
    name: "Finance",
    title: "财务逻辑",
    copy: "订单、押金、结算、风险必须能对账。",
    className: "node-b",
  },
  {
    name: "Conversion",
    title: "客户转化",
    copy: "能讲清为什么买、怎么交付、怎么复购。",
    className: "node-c",
  },
  {
    name: "Prototype",
    title: "AI 原型",
    copy: "用 Base44 / AI coding 快速把方向变成 Demo。",
    className: "node-d",
  },
  {
    name: "Delivery",
    title: "团队协同",
    copy: "框架定清楚，技术细节交团队一次沟通落地。",
    className: "node-e",
  },
  {
    name: "Loop",
    title: "交付闭环",
    copy: "从客户反馈回到产品迭代和销售话术。",
    className: "node-f",
  },
];

const facts = [
  "FleetFlow README 核验：React + Vite / Node + Express / MySQL",
  "财务文档核验：订单生命周期、资金流向、结算规则、风险规则",
  "公开页只展示脱敏预览和可讲事实，不放源码仓库入口",
  "未确认的业务数字不在公开页面展示，避免给招聘方看到无来源结论",
];

type ContactItem = {
  type: "email" | "phone" | "boss" | "wechat";
  label: string;
  value?: string;
};

const contacts: ContactItem[] = [
  { type: "wechat", label: "微信" },
  { type: "phone", label: "电话" },
  { type: "email", label: "邮箱" },
  { type: "boss", label: "Boss 直聘" },
];

const journey = [
  {
    stage: "I",
    title: "把生意拆开看",
    years: "Stage 01",
    copy: "不管哪个行业，先把客户、钱、流程、风险拆成一张能管的结构图。",
    image: "/assets/projects/data-vault-wide.webp",
  },
  {
    stage: "II",
    title: "当天把想法变成能用的东西",
    years: "Stage 02",
    copy: "不秀工具，只看哪种 AI 能把这件事做到最快、最好。",
    image: "/assets/projects/ai-engine-wide.webp",
  },
  {
    stage: "III",
    title: "判断它到底能不能变成钱",
    years: "Stage 03",
    copy: "围绕客户痛点、成交动作、交付和复购转介绍，只认一个结果：有没有人愿意买单。",
    image: "/assets/projects/command-table-wide.webp",
  },
];

const commandTiles = [
  {
    icon: BrainCircuit,
    title: "AI 接进业务",
    copy: "先判断哪里该用 AI，再决定用什么工具。",
  },
  {
    icon: Workflow,
    title: "经营拆成系统",
    copy: "客户、钱、流程、风险拆成能协同的结构。",
  },
  {
    icon: CircleDollarSign,
    title: "结果只看买单",
    copy: "不炫技，盯成交、交付、复购和现金流。",
  },
  {
    icon: ShieldCheck,
    title: "隐私先打码",
    copy: "证据可看，真实客户和财务数据不公开。",
  },
];

const knowledgeSignals = [
  "赛博日记",
  "决策轨道",
  "Skill 沉淀",
  "Token 消耗",
  "复盘流",
  "待接入数据",
];

const dashboardRows = [
  { label: "公开案例", value: `${projects.length}`, note: "来自 projects 数组" },
  {
    label: "可实测入口",
    value: `${projects.filter((project) => interactiveModes.includes(project.demo.mode)).length}`,
    note: "原型 / 外链 / 可嵌入",
  },
  { label: "价值结果", value: "待确认", note: "不写无来源数字" },
  { label: "真实数据", value: "已脱敏", note: "私有系统只展示截图碎片" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

function SectionTitle({
  shadow,
  title,
  copy,
}: {
  shadow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="section-title">
      <span className="shadow-title">{shadow}</span>
      <h2>{title}</h2>
      {copy ? <p>{copy}</p> : null}
    </div>
  );
}

function CommandDashboard() {
  return (
    <section className="command-section" id="command">
      <SectionTitle
        shadow="COMMAND"
        title="把业务、客户、钱、团队和 AI 拆成可运行系统"
        copy="这一层不是工具熟练度，而是能不能把老板脑子里的增长命题，拆成团队可以执行、复盘和继续迭代的系统。"
      />
      <div className="command-grid">
        <div className="command-index" aria-hidden="true">
          <span>01</span>
          <strong>NACL-LAB</strong>
          <p>AI Commercialization Console</p>
        </div>
        <div className="command-bento">
          {commandTiles.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className={`command-tile tile-${index + 1}`}
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeUp}
                transition={{ duration: 0.48, delay: index * 0.06 }}
              >
                <Icon size={20} />
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function KnowledgeDashboard() {
  return (
    <section className="asset-section knowledge-dashboard" id="asset">
      <SectionTitle
        shadow="PLANET"
        title="赛博日记不是记录，是个人经营资产"
        copy="把决策、技能、复盘和工具消耗沉淀成可检索、可迁移的知识星球；没有来源的数据只作为结构占位。"
      />
      <div className="knowledge-grid">
        <div className="knowledge-planet">
          <SkillOrbit />
        </div>
        <div className="knowledge-panel">
          <div className="panel-header">
            <BrainCircuit size={16} />
            <span>knowledge console</span>
          </div>
          <div className="signal-list">
            {knowledgeSignals.map((signal) => (
              <div className="signal-row" key={signal}>
                <span>{signal}</span>
                <strong>{signal === "待接入数据" ? "占位" : "运行中"}</strong>
              </div>
            ))}
          </div>
          <p>
            这一块未来可以接 Obsidian / 赛博日记 / 自动化日志的脱敏截图或接口摘要；当前不伪造成长数据、token 数字或效率结论。
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkConsole() {
  return (
    <section className="work-console" id="journey">
      <SectionTitle
        shadow="WORK"
        title="正面工作：我创造过什么，也准备把什么迁移到下一家公司"
        copy="用作品、流程、证据和未来迁移能力说话，不用没有来源的业务数字包装自己。"
      />
      <div className="work-grid">
        <div className="work-index" aria-hidden="true">
          <span>03</span>
          <strong>Selected Work</strong>
        </div>
        <div className="work-stack">
          {journey.map((item, index) => (
            <motion.article
              className="work-card"
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="work-media">
                <img src={item.image} alt="" loading="lazy" />
              </div>
              <div className="work-copy">
                <span>{item.stage}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EvidenceConsole() {
  return (
    <section className="evidence-section" id="evidence">
      <div className="portrait-blend">
        <img src="/assets/projects/operator-portrait-vertical.webp" alt="candidate visual portrait" loading="lazy" />
      </div>
      <div className="evidence-copy">
        <SectionTitle
          shadow="PROOF"
          title="证据先打码，再展示"
          copy="候选人负责出框架、定业务 / 财务逻辑、定方向。私有系统只公开脱敏截图和可讲事实。"
        />
        <EvidencePanel />
      </div>
    </section>
  );
}

function EvidencePanel() {
  return (
    <div className="evidence-panel" aria-label="核验事实">
      <div className="panel-header">
        <FileSearch size={16} />
        <span>verified evidence</span>
      </div>
      <div className="terminal-lines">
        {facts.map((fact, index) => (
          <div className="terminal-line" key={fact}>
            <span>0{index + 1}</span>
            <p>{fact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectLinks({ links }: { links: ProjectLink[] }) {
  return (
    <div className="project-links">
      {links.map((link) =>
        link.href && !link.disabled ? (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
            <ExternalLink size={15} />
          </a>
        ) : (
          <button key={link.label} type="button" disabled>
            {link.label}
          </button>
        ),
      )}
    </div>
  );
}

function EvidenceDisplay({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  if (!project.evidence.length) {
    return (
      <div className={`visual-device ${compact ? "compact" : ""}`}>
        <img src={project.image} alt={`${project.title} visual`} loading="lazy" />
        <div className="media-scan" />
        <div className="screenshot-slot">
          <span>{project.status}</span>
          <strong>{project.label}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className={`evidence-device ${compact ? "compact" : ""}`}>
      <div className="device-bg" />
      <div className="device-header">
        <span>LIVE SYSTEM EVIDENCE</span>
        <strong>{project.label}</strong>
      </div>
      <div className="fragment-stack">
        {project.evidence.map((item, itemIndex) => (
          <figure className={`fragment-card fragment-${itemIndex + 1}`} key={item.src}>
            <img src={item.src} alt={`${project.title} ${item.label}`} loading="lazy" />
            <figcaption>
              <span>{item.label}</span>
              <small>{item.note}</small>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="signal-rail">
        <span>只读采集</span>
        <span>隐私打码</span>
        <span>动态展示层</span>
      </div>
      <div className="scan-beam" />
      <div className="data-pulse pulse-a" />
      <div className="data-pulse pulse-b" />
    </div>
  );
}

function AgentCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const status = agentStatus(project.demo);
  const planned = project.demo.mode === "planned";
  const cta =
    project.demo.cta ??
    (project.demo.mode === "gallery" ? "看证据" : planned ? "敬请期待" : "启动");
  const launchHref = interactiveModes.includes(project.demo.mode)
    ? project.demo.url
    : undefined;

  return (
    <motion.article
      className={`agent-card${isLiveProduct(project) ? " live-product" : ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <button
        className="agent-thumb"
        type="button"
        onClick={onOpen}
        aria-label={`打开 ${project.title} 控制台`}
      >
        <img src={project.image} alt="" loading="lazy" />
        <span className="agent-cat">{project.category}</span>
        <span className={`status-chip tone-${status.tone}`}>
          <i className="chip-dot" />
          {status.text}
        </span>
      </button>
      <div className="agent-body">
        <h3>{project.title}</h3>
        <span className="agent-label">{project.label}</span>
        <p className="agent-summary">{project.summary}</p>
      </div>
      <div className="agent-foot">
        {launchHref ? (
          <a
            className="launch-btn"
            href={launchHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.title} ${cta}`}
          >
            <PlayCircle size={16} />
            {cta}
            {project.demo.mode === "external" ? <ExternalLink size={14} /> : null}
          </a>
        ) : (
          <button
            type="button"
            className="launch-btn"
            onClick={onOpen}
            disabled={planned}
          >
            <PlayCircle size={16} />
            {cta}
          </button>
        )}
      </div>
    </motion.article>
  );
}

function DemoStage({ project }: { project: Project }) {
  const { demo } = project;
  const liveUrl =
    demo.mode !== "external" && interactiveModes.includes(demo.mode)
      ? demo.url
      : undefined;

  if (demo.mode === "external" && demo.url) {
    return (
      <div className="demo-pending demo-linkout">
        <MonitorPlay size={26} />
        <strong>全屏实测入口</strong>
        <p>该产品会作为完整应用在新窗口打开，不在中台里缩成小 iframe。站内只保留概览、证据和入口。</p>
        <a
          className="demo-open"
          href={demo.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          打开全屏实测
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  if (!liveUrl) {
    return (
      <div className="demo-pending">
        <Rocket size={26} />
        <strong>实测入口待接入</strong>
        <p>
          {demo.mode === "planned"
            ? "该智能体仍在规划阶段，敬请期待。"
            : "为避免泄露真实数据，可点实测版本将用脱敏 / 演示数据部署后挂入这里。"}
        </p>
      </div>
    );
  }

  return (
    <div className="demo-stage">
      <div className="demo-frame">
        <div className="demo-bar">
          <span />
          <span />
          <span />
          <em>{liveUrl}</em>
        </div>
        <iframe src={liveUrl} title={`${project.title} 实测`} loading="lazy" />
      </div>
      <a
        className="demo-open"
        href={liveUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        新窗口打开
        <ExternalLink size={14} />
      </a>
    </div>
  );
}

function AgentConsole({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const hasEvidence = project.evidence.length > 0 || project.gallery.length > 0;
  const canDemo = interactiveModes.includes(project.demo.mode);
  const tabs: string[] = ["概览"];
  if (hasEvidence) tabs.push("证据");
  if (canDemo) tabs.push("实测");

  const [tab, setTab] = useState<string>(
    canDemo && project.demo.url ? "实测" : "概览",
  );

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".case-modal button:not([disabled]), .case-modal a[href], .case-modal [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const status = agentStatus(project.demo);

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <motion.div
        className="case-modal console"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-modal-title"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-commandbar">
          <button
            ref={closeButtonRef}
            className="modal-back"
            type="button"
            onClick={onClose}
            aria-label="返回作品列表"
          >
            <ArrowLeft size={17} />
            返回作品列表
          </button>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="关闭智能体控制台"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-top">
          <div>
            <span>
              {project.category} · {project.label}
            </span>
            <h2 id="case-modal-title">
              {project.title}
              <em className={`status-chip tone-${status.tone}`}>
                <i className="chip-dot" />
                {status.text}
              </em>
            </h2>
            <p>{project.summary}</p>
          </div>
          <ProjectLinks links={project.links} />
        </div>

        <div className="console-tabs" role="tablist">
          {tabs.map((name) => (
            name === "实测" && project.demo.mode === "external" && project.demo.url ? (
              <a
                key={name}
                role="tab"
                aria-selected="false"
                className="external-tab"
                href={project.demo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MonitorPlay size={15} />
                实测
                <ExternalLink size={13} />
              </a>
            ) : (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                className={tab === name ? "active" : ""}
                onClick={() => setTab(name)}
              >
                {name === "实测" ? <MonitorPlay size={15} /> : null}
                {name}
              </button>
            )
          ))}
        </div>

        <div className="console-body">
          {tab === "概览" ? (
            <div className="modal-copy">
              <dl>
                <dt>我的角色</dt>
                <dd>{project.role}</dd>
                <dt>做了什么</dt>
                <dd>{project.what}</dd>
                <dt>价值</dt>
                <dd>{project.value}</dd>
                <dt>证据状态</dt>
                <dd>{project.proof}</dd>
              </dl>
            </div>
          ) : null}

          {tab === "证据" ? (
            <div
              className="evidence-gallery"
              aria-label={`${project.title} 证据画廊`}
            >
              {project.evidence.length ? (
                <>
                  <EvidenceDisplay project={project} />
                  <div className="fragment-proof-grid">
                    {project.evidence.map((item) => (
                      <figure className="proof-fragment" key={item.src}>
                        <img
                          src={item.src}
                          alt={`${project.title} ${item.label}`}
                        />
                        <figcaption>
                          <span>{item.label}</span>
                          <small>{item.note}</small>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </>
              ) : (
                project.gallery.map((image) => (
                  <div className="proof-fragment hero-proof" key={image}>
                    <img src={image} alt={`${project.title} evidence`} />
                  </div>
                ))
              )}
            </div>
          ) : null}

          {tab === "实测" ? <DemoStage project={project} /> : null}
        </div>
      </motion.div>
    </div>
  );
}

function Showroom({ onOpen }: { onOpen: (project: Project) => void }) {
  const [filter, setFilter] = useState<Filter>("全部");
  const shown =
    filter === "全部"
      ? projects
      : projects.filter((project) => project.category === filter);
  const interactiveCount = projects.filter((project) =>
    interactiveModes.includes(project.demo.mode),
  ).length;

  return (
    <section className="showroom" id="cases">
      <SectionTitle
        shadow="DASHBOARD"
        title="总数据看板：作品、原型、外链和证据统一汇总"
        copy="项目数量来自结构化数据；可实测入口按 Demo 状态自动计算。没有确凿来源的价值结果继续标注待确认。"
      />
      <div className="dashboard-strip" aria-label="总看板摘要">
        {dashboardRows.map((row) => (
          <div className="dashboard-row" key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <small>{row.note}</small>
          </div>
        ))}
      </div>
      <div className="showroom-hud">
        <div className="hud-stat">
          <strong>{projects.length}</strong>
          <span>智能体</span>
        </div>
        <div className="hud-stat">
          <strong>{interactiveCount}</strong>
          <span>个可跳转</span>
        </div>
        <div className="filter-tabs" role="tablist" aria-label="按类型筛选">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={filter === name}
              className={filter === name ? "active" : ""}
              onClick={() => setFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="agent-grid">
        {shown.map((project, index) => (
          <AgentCard
            project={project}
            index={index}
            key={project.title}
            onOpen={() => onOpen(project)}
          />
        ))}
      </div>
    </section>
  );
}

function SkillOrbit() {
  return (
    <div className="orbit-map" aria-label="职业能力图谱">
      <div className="orbit-starfield" aria-hidden="true" />
      <div className="orbit-aurora" aria-hidden="true" />
      <div className="orbit-scan" aria-hidden="true" />
      <div className="core-orb">
        <Orbit size={34} />
        <strong>AI 商业化</strong>
        <span>Business to Revenue</span>
      </div>
      {skillNodes.map((node) => (
        <div className={`skill-node ${node.className}`} key={node.name}>
          <span>{node.name}</span>
          <strong>{node.title}</strong>
          <p>{node.copy}</p>
        </div>
      ))}
      <div className="orbit-ring ring-one" />
      <div className="orbit-ring ring-two" />
      <div className="orbit-ring ring-three" />
      {Array.from({ length: 8 }, (_, index) => (
        <span
          className={`orbit-beacon beacon-${index + 1}`}
          aria-hidden="true"
          key={index}
        />
      ))}
    </div>
  );
}

function JourneySection() {
  return (
    <section className="journey-section" id="journey">
      <SectionTitle
        shadow="CAREER JOURNEY"
        title="职业成长脉络"
        copy="从业务结构、AI 原型到商业闭环，呈现候选人如何把判断、工具和交付串成可迁移能力。"
      />
      <div className="journey-grid">
        {journey.map((item) => (
          <motion.article
            className="journey-card"
            key={item.title}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <div className="journey-image">
              <img src={item.image} alt="" loading="lazy" />
            </div>
            <div className="journey-copy">
              <span>{item.stage}</span>
              <h3>{item.title}</h3>
              <strong>{item.years}</strong>
              <p>{item.copy}</p>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="journey-collage" aria-hidden="true">
        <img src="/assets/projects/operator-counter-a.webp" alt="" />
        <img src="/assets/projects/archive-hall-wide.webp" alt="" />
        <img src="/assets/projects/operator-front-wide.webp" alt="" />
        <div>AI Business Development</div>
        <img src="/assets/projects/logic-lab-wide.webp" alt="" />
        <img src="/assets/projects/operator-mirror-wide.webp" alt="" />
      </div>
    </section>
  );
}

function ContactList() {
  const visibleContacts = contacts.filter((item) => item.value);

  if (!visibleContacts.length) {
    return (
      <div className="contact-empty">
        <LockKeyhole size={18} />
        <p>私人联系方式暂不公开。正式投递时可接入 Boss 直聘、电话、邮箱或微信复制按钮。</p>
      </div>
    );
  }

  return (
    <div className="contact-grid">
      {visibleContacts.map((item) => {
        if (!item.value) return null;
        if (item.type === "email") {
          return (
            <a href={`mailto:${item.value}`} key={item.label}>
              <Contact size={18} />
              {item.label}：{item.value}
            </a>
          );
        }
        if (item.type === "phone") {
          return (
            <a href={`tel:${item.value}`} key={item.label}>
              <BriefcaseBusiness size={18} />
              {item.label}：{item.value}
            </a>
          );
        }
        if (item.type === "boss") {
          return (
            <a href={item.value} target="_blank" rel="noopener noreferrer" key={item.label}>
              <GitBranch size={18} />
              {item.label}
            </a>
          );
        }
        return (
          <button
            type="button"
            key={item.label}
            onClick={() => navigator.clipboard?.writeText(item.value ?? "")}
          >
            <Copy size={18} />
            复制{item.label}
          </button>
        );
      })}
    </div>
  );
}

function App() {
  const [activeAgent, setActiveAgent] = useState<Project | null>(null);

  useEffect(() => {
    const onSectionClick = (event: globalThis.MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[data-scroll-target]",
      );
      const href = link?.getAttribute("href");
      if (!href?.startsWith("#")) return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      event.preventDefault();
      const scrollIntoView = () => {
        const top = target.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
      };
      scrollIntoView();
      window.requestAnimationFrame(scrollIntoView);
      window.setTimeout(scrollIntoView, 260);
      window.setTimeout(scrollIntoView, 760);
      window.history.pushState(null, "", href);
    };

    document.addEventListener("click", onSectionClick, { capture: true });
    return () => {
      document.removeEventListener("click", onSectionClick, { capture: true });
    };
  }, []);

  return (
    <main className="overflow-x-hidden">
      <div className="grain" />
      <div className="site-shell">
        <header className="nav">
          <a href="#top" className="brand" data-scroll-target>
            <img src="/assets/brand/nacl-logo-white.svg" alt="NACL" />
            <span>盐究所 NACL-LAB</span>
          </a>
          <nav aria-label="页面导航">
            {navItems.map((item) => (
              <a href={item.href} key={item.href} data-scroll-target>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <section className="hero" id="top">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="hero-kicker">
              <span>01</span>
              <strong>AI 商业化经理 / 大中台电子简历</strong>
            </div>
            <h1>
              技术最不值钱
              <span>能把 AI 变成钱才稀缺</span>
            </h1>
            <p>
              盐究所 NACL-LAB 把业务、客户、钱、团队和 AI 拆成可运行系统。不是展示会多少工具，而是证明能不能变成老板愿意押注的增长资产。
            </p>
            <div className="hero-principles" aria-label="合作原则">
              <span>拒绝白嫖</span>
              <span>时间很贵</span>
              <span>执行力强</span>
            </div>
            <div className="hero-actions">
              <a href="#cases" data-scroll-target>
                进作品台实测
                <ArrowUpRight size={18} />
              </a>
              <a href="#contact" className="ghost-action" data-scroll-target>
                联系方式
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="hero-portal">
              <img src="/assets/projects/operator-console-wide.webp" alt="AI manager command console" />
              <div className="portal-wash" />
              <div className="operator-silhouette" aria-hidden="true" />
            </div>
            <div className="hero-side-panel">
              <span>role positioning</span>
              <strong>出框架 / 定业务逻辑 / 定方向</strong>
              <p>把经营问题拆清楚，再让技术和团队照着系统落地。</p>
            </div>
            <div className="mobile-fui-board" aria-hidden="true">
              <div className="fui-topline">
                <span>NACL-LAB</span>
                <span>SYSTEM ONLINE</span>
              </div>
              <div className="fui-radar" />
              <div className="fui-silhouette" />
              <div className="fui-wave" />
              <div className="fui-cells">
                <span>业务</span>
                <span>客户</span>
                <span>现金流</span>
                <span>AI</span>
              </div>
            </div>
          </motion.div>
        </section>

        <CommandDashboard />
        <KnowledgeDashboard />
        <WorkConsole />
        <EvidenceConsole />

        <Showroom onOpen={(project) => setActiveAgent(project)} />

        <section className="manifesto" id="manifesto">
          <div className="manifesto-bg">
            <img src="/assets/projects/operator-mirror-wide.webp" alt="" loading="lazy" />
          </div>
          <div className="manifesto-copy">
            <Layers3 />
            <h2>全链路，就是我的护城河。</h2>
            <p>
              我不把 AI 当成炫技工具，而是把它接进客户、销售、交付、财务、复盘和复购。一个 AI 产品能不能成立，最后不是看术语有多先进，而是有没有人愿意为它买单。
            </p>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div>
            <SectionTitle shadow="CONTACT" title="联系区" />
            <p className="contact-note">
              对外联系方式采用结构化数据控制；确认后才渲染可点击入口，避免公开页面出现无效信息。
            </p>
          </div>
          <ContactList />
        </section>

        <footer>
          <span>盐究所 NACL-LAB · AI Commercialization Manager</span>
          <span>Private data redacted before publishing</span>
        </footer>
      </div>
      {activeAgent ? (
        <AgentConsole project={activeAgent} onClose={() => setActiveAgent(null)} />
      ) : null}
    </main>
  );
}

export default App;

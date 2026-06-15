import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
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
    title: "红了没",
    label: "小红书产品线",
    category: "营销智能体",
    summary: "覆盖选题引擎、内容工厂、知识库、品牌资产、发布与数据复盘的小红书营销产品线。",
    image: "/assets/projects/logic-lab-wide.webp",
    gallery: ["/assets/projects/logic-lab-wide.webp"],
    evidence: [],
    demo: {
      mode: "external",
      url: "https://6b29c3af-3804-4ab6-a217-b1365cda298d.dev.coze.site",
      cta: "打开活 Demo",
    },
    role: "定义内容工厂、选题引擎、品牌资产与发布闭环的产品框架",
    what: "覆盖选题引擎、内容工厂、知识库、品牌资产、发布与数据复盘的小红书营销智能体（Coze + Next.js）。文案、配图和语音生成已真实打通，角色差异化与行业上下文知识库持续迭代。",
    value: "把『写小红书』从灵感活，变成有选题、有素材库、可批量产出和复盘的流水线。",
    proof: "线上活 Demo 已接入，可直接点开实测：选角色 → 一句话 → 出可发布笔记 + 配图 + 营销逻辑拆解。持续迭代中。",
    status: "活 Demo 已接入",
    links: [
      {
        label: "打开线上 Demo",
        href: "https://6b29c3af-3804-4ab6-a217-b1365cda298d.dev.coze.site",
      },
    ],
  },
  {
    title: "爆了没",
    label: "抖音短视频产品线",
    category: "营销智能体",
    summary: "把已验证的内容工厂模式迁移到抖音 / 短视频，生成可复制的爆款执行方案。",
    image: "/assets/projects/concrete-grid-square.webp",
    gallery: ["/assets/projects/concrete-grid-square.webp"],
    evidence: [],
    demo: {
      mode: "external",
      url: "https://0ed6e1df-d2d6-4baa-a7e3-f4bf3643df5c.dev.coze.site",
      cta: "打开活 Demo",
    },
    role: "把小红书跑通的内容工厂模式迁移到短视频平台",
    what: "抖音 / 短视频内容营销智能体，复用选题—产出—发布—复盘的内容闭环，生成可复制的爆款执行方案。",
    value: "把已跑通的内容流水线模式，复制到第二个流量平台。",
    proof: "首版线上 Demo 已接入，可点开实测；持续迭代中。",
    status: "活 Demo 已接入（迭代中）",
    links: [
      {
        label: "打开线上 Demo",
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
  { label: "作品台", href: "#cases" },
  { label: "能力", href: "#skills" },
  { label: "资产", href: "#asset" },
  { label: "脉络", href: "#journey" },
  { label: "证据", href: "#evidence" },
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
      className="agent-card"
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
        <ExternalLink size={26} />
        <strong>外部入口已接入</strong>
        <p>该作品入口会在新窗口打开；站内保留概览与证据说明。</p>
        <a
          className="demo-open"
          href={demo.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          打开入口
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
        <button
          ref={closeButtonRef}
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="关闭智能体控制台"
        >
          <X size={20} />
        </button>
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
        shadow="AGENT SHOWROOM"
        title="智能体陈列墙"
        copy="每个作品一张卡，点主按钮直接跳转；点缩略图打开详情和站内实测。私有系统以打码截图呈现。"
      />
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

  return (
    <main>
      <div className="grain" />
      <div className="site-shell">
        <header className="nav">
          <a href="#top" className="brand">
            <img src="/assets/brand/nacl-logo-white.svg" alt="NACL" />
            <span>盐究所 NACL-LAB</span>
          </a>
          <nav aria-label="页面导航">
            {navItems.map((item) => (
              <a href={item.href} key={item.href}>
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
            <h1>
              技术最不值钱
              <span>能把 AI 变成钱才稀缺</span>
            </h1>
            <p>
              盐究所 NACL-LAB 把业务、客户、钱、团队和 AI 拆成可运行系统。不是展示会多少工具，而是证明能不能变成老板愿意押注的增长资产。
            </p>
            <div className="hero-actions">
              <a href="#cases">
                进作品台实测
                <ArrowUpRight size={18} />
              </a>
              <a href="#contact" className="ghost-action">
                联系方式
              </a>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img src="/assets/projects/operator-console-wide.webp" alt="AI manager cyberpunk portrait" />
            <div className="hero-glass">
              <span>role positioning</span>
              <strong>出框架 / 定业务逻辑 / 定方向</strong>
              <p>把经营问题拆清楚，再让技术和团队照着系统落地。</p>
            </div>
          </motion.div>
        </section>

        <section className="identity-strip" aria-label="定位摘要">
          <div>
            <BrainCircuit />
            <span>AI 接进业务</span>
          </div>
          <div>
            <Workflow />
            <span>拆得开经营</span>
          </div>
          <div>
            <CircleDollarSign />
            <span>盯得住现金流</span>
          </div>
          <div>
            <ShieldCheck />
            <span>沉淀成系统</span>
          </div>
        </section>

        <section className="pyramid-section" id="pyramid">
          <SectionTitle
            shadow="CAPABILITY PYRAMID"
            title="我凭什么值钱"
            copy="会写提示词不稀奇。值钱的是：把 AI 接进客户、销售、交付、财务和复盘，变成老板看得懂的经营结果。"
          />
          <div className="pyramid-grid">
            {pyramid.map((item, index) => (
              <motion.div
                className={`pyramid-level level-${index + 1}`}
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-120px" }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <span>0{index + 1}</span>
                <h3>{item.title}</h3>
                <strong>{item.subtitle}</strong>
                <p>{item.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="asset-section" id="asset">
          <SectionTitle
            shadow="COMPOUNDING ASSET"
            title="自生长知识库"
            copy="别人记赛博日记，我把决策变成会增值的资产。这一层，大多数人还没意识到有多值钱。"
          />
          <div className="asset-grid">
            <div className="asset-copy">
              <p>
                大家刚开始记录决策、写赛博日记，方向对。但我走深一层：
                <strong>让决策能复用、会增值。</strong>
              </p>
              <p>
                我的 Obsidian 里跑着自生长知识库 + 赛博中台 + 赛博日记，统一成一件事——
                <strong>把个人决策变成可复用的数字资产。</strong>
              </p>
              <ul className="asset-points">
                <li>
                  <span>决策即资产</span>
                  每个判断沉淀成可检索、可复用的知识节点，而不是记完就忘。
                </li>
                <li>
                  <span>自生长</span>
                  用得越多、链接越密，知识库自己越长越值钱。
                </li>
                <li>
                  <span>可迁移</span>
                  换公司、换行业，这套资产跟着我走，越攒越厚。
                </li>
              </ul>
            </div>
            <div className="asset-evidence" aria-label="证据占位">
              <div className="asset-placeholder">
                <LockKeyhole size={20} />
                <strong>证据待补充</strong>
                <small>Obsidian 赛博中台 / 知识库截图，打码后接入</small>
              </div>
            </div>
          </div>
        </section>

        <JourneySection />

        <section className="evidence-section" id="evidence">
          <div className="portrait-blend">
            <img src="/assets/projects/operator-portrait-vertical.webp" alt="candidate visual portrait" loading="lazy" />
          </div>
          <div className="evidence-copy">
            <SectionTitle
              shadow="POSITION"
              title="不是纯技术简历，是商业化操盘证据"
              copy="候选人负责出框架、定业务 / 财务逻辑、定方向。技术细节由团队执行，这是产品负责人和业务架构师的取舍。"
            />
            <EvidencePanel />
          </div>
        </section>

        <Showroom onOpen={(project) => setActiveAgent(project)} />

        <section className="skills-section" id="skills">
          <SectionTitle
            shadow="MY SKILL MAP"
            title="职业能力图谱"
            copy="参考移动端轨道图的排版思路，但重新映射到 AI 商业化岗位需要的能力闭环。"
          />
          <SkillOrbit />
        </section>

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

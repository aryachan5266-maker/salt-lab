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
  Orbit,
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

type Project = {
  title: string;
  label: string;
  summary: string;
  image: string;
  gallery: string[];
  evidence: EvidenceFragment[];
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
    title: "Mango FleetFlow",
    label: "芒果租车经营管理系统",
    summary: "把租车业务的客户、订单、车辆、财务、风险规则拆成可运行系统。",
    image: "/assets/projects/data-vault-wide.webp",
    gallery: [
      "/assets/projects/data-vault-wide.webp",
      "/assets/projects/logic-lab-wide.webp",
      "/assets/projects/archive-hall-wide.webp",
    ],
    evidence: [],
    role: "出业务框架、订单/财务逻辑、经营规则拆解",
    what: "React + Vite + Node + MySQL 的租车经营系统，覆盖客户、订单、车辆、财务、合同、会员、销售与 AI 营销工具。",
    value:
      "把散落在表格、流程和人工经验里的经营规则，整理成可交付、可协同、可继续产品化的系统资产。",
    proof:
      "仓库含订单生命周期、资金流向、结算规则库、数据字典、经营指标字典、风险规则库；公开贡献 API 当前显示候选人为主要贡献者之一。",
    status: "仓库事实已核验",
    links: [
      {
        label: "GitHub 仓库",
        href: "https://github.com/MANGO-Hypercar-OS/mango-fleetflow",
      },
    ],
  },
  {
    title: "Mango Z",
    label: "财务系统",
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
    role: "把招聘判断拆成流程、任务和可复盘节点",
    what: "用于试岗流程管理、候选人跟进、任务推进和组织协同的管理系统。",
    value: "把靠感觉的招人判断，转成可记录、可比较、可沉淀的流程资产。",
    proof: "已只读登录并采集管理后台截图；真实使用对象和完整流程节点需候选人确认后公开。",
    status: "只读截图已打码",
    links: [{ label: "内部系统 · 截图见详情", disabled: true }],
  },
  {
    title: "mangoCRM",
    label: "客户与转化系统",
    summary: "围绕线索、客户分层、跟进节奏和转化漏斗设计的销售管理系统。",
    image: "/assets/projects/ai-engine-wide.webp",
    gallery: ["/assets/projects/ai-engine-wide.webp"],
    evidence: [],
    role: "主导 CRM 结构、客户分层、跟进节奏和转化逻辑",
    what: "围绕线索、客户资源、销售跟进、复盘和转化漏斗设计经营系统。",
    value: "不是记录客户，而是让线索被跟进、问题被发现、成交动作被管理。",
    proof: "当前作为候选人主导设计案例呈现；公开截图和成果数据需候选人确认后开放。",
    status: "内部系统",
    links: [{ label: "内部系统 · 截图见详情", disabled: true }],
  },
  {
    title: "Local Automation",
    label: "客资监测 / 销售质量监测",
    summary: "把客户资源流转、销售响应和异常信号变成可触发的本地自动化。",
    image: "/assets/projects/command-table-wide.webp",
    gallery: ["/assets/projects/command-table-wide.webp"],
    evidence: [],
    role: "把销售现场判断拆成可触发的监测规则",
    what: "监控客户资源流转、销售质量、响应节奏和异常信号，辅助管理层复盘。",
    value: "把业务经验从个人脑子里拿出来，变成公司可以持续运行的自动化机制。",
    proof: "当前作为本地自动化案例呈现；规则截图和业务结果需候选人确认后开放。",
    status: "内部自动化",
    links: [{ label: "内部系统 · 截图见详情", disabled: true }],
  },
];

const navItems = [
  { label: "案例", href: "#cases" },
  { label: "能力", href: "#skills" },
  { label: "脉络", href: "#journey" },
  { label: "证据", href: "#evidence" },
  { label: "联系", href: "#contact" },
];

const pyramid = [
  {
    title: "会 AI",
    subtitle: "工具 / 模型 / Demo",
    copy: "能调模型、会提示词、会用工具，能把一个想法做成能看的原型。",
  },
  {
    title: "能落地 AI",
    subtitle: "业务 / 流程 / 交付",
    copy: "知道 AI 应该进入哪段流程，能把技术语言翻译成老板和团队能执行的业务语言。",
  },
  {
    title: "能卖出 AI",
    subtitle: "客户 / 价值 / 收钱",
    copy: "能找到真实痛点，设计付费理由，跑通找客户、交付、收钱、复购和转介绍。",
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
  "贡献记录核验：GitHub API 当前返回候选人为主要贡献者之一",
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
    title: "业务结构拆解",
    years: "Stage 01",
    copy: "从客户、订单、车辆、押金、结算、风险这些真实经营节点里抽规则。",
    image: "/assets/projects/data-vault-wide.webp",
  },
  {
    stage: "II",
    title: "AI 原型落地",
    years: "Stage 02",
    copy: "用 Base44 / AI coding 把方向快速变成可演示、可沟通、可迭代的产品雏形。",
    image: "/assets/projects/ai-engine-wide.webp",
  },
  {
    stage: "III",
    title: "商业闭环推进",
    years: "Stage 03",
    copy: "围绕客户痛点、销售话术、交付流程和复购转介绍，判断 AI 是否真能变成钱。",
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

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.article
      className="project-card"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      transition={{ duration: 0.55, delay: index * 0.06 }}
    >
      <button className="project-media" type="button" onClick={onOpen} aria-label={`查看 ${project.title} 详情`}>
        <EvidenceDisplay project={project} compact />
      </button>
      <div className="project-copy">
        <div>
          <p className="project-index">CASE 0{index + 1}</p>
          <h3>{project.title}</h3>
          <span>{project.label}</span>
        </div>
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
        <div className="card-actions">
          <button type="button" onClick={onOpen}>
            查看详情
            <ArrowUpRight size={16} />
          </button>
          <ProjectLinks links={project.links} />
        </div>
      </div>
    </motion.article>
  );
}

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <motion.div
        className="case-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-modal-title"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="关闭案例详情">
          <X size={20} />
        </button>
        <div className="modal-top">
          <div>
            <span>{project.label}</span>
            <h2 id="case-modal-title">{project.title}</h2>
            <p>{project.summary}</p>
          </div>
          <ProjectLinks links={project.links} />
        </div>

        <div className="modal-grid">
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
          <div className="evidence-gallery" aria-label={`${project.title} 证据画廊`}>
            {project.evidence.length ? (
              <>
                <EvidenceDisplay project={project} />
                <div className="fragment-proof-grid">
                  {project.evidence.map((item) => (
                    <figure className="proof-fragment" key={item.src}>
                      <img src={item.src} alt={`${project.title} ${item.label}`} />
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
        </div>
      </motion.div>
    </div>
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
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <main>
      <div className="grain" />
      <div className="site-shell">
        <header className="nav">
          <a href="#top" className="brand">
            陈妍盐
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
              把 AI 从概念
              <span>变成有人愿意付钱的业务</span>
            </h1>
            <p>
              会 AI 的人很多，能落地的人少；真正能找到客户、完成交付、跑通收钱和转介绍的人更少。
            </p>
            <div className="hero-actions">
              <a href="#cases">
                看案例证据
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
              <p>技术细节交团队执行，沟通一次就能落地。</p>
            </div>
          </motion.div>
        </section>

        <section className="identity-strip" aria-label="定位摘要">
          <div>
            <BrainCircuit />
            <span>懂 AI</span>
          </div>
          <div>
            <Workflow />
            <span>懂业务流程</span>
          </div>
          <div>
            <CircleDollarSign />
            <span>懂商业转化</span>
          </div>
          <div>
            <ShieldCheck />
            <span>严谨可追溯</span>
          </div>
        </section>

        <section className="pyramid-section" id="pyramid">
          <SectionTitle
            shadow="CAPABILITY PYRAMID"
            title="能力金字塔"
            copy="技术不是终点。AI 经理真正值钱的地方，是把技术翻译成业务结果。"
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

        <section className="cases" id="cases">
          <SectionTitle
            shadow="PROJECT EVIDENCE"
            title="案例卡区"
            copy="每个项目统一讲清：我的角色、做了什么、产生什么价值。没有来源的数字不在公开页面展示。"
          />
          <div className="project-stack">
            {projects.map((project, index) => (
              <ProjectCard
                project={project}
                index={index}
                key={project.title}
                onOpen={() => setActiveProject(project)}
              />
            ))}
          </div>
        </section>

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
          <span>陈妍盐 · AI Commercialization Manager</span>
          <span>Private data redacted before publishing</span>
        </footer>
      </div>
      {activeProject ? (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      ) : null}
    </main>
  );
}

export default App;

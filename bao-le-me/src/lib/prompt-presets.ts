import type { RoleKey } from '@/lib/types';

export interface RolePromptPreset {
  label: string;
  jobToBeDone: string;
  decisionPower: string;
  contentVoice: string;
  conversionPath: string;
  avoid: string[];
}

export interface IndustryPromptPreset {
  label: string;
  customerAnchor: string;
  proofAssets: string[];
  contentAngles: string[];
  scriptScenes: string[];
  ctaPattern: string;
  riskRules: string[];
}

export interface PromptContextInput {
  role?: string;
  occupation?: string;
  industry?: string;
  city?: string;
  storeType?: string;
  priceRange?: string;
  targetAudience?: string[] | string;
  differentiator?: string;
  competitors?: string;
  goalType?: string;
  goalDetail?: string;
}

function readString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readStringOrList(input: Record<string, unknown>, key: string): string | string[] | undefined {
  const value = input[key];
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  return undefined;
}

const ROLE_PROMPTS: Record<RoleKey, RolePromptPreset> = {
  boss: {
    label: '老板/创始人',
    jobToBeDone: '要用内容判断业务方向、建立信任、筛选真正会付钱的人。',
    decisionPower: '能改产品、价格、服务承诺和线下交付，所以建议必须落到经营动作。',
    contentVoice: '像老板本人说真话：直接、克制、有取舍，不像代运营话术。',
    conversionPath: '评论/私信先筛需求，再引导到店、预约、咨询或成交。',
    avoid: ['空喊品牌理念', '只晒环境不讲判断标准', '把同行对比写成攻击'],
  },
  operator: {
    label: '运营',
    jobToBeDone: '要把选题拆成可执行排期、素材清单、脚本结构和复盘指标。',
    decisionPower: '通常不能改核心产品，但能改内容角度、发布节奏和承接链路。',
    contentVoice: '清楚、利落、可复制，少讲老板情怀，多讲内容动作。',
    conversionPath: '用系列内容收集互动信号，再把高意向评论转成私信线索。',
    avoid: ['只追热点不判断适配', '套模板标题', '忽略素材可拍性'],
  },
  sales: {
    label: '销售/顾问',
    jobToBeDone: '要让内容帮忙破冰、建立专业判断、筛选有明确需求的线索。',
    decisionPower: '能调整话术和跟进节奏，但不能承诺产品没有的结果。',
    contentVoice: '像专业顾问：先诊断问题，再给判断，不强推。',
    conversionPath: '评论区收集问题，私信做需求诊断，再预约沟通。',
    avoid: ['夸大承诺', '硬广式催单', '用恐吓制造成交'],
  },
  'shop-owner': {
    label: '店主/主理人',
    jobToBeDone: '要把真实门店、服务细节、到店理由拍清楚，带来同城高意向客户。',
    decisionPower: '能控制现场体验、出品、服务和门店承接，所以内容要能落到到店动作。',
    contentVoice: '像主理人站在现场解释：真实、具体、有画面。',
    conversionPath: '用同城场景和避坑标准吸引评论，再引导到店、团购、预约。',
    avoid: ['只拍装修氛围', '过度网红滤镜', '不说明适合谁不适合谁'],
  },
  'personal-ip': {
    label: '个人IP/专家',
    jobToBeDone: '要把个人判断力产品化，建立可被记住的观点和方法论。',
    decisionPower: '能控制观点、人设和交付边界，所以内容要突出选择标准。',
    contentVoice: '像一个有判断力的人：观点鲜明，但证据和边界说清楚。',
    conversionPath: '用观点吸引同频人，再引导关注、咨询、社群或课程/服务。',
    avoid: ['人设空泛', '只讲鸡汤', '方法论没有场景'],
  },
};

const INDUSTRY_PROMPTS: Record<string, IndustryPromptPreset> = {
  餐饮: {
    label: '餐饮 / 咖啡 / 烘焙',
    customerAnchor: '消费半径、复购频率、出品稳定性、排队/等待成本、同城场景。',
    proofAssets: ['真实出品过程', '后厨/吧台标准', '菜单和价格解释', '到店动线', '客户常问问题'],
    contentAngles: ['同城避坑', '出品稳定性对比', '老板解释成本', '工作日高频消费场景'],
    scriptScenes: ['门头到吧台一镜到底', '出品细节特写', '同街区对比', '客户点单问题复盘'],
    ctaPattern: '评论区发你的预算/商圈/常点品类，帮你判断适不适合。',
    riskRules: ['不捏造食安资质', '不恶意攻击同行', '不承诺人人喜欢'],
  },
  美业: {
    label: '美业 / 美发 / 美甲',
    customerAnchor: '审美匹配、服务安全、翻车风险、预约制信任、前后对比证据。',
    proofAssets: ['真实案例前后对比', '工具消毒流程', '设计沟通记录', '售后处理方式'],
    contentAngles: ['翻车避坑', '审美诊断', '不同脸型/肤色/手型适配', '价格透明'],
    scriptScenes: ['客户需求沟通', '过程细节', '前后对比', '不适合案例说明'],
    ctaPattern: '评论区发你的基础情况/预算/想要效果，先判断适不适合做。',
    riskRules: ['不承诺医学效果', '不制造容貌焦虑', '不盗用案例图'],
  },
  服装: {
    label: '服装 / 时尚 / 配饰',
    customerAnchor: '身材适配、场景需求、预算、质感证据、复购理由。',
    proofAssets: ['上身实拍', '面料细节', '洗护测试', '不同身材试穿', '搭配场景'],
    contentAngles: ['身材避坑', '一衣多穿', '通勤/约会/旅行场景', '质感对比'],
    scriptScenes: ['镜前试穿', '细节近拍', '场景切换', '不同身材对比'],
    ctaPattern: '评论区发身高体重/场景/预算，给你一个不踩雷搭配方向。',
    riskRules: ['不编造品牌授权', '不制造身材羞辱', '不夸大材质'],
  },
  教育: {
    label: '教育培训 / 知识付费',
    customerAnchor: '学习目标、基础水平、时间投入、结果边界、试错成本。',
    proofAssets: ['课程大纲', '学习路径', '练习样例', '常见错误', '真实反馈摘要'],
    contentAngles: ['新手误区', '学习路径拆解', '成果边界说明', '选课避坑'],
    scriptScenes: ['白板拆解', '作业点评', '案例前后变化', '学习计划展示'],
    ctaPattern: '评论区发你的基础和目标，先判断该从哪一步开始。',
    riskRules: ['不承诺包过/暴富', '不编造成绩数据', '不贩卖焦虑'],
  },
  汽车: {
    label: '汽车 / 出行 / 租赁',
    customerAnchor: '用车场景、预算、风险规则、服务响应、合同/保险边界。',
    proofAssets: ['车辆状态', '合同条款解释', '保险范围', '取还车流程', '真实用车场景'],
    contentAngles: ['租车避坑', '车型选择', '费用透明', '事故/违章处理'],
    scriptScenes: ['验车流程', '合同特写', '取还车动线', '不同车型对比'],
    ctaPattern: '评论区发人数/天数/路线/预算，先帮你判断车型和风险点。',
    riskRules: ['不隐藏费用', '不承诺无风险', '不展示敏感证件信息'],
  },
  房产: {
    label: '房产 / 家居 / 装修',
    customerAnchor: '预算、户型、居住周期、决策人、风险条款和交付确定性。',
    proofAssets: ['户型图', '施工节点', '材料清单', '预算拆解', '验收标准'],
    contentAngles: ['户型避坑', '预算拆解', '施工节点', '验收清单'],
    scriptScenes: ['现场走拍', '图纸讲解', '材料对比', '验收问题复盘'],
    ctaPattern: '评论区发户型/预算/阶段，先判断最容易踩坑的一步。',
    riskRules: ['不承诺升值', '不编造成交数据', '不隐瞒限制条件'],
  },
  健身: {
    label: '健身 / 运动 / 康复',
    customerAnchor: '身体基础、目标、时间频率、安全边界、坚持成本。',
    proofAssets: ['动作示范', '训练计划', '错误动作对比', '器械使用', '恢复建议'],
    contentAngles: ['动作纠错', '新手路径', '目标拆解', '私教避坑'],
    scriptScenes: ['训练现场', '动作细节慢放', '计划表', '前后节奏对比'],
    ctaPattern: '评论区发你的目标和基础，先判断该练什么、不该练什么。',
    riskRules: ['不替代医疗诊断', '不承诺速成效果', '不鼓励危险动作'],
  },
  电商: {
    label: '电商 / 直播带货',
    customerAnchor: '使用场景、复购理由、价格带、信任证据、售后边界。',
    proofAssets: ['开箱实测', '使用前后对比', '材质/参数解释', '售后规则', '真实问题答疑'],
    contentAngles: ['真实测评', '场景种草', '同价位对比', '售后避坑'],
    scriptScenes: ['开箱', '实测过程', '细节特写', '对比测试'],
    ctaPattern: '评论区发你的使用场景/预算，先判断该不该买。',
    riskRules: ['不虚构销量评价', '不夸大功效', '不隐瞒限制条件'],
  },
  本地生活: {
    label: '本地生活 / 休闲',
    customerAnchor: '地理距离、消费时段、同行人群、体验稳定性、预约成本。',
    proofAssets: ['路线动线', '价格菜单', '现场环境', '排队/预约规则', '体验流程'],
    contentAngles: ['周末避坑', '亲子/情侣/朋友场景', '路线攻略', '性价比判断'],
    scriptScenes: ['从地铁/停车点走到门口', '现场体验', '价格明细', '适合/不适合人群'],
    ctaPattern: '评论区发人数/时间/预算，帮你判断值不值得去。',
    riskRules: ['不编造排队时长', '不隐藏额外费用', '不冒充官方信息'],
  },
  B2B: {
    label: 'B2B / 企业服务',
    customerAnchor: '决策链、预算周期、风险成本、ROI 证据、交付边界。',
    proofAssets: ['流程图', '案例拆解', '问题诊断清单', '交付节点', '风险清单'],
    contentAngles: ['老板避坑', '采购判断标准', '流程降本', '案例复盘'],
    scriptScenes: ['白板拆解', '客户问题复盘', '流程对比', '方案边界说明'],
    ctaPattern: '评论区发你的业务阶段/问题，先判断是不是该上这个方案。',
    riskRules: ['不编造客户名和业绩', '不承诺固定 ROI', '不泄露客户隐私'],
  },
};

const FALLBACK_INDUSTRY: IndustryPromptPreset = {
  label: '综合行业',
  customerAnchor: '真实购买场景、预算、决策成本、信任证据、交付边界。',
  proofAssets: ['真实场景', '客户问题', '过程证据', '价格/规则说明', '适合与不适合人群'],
  contentAngles: ['避坑判断', '真实问题拆解', '场景对比', '选择标准'],
  scriptScenes: ['真实现场', '细节特写', '对比画面', '主理人/顾问解释'],
  ctaPattern: '评论区发你的情况，先帮你判断适不适合。',
  riskRules: ['不编造数据', '不夸大承诺', '不攻击同行', '不隐藏限制条件'],
};

function normalizeIndustry(industry?: string): string {
  const value = industry || '';
  if (value.includes('餐') || value.includes('咖啡') || value.includes('烘焙')) return '餐饮';
  if (value.includes('美') || value.includes('发') || value.includes('甲')) return '美业';
  if (value.includes('服') || value.includes('时尚') || value.includes('配饰')) return '服装';
  if (value.includes('教育') || value.includes('培训') || value.includes('知识')) return '教育';
  if (value.includes('汽车') || value.includes('出行') || value.includes('租赁')) return '汽车';
  if (value.includes('房') || value.includes('家居') || value.includes('装修')) return '房产';
  if (value.includes('健身') || value.includes('运动') || value.includes('康复')) return '健身';
  if (value.includes('电商') || value.includes('直播') || value.includes('带货')) return '电商';
  if (value.includes('本地') || value.includes('休闲')) return '本地生活';
  if (value.includes('B2B') || value.includes('企业')) return 'B2B';
  return value;
}

function isRoleKey(role?: string): role is RoleKey {
  return Boolean(role && role in ROLE_PROMPTS);
}

export function getRolePrompt(role?: string, occupation?: string): RolePromptPreset {
  const preset = isRoleKey(role) ? ROLE_PROMPTS[role] : ROLE_PROMPTS.boss;
  if (!occupation?.trim()) return preset;
  return {
    ...preset,
    label: `${preset.label} / ${occupation.trim()}`,
    jobToBeDone: `${preset.jobToBeDone} 具体岗位/职业是「${occupation.trim()}」，输出要贴合这个人的实际权限、日常工作和转化目标。`,
  };
}

export function coercePromptContext(input: Record<string, unknown>): PromptContextInput {
  return {
    role: readString(input, 'role'),
    occupation: readString(input, 'occupation'),
    industry: readString(input, 'industry'),
    city: readString(input, 'city'),
    storeType: readString(input, 'storeType'),
    priceRange: readString(input, 'priceRange'),
    targetAudience: readStringOrList(input, 'targetAudience'),
    differentiator: readString(input, 'differentiator'),
    competitors: readString(input, 'competitors'),
    goalType: readString(input, 'goalType'),
    goalDetail: readString(input, 'goalDetail'),
  };
}

export function getIndustryPrompt(industry?: string): IndustryPromptPreset {
  const normalized = normalizeIndustry(industry);
  return INDUSTRY_PROMPTS[normalized] || FALLBACK_INDUSTRY;
}

export function getBaselineContentFormats(input: PromptContextInput): string[] {
  const industry = getIndustryPrompt(input.industry);
  const role = getRolePrompt(input.role, input.occupation);
  return [
    ...industry.contentAngles.slice(0, 3),
    role.label.includes('销售') ? '客户问题诊断短视频' : '',
    role.label.includes('运营') ? '系列化选题排期' : '',
    role.label.includes('个人IP') ? '观点方法论口播' : '',
  ].filter(Boolean);
}

export function buildPromptContext(input: PromptContextInput): string {
  const role = getRolePrompt(input.role, input.occupation);
  const industry = getIndustryPrompt(input.industry);
  const audience = Array.isArray(input.targetAudience) ? input.targetAudience.join('、') : input.targetAudience;

  return `## 角色基础提示词
角色：${role.label}
岗位任务：${role.jobToBeDone}
决策权限：${role.decisionPower}
表达口吻：${role.contentVoice}
转化路径：${role.conversionPath}
角色避雷：${role.avoid.join('；')}

## 行业基础提示词
行业：${industry.label}
真实客户锚点：${industry.customerAnchor}
可拍证据：${industry.proofAssets.join('；')}
推荐角度：${industry.contentAngles.join('；')}
可拍场景：${industry.scriptScenes.join('；')}
CTA 规则：${industry.ctaPattern}
行业避雷：${industry.riskRules.join('；')}

## 当前业务约束
城市/区域：${input.city || '未提供'}
业态/门店：${input.storeType || '未提供'}
客单价：${input.priceRange || '未知'}
目标人群：${audience || '未明确'}
差异化：${input.differentiator || '待确认'}
竞品：${input.competitors || '待确认'}
目标：${input.goalDetail || input.goalType || '待确认'}`;
}

export function buildSafetyRules(): string {
  return `## 统一红线
- 不编造播放量、粉丝数、点赞量、成交率、客群占比、平台热度、ROI 等真实世界数字；
- 没有真实来源时，只能写 AI 推断/非实时数据/示例，不冒充平台实测；
- 输出要能拍、能执行、能承接，不要只给抽象概念；
- 每个建议都要贴合角色权限、行业证据和当前业务约束。`;
}

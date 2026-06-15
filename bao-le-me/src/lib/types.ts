// ============================================================
// 爆了没 (Bao Le Mei) — 核心类型定义
// ============================================================

// ---------- 角色系统 ----------
export type RoleKey =
  | 'boss'           // 老板/创始人
  | 'operator'       // 运营
  | 'sales'          // 销售
  | 'shop-owner'     // 店主
  | 'personal-ip';   // 个人IP

export interface RoleDef {
  key: RoleKey;
  label: string;
  emoji: string;
  desc: string;
  defaultIndustry: string;
  defaultAudience: string[];
}

// ---------- 导航 ----------
export type PageKey =
  | 'home'
  | 'onboarding'
  | 'hot-radar'
  | 'decode'
  | 'positioning'
  | 'generate'
  | 'brand-assets'
  | 'settings';

// ---------- 品牌资产 ----------
export interface BrandAssets {
  brandName: string;
  businessName: string;
  industry: string;
  targetAudience: string[];
  ageGroup: string[];
  coreNeed: string[];
  customerPainPoints: string[];
  purchaseMotivation: string[];
  priceRange: string;
  acquisition: string[];
  contentExperience: string;
  postingFrequency: string;
  teamSize: string;
  competitors: string;
  differentiator: string;
  platform: string[];
  goalType: string;
  goalDetail: string;
  role: RoleKey;
  // AI derived
  contentStrategy: string;
  tone: string;
  priceSensitivity: string;
  contentFormats: string[];
  avoid: string[];
  audienceMatchScore: number;
  audienceAnalysis: string;
  operationAdvice: string[];
  riskWarnings: string[];
}

// ---------- 数据中台 ----------
export interface DataCenterRequest {
  query: string;
  type: 'hot' | 'benchmarks' | 'positioning';
  industry?: string;
  role?: RoleKey;
}

export interface HotTopic {
  id: string;
  title: string;
  heat: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  tags: string[];
  source: string;     // 真实来源标注
  isDemo?: boolean;   // 示例数据标记
}

export interface BenchmarkAccount {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  avgPlays: string;
  engagementRate: string;
  topVideoTitle: string;
  contentStyle: string;
  source: string;
  isDemo?: boolean;
}

// ---------- 差异化卡位引擎（招牌）----------
export interface PositioningResult {
  crowdedness: number;         // 拥挤度 0-100
  crowdednessLabel: string;    // 拥挤度描述
  emptySlots: PositionSlot[];  // 空位
  reasons: string[];           // 为什么选这些空位
  yourAngle: string;           // 你的差异化角度
  riskNotes: string[];         // 风险提示
}

export interface PositionSlot {
  angle: string;               // 切入角度
  evidence: string;            // 数据支撑
  audience: string;            // 对应人群
  exampleTitle: string;        // 示例标题
}

// ---------- 脚本生成（三件套）----------
export interface DouyinScript {
  hook: ScriptSection;         // 黄金3秒钩子
  body: ScriptSection[];       // 主体段落（每段有beat）
  twist: ScriptSection;        // 反转节点
  cta: ScriptSection;          // 强CTA
  title: string;               // 可用标题
  tags: string[];              // 话题标签
  bgm: string;                 // BGM推荐
  coverPrompt: string;         // 封面9:16提示词
  ttsText: string;             // TTS配音文本
  forbiddenCheck: ForbiddenCheck; // 违禁词体检
}

export interface ScriptSection {
  seconds: string;             // 时间段
  beat: string;                // 节拍描述
  visual: string;              // 画面描述
  audio: string;               // 台词/音效
  note: string;                // 拍摄备注
}

export interface ForbiddenCheck {
  hasForbidden: boolean;
  forbiddenWords: string[];
  suggestion: string;
}

// ---------- API 响应 ----------
export interface AnalyzeProfileResponse {
  contentStrategy: string;
  tone: string;
  priceSensitivity: string;
  contentFormats: string[];
  avoid: string[];
  audienceMatchScore: number;
  audienceAnalysis: string;
  operationAdvice: string[];
  riskWarnings: string[];
}

export interface HotRadarResponse {
  topics: HotTopic[];
  source: string;
  fetchedAt: string;
}

export interface DecodeResponse {
  accounts: BenchmarkAccount[];
  source: string;
  fetchedAt: string;
}

export interface PositioningResponse {
  positioning: PositioningResult;
}

export interface GenerateScriptResponse {
  script: DouyinScript;
}

export interface RecommendResponse {
  recommendations: ViralRecommendation[];
}

// ---------- 兼容旧类型 ----------
export interface ViralRecommendation {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  aiAction: string;
  stats: {
    plays: string;
    likes: string;
    comments: string;
    shares: string;
    completionRate: string;
    engagementRate: string;
  };
  bgm: string;
  hotTags: string[];
  publishTime: string;
}

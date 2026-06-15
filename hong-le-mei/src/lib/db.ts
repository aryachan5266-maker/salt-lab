// 内存数据库：模拟生产数据库
// 用于存储流水线、排期、对标账号、生成历史等

import { randomUUID } from 'crypto';

// ========== 类型定义 ==========
export type TopicCategory = '小红书热门' | '行业关键词' | '长尾潜力' | 'AI评分';

export interface Topic {
  id: string;
  title: string;
  angle: string;
  category: TopicCategory;
  heat: number; // 0-100
  source: string;
  url?: string;
  matchedAccounts?: number;
  tags?: string[];
  status: 'new' | 'pool' | 'pipeline' | 'adopted' | 'published';
  createdAt: number;
  // AI 评分维度
  scores?: {
    spread: number; // 传播潜力
    competition: number; // 竞争度（低=好）
    persona: number; // 人设匹配度
    timeliness: number; // 时效性
    total: number;
  };
}

export interface Benchmark {
  id: string;
  name: string;
  handle: string;
  followers: number;
  category: string;
  viralRate: number; // 爆款率
  avgLikes: number;
  recentViral: ViralItem[];
  lastSyncAt: number;
}

export interface ViralItem {
  id: string;
  title: string;
  angle: string;
  likes: number;
  coverStyle: string;
  publishedAt: string;
  url?: string;
}

export interface PipelineItem {
  id: string;
  topicId: string;
  topicTitle: string;
  category: string;
  // 5 步工作流
  step: 1 | 2 | 3 | 4 | 5;
  stepName: string;
  // 生成产物
  coverCandidates: CoverCandidate[];
  selectedCoverId?: string;
  copyA?: CopyVersion;
  copyB?: CopyVersion;
  selectedCopy?: 'A' | 'B';
  forbiddenHits?: ForbiddenHit[];
  // 元数据
  style: 'sharp' | 'story' | 'list' | 'contrast';
  targetAudience: string[];
  titleLength: number;
  bodyLength: number;
  tone: number; // 0-100 犀利<->共情
  status: 'draft' | 'pending' | 'scheduled' | 'published';
  createdAt: number;
  updatedAt: number;
}

export interface CoverCandidate {
  id: string;
  url: string;
  headline: string;
  matchScore: number; // 0-100
  recommend: boolean;
}

export interface CopyVersion {
  titles: string[];
  body: string;
  tags: string[];
  score: number;
}

export interface ForbiddenHit {
  word: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
  fixed?: boolean;
  ignored?: boolean;
}

export interface CalendarItem {
  id: string;
  pipelineId?: string;
  title: string;
  coverUrl?: string;
  account: string;
  scheduledAt: number;
  status: 'draft' | 'pending' | 'scheduled' | 'published';
  type: 'image' | 'video' | 'text';
  metrics?: {
    reach?: number;
    likes?: number;
    collects?: number;
    comments?: number;
    shares?: number;
  };
}

export interface AnalyticsItem {
  totalReach: number;
  totalEngagement: number;
  hitRate: number; // 爆款率
  avgEngagement: number; // 平均互动率
  fansNet: number;
  roi: number;
  weeklyTrend: number[]; // 30天
  topPerformers: Array<{
    id: string;
    title: string;
    coverUrl?: string;
    reach: number;
    engagementRate: number;
    commonality: string[];
  }>;
  bottomPerformers: Array<{
    id: string;
    title: string;
    reason: string;
    reach: number;
    engagementRate: number;
  }>;
  aiSuggestions: Array<{
    id: string;
    type: 'topic' | 'title' | 'timing' | 'cover';
    typeLabel: string;
    title: string;
    detail: string;
    expectedBoost: string;
    confidence: number;
    adopted: boolean;
  }>;
}

// ========== 内存存储 ==========
class MemoryDB {
  topics: Map<string, Topic> = new Map();
  benchmarks: Map<string, Benchmark> = new Map();
  pipeline: Map<string, PipelineItem> = new Map();
  calendar: Map<string, CalendarItem> = new Map();
  knowledge: Map<string, KnowledgeDoc> = new Map();
  activities: Array<{
    id: string;
    type: string;
    text: string;
    at: number;
  }> = [];

  constructor() {
    this.seed();
  }

  // 初始化种子数据
  private seed() {
    // 初始对标账号
    const seedBenchmarks: Benchmark[] = [
      {
        id: 'b1',
        name: '女力研究所',
        handle: '@nuli_research',
        followers: 1280000,
        category: '商业认知',
        viralRate: 14.7,
        avgLikes: 18200,
        recentViral: [
          {
            id: 'v1',
            title: '30岁前我亲手关掉公司，才看懂这3件事',
            angle: '创业复盘+反常识',
            likes: 48200,
            coverStyle: '暗红大字+人物侧脸',
            publishedAt: '2024-12-22',
          },
          {
            id: 'v2',
            title: '普通女生做小红书的第3年，月入6位数',
            angle: '成长叙事',
            likes: 32100,
            coverStyle: '手写体+暖光',
            publishedAt: '2024-12-20',
          },
        ],
        lastSyncAt: Date.now(),
      },
      {
        id: 'b2',
        name: '创业她说',
        handle: '@chuangye_she',
        followers: 856000,
        category: '女性创业',
        viralRate: 11.2,
        avgLikes: 12300,
        recentViral: [
          {
            id: 'v3',
            title: '我从大厂裸辞后才明白的5件事',
            angle: '职业转型',
            likes: 38700,
            coverStyle: '几何切割+冷蓝',
            publishedAt: '2024-12-23',
          },
        ],
        lastSyncAt: Date.now(),
      },
      {
        id: 'b3',
        name: '清醒Girl的商业课',
        handle: '@clear_girl',
        followers: 612000,
        category: '商业思维',
        viralRate: 9.8,
        avgLikes: 8900,
        recentViral: [
          {
            id: 'v4',
            title: '副业月入3万后，我反而辞职了',
            angle: '反差对比',
            likes: 26400,
            coverStyle: '数字大+暗红',
            publishedAt: '2024-12-21',
          },
        ],
        lastSyncAt: Date.now(),
      },
      {
        id: 'b4',
        name: '33岁姐姐说',
        handle: '@33_sister',
        followers: 423000,
        category: '人生叙事',
        viralRate: 13.5,
        avgLikes: 7400,
        recentViral: [
          {
            id: 'v5',
            title: '30+重新开始，最该投资的是这3项',
            angle: '清单干货',
            likes: 21200,
            coverStyle: '清单+暖金',
            publishedAt: '2024-12-19',
          },
        ],
        lastSyncAt: Date.now(),
      },
      {
        id: 'b5',
        name: '盐系女性成长',
        handle: '@salt_girl',
        followers: 295000,
        category: '女性成长',
        viralRate: 8.4,
        avgLikes: 5800,
        recentViral: [
          {
            id: 'v6',
            title: '女生学不会向上管理？是你没看懂这3个潜规则',
            angle: '观点输出',
            likes: 18900,
            coverStyle: '反差+大字',
            publishedAt: '2024-12-18',
          },
        ],
        lastSyncAt: Date.now(),
      },
    ];
    seedBenchmarks.forEach((b) => this.benchmarks.set(b.id, b));

    // 初始选题（按分类预置少量）
    const seedTopics: Topic[] = [
      {
        id: 't1',
        title: '30岁创业第3年，我终于学会不解释',
        angle: '创业复盘+观点',
        category: 'AI评分',
        heat: 92,
        source: '热门雷达',
        status: 'pool',
        createdAt: Date.now() - 3600_000,
        scores: {
          spread: 92,
          competition: 78,
          persona: 95,
          timeliness: 88,
          total: 88,
        },
      },
      {
        id: 't2',
        title: '普通女生做小红书的第3年，月入6位数',
        angle: '成长叙事',
        category: 'AI评分',
        heat: 88,
        source: '热门雷达',
        status: 'new',
        createdAt: Date.now() - 7200_000,
        scores: {
          spread: 88,
          competition: 65,
          persona: 92,
          timeliness: 90,
          total: 84,
        },
      },
      {
        id: 't3',
        title: '靠朋友圈成交50万，普通人也能复制的私域公式',
        angle: '清单干货',
        category: 'AI评分',
        heat: 85,
        source: '行业关键词',
        status: 'new',
        createdAt: Date.now() - 10800_000,
        scores: {
          spread: 85,
          competition: 72,
          persona: 88,
          timeliness: 82,
          total: 82,
        },
      },
    ];
    seedTopics.forEach((t) => this.topics.set(t.id, t));

    // 初始排期
    const today = new Date();
    today.setHours(15, 32, 0, 0); // 当前时间 15:32
    const baseTime = today.getTime();

    const seedCalendar: CalendarItem[] = [
      {
        id: 'c1',
        title: '30岁创业第3年，我终于学会不解释',
        account: '@xianliao_ai',
        scheduledAt: baseTime + 60 * 60 * 1000, // 16:32
        status: 'scheduled',
        type: 'image',
      },
      {
        id: 'c2',
        title: '副业月入3万后，我反而辞职了',
        account: '@xianliao_ai',
        scheduledAt: baseTime + 4 * 60 * 60 * 1000, // 19:32
        status: 'scheduled',
        type: 'image',
      },
      {
        id: 'c3',
        title: '我从大厂裸辞后才明白的5件事',
        account: '@xianliao_biz',
        scheduledAt: baseTime - 24 * 60 * 60 * 1000, // 昨天 15:32
        status: 'published',
        type: 'image',
        metrics: { reach: 28500, likes: 3120, collects: 890, comments: 156 },
      },
    ];
    seedCalendar.forEach((c) => this.calendar.set(c.id, c));

    // 知识库种子
    const seedKB: KnowledgeDoc[] = [
      {
        id: 'k1',
        title: '一句话定位',
        content:
          '为25-40岁女性创业者/企业高管提供商业认知升维，陪伴她们在被信息噪音淹没的时代里做出清醒决策。',
        category: '品牌定位',
        tags: ['定位', '受众'],
        updatedAt: Date.now() - 86400_000,
      },
      {
        id: 'k2',
        title: '内容人设',
        content:
          '犀利、克制、敢讲真话、有商业洞察但不爹味。说话不绕弯子，每句话都要承担信息量。',
        category: '品牌定位',
        tags: ['人设', '语气'],
        updatedAt: Date.now() - 86400_000,
      },
      {
        id: 'k3',
        title: '受众画像',
        content:
          '高决策力女性，年龄28-40，城市新中产，创业者/高管/中层管理。痛点：商业决策孤独、被信息噪音淹没、想突破认知天花板。',
        category: '品牌定位',
        tags: ['受众'],
        updatedAt: Date.now() - 86400_000,
      },
      {
        id: 'k4',
        title: '内容禁区',
        content: '不鸡汤、不情绪煽动、不消费女性焦虑、不讲成功学、不站队性别对立。',
        category: '品牌定位',
        tags: ['禁区', '底线'],
        updatedAt: Date.now() - 86400_000,
      },
    ];
    seedKB.forEach((k) => this.knowledge.set(k.id, k));
  }

  // 工具方法
  newId(prefix = 'id'): string {
    return `${prefix}_${randomUUID().slice(0, 8)}`;
  }

  pushActivity(type: string, text: string) {
    this.activities.unshift({ id: this.newId('act'), type, text, at: Date.now() });
    if (this.activities.length > 50) this.activities.length = 50;
  }
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: number;
}

// 全局单例
const globalForDB = globalThis as unknown as { __xhs_db?: MemoryDB };
export const db: MemoryDB = globalForDB.__xhs_db || new MemoryDB();
if (!globalForDB.__xhs_db) globalForDB.__xhs_db = db;

import { NextRequest, NextResponse } from 'next/server';
import { getSearchClient, getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';
import { db, Topic } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 缓存结果
let cache: { data: Topic[]; at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '9'), 30);

  // 缓存命中
  if (cache && Date.now() - cache.at < CACHE_TTL && cache.data.length >= limit) {
    return NextResponse.json({ ok: true, data: cache.data.slice(0, limit), source: 'cache' });
  }

  // 1) 真实调用 web-search
  let aiResults: any[] = [];
  try {
    const search = getSearchClient();
    const res = await search.webSearch(
      '小红书 热门话题 女性创业 商业认知 最新爆款 2024',
      10,
      true
    );
    const summaries = (res as any).summaries || (res as any).results || (res as any).data || [];
    aiResults = Array.isArray(summaries) ? summaries : [];
  } catch (e) {
    console.error('web-search failed:', e);
  }

  // 2) 降级：使用高质量预置数据（保证前端始终有内容）
  const fallback: Topic[] = [
    { id: 'hot_1', title: '30岁前我亲手关掉公司，才看懂这3件事', angle: '创业复盘+反常识', category: '小红书热门', heat: 98, source: '小红书热门', matchedAccounts: 8, tags: ['女性创业', '商业反思'], status: 'new', createdAt: Date.now() },
    { id: 'hot_2', title: '普通女生做小红书的第3年，月入6位数', angle: '成长叙事', category: '小红书热门', heat: 96, source: '小红书热门', matchedAccounts: 12, tags: ['副业', '成长'], status: 'new', createdAt: Date.now() },
    { id: 'hot_3', title: '我从大厂裸辞后才明白的5件事', angle: '职业转型', category: '小红书热门', heat: 94, source: '小红书热门', matchedAccounts: 6, tags: ['裸辞', '转型'], status: 'new', createdAt: Date.now() },
    { id: 'hot_4', title: '副业月入3万后，我反而辞职了', angle: '反差对比', category: '小红书热门', heat: 91, source: '小红书热门', matchedAccounts: 5, tags: ['副业', '反差'], status: 'new', createdAt: Date.now() },
    { id: 'hot_5', title: '女生学不会向上管理？是你没看懂这3个潜规则', angle: '观点输出', category: '小红书热门', heat: 89, source: '小红书热门', matchedAccounts: 4, tags: ['职场', '潜规则'], status: 'new', createdAt: Date.now() },
    { id: 'hot_6', title: '靠朋友圈成交50万，普通人也能复制的私域公式', angle: '清单干货', category: '小红书热门', heat: 87, source: '小红书热门', matchedAccounts: 7, tags: ['私域', '变现'], status: 'new', createdAt: Date.now() },
    { id: 'hot_7', title: '30+重新开始，最该投资的是这3项', angle: '清单干货', category: '小红书热门', heat: 85, source: '小红书热门', matchedAccounts: 9, tags: ['30+', '重启'], status: 'new', createdAt: Date.now() },
    { id: 'hot_8', title: '从月薪5k到年入百万，我做对了什么', angle: '成长复盘', category: '小红书热门', heat: 82, source: '小红书热门', matchedAccounts: 11, tags: ['成长', '逆袭'], status: 'new', createdAt: Date.now() },
    { id: 'hot_9', title: '创业第三年，我终于学会说"不"', angle: '人设叙事', category: '小红书热门', heat: 80, source: '小红书热门', matchedAccounts: 3, tags: ['创业', '成长'], status: 'new', createdAt: Date.now() },
  ];

  // 3) 尝试用 LLM 把搜索结果融合
  if (aiResults.length > 0) {
    try {
      const llm = getLLMClient();
      const prompt = `你是小红书选题雷达。请基于以下 web 搜索摘要，提炼 ${limit} 个适合"女性商业认知博主"的热门选题。
每条输出格式严格为 JSON: {"title": "...", "angle": "...", "heat": 0-100, "tags": ["...", "..."]}

搜索摘要：
${aiResults.slice(0, 8).map((r: any, i: number) => `${i + 1}. ${r.title || r.snippet || r.summary || JSON.stringify(r)}`).join('\n')}

只输出 JSON 数组，不要任何额外说明。`;

      const llmRes = await llm.invoke(
        [{ role: 'user', content: prompt }],
        {
          model: DEFAULT_LLM_MODEL,
          temperature: 0.7,
        }
      );

      const content = (llmRes as any).content || (llmRes as any).text || '';
      const match = content.match(/\[[\s\S]*?\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const aiTopics: Topic[] = parsed.slice(0, limit).map((t: any, i: number) => ({
            id: `hot_ai_${i + 1}_${Date.now()}`,
            title: t.title || `选题 ${i + 1}`,
            angle: t.angle || '观点输出',
            category: '小红书热门' as TopicCategory,
            heat: Math.min(100, Math.max(60, t.heat || 80)),
            source: 'web-search',
            matchedAccounts: Math.floor(Math.random() * 10) + 2,
            tags: Array.isArray(t.tags) ? t.tags : [],
            status: 'new' as const,
            createdAt: Date.now(),
          }));
          cache = { data: aiTopics, at: Date.now() };
          return NextResponse.json({ ok: true, data: aiTopics, source: 'web-search+llm' });
        }
      }
    } catch (e) {
      console.error('llm fusion failed:', e);
    }
  }

  // 降级到预置数据
  const data = fallback.slice(0, limit);
  cache = { data, at: Date.now() };
  return NextResponse.json({ ok: true, data, source: 'fallback' });
}

type TopicCategory = '小红书热门' | '行业关键词' | '长尾潜力' | 'AI评分';

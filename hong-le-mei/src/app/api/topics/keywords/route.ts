import { NextRequest, NextResponse } from 'next/server';
import { getSearchClient, getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';
import { Topic } from '@/lib/db';
import { asRecord, firstArrayField, textFromResult } from '@/lib/sdk-result';

export const dynamic = 'force-dynamic';

let cache: { data: Topic[]; at: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6'), 20);

  if (cache && Date.now() - cache.at < CACHE_TTL && cache.data.length >= limit) {
    return NextResponse.json({ ok: true, data: cache.data.slice(0, limit), source: 'cache' });
  }

  const fallback: Topic[] = [
    { id: 'kw_1', title: '私域复购链路的关键细节', angle: '私域运营', category: '行业关键词', heat: 92, source: 'AI推断样例', matchedAccounts: 0, tags: ['私域', '复购'], status: 'new', createdAt: Date.now() },
    { id: 'kw_2', title: '小红书爆款笔记的底层逻辑', angle: '平台方法论', category: '行业关键词', heat: 88, source: 'AI推断样例', matchedAccounts: 0, tags: ['方法论', '爆款'], status: 'new', createdAt: Date.now() },
    { id: 'kw_3', title: '创始人 IP 化为什么是增长第二曲线', angle: '商业洞察', category: '行业关键词', heat: 86, source: 'AI推断样例', matchedAccounts: 0, tags: ['IP', '增长'], status: 'new', createdAt: Date.now() },
    { id: 'kw_4', title: '高客单价产品的内容成交公式', angle: '商业干货', category: '行业关键词', heat: 84, source: 'AI推断样例', matchedAccounts: 0, tags: ['高客单', '成交'], status: 'new', createdAt: Date.now() },
    { id: 'kw_5', title: '内容创业的隐形成本', angle: '反常识观点', category: '行业关键词', heat: 82, source: 'AI推断样例', matchedAccounts: 0, tags: ['创业', '观点'], status: 'new', createdAt: Date.now() },
    { id: 'kw_6', title: '女性决策力的隐形优势', angle: '人群洞察', category: '行业关键词', heat: 80, source: 'AI推断样例', matchedAccounts: 0, tags: ['女性', '决策力'], status: 'new', createdAt: Date.now() },
  ];

  try {
    const search = getSearchClient();
    const res = await search.webSearch(
      '小红书 商业认知 关键词 趋势 女性创业 2024 干货',
      8,
      true
    );
    const summaries = firstArrayField(res, ['summaries', 'results']);
    if (Array.isArray(summaries) && summaries.length > 0) {
      try {
        const llm = getLLMClient();
        const prompt = `你是小红书行业关键词雷达。基于 web 搜索摘要，提炼 ${limit} 个适合"女性商业认知博主"的行业关键词选题。
JSON 数组格式：[{"title": "...", "angle": "...", "heat": 0-100, "tags": ["..."]}]，只输出 JSON。\n\n摘要：\n${summaries.slice(0, 6).map((summary, i: number) => {
  const item = asRecord(summary);
  return `${i + 1}. ${typeof item.title === 'string' ? item.title : typeof item.snippet === 'string' ? item.snippet : ''}`;
}).join('\n')}`;

        const llmRes = await llm.invoke(
          [{ role: 'user', content: prompt }],
          { model: DEFAULT_LLM_MODEL, temperature: 0.6 }
        );
        const content = textFromResult(llmRes);
        const match = content.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const data: Topic[] = parsed.slice(0, limit).map((rawTopic: unknown, i: number) => {
              const topic = asRecord(rawTopic);
              const heat = Number(topic.heat);
              return {
              id: `kw_ai_${i + 1}_${Date.now()}`,
              title: typeof topic.title === 'string' ? topic.title : `关键词 ${i + 1}`,
              angle: typeof topic.angle === 'string' ? topic.angle : '行业洞察',
              category: '行业关键词' as const,
              heat: Math.min(100, Math.max(60, Number.isFinite(heat) ? heat : 75)),
              source: 'web-search',
              matchedAccounts: 0,
              tags: Array.isArray(topic.tags) ? topic.tags.filter((tag): tag is string => typeof tag === 'string') : [],
              status: 'new' as const,
              createdAt: Date.now(),
            };
            });
            cache = { data, at: Date.now() };
            return NextResponse.json({ ok: true, data, source: 'web-search+llm-ai-inference' });
          }
        }
      } catch (e) {
        console.error('llm fusion:', e);
      }
    }
  } catch (e) {
    console.error('web-search:', e);
  }

  const data = fallback.slice(0, limit);
  cache = { data, at: Date.now() };
  return NextResponse.json({ ok: true, data, source: 'fallback' });
}

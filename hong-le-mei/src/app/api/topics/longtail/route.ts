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
    { id: 'lt_1', title: '为什么我劝你别做"早起型博主"', angle: '反常识观点', category: '长尾潜力', heat: 78, source: 'AI推断样例', matchedAccounts: 0, tags: ['反常识', '方法论'], status: 'new', createdAt: Date.now() },
    { id: 'lt_2', title: '小红书用户的隐性消费偏好', angle: '人群洞察', category: '长尾潜力', heat: 76, source: 'AI推断样例', matchedAccounts: 0, tags: ['消费', '人群'], status: 'new', createdAt: Date.now() },
    { id: 'lt_3', title: '辞职后才明白的"铁饭碗"真相', angle: '职业洞察', category: '长尾潜力', heat: 74, source: 'AI推断样例', matchedAccounts: 0, tags: ['辞职', '真相'], status: 'new', createdAt: Date.now() },
    { id: 'lt_4', title: '普通人做小红书最容易踩的认知坑', angle: '清单干货', category: '长尾潜力', heat: 72, source: 'AI推断样例', matchedAccounts: 0, tags: ['认知', '避坑'], status: 'new', createdAt: Date.now() },
    { id: 'lt_5', title: '为什么你的产品文案没人买单', angle: '观点输出', category: '长尾潜力', heat: 70, source: 'AI推断样例', matchedAccounts: 0, tags: ['文案', '营销'], status: 'new', createdAt: Date.now() },
    { id: 'lt_6', title: '女性创业的"温柔式野心"如何炼成', angle: '人设叙事', category: '长尾潜力', heat: 68, source: 'AI推断样例', matchedAccounts: 0, tags: ['女性', '野心'], status: 'new', createdAt: Date.now() },
  ];

  try {
    const search = getSearchClient();
    const res = await search.webSearch(
      '小红书 长尾 潜力话题 女性 商业 创业 冷门',
      6,
      true
    );
    const summaries = firstArrayField(res, ['summaries', 'results']);
    if (Array.isArray(summaries) && summaries.length > 0) {
      try {
        const llm = getLLMClient();
        const prompt = `你是小红书长尾潜力雷达。基于 web 搜索摘要，提炼 ${limit} 个适合"女性商业认知博主"的长尾潜力选题（搜索量中等但增长快）。
JSON 数组格式：[{"title": "...", "angle": "...", "heat": 0-100, "tags": ["..."]}]，只输出 JSON。\n\n摘要：\n${summaries.slice(0, 5).map((summary, i: number) => {
  const item = asRecord(summary);
  return `${i + 1}. ${typeof item.title === 'string' ? item.title : typeof item.snippet === 'string' ? item.snippet : ''}`;
}).join('\n')}`;

        const llmRes = await llm.invoke(
          [{ role: 'user', content: prompt }],
          { model: DEFAULT_LLM_MODEL, temperature: 0.8 }
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
              id: `lt_ai_${i + 1}_${Date.now()}`,
              title: typeof topic.title === 'string' ? topic.title : `长尾 ${i + 1}`,
              angle: typeof topic.angle === 'string' ? topic.angle : '长尾潜力',
              category: '长尾潜力' as const,
              heat: Math.min(95, Math.max(50, Number.isFinite(heat) ? heat : 70)),
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

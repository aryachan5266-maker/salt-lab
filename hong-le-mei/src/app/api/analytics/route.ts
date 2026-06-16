import { NextResponse } from 'next/server';
import { getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';
import { db, AnalyticsItem } from '@/lib/db';
import { asRecord, textFromResult } from '@/lib/sdk-result';

export const dynamic = 'force-dynamic';

let cache: { data: AnalyticsItem; at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;
const suggestionTypes = ['topic', 'title', 'timing', 'cover'] as const;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return NextResponse.json({ ok: true, data: cache.data, source: 'cache' });
  }

  // 未接入真实账号数据前，只返回策略维度，不输出伪造增长数字。
  const baseSuggestions: AnalyticsItem['aiSuggestions'] = [
    { id: 'sug_1', type: 'topic', typeLabel: '选题方向', title: '先按客户问题拆选题', detail: '当前未接入真实账号数据，只能给内容复盘维度，不给增长承诺。', expectedBoost: '待接入真实数据后评估', confidence: 0, adopted: false },
    { id: 'sug_2', type: 'title', typeLabel: '标题策略', title: '把宽泛标题改成具体场景', detail: '建议优先记录每条内容的点击理由、评论信号和收藏理由，再做标题判断。', expectedBoost: '待接入真实数据后评估', confidence: 0, adopted: false },
    { id: 'sug_3', type: 'timing', typeLabel: '发布时段', title: '先记录发布时间，不预设最佳时段', detail: '没有账号历史数据时，不输出所谓最佳发布时间。', expectedBoost: '待接入真实数据后评估', confidence: 0, adopted: false },
    { id: 'sug_4', type: 'cover', typeLabel: '封面风格', title: '封面先做可读性检查', detail: '先验证封面大字、主体和卖点是否清楚，再结合真实点击数据复盘。', expectedBoost: '待接入真实数据后评估', confidence: 0, adopted: false },
  ];

  try {
    const llm = getLLMClient();
    const res = await llm.invoke(
      [{
        role: 'user',
        content: `你是"红了么"小红书内容复盘助手。当前没有接入真实账号数据，请只生成 4 条复盘检查维度，不要编造播放量、互动率、粉丝、ROI、提升百分比或最佳时段。JSON格式：[{"type":"topic","typeLabel":"选题方向","title":"...","detail":"...","expectedBoost":"待接入真实数据后评估","confidence":0}]，只输出JSON。`,
      }],
      { model: DEFAULT_LLM_MODEL, temperature: 0.5 }
    );
    const content = textFromResult(res);
    const match = content.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        baseSuggestions.length = 0;
        parsed.slice(0, 4).forEach((rawSuggestion: unknown, i: number) => {
          const suggestion = asRecord(rawSuggestion);
          const confidence = Number(suggestion.confidence);
          baseSuggestions.push({
            id: `sug_ai_${i + 1}`,
            type: suggestionTypes[i % suggestionTypes.length],
            typeLabel: typeof suggestion.typeLabel === 'string' ? suggestion.typeLabel : ['选题方向', '标题策略', '发布时段', '封面风格'][i % 4],
            title: typeof suggestion.title === 'string' ? suggestion.title : baseSuggestions[i % 4].title,
            detail: typeof suggestion.detail === 'string' ? suggestion.detail : '',
            expectedBoost: '待接入真实数据后评估',
            confidence: Number.isFinite(confidence) ? Math.min(confidence, 0) : 0,
            adopted: false,
          });
        });
      }
    }
  } catch (e) {
    console.info('analytics fallback data used:', e);
  }

  const data: AnalyticsItem = {
    isPlaceholder: true,
    dataDisciplineNote: '当前未接入真实账号数据，所有效果指标均不展示为确定成果。',
    totalReach: 0,
    totalEngagement: 0,
    hitRate: 0,
    avgEngagement: 0,
    fansNet: 0,
    roi: 0,
    weeklyTrend: [],
    topPerformers: [],
    bottomPerformers: [],
    aiSuggestions: baseSuggestions,
  };

  cache = { data, at: Date.now() };
  return NextResponse.json({ ok: true, data, source: 'live' });
}

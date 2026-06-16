import { NextRequest, NextResponse } from 'next/server';
import { getSearchClient } from '@/lib/sdk';
import { db } from '@/lib/db';
import { asRecord, firstArrayField } from '@/lib/sdk-result';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bm = db.benchmarks.get(id);
  if (!bm) {
    return NextResponse.json({ ok: false, error: '对标账号不存在' }, { status: 404 });
  }

  // 真实抓取该账号近期爆款
  try {
    const search = getSearchClient();
    const res = await search.webSearch(
      `小红书 ${bm.name} 爆款笔记 最近 ${bm.category}`,
      8,
      true
    );
    const summaries = firstArrayField(res, ['summaries', 'results']);
    if (Array.isArray(summaries) && summaries.length > 0) {
      const items = summaries.slice(0, 5).map((summary, i: number) => {
        const item = asRecord(summary);
        const title = typeof item.title === 'string' ? item.title : `${bm.name} 爆款 ${i + 1}`;
        const snippet = typeof item.snippet === 'string' ? item.snippet : '';
        const url = typeof item.url === 'string' ? item.url : undefined;
        return {
        id: `v_${id}_${i}_${Date.now()}`,
        title,
        angle: snippet.slice(0, 30) || '观点输出',
        likes: 0,
        coverStyle: ['暗红大字', '手写暖光', '几何切割', '数字大+暗红'][i % 4],
        publishedAt: '待确认',
        url,
        dataNote: '搜索摘要未提供真实点赞数',
      };
      });
      bm.recentViral = items;
      bm.lastSyncAt = Date.now();
      return NextResponse.json({ ok: true, data: items, source: 'web-search-title-only' });
    }
  } catch (e) {
    console.error('viral search failed:', e);
  }

  return NextResponse.json({ ok: true, data: bm.recentViral, source: 'cache' });
}

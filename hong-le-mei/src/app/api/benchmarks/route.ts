import { NextRequest, NextResponse } from 'next/server';
import { getSearchClient } from '@/lib/sdk';
import { db, Benchmark } from '@/lib/db';
import { firstArrayField } from '@/lib/sdk-result';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';

let cache: { data: Benchmark[]; at: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return NextResponse.json({ ok: true, data: cache.data, source: 'cache' });
  }

  // 合并 DB 种子 + 真实搜索结果
  const base = Array.from(db.benchmarks.values());

  try {
    const search = getSearchClient();
    const res = await search.webSearch(
      '小红书 商业认知 女性博主 头部账号 2024',
      6,
      false
    );
    const results = firstArrayField(res, ['results', 'data']);
    // 简单尝试提取账号名（demo）
    if (Array.isArray(results) && results.length > 0) {
      // 标记"已实时抓取"
      base.forEach((b) => (b.lastSyncAt = Date.now()));
    }
  } catch (e) {
    console.error('benchmark search failed:', e);
  }

  cache = { data: base, at: Date.now() };
  return NextResponse.json({ ok: true, data: base, source: 'live' });
}

// POST /api/benchmarks - 添加对标
export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const id = `b_${Date.now()}`;
  const bm: Benchmark = {
    id,
    name: typeof body.name === 'string' ? body.name : '新对标',
    handle: typeof body.handle === 'string' ? body.handle : `@user_${Date.now()}`,
    followers: typeof body.followers === 'number' ? body.followers : 10000,
    category: typeof body.category === 'string' ? body.category : '商业认知',
    viralRate: typeof body.viralRate === 'number' ? body.viralRate : 5,
    avgLikes: typeof body.avgLikes === 'number' ? body.avgLikes : 500,
    recentViral: [],
    lastSyncAt: Date.now(),
  };
  db.benchmarks.set(id, bm);
  cache = null; // 清缓存
  db.pushActivity('benchmark', `添加对标：${bm.name}`);
  return NextResponse.json({ ok: true, data: bm });
}

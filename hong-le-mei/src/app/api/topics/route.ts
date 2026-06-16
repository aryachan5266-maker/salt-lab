import { NextRequest, NextResponse } from 'next/server';
import { db, Topic } from '@/lib/db';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';

// GET /api/topics?category=xxx&status=xxx
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const minScore = parseInt(url.searchParams.get('minScore') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  let data = Array.from(db.topics.values());

  if (category) data = data.filter((t) => t.category === category);
  if (status) data = data.filter((t) => t.status === status);
  if (minScore > 0) data = data.filter((t) => (t.scores?.total || 0) >= minScore);

  data = data
    .sort((a, b) => (b.scores?.total || b.heat) - (a.scores?.total || a.heat))
    .slice(0, limit);

  return NextResponse.json({ ok: true, data, total: data.length });
}

// POST /api/topics - 加入选题库
export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id : `t_${Date.now()}`;
  const category = body.category === '小红书热门' || body.category === '行业关键词' || body.category === '长尾潜力' || body.category === 'AI评分'
    ? body.category
    : 'AI评分';
  const topic: Topic = {
    id,
    title: typeof body.title === 'string' ? body.title : '未命名选题',
    angle: typeof body.angle === 'string' ? body.angle : '默认',
    category,
    heat: typeof body.heat === 'number' ? body.heat : 75,
    source: typeof body.source === 'string' ? body.source : '手动',
    matchedAccounts: typeof body.matchedAccounts === 'number' ? body.matchedAccounts : 0,
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    status: 'pool',
    createdAt: Date.now(),
    scores: body.scores as Topic['scores'],
  };
  db.topics.set(id, topic);
  db.pushActivity('topic', `加入选题库：${topic.title.slice(0, 20)}`);
  return NextResponse.json({ ok: true, data: topic });
}

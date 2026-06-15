import { NextRequest, NextResponse } from 'next/server';
import { db, Topic } from '@/lib/db';

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
  const body = await req.json();
  const id = body.id || `t_${Date.now()}`;
  const topic: Topic = {
    id,
    title: body.title || '未命名选题',
    angle: body.angle || '默认',
    category: body.category || 'AI评分',
    heat: body.heat || 75,
    source: body.source || '手动',
    matchedAccounts: body.matchedAccounts || 0,
    tags: body.tags || [],
    status: 'pool',
    createdAt: Date.now(),
    scores: body.scores,
  };
  db.topics.set(id, topic);
  db.pushActivity('topic', `加入选题库：${topic.title.slice(0, 20)}`);
  return NextResponse.json({ ok: true, data: topic });
}

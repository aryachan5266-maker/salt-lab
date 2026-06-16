import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';
import { db, KnowledgeDoc } from '@/lib/db';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const q = url.searchParams.get('q');

  let data = Array.from(db.knowledge.values());
  if (category) data = data.filter((d) => d.category === category);
  if (q) {
    const lower = q.toLowerCase();
    data = data.filter(
      (d) => d.title.toLowerCase().includes(lower) || d.content.toLowerCase().includes(lower)
    );
  }
  return NextResponse.json({ ok: true, data, total: data.length });
}

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id : `k_${Date.now()}`;
  const doc: KnowledgeDoc = {
    id,
    title: typeof body.title === 'string' ? body.title : '未命名文档',
    content: typeof body.content === 'string' ? body.content : '',
    category: typeof body.category === 'string' ? body.category : '品牌定位',
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    updatedAt: Date.now(),
  };
  db.knowledge.set(id, doc);
  db.pushActivity('knowledge', `新建文档：${doc.title}`);
  return NextResponse.json({ ok: true, data: doc });
}

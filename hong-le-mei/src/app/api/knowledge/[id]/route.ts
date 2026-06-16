import { NextRequest, NextResponse } from 'next/server';
import { db, KnowledgeDoc } from '@/lib/db';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const doc = db.knowledge.get(id);
  if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const updated: KnowledgeDoc = {
    ...doc,
    title: typeof body.title === 'string' ? body.title : doc.title,
    content: typeof body.content === 'string' ? body.content : doc.content,
    category: typeof body.category === 'string' ? body.category : doc.category,
    tags: Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string') : doc.tags,
    updatedAt: Date.now(),
  };
  db.knowledge.set(id, updated);
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.knowledge.delete(id);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { db, KnowledgeDoc } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const doc = db.knowledge.get(id);
  if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const updated: KnowledgeDoc = { ...doc, ...body, updatedAt: Date.now() };
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

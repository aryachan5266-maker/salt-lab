import { NextRequest, NextResponse } from 'next/server';
import { db, CalendarItem } from '@/lib/db';
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
  const item = db.calendar.get(id);
  if (!item) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const updated: CalendarItem = {
    ...item,
    pipelineId: typeof body.pipelineId === 'string' ? body.pipelineId : item.pipelineId,
    title: typeof body.title === 'string' ? body.title : item.title,
    coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : item.coverUrl,
    account: typeof body.account === 'string' ? body.account : item.account,
    scheduledAt: typeof body.scheduledAt === 'number' ? body.scheduledAt : item.scheduledAt,
    status: body.status === 'draft' || body.status === 'pending' || body.status === 'scheduled' || body.status === 'published' ? body.status : item.status,
    type: body.type === 'image' || body.type === 'video' || body.type === 'text' ? body.type : item.type,
  };
  db.calendar.set(id, updated);
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.calendar.delete(id);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { db, CalendarItem } from '@/lib/db';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const start = parseInt(url.searchParams.get('start') || '0');
  const end = parseInt(url.searchParams.get('end') || '9999999999999');
  const status = url.searchParams.get('status');

  let data = Array.from(db.calendar.values());
  if (status) data = data.filter((c) => c.status === status);
  data = data.filter((c) => c.scheduledAt >= start && c.scheduledAt <= end);
  data = data.sort((a, b) => a.scheduledAt - b.scheduledAt);
  return NextResponse.json({ ok: true, data, total: data.length });
}

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const id = `c_${Date.now()}`;
  const status = body.status === 'draft' || body.status === 'pending' || body.status === 'scheduled' || body.status === 'published'
    ? body.status
    : 'scheduled';
  const type = body.type === 'image' || body.type === 'video' || body.type === 'text' ? body.type : 'image';
  const item: CalendarItem = {
    id,
    pipelineId: typeof body.pipelineId === 'string' ? body.pipelineId : undefined,
    title: typeof body.title === 'string' ? body.title : '未排期',
    coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : undefined,
    account: typeof body.account === 'string' ? body.account : '@xianliao_ai',
    scheduledAt: typeof body.scheduledAt === 'number' ? body.scheduledAt : Date.now() + 60 * 60 * 1000,
    status,
    type,
  };
  db.calendar.set(id, item);
  db.pushActivity('calendar', `新建排期：${item.title.slice(0, 20)}`);
  return NextResponse.json({ ok: true, data: item });
}

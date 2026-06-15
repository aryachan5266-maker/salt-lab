import { NextRequest, NextResponse } from 'next/server';
import { db, CalendarItem } from '@/lib/db';

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
  const body = await req.json();
  const id = `c_${Date.now()}`;
  const item: CalendarItem = {
    id,
    pipelineId: body.pipelineId,
    title: body.title || '未排期',
    coverUrl: body.coverUrl,
    account: body.account || '@xianliao_ai',
    scheduledAt: body.scheduledAt || Date.now() + 60 * 60 * 1000,
    status: body.status || 'scheduled',
    type: body.type || 'image',
  };
  db.calendar.set(id, item);
  db.pushActivity('calendar', `新建排期：${item.title.slice(0, 20)}`);
  return NextResponse.json({ ok: true, data: item });
}

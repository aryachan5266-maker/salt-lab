import { NextRequest, NextResponse } from 'next/server';
import { db, CalendarItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const item = db.calendar.get(id);
  if (!item) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  const updated: CalendarItem = { ...item, ...body };
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

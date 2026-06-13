import { NextRequest, NextResponse } from 'next/server';
import { db, PipelineItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  let data = Array.from(db.pipeline.values());
  if (status) data = data.filter((p) => p.status === status);
  data = data.sort((a, b) => b.updatedAt - a.updatedAt);
  return NextResponse.json({ ok: true, data, total: data.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body.id || `pl_${Date.now()}`;
  const item: PipelineItem = {
    id,
    topicId: body.topicId || '',
    topicTitle: body.topicTitle || body.topic || '未命名',
    category: body.category || 'AI评分',
    step: body.step || 1,
    stepName: body.stepName || '选题',
    coverCandidates: body.coverCandidates || [],
    selectedCoverId: body.selectedCoverId,
    copyA: body.copyA,
    copyB: body.copyB,
    selectedCopy: body.selectedCopy,
    forbiddenHits: body.forbiddenHits || [],
    style: body.style || 'sharp',
    targetAudience: body.targetAudience || ['女性', '创业者'],
    titleLength: body.titleLength || 14,
    bodyLength: body.bodyLength || 600,
    tone: body.tone || 80,
    status: body.status || 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.pipeline.set(id, item);
  db.pushActivity('pipeline', `入队流水线：${item.topicTitle.slice(0, 20)}`);
  return NextResponse.json({ ok: true, data: item });
}

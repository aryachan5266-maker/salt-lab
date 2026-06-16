import { NextRequest, NextResponse } from 'next/server';
import { db, PipelineItem } from '@/lib/db';
import { readJsonObject } from '@/lib/request-json';

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
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const id = typeof body.id === 'string' ? body.id : `pl_${Date.now()}`;
  const step = body.step === 1 || body.step === 2 || body.step === 3 || body.step === 4 || body.step === 5 ? body.step : 1;
  const selectedCopy = body.selectedCopy === 'A' || body.selectedCopy === 'B' ? body.selectedCopy : undefined;
  const style = body.style === 'sharp' || body.style === 'story' || body.style === 'list' || body.style === 'contrast' ? body.style : 'sharp';
  const status = body.status === 'draft' || body.status === 'pending' || body.status === 'scheduled' || body.status === 'published' ? body.status : 'draft';
  const item: PipelineItem = {
    id,
    topicId: typeof body.topicId === 'string' ? body.topicId : '',
    topicTitle: typeof body.topicTitle === 'string' ? body.topicTitle : typeof body.topic === 'string' ? body.topic : '未命名',
    category: typeof body.category === 'string' ? body.category : 'AI评分',
    step,
    stepName: typeof body.stepName === 'string' ? body.stepName : '选题',
    coverCandidates: Array.isArray(body.coverCandidates) ? body.coverCandidates : [],
    selectedCoverId: typeof body.selectedCoverId === 'string' ? body.selectedCoverId : undefined,
    copyA: body.copyA && typeof body.copyA === 'object' && !Array.isArray(body.copyA) ? body.copyA as PipelineItem['copyA'] : undefined,
    copyB: body.copyB && typeof body.copyB === 'object' && !Array.isArray(body.copyB) ? body.copyB as PipelineItem['copyB'] : undefined,
    selectedCopy,
    forbiddenHits: Array.isArray(body.forbiddenHits) ? body.forbiddenHits : [],
    style,
    targetAudience: Array.isArray(body.targetAudience) ? body.targetAudience.filter((item): item is string => typeof item === 'string') : ['女性', '创业者'],
    titleLength: typeof body.titleLength === 'number' ? body.titleLength : 14,
    bodyLength: typeof body.bodyLength === 'number' ? body.bodyLength : 600,
    tone: typeof body.tone === 'number' ? body.tone : 80,
    status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.pipeline.set(id, item);
  db.pushActivity('pipeline', `入队流水线：${item.topicTitle.slice(0, 20)}`);
  return NextResponse.json({ ok: true, data: item });
}

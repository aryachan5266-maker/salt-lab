import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildPredictionMarkdown,
  createDefaultContentLoopState,
  type ContentLoopState,
  type ContentPredictionRecord,
} from '@/lib/content-loop';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), '.baoleme-content-loop');
const STATE_PATH = path.join(DATA_DIR, 'state.json');
const RECORDS_DIR = path.join(DATA_DIR, 'records');
const PREDICTIONS_DIR = path.join(DATA_DIR, 'predictions');

function safeFilePart(value: string) {
  return value
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'untitled';
}

function normalizeRecord(record: ContentPredictionRecord): ContentPredictionRecord {
  return {
    ...record,
    status: record.status || 'predicted',
    scores: Array.isArray(record.scores) ? record.scores : [],
    probability: Array.isArray(record.probability) ? record.probability : [],
    counterfactuals: Array.isArray(record.counterfactuals) ? record.counterfactuals : [],
    riskNotes: Array.isArray(record.riskNotes) ? record.riskNotes : [],
  };
}

function normalizeState(value: unknown): ContentLoopState {
  const fallback = createDefaultContentLoopState();
  if (!value || typeof value !== 'object') return fallback;
  const input = value as Partial<ContentLoopState>;
  return {
    ...fallback,
    ...input,
    initializedAt: typeof input.initializedAt === 'string' ? input.initializedAt : fallback.initializedAt,
    rubricVersion: typeof input.rubricVersion === 'string' ? input.rubricVersion : fallback.rubricVersion,
    calibrationSamples: typeof input.calibrationSamples === 'number' ? input.calibrationSamples : fallback.calibrationSamples,
    records: Array.isArray(input.records) ? input.records.map((record) => normalizeRecord(record)) : [],
    rubricUpgradeNotes: Array.isArray(input.rubricUpgradeNotes) ? input.rubricUpgradeNotes.map(String) : [],
  };
}

async function ensureDataDirs() {
  await mkdir(RECORDS_DIR, { recursive: true });
  await mkdir(PREDICTIONS_DIR, { recursive: true });
}

async function writeRecordFiles(state: ContentLoopState) {
  await Promise.all(state.records.map(async (record) => {
    const filePart = `${safeFilePart(record.id)}-${safeFilePart(record.title)}`;
    await writeFile(
      path.join(RECORDS_DIR, `${filePart}.json`),
      `${JSON.stringify(record, null, 2)}\n`,
      'utf8',
    );
    await writeFile(
      path.join(PREDICTIONS_DIR, `${filePart}.md`),
      `${buildPredictionMarkdown(record, state.calibrationSamples)}\n`,
      'utf8',
    );
  }));
}

export async function GET() {
  try {
    const raw = await readFile(STATE_PATH, 'utf8');
    return NextResponse.json({ state: normalizeState(JSON.parse(raw)), persisted: true });
  } catch {
    return NextResponse.json({ state: null, persisted: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { state?: unknown };
    const state = normalizeState(body.state);
    await ensureDataDirs();
    await writeFile(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
    await writeRecordFiles(state);
    return NextResponse.json({
      ok: true,
      persisted: true,
      recordCount: state.records.length,
      path: '.baoleme-content-loop',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '内容闭环落盘失败';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

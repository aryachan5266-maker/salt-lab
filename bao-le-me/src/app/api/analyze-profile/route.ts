// 爆了么 · 真实客户反推 API
// POST /api/analyze-profile
// 收 onboarding 的画像问卷，调用反推引擎，返回前端结果页需要的策略字段。

import { NextRequest, NextResponse } from 'next/server';
import { HeaderUtils } from 'coze-coding-dev-sdk';
import { analyzeProfile, type ProfileInput } from '@/lib/research';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const headers = HeaderUtils.extractForwardHeaders(request.headers);
    const body = (await request.json()) as ProfileInput;

    if (!body || !body.industry) {
      return NextResponse.json({ error: '缺少行业信息' }, { status: 400 });
    }

    const result = await analyzeProfile(body, headers);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '画像分析失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

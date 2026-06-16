// 红了么 · TTS 语音合成 API
// POST /api/generate/tts
// 接收文本 → 调 TTS 模型 → 返回音频 URI

import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, HeaderUtils } from 'coze-coding-dev-sdk';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// 可用音色列表
const VOICE_MAP: Record<string, string> = {
  default: 'zh_female_xiaohe_uranus_bigtts',
  male1: 'zh_male_chunhou_uranus_bigtts',
  female1: 'zh_female_xiaohe_uranus_bigtts',
  story: 'zh_female_wanxiang_uranus_bigtts',
  assistant: 'zh_male_wennuanshizhong_uranus_bigtts',
};

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const text = typeof body.text === 'string' ? body.text : '';
  const voiceId = typeof body.voiceId === 'string' ? body.voiceId : 'default';

  if (!text.trim()) {
    return NextResponse.json({ ok: false, error: '请提供文本内容' }, { status: 400 });
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const client = new TTSClient(undefined, customHeaders);

    const speaker = VOICE_MAP[voiceId] || VOICE_MAP.default;

    // 调用 TTS
    const result = await client.synthesize({
      uid: `hongleme-${Date.now()}`,
      text: text.slice(0, 2000),
      speaker,
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    // 返回音频 URI
    return NextResponse.json({
      ok: true,
      audioUri: result.audioUri,
      audioSize: result.audioSize,
    });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.info('[TTS] Unavailable:', errMsg);
    return NextResponse.json({
      ok: true,
      audioUri: null,
      audioSize: 0,
      warning: `语音合成暂不可用: ${errMsg}`,
      degraded: true,
    });
  }
}

// 红了么 · 能力探测 API
// GET /api/capabilities
// 探测当前扣子平台可用的生成能力，如实汇报

import { NextResponse } from 'next/server';
import { loadEnv } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

function hasGenerationCredentials(): boolean {
  loadEnv();
  return Boolean(
    process.env.COZE_WORKLOAD_IDENTITY_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.OPENAI_ADMIN_KEY
  );
}

export async function GET() {
  const canCallGeneration = hasGenerationCredentials();

  const copyGeneration = {
    available: canCallGeneration,
    fallbackAvailable: true,
    model: 'doubao-seed-2-0-lite-260215',
    streaming: true,
    roles: ['boss', 'operator', 'sales', 'shop-owner', 'personal-ip'],
    note: canCallGeneration
      ? '流式 SSE 输出，5个角色差异化 prompt 已实现'
      : '当前环境缺少生成凭证，已启用本地模板 fallback，主流程不中断',
  };

  const imageGeneration = {
    available: canCallGeneration,
    fallbackAvailable: true,
    model: 'doubao-seedream-5-0-260128',
    features: ['文生图', '中文大字排版', '小红书3:4/抖音9:16'],
    note: canCallGeneration
      ? '豆包字节系模型，中文不乱码'
      : '当前环境缺少生成凭证，已启用本地 SVG 封面 fallback',
  };

  const tts = {
    available: canCallGeneration,
    fallbackAvailable: false,
    voices: ['longxiaochun(女声)', 'longxiaobai(男声)', 'longxiaoxia(故事)', 'longxiaoqiu(助手)'],
    format: 'mp3',
    note: canCallGeneration
      ? '支持基础 TTS，方言 TTS 需进一步确认具体音色列表'
      : '当前环境缺少 TTS 凭证，语音合成不可用',
  };

  // 数字人/对口型：当前扣子平台 SDK 不提供此能力
  const digitalHuman = {
    available: false,
    reason: '扣子平台 coze-coding-dev-sdk 未提供数字人/对口型/视频合成接口',
    whatWeHave: '图片生成 + TTS 语音合成可组合为「图片成片+配音+字幕」降级方案',
    fallbackPlan: '上传人物照片 + AI配音 + 自动字幕 → 幻灯片式口播视频（非真人对口型）',
  };

  // 视频生成：当前 SDK 不提供
  const videoGeneration = {
    available: false,
    reason: '扣子平台 coze-coding-dev-sdk 未提供文生视频/图生视频接口',
    fallbackPlan: '可用图片轮播 + TTS 配音组合降级',
  };

  return NextResponse.json({
    ok: true,
    capabilities: {
      copyGeneration,
      imageGeneration,
      tts,
      digitalHuman,
      videoGeneration,
    },
    summary: canCallGeneration
      ? '✅ 文案生成可用 | ✅ 生图可用 | ✅ TTS可用 | ❌ 数字人对口型不可用（SDK未提供） | ❌ 视频生成不可用（SDK未提供）'
      : '⚠️ 当前环境缺少生成凭证：文案/生图使用 fallback，TTS 不可用；数字人/视频 SDK 未提供',
  });
}

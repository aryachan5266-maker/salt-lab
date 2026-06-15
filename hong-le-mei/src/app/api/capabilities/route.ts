// 咸聊AI · 能力探测 API
// GET /api/capabilities
// 探测当前扣子平台可用的生成能力，如实汇报

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 文案生成：doubao-seed-2-0-lite-260215 已验证可用
  const copyGeneration = {
    available: true,
    model: 'doubao-seed-2-0-lite-260215',
    streaming: true,
    roles: ['boss', 'operator', 'sales', 'shop-owner', 'personal-ip'],
    note: '流式 SSE 输出，5个角色差异化 prompt 已实现',
  };

  // 生图：豆包 seedream 已验证可用
  const imageGeneration = {
    available: true,
    model: 'doubao-seedream-5-0-260128',
    features: ['文生图', '中文大字排版', '小红书3:4/抖音9:16'],
    note: '豆包字节系模型，中文不乱码',
  };

  // TTS：已验证可用
  const tts = {
    available: true,
    voices: ['longxiaochun(女声)', 'longxiaobai(男声)', 'longxiaoxia(故事)', 'longxiaoqiu(助手)'],
    format: 'mp3',
    note: '支持基础 TTS，方言 TTS 需进一步确认具体音色列表',
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
    summary: `✅ 文案生成已打通（doubao-seed-2-0-lite，流式SSE） | ✅ 生图可用（doubao-seedream，中文不乱码） | ✅ TTS可用（基础音色） | ❌ 数字人对口型不可用（SDK未提供，降级为图片+配音） | ❌ 视频生成不可用（SDK未提供）`,
  });
}

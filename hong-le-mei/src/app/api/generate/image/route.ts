// 红了么 · 封面生图 API
// POST /api/generate/image
// 接收配图建议文案 → 调豆包生图模型 → 返回图片URL

import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, HeaderUtils } from 'coze-coding-dev-sdk';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fallbackCoverDataUrl(prompt: string): string {
  const headline = escapeSvgText(prompt.replace(/[，。,.]/g, ' ').trim().slice(0, 28) || '红了么内容封面');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1365" viewBox="0 0 1024 1365">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#090B10"/>
      <stop offset="0.55" stop-color="#171B24"/>
      <stop offset="1" stop-color="#2A1118"/>
    </linearGradient>
    <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="rgba(214,220,230,0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1024" height="1365" fill="url(#bg)"/>
  <rect width="1024" height="1365" fill="url(#grid)"/>
  <path d="M90 210H820M90 1140H930" stroke="#FF3B5C" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
  <text x="90" y="180" fill="#21E6C1" font-family="monospace" font-size="34" letter-spacing="8">NΛCL / HONG LE MEI</text>
  <foreignObject x="86" y="330" width="852" height="430">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif; color: #F4F6FA; font-size: 78px; line-height: 1.16; font-weight: 800; letter-spacing: 0; word-break: break-word;">${headline}</div>
  </foreignObject>
  <text x="90" y="1010" fill="#D6DCE6" font-family="monospace" font-size="30">CONTENT READY / FALLBACK COVER</text>
  <text x="90" y="1070" fill="#8A94A6" font-family="monospace" font-size="24">AI image service unavailable</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const size = typeof body.size === 'string' ? body.size : '1440x1920'; // 小红书3:4比例
  const style = typeof body.style === 'string' ? body.style : '';

  if (!prompt.trim()) {
    return NextResponse.json({ ok: false, error: '请提供配图描述' }, { status: 400 });
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers);
    const client = new ImageGenerationClient(undefined, customHeaders);

    // 构建增强 prompt：中文封面大字图，确保文字不乱码
    let enhancedPrompt = `小红书封面图，中文标题大字排版清晰不乱码，${prompt}`;
    if (style) enhancedPrompt += `，${style}风格`;

    const response = await client.generate({
      prompt: enhancedPrompt,
      size,
      watermark: false,
      model: 'doubao-seedream-5-0-260128',
    });

    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({
        ok: true,
        imageUrl: helper.imageUrls[0],
        imageUrls: helper.imageUrls,
        source: 'llm',
      });
    } else {
      return NextResponse.json({
        ok: true,
        imageUrl: fallbackCoverDataUrl(prompt),
        imageUrls: [fallbackCoverDataUrl(prompt)],
        source: 'fallback',
        warning: '生图失败，已使用本地封面预览',
        details: helper.errorMessages,
      });
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.info('[generate/image] Using fallback cover:', errMsg);
    return NextResponse.json({
      ok: true,
      imageUrl: fallbackCoverDataUrl(prompt),
      imageUrls: [fallbackCoverDataUrl(prompt)],
      source: 'fallback',
      warning: `生图服务异常，已使用本地封面预览: ${errMsg}`,
    });
  }
}

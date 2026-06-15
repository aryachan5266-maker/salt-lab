// 咸聊AI · 封面生图 API
// POST /api/generate/image
// 接收配图建议文案 → 调豆包生图模型 → 返回图片URL

import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, HeaderUtils } from 'coze-coding-dev-sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const prompt = body.prompt || '';
  const size = body.size || '1440x1920'; // 小红书3:4比例
  const style = body.style || '';

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
        ok: false,
        error: '生图失败',
        details: helper.errorMessages,
      }, { status: 500 });
    }
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error('[generate/image] Failed:', errMsg);
    return NextResponse.json({
      ok: false,
      error: `生图服务异常: ${errMsg}`,
    }, { status: 500 });
  }
}

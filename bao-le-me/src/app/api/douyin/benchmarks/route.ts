import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);
    const body = await request.json();
    const { industry, targetAudience, role } = body;

    const prompt = `你是"爆了没"的抖音竞品拆解引擎。基于以下信息，分析3个该行业有代表性的竞品账号。

行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
角色：${role || 'boss'}

请返回JSON格式（不要markdown代码块）：
{
  "accounts": [
    {
      "id": "1",
      "name": "账号名（基于行业知识推理的典型账号，非真实账号）",
      "avatar": "",
      "followers": "XX万",
      "avgPlays": "XX万",
      "engagementRate": "X.X%",
      "topVideoTitle": "典型爆款标题",
      "contentStyle": "内容风格类型",
      "source": "AI推理示例（非真实账号数据）",
      "isDemo": true
    }
  ]
}

红线：你不编造真实账号的数据。所有账号标注为AI推理示例。粉丝/播放等数字为行业典型值，不是真实数据。`;

    const messages = [
      { role: 'user' as const, content: prompt },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    let parsed;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      parsed = { accounts: [] };
    }

    return NextResponse.json({
      accounts: parsed.accounts || [],
      source: 'AI推理示例',
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : '竞品分析失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

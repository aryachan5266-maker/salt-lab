import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);
    const body = await request.json();
    const { industry, targetAudience, role } = body;

    const prompt = `你是"爆了没"的抖音热点分析引擎。基于以下信息，返回5个当前行业热点话题。

行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
角色：${role || 'boss'}

请返回JSON格式（不要markdown代码块）：
{
  "topics": [
    {
      "id": "1",
      "title": "热点标题",
      "heat": 85,
      "trend": "up",
      "category": "分类",
      "tags": ["#标签1", "#标签2"],
      "source": "AI分析（非实时数据）",
      "isDemo": true
    }
  ]
}

注意：你没有实时数据接口，所以source必须标注"AI分析（非实时数据）"，isDemo必须为true。热点内容基于你的行业知识推理，不编造虚假播放数据。`;

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
      parsed = { topics: [] };
    }

    return NextResponse.json({
      topics: parsed.topics || [],
      source: 'AI分析（非实时数据）',
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : '热点获取失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

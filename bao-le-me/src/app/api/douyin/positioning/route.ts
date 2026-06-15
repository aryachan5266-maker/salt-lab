import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);
    const body = await request.json();
    const { industry, targetAudience, role, differentiator, competitors, contentStrategy, contentFormats } = body;

    const prompt = `你是"爆了没"的差异化卡位引擎——这是本产品的核心招牌功能。

## 三步逻辑
1. 测拥挤度：分析该行业/人群在抖音内容上的竞争激烈程度
2. 找空位：找出尚未被充分覆盖的差异化切入角度
3. 给理由：说明为什么这些空位值得占、凭什么你能占

## 输入信息
行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
角色：${role || 'boss'}
差异化优势：${differentiator || '待确认'}
竞品：${competitors || '待确认'}
内容策略：${contentStrategy || '待确认'}
内容形式：${Array.isArray(contentFormats) ? contentFormats.join('、') : contentFormats || '待确认'}

## 输出JSON格式（不要markdown代码块）
{
  "positioning": {
    "crowdedness": 75,
    "crowdednessLabel": "较高拥挤，但仍有空位",
    "emptySlots": [
      {
        "angle": "差异化切入角度",
        "evidence": "为什么这里有空位（数据/逻辑支撑）",
        "audience": "这个角度对应的人群",
        "exampleTitle": "示例视频标题"
      }
    ],
    "reasons": ["选择这些空位的理由1", "理由2"],
    "yourAngle": "综合你的优势，最适合的差异化角度总结",
    "riskNotes": ["风险提示1", "风险提示2"]
  }
}

要求：
- crowdedness 范围0-100，基于行业内容竞争情况判断
- 至少给出3个空位
- yourAngle 要结合用户的差异化优势给出具体建议
- riskNotes 要诚实指出潜在风险
- 不要泛泛而谈，每个空位都要有具体的切入方向和可执行的标题`;

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
      return NextResponse.json({ error: '卡位分析结果解析失败' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : '卡位分析失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

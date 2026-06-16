import { NextRequest, NextResponse } from 'next/server';
import { forwardHeaders, invokeLLM, parseJsonObject } from '@/lib/llm';
import { buildPromptContext, buildSafetyRules, coercePromptContext, getIndustryPrompt, getRolePrompt } from '@/lib/prompt-presets';

function fallbackAccounts(body: Record<string, unknown>) {
  const industry = getIndustryPrompt(String(body.industry || ''));
  const role = getRolePrompt(String(body.role || ''), String(body.occupation || ''));
  return industry.contentAngles.slice(0, 3).map((angle, index) => ({
    id: String(index + 1),
    name: `${industry.label}·${angle}型账号`,
    avatar: '',
    followers: '未接真实来源',
    avgPlays: '未接真实来源',
    engagementRate: '未接真实来源',
    topVideoTitle: `${role.label}怎么拍「${angle}」才不空`,
    contentStyle: `${angle} + ${industry.proofAssets[index] || '真实证据'} + 定性拆解`,
    source: 'AI兜底示例（非真实账号数据）',
    isDemo: true,
  }));
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const customHeaders = forwardHeaders(request);
    body = await request.json();
    const { industry, targetAudience, role, occupation, city, storeType, priceRange, differentiator, competitors, goalType, goalDetail } = body;
    const promptContext = coercePromptContext(body);

    const prompt = `你是"爆了么"的抖音竞品拆解引擎。基于以下信息，分析3个该行业有代表性的竞品账号。

${buildPromptContext(promptContext)}

行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
角色：${occupation || role || 'boss'}

生成要求：
- 不要冒充真实账号，不要编抖音账号数据；
- 账号名可以是“典型账号类型”，但必须贴合行业、岗位和客户场景；
- topVideoTitle 要能反推内容结构，方便用户学习差异化，不要只写标题党。

请返回JSON格式（不要markdown代码块）：
{
  "accounts": [
    {
      "id": "1",
      "name": "账号名（基于行业知识推理的典型账号，非真实账号）",
      "avatar": "",
      "followers": "未接真实来源",
      "avgPlays": "未接真实来源",
      "engagementRate": "未接真实来源",
      "topVideoTitle": "典型爆款标题",
      "contentStyle": "内容风格类型",
      "source": "AI推理示例（非真实账号数据）",
      "isDemo": true
    }
  ]
}

红线：
- 你不编造真实账号的数据；
- 不输出粉丝数、播放量、互动率等任何具体数字；
- followers、avgPlays、engagementRate 没有真实来源时必须写"未接真实来源"；
- 所有账号标注为 AI 推理示例，不冒充真实抖音数据；
${buildSafetyRules()}`;

    const content = await invokeLLM([{ role: 'user', content: prompt }], {
      headers: customHeaders,
      temperature: 0.7,
    });
    const parsed = parseJsonObject<{ accounts: unknown[] }>(content);

    return NextResponse.json({
      accounts: parsed.accounts?.length ? parsed.accounts : fallbackAccounts(body),
      source: 'AI推理示例',
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      accounts: fallbackAccounts(body),
      source: 'AI兜底示例',
      fetchedAt: new Date().toISOString(),
    });
  }
}

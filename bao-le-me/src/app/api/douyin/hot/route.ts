import { NextRequest, NextResponse } from 'next/server';
import { forwardHeaders, invokeLLM, parseJsonObject } from '@/lib/llm';
import { buildPromptContext, buildSafetyRules, coercePromptContext, getIndustryPrompt, getRolePrompt } from '@/lib/prompt-presets';

function fallbackTopics(body: Record<string, unknown>) {
  const industry = getIndustryPrompt(String(body.industry || ''));
  const role = getRolePrompt(String(body.role || ''), String(body.occupation || ''));
  const tag = industry.label.split(' ')[0].split('/')[0].replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '') || '行业';
  return industry.contentAngles.slice(0, 5).map((angle, index) => ({
    id: String(index + 1),
    title: `${role.label}今天可拍：${angle}`,
    heat: 76 - index * 3,
    trend: index < 2 ? 'up' : 'stable',
    category: industry.label,
    tags: ['#爆了么选题', `#${tag}`, '#AI推断'],
    source: 'AI兜底（非实时数据）',
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

    const prompt = `你是"爆了么"的抖音热点分析引擎。基于以下信息，返回5个当前行业热点话题。

${buildPromptContext(promptContext)}

行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
角色：${occupation || role || 'boss'}

生成要求：
- 热点必须适合该角色/职业能拍、能承接，不要只给泛娱乐话题；
- 每个 title 要像一个今天能拍的选题，而不是抽象赛道词；
- category 用行业内真实可理解的分类；
- tags 只给话题标签，不给平台数据。

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

注意：
- 你没有实时数据接口，所以 source 必须标注"AI分析（非实时数据）"，isDemo 必须为 true；
- heat 只是 AI 适配评分，不是抖音平台热度、播放量或搜索量；
${buildSafetyRules()}`;

    const content = await invokeLLM([{ role: 'user', content: prompt }], {
      headers: customHeaders,
      temperature: 0.7,
    });
    const parsed = parseJsonObject<{ topics: unknown[] }>(content);

    return NextResponse.json({
      topics: parsed.topics?.length ? parsed.topics : fallbackTopics(body),
      source: 'AI分析（非实时数据）',
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      topics: fallbackTopics(body),
      source: 'AI兜底（非实时数据）',
      fetchedAt: new Date().toISOString(),
    });
  }
}

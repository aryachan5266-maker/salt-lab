import { NextRequest, NextResponse } from 'next/server';
import { forwardHeaders, invokeLLM, parseJsonObject } from '@/lib/llm';
import { buildPromptContext, buildSafetyRules, coercePromptContext, getIndustryPrompt, getRolePrompt } from '@/lib/prompt-presets';

function containsUnsupportedNumbers(value: unknown): boolean {
  if (typeof value === 'string') {
    return /(\d+|[一二三四五六七八九十]+)\s*(%|％|万|千|元|块|天|个月|小时|分钟)/.test(value);
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsUnsupportedNumbers(item));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, item]) => key !== 'crowdedness' && containsUnsupportedNumbers(item));
  }
  return false;
}

function fallbackPositioning(body: Record<string, unknown>) {
  const industry = getIndustryPrompt(String(body.industry || ''));
  const role = getRolePrompt(String(body.role || ''), String(body.occupation || ''));
  const emptySlots = industry.contentAngles.slice(0, 3).map((angle, index) => ({
    angle: `${role.label}卡位：${angle}`,
    evidence: `这个方向能用「${industry.proofAssets[index] || '真实证据'}」证明，不依赖编造数据，也比泛泛宣传更容易建立信任。`,
    audience: typeof body.targetAudience === 'string' ? body.targetAudience : '正在比较选择、需要判断标准的真实客户',
    exampleTitle: `${angle}：先看这一个判断点，再决定要不要买/到店/咨询`,
  }));
  return {
    crowdedness: 64,
    crowdednessLabel: 'AI判断：中等拥挤，有可切入空位',
    source: 'AI兜底（非实时平台数据）',
    emptySlots,
    reasons: [
      `${role.label}的内容要服务于「${role.conversionPath}」，不能只追播放热闹。`,
      `${industry.label}最容易被信任的证据是：${industry.proofAssets.slice(0, 3).join('、')}。`,
      '这些空位都能拍出现场证据和判断标准，适合先做最小闭环。',
    ],
    yourAngle: `用「${industry.contentAngles[0] || '避坑判断'}」切入，结合${role.label}的真实权限和行业证据，先建立可信判断，再引导高意向行动。`,
    riskNotes: industry.riskRules,
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const customHeaders = forwardHeaders(request);
    body = await request.json();
    const { industry, targetAudience, role, occupation, city, storeType, priceRange, differentiator, competitors, contentStrategy, contentFormats, goalType, goalDetail } = body;
    const promptContext = coercePromptContext(body);

    const prompt = `你是"爆了么"的差异化卡位引擎——这是本产品的核心招牌功能。

${buildPromptContext(promptContext)}

## 三步逻辑
1. 测 AI 卡位评分：分析该行业/人群在抖音内容上的竞争激烈程度
2. 找空位：找出尚未被充分覆盖的差异化切入角度
3. 给理由：说明为什么这些空位值得占、凭什么你能占

## 输入信息
行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
角色：${occupation || role || 'boss'}
差异化优势：${differentiator || '待确认'}
竞品：${competitors || '待确认'}
内容策略：${contentStrategy || '待确认'}
内容形式：${Array.isArray(contentFormats) ? contentFormats.join('、') : contentFormats || '待确认'}

## 输出JSON格式（不要markdown代码块）
{
  "positioning": {
    "crowdedness": 75,
    "crowdednessLabel": "AI判断：较高拥挤，但仍有空位",
    "source": "AI推断（非实时平台数据）",
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
- crowdedness 范围0-100，只能作为 AI 卡位评分，不是抖音平台真实热度、搜索量、播放量或竞争指数
- source 必须写"AI推断（非实时平台数据）"
- 至少给出3个空位
- yourAngle 要结合用户的差异化优势给出具体建议
- riskNotes 要诚实指出潜在风险
- 不编造播放量、粉丝数、点赞量、成交率、客群占比等真实世界数字
- 不要泛泛而谈，每个空位都要有具体的切入方向和可执行的标题
${buildSafetyRules()}`;

    const content = await invokeLLM([{ role: 'user', content: prompt }], {
      headers: customHeaders,
      temperature: 0.7,
      timeoutMs: 9000,
    });
    const parsed = parseJsonObject<{ positioning?: unknown }>(content);
    if (!parsed.positioning) {
      return NextResponse.json({ positioning: fallbackPositioning(body) });
    }

    const positioning = {
      ...(parsed.positioning as Record<string, unknown>),
      source: (parsed.positioning as { source?: string }).source || 'AI推断（非实时平台数据）',
    };

    return NextResponse.json({
      positioning: containsUnsupportedNumbers(positioning) ? fallbackPositioning(body) : positioning,
    });
  } catch {
    return NextResponse.json({ positioning: fallbackPositioning(body) });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { forwardHeaders, invokeLLM, parseJsonObject } from '@/lib/llm';
import { buildPromptContext, buildSafetyRules, coercePromptContext, getIndustryPrompt, getRolePrompt } from '@/lib/prompt-presets';
import type { DouyinScript } from '@/lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isScript(value: unknown): value is DouyinScript {
  return (
    isRecord(value) &&
    isRecord(value.hook) &&
    Array.isArray(value.body) &&
    isRecord(value.twist) &&
    isRecord(value.cta) &&
    typeof value.title === 'string'
  );
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function scriptContainsUnsupportedNumbers(script: DouyinScript): boolean {
  const texts = [
    script.title,
    script.hook.visual,
    script.hook.audio,
    script.hook.note,
    ...script.body.flatMap((section) => [section.visual, section.audio, section.note]),
    script.twist.visual,
    script.twist.audio,
    script.twist.note,
    script.cta.visual,
    script.cta.audio,
    script.cta.note,
    script.ttsText,
  ];
  return texts.some((text) => /(\d+|[一二三四五六七八九十]+)\s*(%|％|万|千|元|块|天|个月|小时|分钟)/.test(text));
}

function fallbackScript(topic: string, audience: string, context: Record<string, unknown> = {}): DouyinScript {
  const profile = (context.profile && typeof context.profile === 'object' ? context.profile : {}) as Record<string, unknown>;
  const industry = getIndustryPrompt(String(profile.industry || context.industry || ''));
  const role = getRolePrompt(String(context.role || profile.role || ''), String(context.occupation || profile.occupation || ''));
  const proof = industry.proofAssets[0] || '真实证据';
  const scene = industry.scriptScenes[0] || '真实现场';
  const cta = industry.ctaPattern;

  return {
    title: `${topic}｜给${audience}看的避坑脚本`,
    tags: ['#同城探店', '#避坑', '#真实体验'],
    bgm: '轻节奏口播 BGM',
    hook: {
      seconds: '0-3秒',
      beat: '痛点钩子',
      visual: `镜头对准${scene}，字幕提出一个和${industry.label}相关的具体判断问题。`,
      audio: `如果你正准备看${topic}，先别急着决定，很多人第一步就看错了。`,
      note: '不要喊口号，直接抛出用户正在纠结的问题。',
    },
    body: [
      {
        seconds: '3-12秒',
        beat: '指出误区',
        visual: `展示${proof}，对比一个容易误判的选择场景。`,
        audio: `大多数人会先看价格或热闹程度，但${industry.label}真正影响体验的是是否适合你、证据够不够清楚。`,
        note: '给出判断标准，不要攻击同行。',
      },
      {
        seconds: '12-24秒',
        beat: '给判断方法',
        visual: `用三条字幕列出选择标准，每条配一个${industry.proofAssets[1] || proof}细节。`,
        audio: `你可以看三点：是否说清适用人群，过程是否透明，出了问题怎么处理。${role.label}最该讲清楚的是判断理由，不是空口承诺。`,
        note: '每条都要能拍到画面。',
      },
    ],
    twist: {
      seconds: '24-34秒',
      beat: '认知反转',
      visual: '切到主理人或老板口播，背景是真实工作现场。',
      audio: '所以不是越热门越适合你，而是谁能帮你少踩坑，谁才值得优先考虑。',
      note: '反转要服务信任，不要为了反转而反转。',
    },
    cta: {
      seconds: '34-45秒',
      beat: '行动号召',
      visual: '展示可私信咨询的问题模板或门店入口。',
      audio: cta,
      note: 'CTA 要具体，让用户知道下一步发什么。',
    },
    ttsText: `如果你正准备看${topic}，先别急着决定。很多人第一步就看错了。大多数人会先看价格或热闹程度，但真正影响体验的是是否适合你、证据够不够清楚。你可以看三点：是否说清适用人群，过程是否透明，出了问题怎么处理。所以不是越热门越适合你，而是谁能帮你少踩坑，谁才值得优先考虑。${cta}`,
    coverPrompt: '9:16 竖版封面，深色真实门店背景，主标题 8 字以内，突出“别先下单”，小字补充“先看这三点”。',
    forbiddenCheck: {
      hasForbidden: false,
      forbiddenWords: [],
      suggestion: '未发现明显违禁表达；发布前仍需按平台规则复核。',
    },
  };
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const customHeaders = forwardHeaders(request);
    body = await request.json();
    const profile = (body.profile && typeof body.profile === 'object' ? body.profile : {}) as Record<string, unknown>;
    const targetAudience = profile.targetAudience || body.targetAudience || [];
    const contentFormats = stringList(profile.contentFormats);
    const topic = stringValue(body.topic) || contentFormats[0] || '同城避坑选题';
    const audienceText = Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '目标客户';
    const promptContext = coercePromptContext({
      ...profile,
      ...body,
      targetAudience,
      role: body.role || profile.role,
      occupation: body.occupation || profile.occupation,
    });

    const prompt = `你是"爆了么"的抖音编导脑。请基于真实客户反推结果，生成一条可以直接拍的抖音短视频脚本。

${buildPromptContext(promptContext)}

## 业务输入
行业：${profile.industry || body.industry || '综合'}
城市：${profile.city || body.city || '未提供'}
业态：${profile.storeType || body.storeType || '未提供'}
客单价：${profile.priceRange || body.priceRange || '未知'}
选题方向：${topic}
目标人群：${audienceText}
内容策略：${profile.contentStrategy || body.contentStrategy || '先建立可信场景，再筛选高意向客户'}
内容语气：${profile.tone || body.tone || '直接、真实、有证据感'}
差异化优势：${profile.differentiator || body.differentiator || '待确认'}
角色/职业：${body.occupation || profile.occupation || body.role || 'boss'}

## 要求
- 生成真实可拍的脚本，不要只给抽象建议；
- 每一段必须包含：seconds、beat、visual、audio、note；
- 不编造播放量、成交率、粉丝数、平台热度等数字；
- 口播要像真人能读出来，不要宣传稿腔；
- CTA 要明确告诉用户下一步发什么或点什么；
- 镜头必须使用该行业能拍到的证据和场景；
- 话术必须符合该岗位/职业的权限，不能让运营承诺老板才能改的事，也不能让销售承诺产品没有的结果；
- 输出必须是严格 JSON，不要 markdown。

${buildSafetyRules()}

## 输出结构
{
  "script": {
    "title": "视频标题",
    "tags": ["#标签"],
    "bgm": "BGM建议",
    "hook": { "seconds": "0-3秒", "beat": "", "visual": "", "audio": "", "note": "" },
    "body": [
      { "seconds": "3-12秒", "beat": "", "visual": "", "audio": "", "note": "" },
      { "seconds": "12-24秒", "beat": "", "visual": "", "audio": "", "note": "" }
    ],
    "twist": { "seconds": "24-34秒", "beat": "", "visual": "", "audio": "", "note": "" },
    "cta": { "seconds": "34-45秒", "beat": "", "visual": "", "audio": "", "note": "" },
    "ttsText": "完整口播文本",
    "coverPrompt": "9:16封面提示词",
    "forbiddenCheck": { "hasForbidden": false, "forbiddenWords": [], "suggestion": "" }
  }
}`;

    const content = await invokeLLM([{ role: 'user', content: prompt }], {
      headers: customHeaders,
      temperature: 0.72,
      timeoutMs: 9000,
    });
    const parsed = parseJsonObject<{ script?: DouyinScript } & Partial<DouyinScript>>(content);
    const script = isScript(parsed.script)
      ? parsed.script
      : isScript(parsed)
        ? parsed
        : fallbackScript(String(topic), String(audienceText || '目标客户'), body);
    const isModelScript = isScript(parsed.script) || isScript(parsed);
    const safeScript = scriptContainsUnsupportedNumbers(script)
      ? fallbackScript(String(topic), String(audienceText || '目标客户'), body)
      : script;

    return NextResponse.json({
      script: safeScript,
      source: isModelScript && safeScript === script ? 'AI生成（非实时数据）' : 'AI兜底（非实时数据）',
      isFallback: !isModelScript || safeScript !== script,
    });
  } catch {
    const profile = (body.profile && typeof body.profile === 'object' ? body.profile : {}) as Record<string, unknown>;
    const targetAudience = profile.targetAudience || body.targetAudience || [];
    const contentFormats = stringList(profile.contentFormats);
    const topic = stringValue(body.topic) || contentFormats[0] || '同城避坑选题';
    const audienceText = Array.isArray(targetAudience) ? targetAudience.join('、') : String(targetAudience || '目标客户');
    return NextResponse.json({
      script: fallbackScript(String(topic), audienceText, body),
      source: 'AI兜底（非实时数据）',
      isFallback: true,
    });
  }
}

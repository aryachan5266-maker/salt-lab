import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);
    const body = await request.json();
    const { role, industry, targetAudience, positioning, contentStrategy, tone, differentiator } = body;

    const prompt = `你是"爆了没"的抖音脚本生成引擎。基于以下信息，生成一套完整的抖音三件套：完播率脚本 + 配音文案 + 封面描述。

## 角色与画像
角色：${role || 'boss'}
行业：${industry || '综合'}
目标人群：${Array.isArray(targetAudience) ? targetAudience.join('、') : targetAudience || '综合'}
差异化角度：${positioning || '待确认'}
内容策略：${contentStrategy || '待确认'}
调性：${tone || '专业真诚'}
差异化优势：${differentiator || '待确认'}

## 完播率工程要求
- 黄金3秒钩子前置：开头必须用痛点/悬念/反转抓住注意力
- 每段有beat：每5-8秒设置一个节奏点（画面切换/情绪转折/信息升级）
- 反转节点：中段至少1次认知反转
- 强CTA：结尾明确的行动号召

## 输出JSON格式（不要markdown代码块）
{
  "script": {
    "title": "视频标题",
    "duration": "30-60秒",
    "hook": {
      "text": "黄金3秒钩子文案",
      "visual": "开场画面描述"
    },
    "beats": [
      {
        "time": "0-3秒",
        "type": "hook/beat/reversal/cta",
        "narration": "旁白/口播文案",
        "visual": "画面描述",
        "beatNote": "这个节奏点的作用"
      }
    ],
    "cta": {
      "text": "结尾行动号召文案",
      "visual": "结尾画面描述"
    }
  },
  "voiceover": {
    "fullText": "完整配音文案（口语化，可直接读）",
    "speed": "1.0x",
    "tone": "语气风格"
  },
  "cover": {
    "mainText": "封面主标题（8字以内）",
    "subText": "封面副标题（12字以内）",
    "layout": "封面布局建议",
    "bgStyle": "背景风格建议（9:16竖版）"
  }
}

要求：
- 脚本必须可执行：每个beat有具体的文案+画面，不是抽象建议
- 配音文案口语化，不要书面语
- 封面标题要有冲击力，符合抖音9:16竖版规范
- 全程不编造虚假数据`;

    const messages = [
      { role: 'user' as const, content: prompt },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.7,
    });

    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(response.content);
    } catch {
      // Try extracting JSON from markdown code block
      const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/) ||
                        response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch {
          return NextResponse.json({
            script: { title: '脚本生成完成', hook: { text: response.content.slice(0, 100) }, beats: [], cta: { text: '' } },
            voiceover: { fullText: response.content, speed: '1.0x', tone: '专业' },
            cover: { mainText: '查看详情', subText: '', layout: '居中', bgStyle: '深色' },
            _raw: response.content,
          });
        }
      } else {
        return NextResponse.json({
          script: { title: '脚本生成完成', hook: { text: '' }, beats: [], cta: { text: '' } },
          voiceover: { fullText: response.content, speed: '1.0x', tone: '专业' },
          cover: { mainText: '查看详情', subText: '', layout: '居中', bgStyle: '深色' },
          _raw: response.content,
        });
      }
    }

    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : '脚本生成失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

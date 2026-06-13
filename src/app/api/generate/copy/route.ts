import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const topic = body.topic || '';
  const angle = body.angle || '犀利观点';
  const style = body.style || 'sharp';
  const targetAudience = body.targetAudience || ['女性', '25-35岁', '创业者'];
  const titleLength = body.titleLength || 14;
  const bodyLength = body.bodyLength || 600;

  if (!topic) {
    return NextResponse.json({ ok: false, error: 'topic 必填' }, { status: 400 });
  }

  const styleGuide: Record<string, string> = {
    sharp: '犀利观点型：开头直接抛反常识钩子，1-2句内刺中痛点；段落短而有力；金句密度高；不绕弯。',
    story: '故事叙事型：第一人称，时间线叙事，从低谷/转折/觉醒三段式；情绪铺陈到金句高潮。',
    list: '清单干货型：分点输出，1/2/3 序号清晰；每点先结论后展开；末尾给可执行钩子。',
    contrast: '反差对比型：用"看起来 vs 实际上"结构，先说现象再颠覆；句式对比强烈。',
  };

  const prompt = `你是小红书头部商业认知博主"咸聊AI"（女性，30+，创业者视角，受众=25-40岁女性老板/创业者/高管）。

任务：基于选题生成 A/B 两个版本的小红书笔记文案。

【选题】${topic}
【切入角度】${angle}
【目标受众】${targetAudience.join('、')}
【风格】${styleGuide[style] || styleGuide.sharp}
【约束】标题 ≤ ${titleLength}字；正文 ≈ ${bodyLength}字

【输出要求】严格 JSON 格式：
{
  "A": {
    "titles": ["标题1", "标题2", "标题3"],
    "body": "正文（小红书风格，短段落，强钩子，关键句加 emoji）",
    "tags": ["#话题1", "#话题2", ...5-8个],
    "score": 0-100
  },
  "B": {
    "titles": ["标题1", "标题2", "标题3"],
    "body": "正文（另一种切入）",
    "tags": ["#话题1", "#话题2", ...],
    "score": 0-100
  }
}

只输出 JSON，不要任何额外说明。`;

  try {
    const llm = getLLMClient();
    const res = await llm.invoke(
      [{ role: 'user', content: prompt }],
      { model: DEFAULT_LLM_MODEL, temperature: 0.85 }
    );
    const content = (res as any).content || (res as any).text || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return NextResponse.json({ ok: true, data: parsed, source: 'llm' });
    }
  } catch (e) {
    console.error('llm generate copy failed:', e);
  }

  // 降级
  return NextResponse.json({
    ok: true,
    data: {
      A: {
        titles: [
          `30岁才明白：${topic.slice(0, 8)}的真相比你想的残酷`,
          `为什么我说：${topic.slice(0, 6)} 是个伪命题`,
          `3年踩坑换来的认知：关于${topic.slice(0, 6)}`,
        ],
        body: `很多人对「${topic}」的理解，其实停留在表象。\n\n但做了3年商业后我才看明白——\n\n真相是：表象越光鲜，内核越冷峻。\n\n✅ 关键不是方法论，而是认知差\n✅ 不是努力堆叠，而是选择放弃\n✅ 不是赢得所有人，而是精准筛选\n\n听懂的姐妹评论区扣"懂了"，下篇拆解执行细节。`,
        tags: ['#女性创业', '#商业认知', '#咸聊AI', '#创业干货', '#女性成长'],
        score: 86,
      },
      B: {
        titles: [
          `从月薪5k到年入百万，我是如何重新理解${topic.slice(0, 6)}的`,
          `${topic.slice(0, 8)}背后的3个真相，越早知道越好`,
          `为什么我劝你重新审视"${topic.slice(0, 6)}"这件事`,
        ],
        body: `去年这时候，我还在为${topic}焦虑到失眠。\n\n直到我学会了一件事：\n\n不解释。\n\n🎯 不向不理解你的人解释\n🎯 不为不值得的事消耗\n🎯 不活在别人定义的"应该"里\n\n创业第三年我才学会：\n真正的自由，是不被任何叙事绑架。\n\n收藏这篇，迷茫时翻出来看看。`,
        tags: ['#创业复盘', '#女性力量', '#商业洞察', '#认知升级', '#30+重启'],
        score: 82,
      },
    },
    source: 'fallback',
  });
}

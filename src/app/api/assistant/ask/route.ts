import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  if (!question) {
    return NextResponse.json({ ok: false, error: 'question 必填' }, { status: 400 });
  }

  // 从知识库 + 当前流水线 + 排期 拼上下文
  const kb = Array.from(db.knowledge.values())
    .map((d) => `【${d.title}】${d.content}`)
    .join('\n\n');
  const calendar = Array.from(db.calendar.values())
    .filter((c) => c.status === 'scheduled')
    .map((c) => `- ${c.title} @ ${new Date(c.scheduledAt).toLocaleString('zh-CN')}`)
    .join('\n');
  const topicPool = Array.from(db.topics.values()).slice(0, 10).map((t) => `- ${t.title} (${t.category})`).join('\n');

  const prompt = `你是"咸聊AI"内容中台的 AI 助手小咸。回答用户问题时，要结合以下上下文：

【品牌知识库】
${kb || '（暂无）'}

【即将发布的排期】
${calendar || '（暂无）'}

【当前选题库 TOP10】
${topicPool || '（暂无）'}

【用户问题】${question}

要求：
1. 回答专业、简洁、有信息量（150字以内）
2. 结合上面上下文给出具体可执行建议
3. 风格要贴合"30+女性商业认知博主"的人设：犀利、克制、敢讲真话
4. 不要堆砌套话`;

  try {
    const llm = getLLMClient();
    const res = await llm.invoke(
      [{ role: 'user', content: prompt }],
      { model: DEFAULT_LLM_MODEL, temperature: 0.7 }
    );
    const content = (res as any).content || (res as any).text || '';
    return NextResponse.json({ ok: true, answer: content, source: 'llm' });
  } catch (e) {
    console.error('assistant failed:', e);
    return NextResponse.json({
      ok: true,
      answer: '网络开小差，请稍后再试～',
      source: 'fallback',
    });
  }
}

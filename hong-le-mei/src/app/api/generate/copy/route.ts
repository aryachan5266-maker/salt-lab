// 红了没 · 文案生成 API · 流式 SSE
// POST /api/generate/copy
// 接收角色+输入+标签 → 拼结构化 prompt → 调大模型 → 流式返回 → 存入 Supabase → 扣额度

import { NextRequest } from 'next/server';
import { LLMClient, HeaderUtils } from 'coze-coding-dev-sdk';
import { ROLES, buildUserPrompt, type RoleKey } from '@/lib/roles';
import { saveGeneration, deductCredit, getUserId, getBrandContext } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const role = (body.role || 'operator') as RoleKey;
  const input = body.input || '';
  const gender = body.gender || '';
  const industry = body.industry || '';
  const brandContextFromBody = body.brandContext || '';
  const userId = body.userId || getUserId();

  if (!input.trim()) {
    return new Response(JSON.stringify({ ok: false, error: '请输入你的营销需求' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const roleConfig = ROLES[role];
  if (!roleConfig) {
    return new Response(JSON.stringify({ ok: false, error: '无效角色' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 检查额度 (deductCredit签名: userId, creditsUsed, action)
  const creditCheck = await deductCredit(userId, 1, 'copy');
  if (!creditCheck.success) {
    return new Response(JSON.stringify({
      ok: false,
      error: '额度不足，请升级套餐',
      code: 'INSUFFICIENT_CREDIT',
      remaining: creditCheck.remaining,
    }), {
      status: 402,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 获取品牌上下文（从Supabase品牌资产拼接）
  let brandContext = brandContextFromBody;
  if (!brandContext) {
    try {
      const ctx = await getBrandContext(userId);
      if (ctx) brandContext = ctx;
    } catch {
      // 品牌资产获取失败不影响生成
    }
  }

  const systemPrompt = roleConfig.systemPrompt;
  const userPrompt = buildUserPrompt({ role, input, gender, industry, brandContext });

  // 流式 SSE 响应
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendSSE = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        sendSSE('meta', { role, input, industry, gender, remainingCredits: creditCheck.remaining });

        const customHeaders = HeaderUtils.extractForwardHeaders(req.headers);
        const llm = new LLMClient(undefined, customHeaders);

        const streamIter = await llm.stream(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          { model: 'doubao-seed-2-0-lite-260215', temperature: 0.85 }
        );

        let fullContent = '';

        for await (const chunk of streamIter) {
          const text = chunk.content || chunk.text || '';
          if (text) {
            fullContent += text;
            sendSSE('delta', { text });
          }
        }

        // 尝试解析完整 JSON
        let parsed = null;
        try {
          const match = fullContent.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        } catch {
          // JSON 解析失败，返回原始文本
        }

        const resultData = parsed || {
          titles: [input.slice(0, 20) + '...'],
          body: fullContent,
          tags: ['#红了没', `#${industry || '营销'}`, '#内容创作'],
          platform: '小红书',
          imageSuggestion: '根据文案内容生成封面图',
          marketingLogic: ['AI 生成内容，营销逻辑解析中...'],
        };

        // 存入 Supabase (result 存为 jsonb)
        try {
          await saveGeneration({
            user_id: userId,
            role,
            input,
            gender: gender || null,
            industry: industry || null,
            brand_context: brandContext || null,
            result: resultData as Record<string, unknown>,
            image_url: null,
            image_prompt: resultData.imageSuggestion || null,
            tts_url: null,
            platform: resultData.platform || 'xiaohongshu',
            status: 'completed',
            credits_cost: 1,
            forbidden_check: null,
          });
        } catch (dbErr) {
          console.error('[generate/copy] Save to Supabase failed:', dbErr);
        }

        sendSSE('done', {
          ok: true,
          data: resultData,
          source: parsed ? 'llm' : 'llm-raw',
          remainingCredits: creditCheck.remaining - 1,
        });

        controller.close();
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error('[generate/copy] LLM streaming failed:', errMsg);

        sendSSE('error', { ok: false, error: `生成失败: ${errMsg}` });

        // 降级：返回基于输入的模板内容
        const fallbackData = {
          titles: [
            `${input.slice(0, 15)}，这个真相你必须知道`,
            `为什么我劝你重新思考「${input.slice(0, 10)}」`,
            `${input.slice(0, 12)}背后，藏着3个你不知道的秘密`,
          ],
          body: `很多人对「${input}」的理解，其实停留在表象。\n\n但深入之后才发现——\n\n✅ 第一点：表象越简单，内核越复杂\n✅ 第二点：真正的高手，从来不按套路出牌\n✅ 第三点：差距不在努力，在认知\n\n${industry ? `在${industry}行业尤其如此。` : ''}\n\n听懂的，评论区告诉我你的理解 👇`,
          tags: [
            '#红了没',
            `#${industry || '营销干货'}`,
            '#内容创作',
            '#商业认知',
            `#${input.slice(0, 4)}`,
            '#涨粉攻略',
          ],
          platform: '小红书',
          imageSuggestion: `封面大字图：标题"${input.slice(0, 15)}"，背景渐变色，${industry || '通用'}行业风格`,
          marketingLogic: [
            '钩子：用反常识/悬念引发好奇',
            '转化路径：阅读→共鸣→互动→关注',
            `目标人群：${gender && gender !== '不限' ? gender + '性' : ''}${industry || '创业者'}`,
            '差异化：观点犀利+结构清晰+可执行',
          ],
        };

        try {
          await saveGeneration({
            user_id: userId,
            role,
            input,
            gender: gender || null,
            industry: industry || null,
            brand_context: brandContext || null,
            result: fallbackData as Record<string, unknown>,
            image_url: null,
            image_prompt: fallbackData.imageSuggestion || null,
            tts_url: null,
            platform: 'xiaohongshu',
            status: 'completed',
            credits_cost: 0,
            forbidden_check: null,
          });
        } catch (dbErr) {
          console.error('[generate/copy] Save fallback to Supabase failed:', dbErr);
        }

        sendSSE('done', {
          ok: true,
          data: fallbackData,
          source: 'fallback',
          remainingCredits: creditCheck.remaining - 1,
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

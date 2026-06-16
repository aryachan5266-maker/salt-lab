// 红了么 · 违禁词检测 API（付费钩子版）
// POST /api/check/forbidden { text, userId, generationId? }
// - 检测小红书/抖音违禁词
// - 记录到 Supabase forbidden_checks 表
// - 扣减额度（免费用户每日 3 次，Pro 不限）
// - 返回检测结果 + 剩余额度

import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';
import { getSupabaseServerClient, saveForbiddenCheck, getUserCredits, getUserId } from '@/lib/db-supabase';
import { hasSupabaseCredentials } from '@/storage/database/supabase-client';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 999;

async function getRemainingChecks(userId: string = getUserId()): Promise<{ remaining: number; total: number; isPro: boolean }> {
  try {
    if (!hasSupabaseCredentials()) {
      return { remaining: FREE_DAILY_LIMIT, total: FREE_DAILY_LIMIT, isPro: false };
    }
    const supabase = getSupabaseServerClient();
    const today = new Date().toISOString().slice(0, 10);

    const { count, error } = await supabase
      .from('forbidden_checks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`);

    if (error) throw error;

    // 从 users 表读取 plan 状态
    let isPro = false;
    try {
      const user = await getUserCredits(userId);
      if (user && (user.plan === 'pro' || user.plan === 'enterprise')) {
        isPro = true;
      }
    } catch { /* ignore */ }

    const total = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const used = count || 0;

    return { remaining: Math.max(0, total - used), total, isPro };
  } catch {
    return { remaining: FREE_DAILY_LIMIT, total: FREE_DAILY_LIMIT, isPro: false };
  }
}

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const text = typeof body.text === 'string' ? body.text : '';
  const rawUserId = typeof body.userId === 'string' ? body.userId : '';
  const generationId = typeof body.generationId === 'string' ? body.generationId : null;
  const userId = rawUserId && rawUserId !== 'anonymous' ? rawUserId : getUserId();
  if (!text) {
    return NextResponse.json({ ok: false, error: 'text 必填' }, { status: 400 });
  }

  // 1. 检查额度
  const quota = await getRemainingChecks(userId);
  if (quota.remaining <= 0) {
    return NextResponse.json({
      ok: false,
      error: '今日违禁词检测次数已用完',
      code: 'QUOTA_EXCEEDED',
      quota,
      upgradeHint: '升级 Pro 版，不限次数检测，告别违规限流风险',
    }, { status: 429 });
  }

  // 2. 执行检测
  // hits 统一使用 { word, category, severity, suggestion } 结构
  let hits: Array<{ word: string; category: string; severity: 'high' | 'medium' | 'low'; suggestion: string }> = [];
  let source = 'fallback';

  const prompt = `你是小红书和抖音双平台违禁词检测专家。请扫描以下文本，识别：
1. 极限词（绝对、唯一、第一、最、最佳、顶级、国家级、独家）
2. 高敏词（赚钱、暴富、躺赚、稳赚、保证、必赚）
3. 医疗/功效词（根治、治愈、彻底、永久）
4. 平台违禁（加微信、私信、扫码、引流、互关、关注领）
5. 夸张诱导词（震惊、可怕、恐怖、惊呆）
6. 虚假承诺（100%有效、无效退款、包治）

【文本】
${text}

【输出】严格 JSON：
{
  "hits": [
    {
      "word": "原词",
      "category": "极限词|高敏词|医疗词|平台违禁|夸张诱导|虚假承诺",
      "severity": "high|medium|low",
      "suggestion": "建议替换词"
    }
  ]
}
只输出 JSON。无违禁词则 hits 为空数组。`;

  try {
    const llm = getLLMClient();
    const res = await llm.invoke(
      [{ role: 'user', content: prompt }],
      { model: DEFAULT_LLM_MODEL, temperature: 0.1 }
    );
    const content = ((res as unknown) as Record<string, unknown>).content || ((res as unknown) as Record<string, unknown>).text || '';
    const match = (content as string).match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      hits = (parsed.hits || []).map((h: Record<string, string>) => ({
        word: h.word || '',
        category: h.category || h.reason || '未知',
        severity: (h.severity as 'high' | 'medium' | 'low') || 'medium',
        suggestion: h.suggestion || '',
      }));
      source = 'llm';
    }
  } catch (e) {
    console.info('[forbidden] Using heuristic scan:', e);
  }

  // 降级：启发式扫描
  if (source === 'fallback') {
    const rules = [
      { word: '赚钱', category: '高敏词', severity: 'high' as const, suggestion: '创收/变现' },
      { word: '暴富', category: '高敏词', severity: 'high' as const, suggestion: '财务自由' },
      { word: '绝对', category: '极限词', severity: 'medium' as const, suggestion: '删除' },
      { word: '第一', category: '极限词', severity: 'medium' as const, suggestion: '前列/头部' },
      { word: '最佳', category: '极限词', severity: 'medium' as const, suggestion: '优秀/出色' },
      { word: '顶级', category: '极限词', severity: 'medium' as const, suggestion: '前列/领先' },
      { word: '唯一', category: '极限词', severity: 'medium' as const, suggestion: '少数/稀缺' },
      { word: '保证', category: '高敏词', severity: 'high' as const, suggestion: '大概率/通常' },
      { word: '躺赚', category: '高敏词', severity: 'high' as const, suggestion: '被动收入' },
      { word: '根治', category: '医疗词', severity: 'high' as const, suggestion: '改善' },
      { word: '加微信', category: '平台违禁', severity: 'high' as const, suggestion: '主页简介查看' },
      { word: '私信我', category: '平台违禁', severity: 'high' as const, suggestion: '评论区留言' },
      { word: '扫码', category: '平台违禁', severity: 'high' as const, suggestion: '删除' },
      { word: '震惊', category: '夸张诱导', severity: 'low' as const, suggestion: '删除' },
      { word: '100%', category: '虚假承诺', severity: 'high' as const, suggestion: '大概率' },
    ];
    hits = rules.filter((r) => text.includes(r.word));
  }

  // 3. 记录到 Supabase (使用正确的列名)
  if (hasSupabaseCredentials()) {
    try {
      await saveForbiddenCheck({
        user_id: userId,
        generation_id: generationId || null,
        content: text.slice(0, 2000),
        hits,
        hit_count: hits.length,
        is_premium: quota.isPro,
      });
    } catch (e) {
      console.error('[forbidden] 记录写入失败:', e);
    }
  }

  // 4. 返回结果 + 额度信息
  const newQuota = await getRemainingChecks(userId);

  return NextResponse.json({
    ok: true,
    hits,
    data: { hits },
    source,
    quota: newQuota,
    // 付费钩子：如果接近额度上限，提示升级
    upgradeHint: newQuota.remaining <= 1 && !newQuota.isPro
      ? '今日检测次数即将用完，升级 Pro 版不限次数'
      : undefined,
    pricingHint: {
      free: `每日 ${FREE_DAILY_LIMIT} 次免费`,
      pro: 'Pro 版不限次数 · ¥29/月',
      enterprise: '企业版含批量检测+自动替换 · 联系商务',
    },
  });
}

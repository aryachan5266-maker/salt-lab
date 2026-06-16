// 红了么 · 额度查询 API
// GET /api/credits?userId=xxx

import { NextRequest } from 'next/server';
import { getUserCredits, getCreditLogs, getUserId } from '@/lib/db-supabase';
import { hasSupabaseCredentials } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userIdParam = req.nextUrl.searchParams.get('userId');
  const userId = userIdParam && userIdParam !== 'anonymous' ? userIdParam : getUserId();

  try {
    if (!hasSupabaseCredentials()) {
      return Response.json({
        ok: true,
        id: 'fallback',
        nickname: '小咸',
        role: null,
        industry: null,
        credits_total: 10,
        credits_used: 0,
        total: 10,
        used: 0,
        remaining: 10,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: null,
        source: 'fallback',
      });
    }
    const credits = await getUserCredits(userId);
    return Response.json({ ok: true, ...credits });
  } catch (e) {
    console.error('[credits] Error:', e);
    // 降级返回默认额度
    return Response.json({
      ok: true,
      id: 'fallback',
      nickname: '小咸',
      role: null,
      industry: null,
      credits_total: 10,
      credits_used: 0,
      total: 10,
      used: 0,
      remaining: 10,
      plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: null,
      source: 'fallback',
    });
  }
}

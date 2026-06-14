// 红了没 · 额度查询 API
// GET /api/credits?userId=xxx

import { NextRequest } from 'next/server';
import { getUserCredits, getCreditLogs, getUserId } from '@/lib/db-supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userIdParam = req.nextUrl.searchParams.get('userId');
  const userId = userIdParam && userIdParam !== 'anonymous' ? userIdParam : getUserId();

  try {
    const credits = await getUserCredits(userId);
    return Response.json({ ok: true, ...credits });
  } catch (e) {
    console.error('[credits] Error:', e);
    // 降级返回默认额度
    return Response.json({
      ok: true,
      total: 10,
      used: 0,
      remaining: 10,
      plan: 'free',
      source: 'fallback',
    });
  }
}

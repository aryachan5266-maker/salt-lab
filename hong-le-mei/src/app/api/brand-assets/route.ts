// 红了么 · 品牌资产 CRUD API
// GET  /api/brand-assets?userId=xxx
// POST /api/brand-assets  { userId, category, name, fileUrl, metadata }

import { NextRequest } from 'next/server';
import { getBrandAssets, addBrandAsset, deleteBrandAsset, getUserId } from '@/lib/db-supabase';
import { readJsonObject } from '@/lib/request-json';
import { hasSupabaseCredentials } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || getUserId();

  try {
    const assets = await getBrandAssets(userId);
    return Response.json({ ok: true, assets });
  } catch (e) {
    console.error('[brand-assets GET] Error:', e);
    return Response.json({ ok: true, assets: [], source: 'fallback' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonObject(req);
    if (!body) {
      return Response.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
    }
    const userId = typeof body.userId === 'string' ? body.userId : getUserId();
    const category = typeof body.category === 'string' ? body.category : '';
    const name = typeof body.name === 'string' ? body.name : '';
    const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl : '';
    const metadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? body.metadata as Record<string, unknown>
      : {};

    if (!category || !name) {
      return Response.json({ ok: false, error: 'category 和 name 必填' }, { status: 400 });
    }

    if (!hasSupabaseCredentials()) {
      return Response.json({
        ok: true,
        asset: {
          id: `local_${Date.now()}`,
          user_id: userId,
          category,
          name,
          file_url: fileUrl || null,
          metadata,
          is_pinned: false,
          created_at: new Date().toISOString(),
        },
        source: 'fallback',
        warning: '本地环境未配置品牌资产数据库，已返回临时资产预览',
      });
    }

    const asset = await addBrandAsset({
      user_id: userId,
      category,
      name,
      file_url: fileUrl || null,
      metadata,
      is_pinned: false,
    });

    return Response.json({ ok: true, asset });
  } catch (e) {
    console.error('[brand-assets POST] Error:', e);
    return Response.json({ ok: false, error: '品牌资产保存失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await readJsonObject(req);
    if (!body) {
      return Response.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
    }
    const id = typeof body.id === 'string' ? body.id : '';

    if (!id) {
      return Response.json({ ok: false, error: 'id 必填' }, { status: 400 });
    }

    if (!hasSupabaseCredentials()) {
      return Response.json({ ok: true, source: 'fallback' });
    }

    const ok = await deleteBrandAsset(id);
    return Response.json({ ok });
  } catch (e) {
    console.error('[brand-assets DELETE] Error:', e);
    return Response.json({ ok: false, error: '删除失败' }, { status: 500 });
  }
}

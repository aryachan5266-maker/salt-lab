// 红了没 · 品牌资产 CRUD API
// GET  /api/brand-assets?userId=xxx
// POST /api/brand-assets  { userId, category, name, fileUrl, metadata }

import { NextRequest } from 'next/server';
import { getBrandAssets, addBrandAsset, deleteBrandAsset, getUserId } from '@/lib/db-supabase';

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
    const body = await req.json();
    const userId = body.userId || getUserId();
    const { category, name, fileUrl, metadata = {} } = body;

    if (!category || !name) {
      return Response.json({ ok: false, error: 'category 和 name 必填' }, { status: 400 });
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
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ ok: false, error: 'id 必填' }, { status: 400 });
    }

    const ok = await deleteBrandAsset(id);
    return Response.json({ ok });
  } catch (e) {
    console.error('[brand-assets DELETE] Error:', e);
    return Response.json({ ok: false, error: '删除失败' }, { status: 500 });
  }
}

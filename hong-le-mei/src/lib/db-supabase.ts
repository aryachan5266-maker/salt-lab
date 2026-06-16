/**
 * 红了么 · 数据库服务层
 * 使用 Supabase 真库替代内存库
 * 列名严格匹配 Drizzle schema (src/storage/database/shared/schema.ts)
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

// ============ 服务端 Supabase 客户端 ============

/** 获取 Supabase 服务端客户端（API Route 专用） */
export function getSupabaseServerClient() {
  return getSupabaseClient();
}

// ============ 常量 ============

/** 默认用户 ID（项目暂无登录体系，使用固定 ID） */
export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/** 获取用户 ID（当前为占位实现，接入 Auth 后替换） */
export function getUserId(): string {
  return DEFAULT_USER_ID;
}

// ============ 类型定义 ============

/** 生成记录 — 对应 generations 表 */
export interface Generation {
  id: string;
  user_id: string;
  role: string;
  input: string;
  gender: string | null;
  industry: string | null;
  brand_context: string | null;
  result: Record<string, unknown> | null;
  image_url: string | null;
  image_prompt: string | null;
  tts_url: string | null;
  platform: string;
  status: string;
  credits_cost: number;
  forbidden_check: Record<string, unknown> | null;
  created_at: string;
}

/** 品牌资产 — 对应 brand_assets 表 */
export interface BrandAsset {
  id: string;
  user_id: string;
  category: string;
  name: string;
  file_url: string | null;
  metadata: Record<string, unknown> | null;
  is_pinned: boolean | null;
  created_at: string;
}

/** 违禁词检测 — 对应 forbidden_checks 表 */
export interface ForbiddenCheck {
  id: string;
  user_id: string;
  generation_id: string | null;
  content: string;
  hits: Array<{ word: string; category: string; suggestion: string; severity: string }> | null;
  hit_count: number | null;
  is_premium: boolean | null;
  created_at: string;
}

/** 知识库 — 对应 knowledge_items 表 */
export interface KnowledgeItem {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  tags: unknown[] | null;
  is_pinned: boolean | null;
  ref_count: number | null;
  source: string | null;
  created_at: string;
  updated_at: string | null;
}

/** 额度日志 — 对应 credit_logs 表 */
export interface CreditLog {
  id: string;
  user_id: string;
  action: string;
  credits: number;
  balance_after: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** 用户额度 — 对应 users 表 */
export interface UserCredits {
  id: string;
  nickname: string | null;
  role: string | null;
  industry: string | null;
  credits_total: number;
  credits_used: number;
  plan: string;
  created_at: string;
  updated_at: string | null;
}

// ============ 辅助函数 ============

function getClient() {
  return getSupabaseClient();
}

function handleResult<T>(result: { data: T | null; error: { message: string } | null }, operation: string): T {
  if (result.error) {
    console.error(`[DB] ${operation} error:`, result.error.message);
    throw new Error(`Database ${operation} failed: ${result.error.message}`);
  }
  return result.data as T;
}

// ============ 额度系统 ============

export async function getUserCredits(userId: string = DEFAULT_USER_ID): Promise<UserCredits | null> {
  const client = getClient();
  const result = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (result.error || !result.data) {
    // 用户不存在，创建默认额度
    const createResult = await client
      .from('users')
      .insert({
        id: userId,
        nickname: '小咸',
        role: 'operator',
        credits_total: 50,
        credits_used: 0,
        plan: 'free',
      })
      .select()
      .single();
    
    if (createResult.error) {
      console.error('[DB] create user error:', createResult.error.message);
      // 返回默认额度而非抛出错误，保证功能可用
      return {
        id: '',
        nickname: '小咸',
        role: 'operator',
        industry: null,
        credits_total: 50,
        credits_used: 0,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: null,
      };
    }
    return createResult.data as UserCredits;
  }
  
  return result.data as UserCredits;
}

export async function deductCredit(
  userId: string = DEFAULT_USER_ID,
  creditsUsed: number = 1,
  action: string = 'generate'
): Promise<{ success: boolean; remaining: number }> {
  const client = getClient();
  
  // 先获取当前额度
  const credits = await getUserCredits(userId);
  if (!credits) {
    return { success: false, remaining: 0 };
  }
  
  const remaining = credits.credits_total - credits.credits_used;
  if (remaining < creditsUsed) {
    return { success: false, remaining };
  }
  
  // 扣减额度
  const updateResult = await client
    .from('users')
    .update({ credits_used: credits.credits_used + creditsUsed })
    .eq('id', userId);
  
  if (updateResult.error) {
    console.error('[DB] deduct credit error:', updateResult.error.message);
    return { success: false, remaining };
  }
  
  // 记录日志
  await client.from('credit_logs').insert({
    user_id: userId,
    action,
    credits: creditsUsed,
    balance_after: remaining - creditsUsed,
  });
  
  return { success: true, remaining: remaining - creditsUsed };
}

// ============ 生成记录 ============

export async function saveGeneration(gen: Omit<Generation, 'id' | 'created_at'>): Promise<Generation> {
  const client = getClient();
  const result = await client
    .from('generations')
    .insert({
      user_id: gen.user_id,
      role: gen.role,
      input: gen.input,
      gender: gen.gender,
      industry: gen.industry,
      brand_context: gen.brand_context,
      result: gen.result,
      image_url: gen.image_url,
      image_prompt: gen.image_prompt,
      tts_url: gen.tts_url,
      platform: gen.platform || 'xiaohongshu',
      status: gen.status || 'completed',
      credits_cost: gen.credits_cost ?? 1,
      forbidden_check: gen.forbidden_check,
    })
    .select()
    .single();
  
  return handleResult(result, 'saveGeneration');
}

export async function getGenerations(userId: string = DEFAULT_USER_ID, limit: number = 20): Promise<Generation[]> {
  const client = getClient();
  const result = await client
    .from('generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return handleResult(result, 'getGenerations');
}

export async function getGenerationById(id: string): Promise<Generation | null> {
  const client = getClient();
  const result = await client
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (result.error || !result.data) return null;
  return result.data as Generation;
}

// ============ 品牌资产 ============

export async function getBrandAssets(
  userId: string = DEFAULT_USER_ID,
  category?: string
): Promise<BrandAsset[]> {
  const client = getClient();
  let query = client
    .from('brand_assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const result = await query;
  return handleResult(result, 'getBrandAssets');
}

export async function addBrandAsset(asset: Omit<BrandAsset, 'id' | 'created_at'>): Promise<BrandAsset> {
  const client = getClient();
  const result = await client
    .from('brand_assets')
    .insert({
      user_id: asset.user_id,
      category: asset.category,
      name: asset.name,
      file_url: asset.file_url,
      metadata: asset.metadata,
      is_pinned: asset.is_pinned || false,
    })
    .select()
    .single();
  
  return handleResult(result, 'addBrandAsset');
}

export async function deleteBrandAsset(id: string): Promise<boolean> {
  const client = getClient();
  const result = await client.from('brand_assets').delete().eq('id', id);
  return !result.error;
}

export async function toggleBrandAssetPin(id: string, isPinned: boolean): Promise<boolean> {
  const client = getClient();
  const result = await client
    .from('brand_assets')
    .update({ is_pinned: isPinned })
    .eq('id', id);
  return !result.error;
}

/**
 * 获取品牌上下文：把用户所有品牌资产拼接成一段描述，喂给生成器
 */
export async function getBrandContext(userId: string = DEFAULT_USER_ID): Promise<string> {
  const assets = await getBrandAssets(userId);
  if (assets.length === 0) return '';
  
  const parts: string[] = ['【品牌资产信息】'];
  
  // Logo
  const logos = assets.filter(a => a.category === 'logo');
  if (logos.length > 0) {
    parts.push(`品牌Logo: ${logos.map(l => l.name).join('、')}`);
  }
  
  // 人物照片
  const persons = assets.filter(a => a.category === 'person');
  if (persons.length > 0) {
    parts.push(`人物形象: ${persons.map(p => p.name).join('、')}`);
  }
  
  // 产品图
  const products = assets.filter(a => a.category === 'product');
  if (products.length > 0) {
    parts.push(`产品: ${products.map(p => p.name).join('、')}`);
  }
  
  // 品牌资料
  const docs = assets.filter(a => a.category === 'document');
  if (docs.length > 0) {
    for (const doc of docs) {
      const meta = doc.metadata as Record<string, unknown> | null;
      if (meta?.brandColors) parts.push(`品牌色: ${meta.brandColors as string}`);
      if (meta?.slogan) parts.push(`Slogan: ${meta.slogan as string}`);
      if (meta?.voice) parts.push(`品牌语调: ${meta.voice as string}`);
    }
  }
  
  // 风格参考
  const styles = assets.filter(a => a.category === 'style_ref');
  if (styles.length > 0) {
    parts.push(`风格参考: ${styles.map(s => s.name).join('、')}`);
  }
  
  return parts.join('\n');
}

// ============ 违禁词检测 ============

export async function saveForbiddenCheck(check: Omit<ForbiddenCheck, 'id' | 'created_at'>): Promise<ForbiddenCheck> {
  const client = getClient();
  const result = await client
    .from('forbidden_checks')
    .insert({
      user_id: check.user_id,
      generation_id: check.generation_id,
      content: check.content,
      hits: check.hits,
      hit_count: check.hit_count,
      is_premium: check.is_premium,
    })
    .select()
    .single();
  
  return handleResult(result, 'saveForbiddenCheck');
}

export async function getForbiddenChecks(generationId: string): Promise<ForbiddenCheck[]> {
  const client = getClient();
  const result = await client
    .from('forbidden_checks')
    .select('*')
    .eq('generation_id', generationId)
    .order('created_at', { ascending: false });
  
  return handleResult(result, 'getForbiddenChecks');
}

export async function getForbiddenCheckQuota(userId: string = DEFAULT_USER_ID): Promise<{ remaining: number; total: number; isPro: boolean }> {
  const user = await getUserCredits(userId);
  if (!user) return { remaining: 3, total: 3, isPro: false };
  
  if (user.plan === 'pro' || user.plan === 'enterprise') {
    return { remaining: 999, total: 999, isPro: true };
  }
  
  // Free: 3 checks per day
  const client = getClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await client
    .from('forbidden_checks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())
    .eq('is_premium', false);
  
  const usedToday = result.count ?? 0;
  const total = 3;
  return { remaining: Math.max(0, total - usedToday), total, isPro: false };
}

// ============ 知识库 ============

export async function getKnowledgeItems(
  userId: string = DEFAULT_USER_ID,
  category?: string
): Promise<KnowledgeItem[]> {
  const client = getClient();
  let query = client
    .from('knowledge_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const result = await query;
  return handleResult(result, 'getKnowledgeItems');
}

export async function addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'created_at'>): Promise<KnowledgeItem> {
  const client = getClient();
  const result = await client
    .from('knowledge_items')
    .insert({
      user_id: item.user_id,
      category: item.category,
      title: item.title,
      content: item.content,
      tags: item.tags,
      is_pinned: item.is_pinned || false,
      ref_count: item.ref_count || 0,
      source: item.source,
    })
    .select()
    .single();
  
  return handleResult(result, 'addKnowledgeItem');
}

// ============ 额度日志 ============

export async function getCreditLogs(userId: string = DEFAULT_USER_ID, limit: number = 50): Promise<CreditLog[]> {
  const client = getClient();
  const result = await client
    .from('credit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return handleResult(result, 'getCreditLogs');
}

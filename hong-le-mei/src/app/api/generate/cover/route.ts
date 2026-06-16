import { NextRequest, NextResponse } from 'next/server';
import { getImageClient, DEFAULT_IMAGE_MODEL } from '@/lib/sdk';
import { arrayField, stringField } from '@/lib/sdk-result';
import { readJsonObject } from '@/lib/request-json';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await readJsonObject(req);
  if (!body) {
    return NextResponse.json({ ok: false, error: '请求体格式错误' }, { status: 400 });
  }
  const topic = typeof body.topic === 'string' ? body.topic : '商业认知';
  const style = typeof body.style === 'string' ? body.style : 'sharp'; // sharp/story/list/contrast
  const headline = typeof body.headline === 'string' ? body.headline : '商业认知';
  const countValue = typeof body.count === 'string' || typeof body.count === 'number' ? body.count : '3';
  const count = Math.min(parseInt(String(countValue), 10) || 3, 4);

  // 风格 → 提示词
  const styleMap: Record<string, string> = {
    sharp: '暗红主色 #b2323a 机械工业风 大字标题 人物侧脸 高对比度',
    story: '暖光人像 暗背景 写实 手写体 质感',
    list: '清单式排版 数字大 暗红 冷峻',
    contrast: '反差构图 上下分割 黑红对比 强冲击',
  };
  const baseStyle = styleMap[style] || styleMap.sharp;

  // 构造 3 张候选的差异化 prompt
  const variations = [
    `小红书封面图，3:4竖版，主题"${headline}"，${baseStyle}，文字大且居中，深色背景，机械工业美学，高质感`,
    `小红书封面图，3:4竖版，主题"${headline}"，${baseStyle}，暗底#050607 + 机械红#b2323a，主标题在画面中央偏上，案例感`,
    `小红书封面图，3:4竖版，主题"${headline}"，${baseStyle}，底部加暖金#d4a574装饰条，主体居中，专业商业博主调性`,
  ].slice(0, count);

  const results: Array<{ id: string; url: string; headline: string; matchScore: number; scoreNote: string; recommend: boolean }> = [];

  try {
    const image = getImageClient();
    for (let i = 0; i < count; i++) {
      try {
        const res = await image.generate({
          prompt: variations[i],
          model: DEFAULT_IMAGE_MODEL,
          size: '1024x1280',
        });
        const url =
          stringField(res, 'image_url') ||
          stringField(res, 'url') ||
          stringField(arrayField(res, 'data')[0], 'url') ||
          stringField(arrayField(res, 'images')[0], 'url');
        if (url) {
          results.push({
            id: `cv_${i + 1}_${Date.now()}`,
            url,
            headline,
            matchScore: 0,
            scoreNote: '待接入真实封面表现数据',
            recommend: i === 0,
          });
        }
      } catch (e) {
        console.error(`image generate ${i} failed:`, e);
      }
    }
  } catch (e) {
    console.error('image client failed:', e);
  }

  // 降级：使用 unsplash 商业图片
  if (results.length === 0) {
    const unsplashIds = [
      'photo-1556761175-5973dc0f32e7',
      'photo-1573164713988-8665fc963095',
      'photo-1551836022-d5d88e9218df',
      'photo-1556761175-b413da4baf72',
    ];
    for (let i = 0; i < count; i++) {
      results.push({
        id: `cv_${i + 1}_${Date.now()}`,
        url: `https://images.unsplash.com/${unsplashIds[i % unsplashIds.length]}?w=720&h=900&fit=crop`,
        headline,
        matchScore: 0,
        scoreNote: '待接入真实封面表现数据',
        recommend: i === 0,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    data: results,
    source: results[0]?.url.includes('unsplash') ? 'unsplash-fallback-placeholder' : 'ai-image-placeholder',
    dataDisciplineNote: '封面匹配分未接入真实发布表现，当前不展示确定分数。',
  });
}

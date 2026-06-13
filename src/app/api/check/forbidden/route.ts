import { NextRequest, NextResponse } from 'next/server';
import { getLLMClient, DEFAULT_LLM_MODEL } from '@/lib/sdk';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text) {
    return NextResponse.json({ ok: false, error: 'text 必填' }, { status: 400 });
  }

  const prompt = `你是小红书平台违禁词检测专家。请扫描以下文本，识别：
1. 极限词（绝对、唯一、第一、最、最佳、顶级、国家级、独家）
2. 高敏词（赚钱、暴富、躺赚、稳赚、保证、必赚）
3. 医疗/功效词（根治、治愈、彻底、永久）
4. 平台违禁（加微信、私信、扫码、引流、互关）
5. 夸张诱导词（震惊、可怕、恐怖、惊呆）

【文本】
${text}

【输出】严格 JSON：
{
  "hits": [
    {
      "word": "原词",
      "reason": "类型（极限词/高敏词/...）",
      "severity": "high|medium|low",
      "suggestion": "建议替换词或操作"
    }
  ]
}

只输出 JSON。`;

  try {
    const llm = getLLMClient();
    const res = await llm.invoke(
      [{ role: 'user', content: prompt }],
      { model: DEFAULT_LLM_MODEL, temperature: 0.2 }
    );
    const content = (res as any).content || (res as any).text || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return NextResponse.json({ ok: true, data: parsed, source: 'llm' });
    }
  } catch (e) {
    console.error('forbidden check failed:', e);
  }

  // 降级：启发式扫描
  const rules: Array<{ word: string; reason: string; severity: 'high' | 'medium' | 'low'; suggestion: string }> = [
    { word: '赚钱', reason: '高敏词', severity: 'high', suggestion: '创收/变现' },
    { word: '绝对', reason: '极限词', severity: 'medium', suggestion: '删除' },
    { word: '第一', reason: '极限词', severity: 'medium', suggestion: '前列/头部' },
    { word: '最佳', reason: '极限词', severity: 'medium', suggestion: '优秀/出色' },
    { word: '顶级', reason: '极限词', severity: 'medium', suggestion: '前列/领先' },
    { word: '保证', reason: '高敏词', severity: 'high', suggestion: '大概率/通常' },
    { word: '躺赚', reason: '高敏词', severity: 'high', suggestion: '被动收入' },
    { word: '根治', reason: '医疗词', severity: 'high', suggestion: '改善' },
    { word: '加微信', reason: '平台违禁', severity: 'high', suggestion: '主页简介' },
    { word: '震惊', reason: '夸张诱导', severity: 'low', suggestion: '删除' },
  ];
  const hits = rules
    .filter((r) => text.includes(r.word))
    .map((r, i) => ({ id: `hit_${i}`, ...r, fixed: false, ignored: false }));
  return NextResponse.json({ ok: true, data: { hits }, source: 'fallback' });
}

// ============================================================
// 爆了么 · 真实客户「反推」引擎
// ------------------------------------------------------------
// 核心理念（盐姐定的）：老板只知道他"想宣传给谁"，但他不一定对。
// 谁是真实客户，得数据说了算。所以这里不回显用户自填，而是：
//   1) 用客观事实（行业 + 城市 + 店型 + 客单价）去【反推】真实人群
//   2) 把"老板以为的客户"和"数据显示的客户"做对比，不一致就直说
//
// 红线：拿不到真实数据就如实标注"AI 推断"，绝不编造精确数字。
//
// 两个可替换插槽（"留接口"）：
//   · DATA 插槽  = researchRealAudience()  → 现接扣子数据中台(盐粒粒)，
//                  以后可换巨量算数/第三方真实数据 API
//   · LLM 插槽   = reason()               → 有 DEEPSEEK_API_KEY 时走 DeepSeek，
//                  否则回退 Coze SDK(doubao)
// ============================================================

import { invokeLLM, parseJsonObject } from './llm';
import { buildPromptContext, buildSafetyRules, getBaselineContentFormats } from './prompt-presets';
import { callDataCenter } from './sdk';

export interface ProfileInput {
  industry: string;
  city?: string;        // 新增维度：在什么城市（反推锚点）
  storeType?: string;   // 新增维度：开什么店（反推锚点）
  // 老板自填 = "他以为的客户"
  targetAudience?: string[];
  ageGroup?: string[];
  coreNeed?: string[];
  customerPainPoints?: string[];
  purchaseMotivation?: string[];
  priceRange?: string;
  acquisition?: string[];
  role?: string;
  occupation?: string;
  businessName?: string;
  competitors?: string;
  differentiator?: string;
  goalType?: string;
  goalDetail?: string;
}

export interface ProfileResult {
  contentStrategy: string;
  tone: string;
  priceSensitivity: string;
  contentFormats: string[];
  avoid: string[];
  audienceMatchScore: number; // 0-100：老板的假设 vs 数据反推的吻合度
  audienceAnalysis: string;   // 反推：数据显示的真实客户 + 与老板假设的差距
  operationAdvice: string[];
  riskWarnings: string[];
  dataSource: string;         // 诚实标注：真实数据 or AI 推断
}

const DEFAULTS: ProfileResult = {
  contentStrategy: '',
  tone: '',
  priceSensitivity: '',
  contentFormats: [],
  avoid: [],
  audienceMatchScore: 0,
  audienceAnalysis: '',
  operationAdvice: [],
  riskWarnings: [],
  dataSource: 'AI 推断（未接入实时数据）',
};

function fallbackProfile(input: ProfileInput, reasonLabel: string): ProfileResult {
  const assumedAudience = input.targetAudience?.length ? input.targetAudience.join('、') : '未明确';
  const city = input.city || '未提供城市';
  const storeType = input.storeType || '未提供业态';
  const industry = input.industry || '当前行业';
  const price = input.priceRange || '未知客单价';

  const contentFormats = getBaselineContentFormats(input);

  return {
    contentStrategy: `先围绕「${city}」「${storeType}」「${price}」建立可信场景，再用避坑、对比和真实到店问题筛出高意向客户。`,
    tone: '冷静、直接、有证据感；少用夸张承诺，多用具体场景和判断理由。',
    priceSensitivity: price.includes('高') ? '客户更在意确定性、服务稳定和风险控制，不宜只打低价。' : '客户会比较价格，但更需要先解决信任和选择成本。',
    contentFormats,
    avoid: ['虚构平台数据', '万能爆款模板', '只喊优惠不解释理由', '照抄同行爆款结构'],
    audienceMatchScore: input.city && input.storeType ? 68 : 52,
    audienceAnalysis: `你先假设的客户是「${assumedAudience}」。本地降级反推更倾向先看「${city} + ${storeType} + ${industry}」能真实触达的人：他们未必是最泛的人群，而是有明确场景、能到店/能咨询、正在比较选择的人。由于当前未接入可用模型或实时数据，这里是保守 AI 推断，不代表抖音平台实测结论。`,
    operationAdvice: [
      '第一批内容先拍“客户最容易踩坑的 3 个判断点”，不要直接拍产品清单。',
      '每条视频固定说明适用人群和不适用人群，用筛选逻辑减少低意向咨询。',
      '把竞品对比写成判断框架，不写成攻击同行。',
    ],
    riskWarnings: [
      '当前结果没有实时抖音数据支撑，只能作为本地演示和策略初稿。',
      '不要把吻合度当作客群比例、播放预测或成交预测。',
    ],
    dataSource: `AI 推断（${reasonLabel}）`,
  };
}

// ---------- DATA 插槽：反推真实人群 ----------
// 现：调扣子数据中台(盐粒粒)。以后换真实数据 API 只改这里。
async function researchRealAudience(
  input: ProfileInput
): Promise<{ text: string; source: string }> {
  try {
    if (process.env.COZE_WORKLOAD_API_TOKEN) {
      const where = input.city ? `在「${input.city}」` : '';
      const store = input.storeType ? `、「${input.storeType}」类门店` : '';
      const query =
        `请基于公开数据，分析「${input.industry}」行业${where}${store}的真实消费人群画像：` +
        `主力年龄段、性别倾向、城市层级、消费能力、内容消费偏好、决策习惯。` +
        `客单价区间参考：${input.priceRange || '未知'}。` +
        `只给有公开依据的判断；没有依据的不要编造精确数字，用定性描述。`;
      const text = await callDataCenter(query);
      if (text && text.trim()) {
        return { text: text.trim(), source: '数据中台（盐粒粒）' };
      }
    }
  } catch {
    // 数据中台不可用 → 降级到纯 AI 推断
  }
  return { text: '', source: 'AI 推断（未接入实时数据）' };
}

// ---------- LLM 插槽：推理 ----------
async function reason(
  prompt: string,
  headers: Record<string, string>
): Promise<string> {
  return invokeLLM([{ role: 'user', content: prompt }], { headers, temperature: 0.6 });
}

export async function analyzeProfile(
  input: ProfileInput,
  headers: Record<string, string>
): Promise<ProfileResult> {
  const research = await researchRealAudience(input);

  const assumed = [
    input.targetAudience?.length ? `想触达：${input.targetAudience.join('、')}` : '',
    input.ageGroup?.length ? `认为年龄段：${input.ageGroup.join('、')}` : '',
    input.coreNeed?.length ? `认为核心诉求：${input.coreNeed.join('、')}` : '',
    input.customerPainPoints?.length ? `认为痛点：${input.customerPainPoints.join('、')}` : '',
    input.purchaseMotivation?.length ? `认为下单动机：${input.purchaseMotivation.join('、')}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `你是"爆了么"的【真实客户反推引擎】。核心原则：老板只知道他想宣传给谁，但他的假设不一定对——真实客户得用数据反推。

${buildPromptContext(input)}

## 客观事实（老板确实知道的）
行业：${input.industry || '未知'}
城市：${input.city || '未提供'}
门店类型：${input.storeType || '未提供'}
岗位/职业：${input.occupation || input.role || '未提供'}
客单价：${input.priceRange || '未知'}
获客来源：${input.acquisition?.join('、') || '未知'}
目标/差异化：${input.goalDetail || input.differentiator || '未提供'}

## 老板自己的假设（"他以为的客户"）
${assumed || '（老板未明确）'}

## 数据反推参考
${research.text || '（暂无实时数据，请基于行业常识谨慎推断，并在 audienceAnalysis 里明确说明这是推断、非实测数据）'}

## 你的任务
1. 反推「数据显示的真实客户」是谁；
2. 和老板的假设做对比，给吻合度 audienceMatchScore（0-100），并在 audienceAnalysis 里**直说差距**——如果老板想错了人群，明确指出"你以为是X，但更可能是Y，因为…"；
3. 基于真实客户给：内容策略、语气、价格敏感度、适合的内容形式、要避开的雷区；
4. 给可执行的运营建议；
5. 诚实的风险提示。

${buildSafetyRules()}
- 没有数据支撑的判断，要在 audienceAnalysis 里标明是推断。

## 只输出 JSON（不要 markdown 代码块）
{
  "contentStrategy": "一句话内容策略",
  "tone": "内容语气",
  "priceSensitivity": "价格敏感度判断",
  "contentFormats": ["适合的内容形式1","形式2"],
  "avoid": ["要避开的雷区1","雷区2"],
  "audienceMatchScore": 0,
  "audienceAnalysis": "数据反推的真实客户 + 与老板假设的差距（不一致就直说）",
  "operationAdvice": ["运营建议1","建议2"],
  "riskWarnings": ["风险1","风险2"]
}`;

  let raw = '';
  try {
    raw = await reason(prompt, headers);
  } catch (e) {
    const message = e instanceof Error ? e.message : '本地模型不可用';
    return fallbackProfile(input, message.includes('Missing credentials') ? '本地无模型凭证' : message);
  }
  const parsed = parseJsonObject<ProfileResult>(raw);

  return { ...DEFAULTS, ...parsed, dataSource: research.source };
}

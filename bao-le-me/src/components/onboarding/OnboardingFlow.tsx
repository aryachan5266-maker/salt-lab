'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Check,
  Database,
  Loader2,
  MapPin,
  Radar,
  Sparkles,
  Target,
  Triangle,
} from 'lucide-react';
import { NACLLogo } from '@/components/nacl-logo';
import { useApp } from '@/lib/store';
import type { AnalyzeProfileResponse, BrandAssets, RoleKey } from '@/lib/types';
import { getAllRoles } from '@/lib/roles';

interface Question {
  id: 'industry' | 'city' | 'storeType' | 'targetAudience' | 'ageGroup' | 'coreNeed' | 'customerPainPoints' | 'purchaseMotivation' | 'priceRange' | 'acquisition';
  title: string;
  subtitle: string;
  multiSelect: boolean;
  options: { label: string; value: string }[];
  hasCustom?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'industry',
    title: '你做什么赛道？',
    subtitle: '先确定竞争盘面，再判断你该避开谁、切进哪里。',
    multiSelect: false,
    options: [
      { label: '餐饮 / 咖啡 / 烘焙', value: '餐饮' },
      { label: '美业 / 美发 / 美甲', value: '美业' },
      { label: '服装 / 时尚 / 配饰', value: '服装' },
      { label: '教育培训 / 知识付费', value: '教育' },
      { label: '汽车 / 出行 / 租赁', value: '汽车' },
      { label: '房产 / 家居 / 装修', value: '房产' },
      { label: '健身 / 运动 / 康复', value: '健身' },
      { label: '电商 / 直播带货', value: '电商' },
      { label: '本地生活 / 休闲', value: '本地生活' },
      { label: 'B2B / 企业服务', value: 'B2B' },
    ],
    hasCustom: true,
  },
  {
    id: 'city',
    title: '你在哪个城市？',
    subtitle: '城市决定真实消费半径。抖音本地获客不能只看行业。',
    multiSelect: false,
    options: [
      { label: '一线城市', value: '一线城市' },
      { label: '新一线城市', value: '新一线城市' },
      { label: '二线城市', value: '二线城市' },
      { label: '三四线城市', value: '三四线城市' },
      { label: '县城 / 区县', value: '县城 / 区县' },
      { label: '线上为主，不限城市', value: '线上为主' },
    ],
    hasCustom: true,
  },
  {
    id: 'storeType',
    title: '你开什么店 / 什么业态？',
    subtitle: '业态是客观锚点。它会校正你以为的客户和真实会买的人。',
    multiSelect: false,
    options: [
      { label: '临街门店', value: '临街门店' },
      { label: '商场店', value: '商场店' },
      { label: '工作室 / 预约制', value: '工作室 / 预约制' },
      { label: '社区店', value: '社区店' },
      { label: '到家 / 上门服务', value: '到家 / 上门服务' },
      { label: '线上店 / 直播间', value: '线上店 / 直播间' },
      { label: '企业服务团队', value: '企业服务团队' },
    ],
    hasCustom: true,
  },
  {
    id: 'targetAudience',
    title: '先猜一下：你以为谁会买？',
    subtitle: '这不是最终答案。爆了么会用城市、业态、客单价和数据反推来验证或纠正。',
    multiSelect: true,
    options: [
      { label: '25-35 岁城市白领', value: '25-35岁城市白领' },
      { label: '18-24 岁大学生', value: '18-24岁大学生' },
      { label: '宝妈群体', value: '宝妈群体' },
      { label: '小镇青年', value: '小镇青年' },
      { label: '35-50 岁中年人群', value: '35-50岁中年人群' },
      { label: '银发族', value: '银发族' },
      { label: 'Z 世代潮人', value: 'Z世代潮人' },
      { label: '创业者 / 老板', value: '创业者/老板' },
      { label: '高净值人群', value: '高净值人群' },
    ],
    hasCustom: true,
  },
  {
    id: 'ageGroup',
    title: '你当前判断的年龄段？',
    subtitle: '先保留你的判断，结果页会显示它和数据反推之间的差距。',
    multiSelect: true,
    options: [
      { label: '18 岁以下', value: '18岁以下' },
      { label: '18-24 岁', value: '18-24岁' },
      { label: '25-30 岁', value: '25-30岁' },
      { label: '31-35 岁', value: '31-35岁' },
      { label: '36-45 岁', value: '36-45岁' },
      { label: '46 岁以上', value: '46岁以上' },
    ],
  },
  {
    id: 'coreNeed',
    title: '你猜他们最想要什么？',
    subtitle: '我们会验证这个诉求是不是内容里真正该打的点。',
    multiSelect: true,
    options: [
      { label: '省钱 / 性价比', value: '省钱/性价比' },
      { label: '品质 / 面子', value: '追求品质/面子' },
      { label: '解决具体问题', value: '解决具体问题' },
      { label: '学习 / 自我提升', value: '学习/自我提升' },
      { label: '消遣 / 娱乐', value: '消遣/娱乐' },
      { label: '社交 / 归属感', value: '社交/归属感' },
      { label: '身份认同 / 圈层', value: '身份认同/圈层' },
      { label: '安全 / 保障', value: '安全/保障' },
    ],
  },
  {
    id: 'customerPainPoints',
    title: '他们最头疼什么？',
    subtitle: '痛点会变成脚本里的冲突、反转和前三秒拦截点。',
    multiSelect: true,
    options: [
      { label: '选择太多不知道选哪个', value: '选择困难' },
      { label: '怕踩坑 / 被坑过', value: '怕踩坑' },
      { label: '价格不透明', value: '价格不透明' },
      { label: '没时间研究', value: '没时间研究' },
      { label: '不知道怎么开始', value: '不知道怎么开始' },
      { label: '现有方案不满意', value: '现有方案不满意' },
      { label: '信息太杂不知道信谁', value: '信息焦虑' },
    ],
  },
  {
    id: 'purchaseMotivation',
    title: '什么时刻他们会下单？',
    subtitle: '抖音内容不是热闹，它必须把人推到一个可行动的节点。',
    multiSelect: true,
    options: [
      { label: '看到别人用得好', value: '看到别人用得好' },
      { label: '限时优惠 / 稀缺感', value: '限时优惠/稀缺感' },
      { label: '解决了具体问题', value: '解决了具体问题' },
      { label: '朋友推荐 / 口碑', value: '朋友推荐/口碑' },
      { label: '品牌信任感', value: '品牌信任感' },
      { label: '冲动 / 情绪驱动', value: '冲动/情绪驱动' },
      { label: '对比后觉得值', value: '对比后觉得值' },
    ],
  },
  {
    id: 'priceRange',
    title: '客单价大概在哪个区间？',
    subtitle: '客单价会改变信任成本。低价拼节奏，高价拼证据。',
    multiSelect: false,
    options: [
      { label: '50 元以下', value: '低价' },
      { label: '50-200 元', value: '中低价' },
      { label: '200-1000 元', value: '中价' },
      { label: '1000-5000 元', value: '中高价' },
      { label: '5000 元以上', value: '高价' },
    ],
  },
  {
    id: 'acquisition',
    title: '现在客户主要怎么来？',
    subtitle: '获客来源会影响内容任务：找新客、筛选客、还是做信任。',
    multiSelect: true,
    options: [
      { label: '自然流量 / 搜索', value: '自然流量' },
      { label: '付费投放', value: '付费投放' },
      { label: '老客推荐 / 口碑', value: '老客推荐' },
      { label: '线下引流', value: '线下引流' },
      { label: '私域 / 社群', value: '私域/社群' },
      { label: '还没什么客户', value: '冷启动' },
    ],
  },
];

const BUSINESS_FIELDS = [
  { id: 'businessName', label: '店名 / 品牌名', type: 'text' as const, placeholder: '例如：芒小果精品咖啡' },
  { id: 'occupation', label: '具体岗位 / 职业', type: 'text' as const, placeholder: '例如：咖啡店主理人、房产销售、健身教练、课程顾问' },
  { id: 'competitors', label: '你认为的竞品', type: 'text' as const, placeholder: '例如：瑞幸、Manner、本地同街区门店' },
  { id: 'differentiator', label: '你和别人不同在哪里', type: 'text' as const, placeholder: '例如：只做云南本地烘焙、预约制服务更稳定' },
  { id: 'platform', label: '现在在哪些平台做内容', type: 'multi-select' as const, options: ['抖音', '小红书', '视频号', 'B站', '还没开始'] },
  { id: 'postingFrequency', label: '能多久发一条', type: 'select' as const, options: ['每天', '每周3-4条', '每周1-2条', '每月几条', '还没开始'] },
  { id: 'teamSize', label: '运营团队几个人', type: 'select' as const, options: ['就我自己', '2-3人', '4-10人', '10人以上'] },
  { id: 'goalType', label: '现阶段最重要的目标', type: 'select' as const, options: ['涨粉', '获客/到店', '品牌认知', '卖货/转化', '建立专业形象'] },
  { id: 'goalDetail', label: '一句话说说你想达成的效果', type: 'text' as const, placeholder: '例如：一个月内吸引更多本地高意向客户到店' },
];

type Phase = 'intro' | 'questions' | 'business' | 'analyzing' | 'result';
type BusinessField = typeof BUSINESS_FIELDS[number];

const baseInputClass = 'w-full rounded-[8px] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white placeholder-white/24 outline-none transition focus:border-[var(--color-accent)]/60 focus:bg-white/[0.055]';

function cleanValues(values: string[] | undefined): string[] {
  return (values || []).map((value) => value.startsWith('__custom__') ? value.replace('__custom__', '') : value).filter(Boolean);
}

function firstValue(values: string[] | undefined): string {
  return cleanValues(values)[0] || '';
}

export default function OnboardingFlow() {
  const { setBrandAssets } = useApp();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [businessAnswers, setBusinessAnswers] = useState<Record<string, string>>({
    role: 'boss',
    platform: '抖音',
    postingFrequency: '每周1-2条',
    teamSize: '就我自己',
    goalType: '获客/到店',
  });
  const [aiResult, setAiResult] = useState<AnalyzeProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleOption = (qId: string, value: string, multi: boolean) => {
    setAnswers((prev) => {
      const current = prev[qId] || [];
      if (multi) {
        return { ...prev, [qId]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
      }
      return { ...prev, [qId]: [value] };
    });
  };

  const setCustomAnswer = (qId: string, value: string, multi: boolean) => {
    setCustomInputs((prev) => ({ ...prev, [qId]: value }));
    setAnswers((prev) => {
      const existing = (prev[qId] || []).filter((v) => !v.startsWith('__custom__'));
      if (!value.trim()) return { ...prev, [qId]: existing };
      return { ...prev, [qId]: multi ? [...existing, `__custom__${value.trim()}`] : [`__custom__${value.trim()}`] };
    });
  };

  const buildPayload = () => ({
    industry: firstValue(answers.industry),
    city: firstValue(answers.city),
    storeType: firstValue(answers.storeType),
    targetAudience: cleanValues(answers.targetAudience),
    ageGroup: cleanValues(answers.ageGroup),
    coreNeed: cleanValues(answers.coreNeed),
    customerPainPoints: cleanValues(answers.customerPainPoints),
    purchaseMotivation: cleanValues(answers.purchaseMotivation),
    priceRange: firstValue(answers.priceRange),
    acquisition: cleanValues(answers.acquisition),
    role: businessAnswers.role || 'boss',
    occupation: businessAnswers.occupation || '',
    businessName: businessAnswers.businessName || '',
    competitors: businessAnswers.competitors || '',
    differentiator: businessAnswers.differentiator || '',
    platform: businessAnswers.platform || '抖音',
    postingFrequency: businessAnswers.postingFrequency || '',
    teamSize: businessAnswers.teamSize || '',
    goalType: businessAnswers.goalType || '',
    goalDetail: businessAnswers.goalDetail || '',
  });

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setPhase('analyzing');
    try {
      const payload = buildPayload();
      const res = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('反推失败，请稍后重试');
      const data = await res.json() as AnalyzeProfileResponse;
      setAiResult(data);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : '反推失败');
      setPhase('business');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((value) => value + 1);
      return;
    }
    setPhase('business');
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ((value) => value - 1);
      return;
    }
    setPhase('intro');
  };

  const handleConfirm = () => {
    if (!aiResult) return;
    const payload = buildPayload();
    const fullAssets: BrandAssets = {
      brandName: payload.businessName,
      businessName: payload.businessName,
      industry: payload.industry,
      city: payload.city,
      storeType: payload.storeType,
      targetAudience: payload.targetAudience,
      ageGroup: payload.ageGroup,
      coreNeed: payload.coreNeed,
      customerPainPoints: payload.customerPainPoints,
      purchaseMotivation: payload.purchaseMotivation,
      priceRange: payload.priceRange,
      acquisition: payload.acquisition,
      contentExperience: '',
      postingFrequency: payload.postingFrequency,
      teamSize: payload.teamSize,
      competitors: payload.competitors,
      differentiator: payload.differentiator,
      platform: payload.platform.split(',').filter(Boolean),
      goalType: payload.goalType,
      goalDetail: payload.goalDetail,
      role: (payload.role || 'boss') as RoleKey,
      occupation: payload.occupation,
      contentStrategy: aiResult.contentStrategy,
      tone: aiResult.tone,
      priceSensitivity: aiResult.priceSensitivity,
      contentFormats: aiResult.contentFormats || [],
      avoid: aiResult.avoid || [],
      audienceMatchScore: aiResult.audienceMatchScore || 0,
      audienceAnalysis: aiResult.audienceAnalysis || '',
      operationAdvice: aiResult.operationAdvice || [],
      riskWarnings: aiResult.riskWarnings || [],
      dataSource: aiResult.dataSource || 'AI 推断（未接入实时数据）',
    };
    setBrandAssets(fullAssets);
  };

  if (phase === 'intro') {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--color-bg)] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(99,230,255,0.16),transparent_32%),radial-gradient(circle_at_82%_26%,rgba(255,255,255,0.08),transparent_25%)]" />
        <div className="pointer-events-none absolute inset-0 nacl-grid opacity-20" />
        <main className="relative mx-auto grid min-h-[100dvh] w-full max-w-[1220px] items-center gap-8 px-5 py-8 sm:px-8 md:grid-cols-[0.96fr_1.04fr] lg:px-10">
          <section className="rounded-[18px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-7 md:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <NACLLogo size="sm" className="w-[124px] shrink-0" />
              <p className="rounded-[7px] border border-white/10 bg-white/[0.035] px-3 py-1.5 text-sm font-semibold text-white/72">
                爆了么
              </p>
            </div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-[7px] border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[var(--color-accent)]">
              <Triangle size={13} />
              真实客户反推
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-normal text-white text-balance sm:text-5xl">
              先测客户，再写抖音脚本。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
              你先猜谁会买，系统用城市、业态、客单价和数据逻辑纠偏。最后给你“该拍给谁、该拍什么、别怎么拍”。
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ['01', '先猜', '保留你的判断'],
                ['02', '纠偏', '指出客户差距'],
                ['03', '开拍', '进入脚本工作台'],
              ].map(([step, title, desc]) => (
                <div key={step} className="rounded-[12px] border border-white/10 bg-black/20 p-4">
                  <p className="text-[var(--color-accent)] text-xs tracking-[0.28em]">{step}</p>
                  <p className="mt-3 text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-xs text-white/36">{desc}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPhase('questions')}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--color-accent)] px-6 py-4 text-sm font-bold text-black transition hover:bg-white active:translate-y-px sm:w-auto"
            >
              开始 30 秒测客户
              <Radar size={17} />
            </button>
            <p className="mt-3 text-xs text-white/34">10 道选择题 + 业务锚点。没有真实来源时会明确标注 AI 推断。</p>
          </section>

          <aside className="rounded-[18px] border border-white/10 bg-black/22 p-5 md:p-7">
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-white/36">这一步会产出什么</p>
            <h2 className="mb-6 text-2xl font-bold text-white">不是画像报告，是开拍前的判断依据。</h2>
            <div className="space-y-3">
              {[
                { icon: MapPin, title: '城市和消费半径', desc: '判断内容该做同城获客，还是泛流量筛选。' },
                { icon: Building2, title: '门店和业态', desc: '同一行业，不同店型的脚本任务完全不同。' },
                { icon: Target, title: '你以为 vs 更可能', desc: '结果页会直接说差距，不顺着答案夸。' },
                { icon: Sparkles, title: '进入工作台', desc: '反推后解锁热点、卡位、脚本这条主线。' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-[12px] border border-white/8 bg-white/[0.025] p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-white/10 bg-white/[0.04] text-[var(--color-accent)]">
                    <item.icon size={17} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-white/46">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>
      </div>
    );
  }

  if (phase === 'questions') {
    const q = QUESTIONS[currentQ];
    const selected = answers[q.id] || [];
    const progress = (currentQ + 1) / QUESTIONS.length;

    return (
      <div className="min-h-screen bg-[var(--color-bg)] px-4 py-5 text-white md:px-8 md:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-5xl flex-col">
          <header className="mb-8 flex items-center justify-between">
            <button onClick={handlePrev} className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white">
              <ArrowLeft size={16} />
              返回
            </button>
            <span className="text-xs tracking-[0.32em] text-white/32">{currentQ + 1} / {QUESTIONS.length}</span>
          </header>

          <div className="mb-10 h-1 w-full rounded-full bg-white/8">
            <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>

          <section className="grid flex-1 gap-8 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="nacl-kicker mb-4">AUDIENCE HYPOTHESIS</p>
              <h1 className="text-3xl font-semibold leading-tight tracking-[0.08em] text-white md:text-5xl">{q.title}</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/54">{q.subtitle}</p>
              {q.multiSelect && <p className="mt-4 text-xs tracking-[0.22em] text-[var(--color-accent)]">MULTI SELECT</p>}
            </div>

            <div className="content-start">
              <div className="grid gap-3 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleOption(q.id, opt.value, q.multiSelect)}
                      className={`flex min-h-[56px] items-center justify-between rounded-[8px] border px-4 py-3 text-left text-sm transition ${
                        isSelected
                          ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 text-white'
                          : 'border-white/10 bg-white/[0.025] text-white/58 hover:border-white/20 hover:bg-white/[0.045]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={16} className="text-[var(--color-accent)]" />}
                    </button>
                  );
                })}
              </div>
              {q.hasCustom && (
                <input
                  type="text"
                  placeholder="填一个更准确的答案"
                  value={customInputs[q.id] || ''}
                  onChange={(e) => setCustomAnswer(q.id, e.target.value, q.multiSelect)}
                  className={`${baseInputClass} mt-4`}
                />
              )}
            </div>
          </section>

          <footer className="mt-10 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selected.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-6 py-4 text-sm font-bold tracking-[0.18em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
            >
              {currentQ < QUESTIONS.length - 1 ? '下一步' : '补充业务锚点'}
            </button>
          </footer>
        </div>
      </div>
    );
  }

  if (phase === 'business') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] px-4 py-5 text-white md:px-8 md:py-8">
        <div className="mx-auto grid min-h-[calc(100vh-40px)] w-full max-w-6xl gap-8 md:grid-cols-[0.72fr_1.28fr]">
          <aside className="flex flex-col justify-between">
            <div>
              <button onClick={() => setPhase('questions')} className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white">
                <ArrowLeft size={16} />
                返回测题
              </button>
              <p className="nacl-kicker mb-4">BUSINESS ANCHORS</p>
              <h1 className="text-3xl font-semibold leading-tight tracking-[0.08em] md:text-5xl">补充业务锚点</h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/54">
                这部分不是包装品牌，而是给反推引擎提供现实约束：谁能到店、谁会决策、谁值得拍。
              </p>
            </div>
            <div className="mt-8 rounded-[8px] border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/8 p-4 text-sm leading-6 text-white/62">
              城市：{firstValue(answers.city) || '未填写'}<br />
              业态：{firstValue(answers.storeType) || '未填写'}<br />
              赛道：{firstValue(answers.industry) || '未填写'}
            </div>
          </aside>

          <section className="nacl-card p-4 md:p-6">
            <div className="mb-5">
              <label className="mb-2 block text-xs tracking-[0.22em] text-white/45">你的身份</label>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {getAllRoles().map((role) => (
                  <button
                    key={role.key}
                    onClick={() => setBusinessAnswers((prev) => ({ ...prev, role: role.key }))}
                    className={`rounded-[8px] border px-3 py-2.5 text-xs transition ${
                      businessAnswers.role === role.key
                        ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 text-white'
                        : 'border-white/10 bg-white/[0.025] text-white/52 hover:border-white/20'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {BUSINESS_FIELDS.map((field: BusinessField) => (
                <div key={field.id} className={field.id === 'goalDetail' || field.id === 'differentiator' ? 'md:col-span-2' : ''}>
                  <label className="mb-1.5 block text-xs tracking-[0.18em] text-white/42">{field.label}</label>
                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={businessAnswers[field.id] || ''}
                      onChange={(e) => setBusinessAnswers((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      className={baseInputClass}
                    />
                  )}
                  {field.type === 'select' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setBusinessAnswers((prev) => ({ ...prev, [field.id]: opt }))}
                          className={`rounded-[8px] border px-3 py-2 text-xs transition ${
                            businessAnswers[field.id] === opt
                              ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 text-white'
                              : 'border-white/10 bg-white/[0.025] text-white/46 hover:border-white/20'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {field.type === 'multi-select' && (
                    <div className="flex flex-wrap gap-2">
                      {field.options.map((opt) => {
                        const selected = (businessAnswers[field.id] || '').split(',').includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => {
                              const current = (businessAnswers[field.id] || '').split(',').filter(Boolean);
                              const next = selected ? current.filter((value) => value !== opt) : [...current, opt];
                              setBusinessAnswers((prev) => ({ ...prev, [field.id]: next.join(',') }));
                            }}
                            className={`rounded-[8px] border px-3 py-2 text-xs transition ${
                              selected
                                ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 text-white'
                                : 'border-white/10 bg-white/[0.025] text-white/46 hover:border-white/20'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-6 py-4 text-sm font-bold tracking-[0.18em] text-black transition hover:bg-white disabled:opacity-50"
              >
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Database size={17} />}
                反推真实客户
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (phase === 'analyzing') {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-[8px] border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/10">
            <Loader2 className="animate-spin text-[var(--color-accent)]" size={24} />
          </div>
          <p className="nacl-kicker mb-3">RUNNING REVERSE ENGINE</p>
          <p className="text-sm text-white/56">正在用城市、业态和你的假设反推真实客户...</p>
        </div>
      </div>
    );
  }

  if (phase === 'result' && aiResult) {
    const score = Math.max(0, Math.min(100, aiResult.audienceMatchScore || 0));

    return (
      <div className="min-h-screen bg-[var(--color-bg)] px-4 py-5 text-white md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <header className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="nacl-kicker mb-3">REAL AUDIENCE RESULT</p>
              <h1 className="text-3xl font-semibold tracking-[0.08em] md:text-5xl">真实客户反推完成</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/54">
                下面不是复述你的答案，而是把你的猜测和数据反推放在一起看。差距越明显，越说明内容策略要换。
              </p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-white/[0.025] px-4 py-3 text-xs leading-6 text-white/46">
              数据来源：<span className="text-white/76">{aiResult.dataSource || 'AI 推断（未接入实时数据）'}</span>
            </div>
          </header>

          <section className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="nacl-card p-5 md:p-6">
              <p className="mb-3 text-xs tracking-[0.26em] text-white/42">吻合度</p>
              <div className="flex items-end gap-2">
                <span className="text-7xl font-semibold tabular-nums text-[var(--color-accent)]">{score}</span>
                <span className="pb-3 text-sm tracking-[0.18em] text-white/40">/100</span>
              </div>
              <div className="mt-6 h-2 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700" style={{ width: `${score}%` }} />
              </div>
              <p className="mt-5 text-sm leading-7 text-white/52">
                这个分数表示“你以为的客户”和“数据反推客户”的吻合度。它不是平台真实占比，不作为播放量或成交预测。
              </p>
            </div>

            <div className="nacl-card p-5 md:p-6">
              <div className="mb-4 flex items-center gap-2 text-[var(--color-accent)]">
                <Target size={18} />
                <h2 className="text-sm font-semibold tracking-[0.18em]">你以为 vs 数据差距</h2>
              </div>
              <p className="text-base leading-8 text-white/76">{aiResult.audienceAnalysis}</p>
            </div>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-3">
            <ResultCard title="内容策略" body={aiResult.contentStrategy} />
            <ResultCard title="内容语气" body={aiResult.tone} />
            <ResultCard title="价格敏感度" body={aiResult.priceSensitivity} />
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <ListCard title="推荐内容形式" items={aiResult.contentFormats} icon={<Sparkles size={17} />} />
            <ListCard title="运营动作" items={aiResult.operationAdvice} icon={<Check size={17} />} />
            <ListCard title="不要这样拍" items={aiResult.avoid} icon={<AlertTriangle size={17} />} />
            <ListCard title="风险预警" items={aiResult.riskWarnings} icon={<AlertTriangle size={17} />} tone="risk" />
          </section>

          <footer className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleConfirm}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-6 py-4 text-sm font-bold tracking-[0.18em] text-black transition hover:bg-white"
            >
              确认，进入爆了么
            </button>
            <button
              onClick={() => setPhase('intro')}
              className="rounded-[8px] border border-white/10 px-6 py-4 text-sm tracking-[0.14em] text-white/48 transition hover:border-white/25 hover:text-white"
            >
              重新反推
            </button>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}

function ResultCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="nacl-card p-5">
      <h2 className="mb-3 text-xs tracking-[0.24em] text-white/42">{title}</h2>
      <p className="text-sm leading-7 text-white/68">{body || '暂无'}</p>
    </div>
  );
}

function ListCard({ title, items, icon, tone }: { title: string; items: string[]; icon: ReactNode; tone?: 'risk' }) {
  return (
    <div className={`rounded-[8px] border p-5 ${
      tone === 'risk'
        ? 'border-red-400/20 bg-red-500/[0.055]'
        : 'border-white/10 bg-white/[0.025]'
    }`}>
      <div className={`mb-4 flex items-center gap-2 ${tone === 'risk' ? 'text-red-300' : 'text-[var(--color-accent)]'}`}>
        {icon}
        <h2 className="text-xs font-semibold tracking-[0.22em]">{title}</h2>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-6 text-white/64">
              <span className={tone === 'risk' ? 'text-red-300' : 'text-[var(--color-accent)]'}>—</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/32">暂无</p>
      )}
    </div>
  );
}

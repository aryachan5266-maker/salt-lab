'use client';

import type { BrandAssets, RoleKey } from '@/lib/types';
import { ROLES, getAllRoles } from '@/lib/roles';

// ============================================================
// MBTI 式深度测评 — 8 道核心题 + 业务信息补充
// ============================================================

interface Question {
  id: string;
  title: string;
  subtitle: string;
  multiSelect: boolean;
  options: { label: string; value: string }[];
  hasCustom?: boolean;
}

const QUESTIONS: Question[] = [
  {
    id: 'industry',
    title: '你做什么行业？',
    subtitle: '这决定了你的内容赛道和竞争环境',
    multiSelect: false,
    options: [
      { label: '餐饮/咖啡/烘焙', value: '餐饮' },
      { label: '美业/美发/美甲', value: '美业' },
      { label: '服装/时尚/配饰', value: '服装' },
      { label: '教育培训/知识付费', value: '教育' },
      { label: '汽车/出行/租赁', value: '汽车' },
      { label: '房产/家居/装修', value: '房产' },
      { label: '健身/运动/康复', value: '健身' },
      { label: '电商/直播带货', value: '电商' },
      { label: '本地生活/休闲', value: '本地生活' },
      { label: 'B2B/企业服务', value: 'B2B' },
    ],
    hasCustom: true,
  },
  {
    id: 'targetAudience',
    title: '你想触达什么样的人？',
    subtitle: '不是你做什么行业就发什么内容，而是你想找谁就做什么内容',
    multiSelect: true,
    options: [
      { label: '25-35岁城市白领', value: '25-35岁城市白领' },
      { label: '18-24岁大学生', value: '18-24岁大学生' },
      { label: '宝妈群体', value: '宝妈群体' },
      { label: '小镇青年', value: '小镇青年' },
      { label: '35-50岁中年人群', value: '35-50岁中年人群' },
      { label: '银发族', value: '银发族' },
      { label: 'Z世代潮人', value: 'Z世代潮人' },
      { label: '创业者/老板', value: '创业者/老板' },
      { label: '高净值人群', value: '高净值人群' },
    ],
    hasCustom: true,
  },
  {
    id: 'ageGroup',
    title: '你的核心客群年龄段？',
    subtitle: '年龄决定内容形式——年轻人要快节奏，中年人要信任感',
    multiSelect: true,
    options: [
      { label: '18岁以下', value: '18岁以下' },
      { label: '18-24岁', value: '18-24岁' },
      { label: '25-30岁', value: '25-30岁' },
      { label: '31-35岁', value: '31-35岁' },
      { label: '36-45岁', value: '36-45岁' },
      { label: '46岁以上', value: '46岁以上' },
    ],
  },
  {
    id: 'coreNeed',
    title: '他们找你，最想要什么？',
    subtitle: '这决定了你的内容切入点——省钱、面子、解决问题？完全不同的打法',
    multiSelect: true,
    options: [
      { label: '省钱/性价比', value: '省钱/性价比' },
      { label: '追求品质/面子', value: '追求品质/面子' },
      { label: '解决具体问题', value: '解决具体问题' },
      { label: '学习/自我提升', value: '学习/自我提升' },
      { label: '消遣/娱乐', value: '消遣/娱乐' },
      { label: '社交/归属感', value: '社交/归属感' },
      { label: '身份认同/圈层', value: '身份认同/圈层' },
      { label: '安全/保障', value: '安全/保障' },
    ],
  },
  {
    id: 'customerPainPoints',
    title: '你的客户最头疼什么？',
    subtitle: '痛点就是选题——他们烦什么你就拍什么',
    multiSelect: true,
    options: [
      { label: '选择太多不知道选哪个', value: '选择困难' },
      { label: '怕踩坑/被坑过', value: '怕踩坑' },
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
    subtitle: '找到触发点，内容就能引导转化',
    multiSelect: true,
    options: [
      { label: '看到别人用得好', value: '看到别人用得好' },
      { label: '限时优惠/稀缺感', value: '限时优惠/稀缺感' },
      { label: '解决了具体问题', value: '解决了具体问题' },
      { label: '朋友推荐/口碑', value: '朋友推荐/口碑' },
      { label: '品牌信任感', value: '品牌信任感' },
      { label: '冲动/情绪驱动', value: '冲动/情绪驱动' },
      { label: '对比后觉得值', value: '对比后觉得值' },
    ],
  },
  {
    id: 'priceRange',
    title: '你的客单价在哪个区间？',
    subtitle: '客单价决定内容深度——低价靠量，高价靠信任',
    multiSelect: false,
    options: [
      { label: '50元以下', value: '低价' },
      { label: '50-200元', value: '中低价' },
      { label: '200-1000元', value: '中价' },
      { label: '1000-5000元', value: '中高价' },
      { label: '5000元以上', value: '高价' },
    ],
  },
  {
    id: 'acquisition',
    title: '你的客户主要怎么来的？',
    subtitle: '获客方式决定流量策略——不同来源要拍不同类型的内容',
    multiSelect: true,
    options: [
      { label: '自然流量/搜索', value: '自然流量' },
      { label: '付费投放', value: '付费投放' },
      { label: '老客推荐/口碑', value: '老客推荐' },
      { label: '线下引流', value: '线下引流' },
      { label: '私域/社群', value: '私域/社群' },
      { label: '还没什么客户', value: '冷启动' },
    ],
  },
];

// 业务信息补充
const BUSINESS_FIELDS = [
  { id: 'role', label: '你的身份', type: 'role-select' as const },
  { id: 'businessName', label: '店名/品牌名', type: 'text' as const, placeholder: '例如：芒小果精品咖啡' },
  { id: 'competitors', label: '你的竞品是谁', type: 'text' as const, placeholder: '例如：瑞幸、Manner' },
  { id: 'differentiator', label: '你和别人有什么不同', type: 'text' as const, placeholder: '例如：只做单品豆、云南本地烘焙' },
  { id: 'platform', label: '现在在哪些平台做内容', type: 'multi-select' as const, options: ['抖音', '小红书', '视频号', 'B站', '还没开始'] },
  { id: 'postingFrequency', label: '能多久发一条', type: 'select' as const, options: ['每天', '每周3-4条', '每周1-2条', '每月几条', '还没开始'] },
  { id: 'teamSize', label: '运营团队几个人', type: 'select' as const, options: ['就我自己', '2-3人', '4-10人', '10人以上'] },
  { id: 'goalType', label: '现阶段最重要的目标', type: 'select' as const, options: ['涨粉', '获客/到店', '品牌认知', '卖货/转化', '建立专业形象'] },
  { id: 'goalDetail', label: '一句话说说你想达成的效果', type: 'text' as const, placeholder: '例如：一个月内吸引100个本地客户到店' },
];

import { useState } from 'react';
import { useApp } from '@/lib/store';

type Phase = 'intro' | 'questions' | 'business' | 'analyzing' | 'result';

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
    goalType: '涨粉',
  });
  const [aiResult, setAiResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ──── Handlers ────

  const toggleOption = (qId: string, value: string, multi: boolean) => {
    setAnswers(prev => {
      const current = prev[qId] || [];
      if (multi) {
        return { ...prev, [qId]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
      }
      return { ...prev, [qId]: [value] };
    });
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        industry: answers.industry?.[0] || '',
        targetAudience: answers.targetAudience || [],
        ageGroup: answers.ageGroup || [],
        coreNeed: answers.coreNeed || [],
        customerPainPoints: answers.customerPainPoints || [],
        purchaseMotivation: answers.purchaseMotivation || [],
        priceRange: answers.priceRange?.[0] || '',
        acquisition: answers.acquisition || [],
        role: businessAnswers.role || 'boss',
        businessName: businessAnswers.businessName || '',
        competitors: businessAnswers.competitors || '',
        differentiator: businessAnswers.differentiator || '',
        platform: businessAnswers.platform || '抖音',
        postingFrequency: businessAnswers.postingFrequency || '',
        teamSize: businessAnswers.teamSize || '',
        goalType: businessAnswers.goalType || '',
        goalDetail: businessAnswers.goalDetail || '',
      };

      const res = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('分析失败，请重试');
      const data = await res.json();
      setAiResult(data);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setPhase('business');
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    } else {
      setPhase('intro');
    }
  };

  const handleConfirm = () => {
    if (!aiResult) return;
    const fullAssets: BrandAssets = {
      brandName: businessAnswers.businessName || '',
      businessName: businessAnswers.businessName || '',
      industry: answers.industry?.[0] || '',
      targetAudience: answers.targetAudience || [],
      ageGroup: answers.ageGroup || [],
      coreNeed: answers.coreNeed || [],
      customerPainPoints: answers.customerPainPoints || [],
      purchaseMotivation: answers.purchaseMotivation || [],
      priceRange: answers.priceRange?.[0] || '',
      acquisition: answers.acquisition || [],
      contentExperience: '',
      postingFrequency: businessAnswers.postingFrequency || '',
      teamSize: businessAnswers.teamSize || '',
      competitors: businessAnswers.competitors || '',
      differentiator: businessAnswers.differentiator || '',
      platform: (businessAnswers.platform || '抖音').split(','),
      goalType: businessAnswers.goalType || '',
      goalDetail: businessAnswers.goalDetail || '',
      role: (businessAnswers.role || 'boss') as RoleKey,
      contentStrategy: (aiResult as Record<string, string>).contentStrategy || '',
      tone: (aiResult as Record<string, string>).tone || '',
      priceSensitivity: (aiResult as Record<string, string>).priceSensitivity || '',
      contentFormats: (aiResult as Record<string, string[]>).contentFormats || [],
      avoid: (aiResult as Record<string, string[]>).avoid || [],
      audienceMatchScore: (aiResult as Record<string, number>).audienceMatchScore || 0,
      audienceAnalysis: (aiResult as Record<string, string>).audienceAnalysis || '',
      operationAdvice: (aiResult as Record<string, string[]>).operationAdvice || [],
      riskWarnings: (aiResult as Record<string, string[]>).riskWarnings || [],
    };
    setBrandAssets(fullAssets);
  };

  // ──── INTRO PHASE ────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#0D0D12] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/nacl-logo.jpeg" alt="nacl" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#C8A97E]/30" />
          </div>

          <h1 className="text-[#C8A97E] text-2xl font-bold text-center mb-3 tracking-wide">nacl · 爆了没</h1>
          <p className="text-white/60 text-sm text-center mb-10">你的编导脑 · 差异化卡位引擎</p>

          {/* 核心说明 */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-6">
            <h2 className="text-white text-base font-semibold mb-3">为什么我们要这样问你？</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-3">
              大多数工具一上来问你「做什么行业」→ 给你看行业数据 → 你还是不知道该拍什么。
            </p>
            <p className="text-white/50 text-sm leading-relaxed mb-3">
              专业运营的思路完全不同：<span className="text-[#C8A97E]">先确定你想触达谁，再倒推该做什么内容</span>。不是你做什么行业就发什么内容，而是你想找什么样的客户，就用什么样的内容去匹配他们。
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              下面这些问题，就是在帮我们理解你的客户。问得越细，我们给的方案越精准。
            </p>
          </div>

          {/* 流程预览 */}
          <div className="flex items-center justify-between px-4 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#C8A97E]/20 border border-[#C8A97E]/40 flex items-center justify-center text-[#C8A97E] text-sm font-bold">1</div>
              <span className="text-white/40 text-xs mt-1.5">画像测评</span>
            </div>
            <div className="flex-1 h-px bg-white/10 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-sm font-bold">2</div>
              <span className="text-white/40 text-xs mt-1.5">业务信息</span>
            </div>
            <div className="flex-1 h-px bg-white/10 mx-2" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 text-sm font-bold">3</div>
              <span className="text-white/40 text-xs mt-1.5">AI解析</span>
            </div>
          </div>

          <button
            onClick={() => setPhase('questions')}
            className="w-full py-4 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] font-bold rounded-xl active:scale-[0.98] transition-transform"
          >
            开始测评
          </button>
          <p className="text-white/20 text-xs text-center mt-3">8 道题 + 业务补充，约 2 分钟</p>
        </div>
      </div>
    );
  }

  // ──── QUESTIONS PHASE ────
  if (phase === 'questions') {
    const q = QUESTIONS[currentQ];
    const selected = answers[q.id] || [];
    const progress = (currentQ + 1) / QUESTIONS.length;

    return (
      <div className="min-h-screen bg-[#0D0D12] flex flex-col px-6 py-6">
        <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={handlePrev} className="text-white/40 text-sm">← 返回</button>
            <span className="text-white/30 text-xs">{currentQ + 1} / {QUESTIONS.length}</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full mb-8">
            <div className="h-full bg-gradient-to-r from-[#C8A97E] to-[#A88B65] rounded-full transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>

          {/* Question */}
          <h2 className="text-white text-xl font-bold mb-2">{q.title}</h2>
          <p className="text-[#C8A97E]/70 text-sm mb-6">{q.subtitle}</p>
          {q.multiSelect && (
            <p className="text-white/30 text-xs mb-4">可多选</p>
          )}

          {/* Options */}
          <div className="flex flex-wrap gap-3 mb-6">
            {q.options.map(opt => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleOption(q.id, opt.value, q.multiSelect)}
                  className={`px-4 py-2.5 rounded-xl text-sm border transition-all ${
                    isSelected
                      ? 'bg-[#C8A97E]/15 border-[#C8A97E]/50 text-[#C8A97E]'
                      : 'bg-white/[0.03] border-white/[0.05] text-white/50 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            {q.hasCustom && (
              <div className="w-full mt-1">
                <input
                  type="text"
                  placeholder="自定义..."
                  value={customInputs[q.id] || ''}
                  onChange={e => {
                    setCustomInputs(prev => ({ ...prev, [q.id]: e.target.value }));
                    if (e.target.value) {
                      setAnswers(prev => ({ ...prev, [q.id]: [...(prev[q.id] || []).filter(v => !v.startsWith('__custom__')), `__custom__${e.target.value}`] }));
                    }
                  }}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#C8A97E]/40"
                />
              </div>
            )}
          </div>

          <div className="mt-auto">
            <button
              onClick={handleNext}
              disabled={selected.length === 0}
              className="w-full py-4 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
            >
              {currentQ < QUESTIONS.length - 1 ? '下一题' : '填业务信息'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── BUSINESS PHASE ────
  if (phase === 'business') {
    return (
      <div className="min-h-screen bg-[#0D0D12] flex flex-col px-6 py-6">
        <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col">
          <button onClick={() => setPhase('questions')} className="text-white/40 text-sm mb-4 self-start">← 返回测评</button>

          <h2 className="text-white text-xl font-bold mb-2">补充业务信息</h2>
          <p className="text-[#C8A97E]/70 text-sm mb-6">让我们更了解你的生意，AI分析更精准</p>

          {/* Role Select */}
          <div className="mb-5">
            <label className="text-white/50 text-xs mb-2 block">你的身份</label>
            <div className="flex flex-wrap gap-2">
              {getAllRoles().map(r => (
                <button
                  key={r.key}
                  onClick={() => setBusinessAnswers(prev => ({ ...prev, role: r.key }))}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                    businessAnswers.role === r.key
                      ? 'bg-[#C8A97E]/15 border-[#C8A97E]/50 text-[#C8A97E]'
                      : 'bg-white/[0.03] border-white/[0.05] text-white/50'
                  }`}
                >
                  {r.emoji} {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic fields */}
          {BUSINESS_FIELDS.filter(f => f.id !== 'role').map(field => (
            <div key={field.id} className="mb-4">
              <label className="text-white/50 text-xs mb-1.5 block">{field.label}</label>
              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={businessAnswers[field.id] || ''}
                  onChange={e => setBusinessAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#C8A97E]/40"
                />
              )}
              {field.type === 'select' && field.options && (
                <div className="flex flex-wrap gap-2">
                  {field.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setBusinessAnswers(prev => ({ ...prev, [field.id]: opt }))}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        businessAnswers[field.id] === opt
                          ? 'bg-[#C8A97E]/15 border-[#C8A97E]/50 text-[#C8A97E]'
                          : 'bg-white/[0.03] border-white/[0.05] text-white/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {field.type === 'multi-select' && field.options && (
                <div className="flex flex-wrap gap-2">
                  {field.options.map(opt => {
                    const selected = (businessAnswers[field.id] || '').split(',').includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          const current = (businessAnswers[field.id] || '').split(',').filter(Boolean);
                          const next = selected ? current.filter(v => v !== opt) : [...current, opt];
                          setBusinessAnswers(prev => ({ ...prev, [field.id]: next.join(',') }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                          selected
                            ? 'bg-[#C8A97E]/15 border-[#C8A97E]/50 text-[#C8A97E]'
                            : 'bg-white/[0.03] border-white/[0.05] text-white/40'
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

          <div className="mt-auto">
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] font-bold rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0D0D12]/30 border-t-[#0D0D12] rounded-full animate-spin" />
                  AI 正在分析...
                </span>
              ) : '让 AI 帮我做运营'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── ANALYZING PHASE ────
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#0D0D12] flex flex-col items-center justify-center px-6">
        <div className="w-12 h-12 border-2 border-[#C8A97E]/30 border-t-[#C8A97E] rounded-full animate-spin mb-6" />
        <p className="text-white/60 text-sm">AI 正在解析你的客户画像...</p>
      </div>
    );
  }

  // ──── RESULT PHASE ────
  if (phase === 'result' && aiResult) {
    const result = aiResult as Record<string, unknown>;
    const score = (result.audienceMatchScore as number) || 0;

    return (
      <div className="min-h-screen bg-[#0D0D12] flex flex-col px-6 py-6">
        <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col">
          <h2 className="text-white text-xl font-bold mb-2">AI 画像解析完成</h2>
          <p className="text-[#C8A97E]/70 text-sm mb-6">基于你的回答，我们生成了以下运营方案</p>

          {/* Match Score */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-sm">人群匹配度</span>
              <span className="text-[#C8A97E] text-2xl font-bold tabular-nums">{score}<span className="text-sm">分</span></span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full">
              <div className="h-full bg-gradient-to-r from-[#C8A97E] to-[#A88B65] rounded-full transition-all duration-700" style={{ width: `${score}%` }} />
            </div>
          </div>

          {/* Strategy */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
            <h3 className="text-white/50 text-xs mb-2">内容策略</h3>
            <p className="text-white/80 text-sm leading-relaxed">{String(result.contentStrategy || '')}</p>
          </div>

          {/* Tone */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
            <h3 className="text-white/50 text-xs mb-2">内容调性</h3>
            <p className="text-white/80 text-sm leading-relaxed">{String(result.tone || '')}</p>
          </div>

          {/* Formats */}
          {Array.isArray(result.contentFormats) && result.contentFormats.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
              <h3 className="text-white/50 text-xs mb-3">推荐内容形式</h3>
              <div className="flex flex-wrap gap-2">
                {result.contentFormats.map((f: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-[#C8A97E]/10 text-[#C8A97E] text-xs rounded-lg">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          {Array.isArray(result.operationAdvice) && result.operationAdvice.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
              <h3 className="text-white/50 text-xs mb-3">运营建议</h3>
              <ul className="space-y-2">
                {result.operationAdvice.map((a: string, i: number) => (
                  <li key={i} className="text-white/70 text-sm flex gap-2"><span className="text-[#C8A97E] shrink-0">•</span>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {Array.isArray(result.riskWarnings) && result.riskWarnings.length > 0 && (
            <div className="bg-[#FDCB6E]/5 border border-[#FDCB6E]/20 rounded-2xl p-5 mb-4">
              <h3 className="text-[#FDCB6E] text-xs mb-3">风险预警</h3>
              <ul className="space-y-2">
                {result.riskWarnings.map((r: string, i: number) => (
                  <li key={i} className="text-[#FDCB6E]/70 text-sm flex gap-2"><span className="text-[#FDCB6E] shrink-0">!</span>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto pt-4">
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] font-bold rounded-xl active:scale-[0.98] transition-transform"
            >
              确认，开始用爆了没
            </button>
            <button
              onClick={() => setPhase('intro')}
              className="w-full py-3 text-white/30 text-sm mt-2"
            >
              重新测评
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

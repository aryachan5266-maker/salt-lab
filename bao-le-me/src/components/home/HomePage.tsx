'use client';

import {
  ArrowRight,
  CheckCircle2,
  Crosshair,
  FileText,
  Gauge,
  Layers3,
  Repeat2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { DeliverableGrid, DouyinPreview, StoryboardStrip } from '@/components/media/DouyinPreview';
import { SAMPLE_VIDEO } from '@/lib/demo-media';
import { useApp } from '@/lib/store';
import { getRole } from '@/lib/roles';

const PRIMARY_STEPS = [
  {
    page: 'onboarding' as const,
    step: '00',
    title: '测真实客户',
    desc: '先用城市、店型和客群假设做反推，别从自嗨脚本开始。',
    icon: CheckCircle2,
  },
  {
    page: 'hot-radar' as const,
    step: '01',
    title: '找今天能蹭的热点',
    desc: '筛掉热闹但不适合你客户的内容。',
    icon: Gauge,
  },
  {
    page: 'positioning' as const,
    step: '02',
    title: '确定不撞车的角度',
    desc: '看同行都在讲什么，再找你的空位。',
    icon: Crosshair,
  },
  {
    page: 'generate' as const,
    step: '03',
    title: '生成能拍的脚本',
    desc: '一次输出封面、分镜、口播和风险体检。',
    icon: FileText,
  },
];

const SECONDARY_TOOLS = [
  { page: 'decode' as const, title: '同行拆解', desc: '拆对方内容结构，不抄文案', icon: Layers3 },
  { page: 'content-loop' as const, title: '预测复盘', desc: '发布前押判断，发布后拿数据校准', icon: Repeat2 },
  { page: 'brand-assets' as const, title: '品牌资产', desc: '查看客户反推和长期记忆', icon: Sparkles },
];

export default function HomePage() {
  const { brandAssets, setCurrentPage } = useApp();
  const role = brandAssets ? getRole(brandAssets.role) : null;
  const hasProfile = Boolean(brandAssets);

  return (
    <div className="space-y-5 md:space-y-7">
      <section className="grid min-h-[calc(100svh-132px)] gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="flex min-h-[520px] flex-col justify-between rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.045)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.26)] md:p-7">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="rounded-[6px] bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-black">
                内容驾驶舱
              </span>
              <span className="rounded-[6px] border border-[var(--color-accent)]/35 bg-[var(--color-accent)]/10 px-2.5 py-1 text-[11px] tracking-[0.12em] text-[var(--color-accent)]">
                抖音编导脑
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.04] tracking-normal text-white text-balance md:text-6xl">
              先看客户，再决定今天拍什么。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/64 md:text-lg">
              爆了么 2.0 把客户反推、热点判断、差异化卡位和脚本交付放进一张工作台。你看到的不只是文字，还要能看到封面、分镜和短视频节奏。
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setCurrentPage(hasProfile ? 'hot-radar' : 'onboarding')}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[var(--color-accent)] px-5 py-3.5 text-sm font-bold text-black transition hover:bg-white active:translate-y-px"
              >
                {hasProfile ? '开始今天的编导任务' : '30 秒测真实客户'}
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('content-loop')}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/12 bg-white/[0.035] px-5 py-3.5 text-sm font-semibold text-white/74 transition hover:border-white/26 hover:bg-white/[0.065] hover:text-white active:translate-y-px"
              >
                进入预测复盘
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-[12px] border border-[var(--color-accent)]/24 bg-black/22 xl:hidden">
              <div className="grid grid-cols-[116px_1fr] gap-3 p-3 sm:grid-cols-[148px_1fr]">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[10px] border border-white/10 bg-black">
                  <img src={SAMPLE_VIDEO.cover} alt="抖音封面样张" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/18">
                    <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[10px] font-semibold text-white">
                      PREVIEW
                    </span>
                  </div>
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-accent)]">今日视频样张</p>
                  <h2 className="mt-2 text-xl font-black leading-tight text-white">{SAMPLE_VIDEO.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-white/52">{SAMPLE_VIDEO.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {SAMPLE_VIDEO.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/72">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PRIMARY_STEPS.map((item) => {
              const Icon = item.icon;
              const locked = !hasProfile && item.page !== 'onboarding';
              return (
                <button
                  key={item.page}
                  type="button"
                  onClick={() => setCurrentPage(locked ? 'onboarding' : item.page)}
                  className="group min-h-[132px] rounded-[12px] border border-white/10 bg-black/18 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]/45 hover:bg-[var(--color-accent)]/8"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-black tabular-nums text-[var(--color-accent)]">{item.step}</span>
                    <span className="grid size-9 place-items-center rounded-[9px] bg-white/[0.055] text-white/70 group-hover:text-[var(--color-accent)]">
                      <Icon size={17} />
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/46">{locked ? '先测客户后解锁' : item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.82fr_1fr] xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-white/36">今日视频样张</p>
                <h2 className="mt-1 text-xl font-bold text-white">封面和节奏先看见</h2>
              </div>
              <span className="rounded-full border border-[var(--color-accent)]/30 px-3 py-1 text-xs text-[var(--color-accent)]">
                本地素材
              </span>
            </div>
            <DouyinPreview />
          </div>

          <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-white/36">今日可交付物</p>
                <h2 className="mt-1 text-xl font-bold text-white">交付后继续校准</h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage(hasProfile ? 'generate' : 'onboarding')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]"
              >
                生成一套
                <ArrowRight size={15} />
              </button>
            </div>
            <DeliverableGrid />
          </div>
        </div>
      </section>

      <section className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/35">分镜预览</p>
            <h2 className="mt-1 text-xl font-bold text-white">45 秒短视频先拆成四段</h2>
          </div>
          <p className="text-sm text-white/38">封面 → 钩子 → 证据 → 转化</p>
        </div>
        <StoryboardStrip />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.035)] p-5 md:p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/38">当前客户判断</p>
          {brandAssets ? (
            <div className="mt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{brandAssets.businessName || '未命名项目'}</h2>
                  <p className="mt-1 text-sm text-white/44">
                    {brandAssets.occupation || role?.label || '老板'} · {brandAssets.city || '未定城市'} · {brandAssets.storeType || brandAssets.industry}
                  </p>
                </div>
                <div className="rounded-[12px] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-2 text-right">
                  <p className="text-[10px] tracking-[0.16em] text-white/38">吻合度</p>
                  <p className="text-2xl font-black tabular-nums text-[var(--color-accent)]">{brandAssets.audienceMatchScore}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {[brandAssets.industry, brandAssets.priceRange, ...brandAssets.targetAudience.slice(0, 2)]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item} className="rounded-[7px] border border-white/10 bg-black/18 px-3 py-1.5 text-xs text-white/58">
                      {item}
                    </span>
                  ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-white/62 line-clamp-4">{brandAssets.audienceAnalysis}</p>
              <p className="mt-4 text-xs leading-5 text-white/34">来源：{brandAssets.dataSource || 'AI 推断'}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-[12px] border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-4">
              <p className="text-sm leading-7 text-white/68">
                还没有客户反推结果。先回答 30 秒问题，系统才会解锁热点、卡位和脚本。
              </p>
              <button
                type="button"
                onClick={() => setCurrentPage('onboarding')}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)]"
              >
                开始测客户
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </aside>

        <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-[var(--color-accent)]" />
            <h2 className="font-bold text-white">运营判断</h2>
          </div>
          {brandAssets ? (
            <div className="grid gap-3 md:grid-cols-2">
              <p className="rounded-[10px] border border-white/8 bg-black/16 p-4 text-sm leading-7 text-white/62">
                {brandAssets.contentStrategy}
              </p>
              <div className="rounded-[10px] border border-red-300/18 bg-red-400/[0.045] p-4">
                <div className="mb-2 flex items-center gap-2 text-red-200">
                  <ShieldAlert size={16} />
                  <span className="text-sm font-semibold">风险提示</span>
                </div>
                <p className="text-sm leading-7 text-white/58">
                  {brandAssets.riskWarnings[0] || '没有真实来源时，不把结果包装成平台实测数据。'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              {SECONDARY_TOOLS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() => setCurrentPage(item.page === 'content-loop' ? 'content-loop' : 'onboarding')}
                    className="rounded-[10px] border border-white/8 bg-black/16 p-4 text-left transition hover:border-white/18 hover:bg-white/[0.045]"
                  >
                    <span className="mb-3 grid size-9 place-items-center rounded-[9px] bg-white/[0.05] text-[var(--color-accent)]">
                      <Icon size={16} />
                    </span>
                    <span className="block text-sm font-semibold text-white">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/38">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

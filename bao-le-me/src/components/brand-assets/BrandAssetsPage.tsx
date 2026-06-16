'use client';

import { Edit3, ShieldAlert, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { NACLLogo } from '@/components/nacl-logo';
import { useApp } from '@/lib/store';
import { getRole } from '@/lib/roles';
import { PageHeader, StepHint } from '@/components/layout/PageHeader';

export default function BrandAssetsPage() {
  const { brandAssets, setCurrentPage } = useApp();
  if (!brandAssets) {
    return (
      <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <p className="nacl-kicker mb-3">BRAND MEMORY</p>
        <h1 className="text-3xl font-bold text-white">还没有客户画像</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
          先完成真实客户反推，系统才会生成品牌资产、目标客户差距、内容策略和后续脚本上下文。
        </p>
        <button
          onClick={() => setCurrentPage('onboarding')}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white"
        >
          <Edit3 size={15} />
          开始反推客户
        </button>
      </div>
    );
  }

  const role = getRole(brandAssets.role);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="BRAND MEMORY"
        title="品牌资产"
        description="这些信息会被后续热点、卡位和脚本生成复用。这里是系统的长期上下文，不是一次性报告。"
        icon={Sparkles}
        action={{
          label: '重新反推',
          onClick: () => setCurrentPage('onboarding'),
          icon: Edit3,
        }}
        next={{ label: '去生成脚本', page: 'generate' }}
      />

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="nacl-card p-5 md:p-6">
          <NACLLogo size="sm" className="mb-5 w-20" />
          <h2 className="text-2xl font-semibold tracking-[0.12em] text-white">{brandAssets.businessName || '未命名品牌'}</h2>
          <p className="mt-2 text-sm text-white/42">
            {brandAssets.occupation || role.label} · {brandAssets.city || '未定城市'} · {brandAssets.storeType || brandAssets.industry}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {brandAssets.targetAudience.slice(0, 4).map((item) => (
              <span key={item} className="rounded-full border border-[var(--color-accent)]/25 bg-[var(--color-accent)]/10 px-3 py-1 text-xs text-[var(--color-accent)]">
                {item}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-white/34">来源：{brandAssets.dataSource || 'AI 推断'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title="内容策略" body={brandAssets.contentStrategy} />
          <InfoCard title="内容调性" body={brandAssets.tone} />
          <InfoCard title="价格敏感度" body={brandAssets.priceSensitivity} />
          <InfoCard title="真实客户差距" body={brandAssets.audienceAnalysis} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ListCard title="推荐形式" items={brandAssets.contentFormats} icon={<Sparkles size={17} />} />
        <ListCard title="避雷项" items={brandAssets.avoid} icon={<ShieldAlert size={17} />} tone="risk" />
      </section>

      <StepHint label="用这份品牌资产继续生成脚本" page="generate" />
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="nacl-card p-5">
      <h2 className="mb-3 text-xs tracking-[0.22em] text-white/42">{title}</h2>
      <p className="text-sm leading-7 text-white/66">{body || '暂无'}</p>
    </div>
  );
}

function ListCard({ title, items, icon, tone }: { title: string; items: string[]; icon: ReactNode; tone?: 'risk' }) {
  return (
    <div className={`rounded-[8px] border p-5 ${tone === 'risk' ? 'border-red-400/20 bg-red-500/[0.055]' : 'border-white/10 bg-white/[0.025]'}`}>
      <div className={`mb-4 flex items-center gap-2 ${tone === 'risk' ? 'text-red-300' : 'text-[var(--color-accent)]'}`}>
        {icon}
        <h2 className="text-xs font-semibold tracking-[0.22em]">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/58">{item}</span>
        )) : <span className="text-sm text-white/32">暂无</span>}
      </div>
    </div>
  );
}

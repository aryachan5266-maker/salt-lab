'use client';

import { Database, Edit3, Layers3, Rocket, RotateCcw, ShieldCheck, Tags } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NACLLogo } from '@/components/nacl-logo';
import { useApp } from '@/lib/store';
import { getRole } from '@/lib/roles';
import { PageHeader } from '@/components/layout/PageHeader';

export default function SettingsPage() {
  const { brandAssets, setCurrentPage } = useApp();
  const role = brandAssets ? getRole(brandAssets.role) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="SYSTEM"
        title="设置"
        description="管理当前身份、品牌资产和能力边界。这里会明确告诉用户哪些是数据来源，哪些只是 AI 推断。"
        icon={ShieldCheck}
        next={{ label: '回到总控台', page: 'home' }}
      />

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="nacl-card p-5 md:p-6">
          <NACLLogo size="sm" className="mb-5 w-20" />
          <h2 className="text-xl font-semibold text-white">{brandAssets?.businessName || '未设置'}</h2>
          <p className="mt-2 text-sm text-white/38">{brandAssets?.occupation || role?.label || '选择身份'} · {brandAssets?.industry || '选择行业'}</p>
          <button
            onClick={() => setCurrentPage('onboarding')}
            className="mt-5 inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/52 transition hover:border-[var(--color-accent)]/40 hover:text-white"
          >
            <Edit3 size={15} />
            编辑
          </button>
        </div>

        <div className="nacl-card overflow-hidden">
          <MenuButton icon={Tags} label="品牌资产" onClick={() => setCurrentPage('brand-assets')} />
          <MenuButton icon={RotateCcw} label="重新反推真实客户" onClick={() => setCurrentPage('onboarding')} />
          <MenuButton icon={Layers3} label="同行拆解" onClick={() => setCurrentPage('decode')} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[8px] border border-[var(--color-accent)]/22 bg-[var(--color-accent)]/8 p-5">
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
            <Database size={17} />
            <h2 className="text-xs font-semibold tracking-[0.22em]">数据来源</h2>
          </div>
          <p className="text-sm leading-7 text-white/62">
            {brandAssets?.dataSource || '未完成客户反推。接入数据中台时显示真实来源；缺数据时明确标注 AI 推断。'}
          </p>
        </div>
        <div className="nacl-card p-5">
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
            <ShieldCheck size={17} />
            <h2 className="text-xs font-semibold tracking-[0.22em]">能力边界</h2>
          </div>
          <p className="text-sm leading-7 text-white/62">
            爆了么交付脚本、分镜、口播、封面提示和违禁词体检；不假装直接生成成片视频。
          </p>
        </div>
        <div className="nacl-card p-5">
          <div className="mb-3 flex items-center gap-2 text-[var(--color-accent)]">
            <Rocket size={17} />
            <h2 className="text-xs font-semibold tracking-[0.22em]">试用状态</h2>
          </div>
          <p className="text-sm leading-7 text-white/62">
            当前适合内测交付：客户反推、热点方向、卡位、脚本和复制交付已打通；实时抖音数据源接入前，不按“真实数据看板”收费。
          </p>
        </div>
      </section>

      <footer className="pt-4 text-center">
        <div className="mb-2 flex items-center justify-center">
          <NACLLogo size="xs" className="w-14" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-white/20">BAO LE ME · NACL-LAB · v1.0.0</p>
      </footer>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-white/8 px-5 py-4 text-left transition last:border-b-0 hover:bg-white/[0.025]"
    >
      <span className="flex items-center gap-3 text-sm text-white/68">
        <Icon size={16} className="text-[var(--color-accent)]" />
        {label}
      </span>
      <span className="text-xs text-white/24">OPEN</span>
    </button>
  );
}

'use client';

import { useState } from 'react';
import { AlertTriangle, Crosshair, Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '@/lib/store';
import type { PositioningResult, PositionSlot } from '@/lib/types';
import { ErrorNotice, PageHeader, StepHint } from '@/components/layout/PageHeader';

export default function PositioningPage() {
  const { brandAssets } = useApp();
  const [result, setResult] = useState<PositioningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runPositioning = async () => {
    if (!brandAssets) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/douyin/positioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: brandAssets.industry,
          city: brandAssets.city,
          storeType: brandAssets.storeType,
          priceRange: brandAssets.priceRange,
          targetAudience: brandAssets.targetAudience,
          role: brandAssets.role,
          occupation: brandAssets.occupation,
          differentiator: brandAssets.differentiator,
          competitors: brandAssets.competitors,
          contentStrategy: brandAssets.contentStrategy,
          contentFormats: brandAssets.contentFormats,
        }),
      });
      if (!res.ok) throw new Error('卡位分析失败');
      const data = await res.json();
      setResult(data.positioning);
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="DIFFERENTIATION ENGINE"
        title="差异化卡位引擎"
        description="三步找到你能占住的空位：判断拥挤程度、找空位、给理由。目标不是抄爆款，是避开撞车。"
        icon={Crosshair}
        action={{
          label: loading ? '分析中' : result ? '重新分析' : '开始卡位分析',
          onClick: runPositioning,
          disabled: loading || !brandAssets,
          loading,
          icon: RefreshCw,
        }}
        next={{ label: '去生成脚本', page: 'generate' }}
      />

      {/* Start Button */}
      {!result && !loading && (
        <button
          onClick={runPositioning}
          className="w-full rounded-[8px] bg-[var(--color-accent)] py-4 font-bold tracking-[0.16em] text-black transition hover:bg-white"
        >
          开始卡位分析
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="mb-4 animate-spin text-[var(--color-accent)]" size={34} />
          <p className="text-white/50 text-sm">正在测算 AI 卡位评分和空位...</p>
          <p className="mt-1 text-xs text-white/24">通常 10 秒左右；外部模型超时会自动给安全兜底结果。</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          {/* Crowdedness */}
          <div className="nacl-card p-5">
            <h3 className="text-white/50 text-xs mb-3">AI 卡位评分</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="36" fill="none"
                    stroke={result.crowdedness > 70 ? '#A9B8C8' : result.crowdedness > 40 ? 'var(--color-accent)' : '#00B894'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${result.crowdedness * 2.26} 226`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg tabular-nums">
                  {result.crowdedness}
                </span>
              </div>
              <div>
                <p className={`font-semibold text-sm ${
                  result.crowdedness > 70 ? 'text-[#A9B8C8]' : result.crowdedness > 40 ? 'text-[var(--color-accent)]' : 'text-[#00B894]'
                }`}>
                  {result.crowdednessLabel}
                </p>
                <p className="text-white/30 text-xs mt-1">0=更空 100=更拥挤 · 非平台真实数据</p>
                <p className="mt-2 text-[10px] text-white/24">{result.source || 'AI推断（非实时平台数据）'}</p>
              </div>
            </div>
          </div>

          {/* Empty Slots */}
          <div className="nacl-card p-5 lg:row-span-3">
            <h3 className="text-white/50 text-xs mb-4">差异化空位</h3>
            <div className="space-y-4">
              {result.emptySlots.map((slot: PositionSlot, i: number) => (
                <div key={i} className="rounded-[8px] border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-xs font-bold text-[var(--color-accent)]">{i + 1}</span>
                    <h4 className="text-white text-sm font-semibold">{slot.angle}</h4>
                  </div>
                  <p className="text-white/40 text-xs mb-1.5">支撑: {slot.evidence}</p>
                  <p className="text-white/40 text-xs mb-1.5">人群: {slot.audience}</p>
                  <div className="rounded-[8px] bg-[var(--color-accent)]/5 px-3 py-2">
                    <p className="text-[var(--color-accent)]/80 text-xs">示例标题: {slot.exampleTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Angle */}
          <div className="rounded-[8px] border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-5">
            <h3 className="text-[var(--color-accent)] text-xs mb-2">你的差异化角度</h3>
            <p className="text-white text-sm leading-relaxed">{result.yourAngle}</p>
          </div>

          {/* Reasons */}
          {result.reasons.length > 0 && (
            <div className="nacl-card p-5">
              <h3 className="text-white/50 text-xs mb-3">为什么选这些空位</h3>
              <ul className="space-y-2">
                {result.reasons.map((r: string, i: number) => (
                  <li key={i} className="text-white/60 text-sm flex gap-2"><span className="text-[var(--color-accent)] shrink-0">—</span>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Notes */}
          {result.riskNotes.length > 0 && (
            <div className="rounded-[8px] border border-red-400/20 bg-red-500/[0.055] p-5 lg:col-span-2">
              <h3 className="mb-3 flex items-center gap-2 text-xs text-red-300"><AlertTriangle size={15} />风险提示</h3>
              {result.riskNotes.map((r: string, i: number) => (
                <p key={i} className="text-white/60 text-xs mb-1">{r}</p>
              ))}
            </div>
          )}

          {/* Re-run */}
          <button
            onClick={runPositioning}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/48 transition hover:border-[var(--color-accent)]/35 hover:text-white lg:col-span-2"
          >
            <RefreshCw size={15} />
            重新分析
          </button>
        </div>
      )}

      {result && <StepHint label="把这个差异化角度变成能拍的脚本" page="generate" />}
      <ErrorNotice message={error} onRetry={runPositioning} />
    </div>
  );
}

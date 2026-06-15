'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import type { PositioningResult, PositionSlot } from '@/lib/types';

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
          targetAudience: brandAssets.targetAudience,
          role: brandAssets.role,
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
    <div className="px-5 py-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#C8A97E]/15 to-[#C8A97E]/5 border border-[#C8A97E]/20 rounded-2xl p-5 mb-5">
        <span className="text-[#C8A97E] text-2xl mb-2 block">🎯</span>
        <h2 className="text-white text-lg font-bold mb-1">差异化卡位引擎</h2>
        <p className="text-white/40 text-xs leading-relaxed">
          市面唯一功能 — 三步找到你的差异化空位：<br />
          测拥挤度 → 找空位 → 给理由
        </p>
      </div>

      {/* Start Button */}
      {!result && !loading && (
        <button
          onClick={runPositioning}
          className="w-full py-4 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] font-bold rounded-xl active:scale-[0.98] transition-transform"
        >
          开始卡位分析
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <div className="w-12 h-12 border-2 border-[#C8A97E]/30 border-t-[#C8A97E] rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm">正在测算拥挤度和空位...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Crowdedness */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <h3 className="text-white/50 text-xs mb-3">赛道拥挤度</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="36" fill="none"
                    stroke={result.crowdedness > 70 ? '#FDCB6E' : result.crowdedness > 40 ? '#C8A97E' : '#00B894'}
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
                  result.crowdedness > 70 ? 'text-[#FDCB6E]' : result.crowdedness > 40 ? 'text-[#C8A97E]' : 'text-[#00B894]'
                }`}>
                  {result.crowdednessLabel}
                </p>
                <p className="text-white/30 text-xs mt-1">0=蓝海 100=红海</p>
              </div>
            </div>
          </div>

          {/* Empty Slots */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <h3 className="text-white/50 text-xs mb-4">差异化空位</h3>
            <div className="space-y-4">
              {result.emptySlots.map((slot: PositionSlot, i: number) => (
                <div key={i} className="bg-white/[0.02] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#C8A97E]/20 flex items-center justify-center text-[#C8A97E] text-xs font-bold">{i + 1}</span>
                    <h4 className="text-white text-sm font-semibold">{slot.angle}</h4>
                  </div>
                  <p className="text-white/40 text-xs mb-1.5">支撑: {slot.evidence}</p>
                  <p className="text-white/40 text-xs mb-1.5">人群: {slot.audience}</p>
                  <div className="bg-[#C8A97E]/5 rounded-lg px-3 py-2">
                    <p className="text-[#C8A97E]/80 text-xs">示例标题: {slot.exampleTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Angle */}
          <div className="bg-gradient-to-br from-[#C8A97E]/10 to-[#C8A97E]/5 border border-[#C8A97E]/20 rounded-2xl p-5">
            <h3 className="text-[#C8A97E] text-xs mb-2">你的差异化角度</h3>
            <p className="text-white text-sm leading-relaxed">{result.yourAngle}</p>
          </div>

          {/* Reasons */}
          {result.reasons.length > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
              <h3 className="text-white/50 text-xs mb-3">为什么选这些空位</h3>
              <ul className="space-y-2">
                {result.reasons.map((r: string, i: number) => (
                  <li key={i} className="text-white/60 text-sm flex gap-2"><span className="text-[#C8A97E] shrink-0">•</span>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Notes */}
          {result.riskNotes.length > 0 && (
            <div className="bg-[#FDCB6E]/5 border border-[#FDCB6E]/20 rounded-2xl p-5">
              <h3 className="text-[#FDCB6E] text-xs mb-3">风险提示</h3>
              {result.riskNotes.map((r: string, i: number) => (
                <p key={i} className="text-[#FDCB6E]/60 text-xs mb-1">! {r}</p>
              ))}
            </div>
          )}

          {/* Re-run */}
          <button
            onClick={runPositioning}
            className="w-full py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/40 text-sm hover:border-[#C8A97E]/20 transition-colors"
          >
            重新分析
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  );
}

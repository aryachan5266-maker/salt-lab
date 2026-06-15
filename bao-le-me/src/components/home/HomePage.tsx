'use client';

import { useApp } from '@/lib/store';
import { getRole } from '@/lib/roles';

export default function HomePage() {
  const { brandAssets, setCurrentPage } = useApp();
  const role = brandAssets ? getRole(brandAssets.role) : null;

  return (
    <div className="px-5 py-5">
      {/* Profile Summary */}
      {brandAssets && (
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{role?.emoji || '👔'}</span>
              <div>
                <h3 className="text-white text-sm font-semibold">{brandAssets.businessName || '未命名'}</h3>
                <p className="text-white/30 text-xs">{role?.label || '老板'} · {brandAssets.industry}</p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('onboarding')}
              className="text-white/30 text-xs hover:text-[#C8A97E] transition-colors"
            >
              编辑 ✎
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {brandAssets.targetAudience.slice(0, 3).map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-[#C8A97E]/10 text-[#C8A97E] text-[10px] rounded-md">{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-white/50 text-xs mb-3 tracking-wide">快速入口</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setCurrentPage('hot-radar')}
          className="bg-gradient-to-br from-[#C8A97E]/10 to-[#C8A97E]/5 border border-[#C8A97E]/20 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-2xl mb-2 block">📡</span>
          <h3 className="text-white text-sm font-semibold mb-1">热点雷达</h3>
          <p className="text-white/30 text-xs">发现行业热点和上升话题</p>
        </button>
        <button
          onClick={() => setCurrentPage('decode')}
          className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-2xl mb-2 block">🔬</span>
          <h3 className="text-white text-sm font-semibold mb-1">同行拆解</h3>
          <p className="text-white/30 text-xs">拆解竞品爆款逻辑</p>
        </button>
        <button
          onClick={() => setCurrentPage('positioning')}
          className="bg-gradient-to-br from-[#C8A97E]/15 to-[#C8A97E]/5 border border-[#C8A97E]/30 rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-2xl mb-2 block">🎯</span>
          <h3 className="text-white text-sm font-semibold mb-1">差异化卡位</h3>
          <p className="text-[#C8A97E]/60 text-xs">招牌功能 — 找到你的空位</p>
        </button>
        <button
          onClick={() => setCurrentPage('generate')}
          className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.05] rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
        >
          <span className="text-2xl mb-2 block">✍️</span>
          <h3 className="text-white text-sm font-semibold mb-1">脚本生成</h3>
          <p className="text-white/30 text-xs">差异化脚本三件套</p>
        </button>
      </div>

      {/* AI Insights */}
      {brandAssets && (
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
          <h3 className="text-white/50 text-xs mb-3">AI 运营诊断</h3>
          <p className="text-white/70 text-sm leading-relaxed">{brandAssets.contentStrategy}</p>
          {brandAssets.riskWarnings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <p className="text-[#FDCB6E] text-xs mb-1">注意</p>
              <p className="text-[#FDCB6E]/60 text-xs">{brandAssets.riskWarnings[0]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

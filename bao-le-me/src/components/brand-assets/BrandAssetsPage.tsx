'use client';

import { useApp } from '@/lib/store';
import { getRole } from '@/lib/roles';

export default function BrandAssetsPage() {
  const { brandAssets, setCurrentPage } = useApp();
  if (!brandAssets) return null;

  const role = getRole(brandAssets.role);

  return (
    <div className="px-5 py-5">
      <h2 className="text-white text-lg font-bold mb-5">品牌资产</h2>

      {/* Brand Card */}
      <div className="bg-gradient-to-br from-[#C8A97E]/10 to-[#C8A97E]/5 border border-[#C8A97E]/20 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#C8A97E]/20 flex items-center justify-center text-xl">{role.emoji}</div>
          <div>
            <h3 className="text-white text-base font-semibold">{brandAssets.businessName || '未命名品牌'}</h3>
            <p className="text-white/30 text-xs">{role.label} · {brandAssets.industry}</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentPage('onboarding')}
          className="text-[#C8A97E] text-xs hover:underline"
        >
          编辑品牌信息 →
        </button>
      </div>

      {/* Strategy */}
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
        <h3 className="text-white/50 text-xs mb-2">内容策略</h3>
        <p className="text-white/70 text-sm leading-relaxed">{brandAssets.contentStrategy}</p>
      </div>

      {/* Tone */}
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
        <h3 className="text-white/50 text-xs mb-2">内容调性</h3>
        <p className="text-white/70 text-sm">{brandAssets.tone}</p>
      </div>

      {/* Avoid */}
      {brandAssets.avoid.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
          <h3 className="text-white/50 text-xs mb-2">避雷项</h3>
          <div className="flex flex-wrap gap-1.5">
            {brandAssets.avoid.map((a, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-500/5 text-red-400/60 text-[10px] rounded-md">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useApp } from '@/lib/store';
import { getRole } from '@/lib/roles';

export default function SettingsPage() {
  const { brandAssets, setCurrentPage } = useApp();
  const role = brandAssets ? getRole(brandAssets.role) : null;

  return (
    <div className="px-5 py-5">
      <h2 className="text-white text-lg font-bold mb-5">设置</h2>

      {/* User Card */}
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#C8A97E]/10 flex items-center justify-center text-xl">
            {role?.emoji || '👤'}
          </div>
          <div className="flex-1">
            <h3 className="text-white text-sm font-semibold">{brandAssets?.businessName || '未设置'}</h3>
            <p className="text-white/30 text-xs">{role?.label || '选择身份'} · {brandAssets?.industry || '选择行业'}</p>
          </div>
          <button
            onClick={() => setCurrentPage('onboarding')}
            className="text-[#C8A97E]/60 text-xs hover:text-[#C8A97E] transition-colors"
          >
            编辑
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl overflow-hidden mb-4">
        <button
          onClick={() => setCurrentPage('brand-assets')}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-white/[0.05] text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">🏷️</span>
            <span className="text-white/70 text-sm">品牌资产</span>
          </div>
          <span className="text-white/20 text-xs">→</span>
        </button>
        <button
          onClick={() => setCurrentPage('onboarding')}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-white/[0.05] text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">🔄</span>
            <span className="text-white/70 text-sm">重新测评</span>
          </div>
          <span className="text-white/20 text-xs">→</span>
        </button>
        <button
          onClick={() => setCurrentPage('decode')}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">🔬</span>
            <span className="text-white/70 text-sm">同行拆解</span>
          </div>
          <span className="text-white/20 text-xs">→</span>
        </button>
      </div>

      {/* Upgrade */}
      <div className="bg-gradient-to-br from-[#C8A97E]/10 to-[#C8A97E]/5 border border-[#C8A97E]/20 rounded-2xl p-5 mb-4">
        <h3 className="text-[#C8A97E] text-sm font-semibold mb-1">升级高级版</h3>
        <p className="text-white/30 text-xs mb-3">无限查询 · 完整卡位 · 一键导出</p>
        <button className="px-4 py-2 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] text-xs font-bold rounded-lg">
          39元/月
        </button>
      </div>

      {/* Info */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/nacl-logo.jpeg" alt="nacl" className="w-5 h-5 rounded object-cover" />
          <span className="text-[#C8A97E] text-xs tracking-wide">nacl · 爆了没</span>
        </div>
        <p className="text-white/15 text-[10px]">你的编导脑 · 差异化卡位引擎</p>
        <p className="text-white/10 text-[10px] mt-1">v1.0.0</p>
      </div>
    </div>
  );
}

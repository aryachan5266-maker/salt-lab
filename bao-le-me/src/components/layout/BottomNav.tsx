'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { Crosshair, FileText, Gauge, Home, Layers3, MoreHorizontal, Repeat2, Settings, Sparkles, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home' as const, label: '首页', icon: Home },
  { id: 'hot-radar' as const, label: '热点', icon: Gauge },
  { id: 'positioning' as const, label: '卡位', icon: Crosshair },
  { id: 'generate' as const, label: '生成', icon: FileText },
];

const MORE_ITEMS = [
  { id: 'decode' as const, label: '同行拆解', desc: '拆竞品结构', icon: Layers3 },
  { id: 'content-loop' as const, label: '预测复盘', desc: '打盲发复升', icon: Repeat2 },
  { id: 'brand-assets' as const, label: '品牌资产', desc: '客户反推记忆', icon: Sparkles },
  { id: 'settings' as const, label: '设置', desc: '数据来源和边界', icon: Settings },
];

export default function BottomNav() {
  const { currentPage, setCurrentPage, customerProfile } = useApp();
  const [open, setOpen] = useState(false);

  const navigate = (page: typeof NAV_ITEMS[number]['id'] | typeof MORE_ITEMS[number]['id']) => {
    setCurrentPage(page);
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-[72px] z-50 rounded-[14px] border border-white/12 bg-[#07090D]/96 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/38">更多功能</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-8 place-items-center rounded-[8px] border border-white/10 text-white/48"
              aria-label="关闭更多功能"
            >
              <X size={15} />
            </button>
          </div>
          <div className="grid gap-2">
            {MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              const isLocked = !customerProfile && item.id !== 'content-loop';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => !isLocked && navigate(item.id)}
                  disabled={isLocked}
                  className="flex items-center gap-3 rounded-[10px] border border-white/8 bg-white/[0.025] p-3 text-left transition hover:border-[var(--color-accent)]/35 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <span className="grid size-10 place-items-center rounded-[9px] bg-white/[0.045] text-[var(--color-accent)]">
                    <Icon size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-white/36">{isLocked ? '先完成客户反推' : item.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#050609]/92 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isLocked = !customerProfile && item.id !== 'home';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => !isLocked && navigate(item.id)}
                disabled={isLocked}
                className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                  isLocked ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'
                } ${isActive ? 'text-[var(--color-accent)]' : 'text-white/40'}`}
              >
                <Icon size={19} />
                <span className="text-[10px] tracking-[0.08em]">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-2 left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-[var(--color-accent)]" />
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
              MORE_ITEMS.some((item) => item.id === currentPage) || open ? 'text-[var(--color-accent)]' : 'text-white/40'
            }`}
          >
            <MoreHorizontal size={19} />
            <span className="text-[10px] tracking-[0.08em]">更多</span>
            {(MORE_ITEMS.some((item) => item.id === currentPage) || open) && (
              <span className="absolute -top-2 left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-[var(--color-accent)]" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
}

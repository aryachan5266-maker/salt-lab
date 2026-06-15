'use client';

import { useApp } from '@/lib/store';

const NAV_ITEMS = [
  { id: 'home' as const, label: '首页', icon: '⬡' },
  { id: 'hot-radar' as const, label: '热点', icon: '◎' },
  { id: 'positioning' as const, label: '卡位', icon: '◆' },
  { id: 'generate' as const, label: '生成', icon: '▶' },
];

export default function BottomNav() {
  const { currentPage, setCurrentPage, customerProfile } = useApp();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#0D0D12]/95 backdrop-blur-xl border-t border-white/5 z-50">
      <div className="flex items-center justify-around py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id;
          const isLocked = !customerProfile && item.id !== 'home';
          return (
            <button
              key={item.id}
              onClick={() => !isLocked && setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                isLocked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              } ${isActive ? 'text-brand-gold' : 'text-white/40'}`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
              {isActive && (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[2px] bg-brand-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

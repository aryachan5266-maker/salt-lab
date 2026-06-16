'use client';

import { ArrowLeft } from 'lucide-react';
import { NACLLogo } from '@/components/nacl-logo';

interface NACLHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export function NACLHeader({ title, subtitle, showBack = true, onBack, rightSlot }: NACLHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) window.history.back();
    else window.location.assign('/');
  };

  return (
    <header className="sticky top-0 z-40 h-11 flex items-center justify-between px-4"
      style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B, #0E1016)' }}>
      <div className="flex min-w-0 items-center gap-2.5">
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="返回上一页"
            title="返回上一页"
            className="flex h-9 min-w-9 shrink-0 items-center justify-center gap-1 rounded-sm px-2 text-[10px] text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回</span>
          </button>
        )}
        <NACLLogo size="xs" />
        <span className="shrink-0 text-[10px] font-medium" style={{ color: '#8A94A6' }}>{title}</span>
        {subtitle && <span className="hidden truncate text-[9px] font-mono sm:inline" style={{ color: '#5A6273' }}>{subtitle}</span>}
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </header>
  );
}

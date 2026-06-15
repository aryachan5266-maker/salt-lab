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
  return (
    <header className="sticky top-0 z-40 h-11 flex items-center justify-between px-4"
      style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B, #0E1016)' }}>
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button onClick={onBack || (() => window.history.back())}
            className="text-on-surface-variant hover:text-on-surface transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        )}
        <NACLLogo size="xs" />
        <span className="text-[10px] font-medium" style={{ color: '#8A94A6' }}>{title}</span>
        {subtitle && <span className="text-[9px] font-mono" style={{ color: '#5A6273' }}>{subtitle}</span>}
      </div>
      {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}
    </header>
  );
}

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Home } from 'lucide-react';

interface ComingSoonPanelProps {
  icon: ReactNode;
  title: string;
  description: string;
  note?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function ComingSoonPanel({
  icon,
  title,
  description,
  note = '该模块正在接入，先用已跑通的生成链路完成当前任务',
  secondaryHref,
  secondaryLabel,
}: ComingSoonPanelProps) {
  return (
    <div className="metal-panel rounded-lg p-6 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-[rgba(140,150,165,0.18)] bg-[rgba(140,150,165,0.04)] text-on-surface-weakest">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-medium text-on-surface">{title}</h2>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
      <p className="mx-auto mt-2 max-w-md text-xs font-mono text-on-surface-weakest">{note}</p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href="/" className="hud-btn-primary rounded-sm px-4 py-2 text-xs font-medium">
          <span className="inline-flex items-center justify-center gap-1.5">
            <Home className="h-3.5 w-3.5" />
            回首页生成
          </span>
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref} className="hud-btn-ghost rounded-sm px-4 py-2 text-xs font-medium">
            <span className="inline-flex items-center justify-center gap-1.5">
              {secondaryLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

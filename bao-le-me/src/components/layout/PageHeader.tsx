'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { PageKey } from '@/lib/types';
import { useApp } from '@/lib/store';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
  };
  next?: {
    label: string;
    page: PageKey;
  };
}

export function PageHeader({ eyebrow, title, description, icon: Icon, action, next }: PageHeaderProps) {
  const { canGoBack, goBack, setCurrentPage } = useApp();
  const ActionIcon = action?.icon;

  return (
    <header className="rounded-[12px] border border-white/10 bg-white/[0.025] p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-black/18 px-3 py-2 text-xs font-semibold text-white/52 transition hover:border-white/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={14} />
          返回
        </button>
        {next && (
          <button
            type="button"
            onClick={() => setCurrentPage(next.page)}
            className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--color-accent)]/28 bg-[var(--color-accent)]/10 px-3 py-2 text-xs font-semibold text-[var(--color-accent)] transition hover:border-[var(--color-accent)]/55 hover:bg-[var(--color-accent)]/16"
          >
            {next.label}
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            {Icon && (
              <span className="grid size-9 place-items-center rounded-[8px] border border-[var(--color-accent)]/28 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <Icon size={17} />
              </span>
            )}
            <p className="nacl-kicker">{eyebrow}</p>
          </div>
          <h1 className="nacl-title text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/46">{description}</p>
        </div>

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/58 transition hover:border-[var(--color-accent)]/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ActionIcon && <ActionIcon size={15} className={action.loading ? 'animate-spin' : ''} />}
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
}

export function StepHint({ label, page }: { label: string; page: PageKey }) {
  const { setCurrentPage } = useApp();

  return (
    <button
      type="button"
      onClick={() => setCurrentPage(page)}
      className="flex w-full items-center justify-between rounded-[10px] border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-4 text-left transition hover:border-[var(--color-accent)]/45 hover:bg-[var(--color-accent)]/12"
    >
      <span>
        <span className="block text-xs font-semibold tracking-[0.18em] text-white/34">下一步</span>
        <span className="mt-1 block text-sm font-semibold text-[var(--color-accent)]">{label}</span>
      </span>
      <ArrowRight size={17} className="text-[var(--color-accent)]" />
    </button>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null;

  return (
    <div className="rounded-[10px] border border-red-400/22 bg-red-500/[0.055] p-4">
      <p className="text-sm leading-6 text-red-200">{message}</p>
      <p className="mt-1 text-xs leading-5 text-white/42">可以重试；如果仍失败，系统会保留当前页面和已生成内容。</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-[8px] border border-red-300/24 px-3 py-2 text-xs font-semibold text-red-100 transition hover:border-red-200/40 hover:bg-red-300/10"
        >
          重试
        </button>
      )}
    </div>
  );
}

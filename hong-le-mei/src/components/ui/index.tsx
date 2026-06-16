// UI 原子组件统一导出
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Button } from './button';
export { Badge } from './badge';
export { Skeleton } from './skeleton';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Progress } from './progress';
export { Separator } from './separator';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Input } from './input';
export { Textarea } from './textarea';
export { Label } from './label';

// 自定义扩展组件
import * as React from 'react';
import Link from 'next/link';

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 && (
          <Link
            href="/"
            className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-950/70 px-3 text-sm text-zinc-400 transition hover:border-rose-500/40 hover:text-zinc-100"
          >
            <span aria-hidden="true">←</span>
            <span>返回</span>
          </Link>
        )}
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mb-1 text-xs text-zinc-500">
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1 text-zinc-700">/</span>}
                {b}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-zinc-200">{children}</h3>
      {right}
    </div>
  );
}

export function Tag({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-xs text-zinc-300">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 text-zinc-500 hover:text-rose-400">
          ×
        </button>
      )}
    </span>
  );
}

export function Empty({ text = '暂无数据' }: { text?: string }) {
  return <div className="py-12 text-center text-sm text-zinc-500">{text}</div>;
}

export function MiniBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-zinc-500">
        <span>{label}</span>
        <span className="font-mono text-rose-300">{value}</span>
      </div>
      <div className="mt-0.5 h-1 overflow-hidden rounded bg-zinc-800">
        <div
          className="h-full bg-gradient-to-r from-rose-600 to-amber-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

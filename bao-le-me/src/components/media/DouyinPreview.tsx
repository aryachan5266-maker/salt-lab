'use client';

import { CheckCircle2, Play, ShieldCheck } from 'lucide-react';
import { SAMPLE_VIDEO } from '@/lib/demo-media';

interface DouyinPreviewProps {
  title?: string;
  subtitle?: string;
  cover?: string;
  source?: string;
}

export function DouyinPreview({
  title = SAMPLE_VIDEO.title,
  subtitle = SAMPLE_VIDEO.subtitle,
  cover = SAMPLE_VIDEO.cover,
  source = '本地样例 · 非实时平台数据',
}: DouyinPreviewProps) {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute -inset-4 rounded-[38px] bg-[var(--color-accent)]/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[34px] border border-white/14 bg-[#05070a] p-3 shadow-[0_28px_100px_rgba(0,0,0,0.46)]">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-black">
          <div className="relative aspect-[9/16]">
            <img src={cover} alt="抖音封面样例" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.2)_48%,rgba(0,0,0,0.76))]" />
            <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-black/35 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-white/72 backdrop-blur">
              LOCAL VIDEO MOCK
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid size-16 place-items-center rounded-full border border-white/30 bg-white/12 text-white backdrop-blur">
                <Play size={26} fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-2xl font-black leading-tight text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/62">{subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SAMPLE_VIDEO.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/12 px-2 py-1 text-[10px] text-white/78">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-white/36">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-[var(--color-accent)]" />
            {source}
          </span>
          <span>9:16</span>
        </div>
      </div>
    </div>
  );
}

export function StoryboardStrip() {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      {SAMPLE_VIDEO.beats.map((beat) => (
        <div key={beat.time} className="rounded-[10px] border border-white/10 bg-black/18 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[var(--color-accent)]/12 px-2 py-1 text-[10px] font-bold text-[var(--color-accent)]">
              {beat.time}
            </span>
            <CheckCircle2 size={14} className="text-white/32" />
          </div>
          <h3 className="text-sm font-semibold text-white">{beat.label}</h3>
          <p className="mt-2 text-xs leading-5 text-white/46">{beat.text}</p>
        </div>
      ))}
    </div>
  );
}

export function DeliverableGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
      {SAMPLE_VIDEO.deliverables.map((item) => (
        <div key={item.label} className="rounded-[12px] border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-accent)]">{item.label}</p>
          <p className="mt-3 text-sm leading-6 text-white/62">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

'use client';

import { BarChart3 } from 'lucide-react';

export default function DataReviewPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-5"
        style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B, #0E1016)' }}>
        <span className="font-display text-sm font-bold tracking-[0.15em] metal-text">数据复盘</span>
      </header>
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <div className="metal-panel rounded-lg p-12 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-on-surface-weakest mx-auto" />
          <h2 className="text-lg text-on-surface font-medium">数据复盘</h2>
          <p className="text-sm text-on-surface-variant">盯盘式数据看板、趋势分析、AI 洞察</p>
          <p className="text-xs text-on-surface-weakest font-mono">功能开发中</p>
        </div>
      </main>
    </div>
  );
}

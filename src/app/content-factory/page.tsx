'use client';

import { Zap, LayoutTemplate, Calendar, Search } from 'lucide-react';

export default function ContentFactoryPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-5"
        style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B, #0E1016)' }}>
        <span className="font-display text-sm font-bold tracking-[0.15em] metal-text">内容工厂</span>
      </header>
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <div className="metal-panel rounded-lg p-12 text-center space-y-3">
          <LayoutTemplate className="w-10 h-10 text-on-surface-weakest mx-auto" />
          <h2 className="text-lg text-on-surface font-medium">内容工厂</h2>
          <p className="text-sm text-on-surface-variant">批量生成、模板管理、内容排期</p>
          <p className="text-xs text-on-surface-weakest font-mono">功能开发中，请先使用首页「一键生成」</p>
        </div>
      </main>
    </div>
  );
}

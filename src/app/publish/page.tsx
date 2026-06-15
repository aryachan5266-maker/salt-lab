'use client';

import { Send } from 'lucide-react';
import { NACLHeader } from '@/components/nacl-header';

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="发布管理" subtitle="发布队列·平台账号·日历" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <div className="metal-panel rounded-lg p-12 text-center space-y-3">
          <Send className="w-10 h-10 text-on-surface-weakest mx-auto" />
          <h2 className="text-lg text-on-surface font-medium">发布管理</h2>
          <p className="text-sm text-on-surface-variant">发布队列、平台账号、发布日历</p>
          <p className="text-xs text-on-surface-weakest font-mono">功能开发中</p>
        </div>
      </main>
    </div>
  );
}

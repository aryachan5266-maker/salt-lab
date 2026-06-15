'use client';

import { BookOpen } from 'lucide-react';
import { NACLHeader } from '@/components/nacl-header';

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="知识库" subtitle="营销知识·爆款拆解·话术模板" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <div className="metal-panel rounded-lg p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-on-surface-weakest mx-auto" />
          <h2 className="text-lg text-on-surface font-medium">知识库</h2>
          <p className="text-sm text-on-surface-variant">营销知识沉淀、爆款拆解、话术模板</p>
          <p className="text-xs text-on-surface-weakest font-mono">功能开发中</p>
        </div>
      </main>
    </div>
  );
}

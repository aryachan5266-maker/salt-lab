'use client';

import { BookOpen } from 'lucide-react';
import { ComingSoonPanel } from '@/components/coming-soon-panel';
import { NACLHeader } from '@/components/nacl-header';

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="知识库" subtitle="营销知识·爆款拆解·话术模板" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <ComingSoonPanel
          icon={<BookOpen className="h-8 w-8" />}
          title="知识库"
          description="营销知识沉淀、爆款拆解、话术模板"
          secondaryHref="/knowledge"
          secondaryLabel="打开可用知识库"
        />
      </main>
    </div>
  );
}

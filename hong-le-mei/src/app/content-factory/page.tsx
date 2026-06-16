'use client';

import { LayoutTemplate } from 'lucide-react';
import { ComingSoonPanel } from '@/components/coming-soon-panel';
import { NACLHeader } from '@/components/nacl-header';

export default function ContentFactoryPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="内容工厂" subtitle="批量生成·模板·排期" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <ComingSoonPanel
          icon={<LayoutTemplate className="h-8 w-8" />}
          title="内容工厂"
          description="批量生成、模板管理、内容排期"
          note="批量能力还在接入，当前先用首页一键生成完成单条内容闭环"
          secondaryHref="/topic-engine"
          secondaryLabel="先找选题"
        />
      </main>
    </div>
  );
}

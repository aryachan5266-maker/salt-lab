'use client';

import { Send } from 'lucide-react';
import { ComingSoonPanel } from '@/components/coming-soon-panel';
import { NACLHeader } from '@/components/nacl-header';

export default function PublishPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="发布管理" subtitle="发布队列·平台账号·日历" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <ComingSoonPanel
          icon={<Send className="h-8 w-8" />}
          title="发布管理"
          description="发布队列、平台账号、发布日历"
          secondaryHref="/analytics"
          secondaryLabel="查看数据复盘"
        />
      </main>
    </div>
  );
}

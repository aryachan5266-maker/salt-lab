'use client';

import { BarChart3 } from 'lucide-react';
import { ComingSoonPanel } from '@/components/coming-soon-panel';
import { NACLHeader } from '@/components/nacl-header';

export default function DataReviewPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="数据复盘" subtitle="盯盘看板·趋势·AI洞察" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <ComingSoonPanel
          icon={<BarChart3 className="h-8 w-8" />}
          title="数据复盘"
          description="盯盘式数据看板、趋势分析、AI 洞察"
          secondaryHref="/analytics"
          secondaryLabel="查看现有复盘"
        />
      </main>
    </div>
  );
}

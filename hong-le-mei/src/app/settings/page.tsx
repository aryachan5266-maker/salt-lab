'use client';

import { Settings } from 'lucide-react';
import { ComingSoonPanel } from '@/components/coming-soon-panel';
import { NACLHeader } from '@/components/nacl-header';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="系统设置" subtitle="资料·偏好·品牌" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <ComingSoonPanel
          icon={<Settings className="h-8 w-8" />}
          title="系统设置"
          description="个人资料、生成偏好、品牌设置"
          secondaryHref="/brand-assets"
          secondaryLabel="管理品牌资产"
        />
      </main>
    </div>
  );
}

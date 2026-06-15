'use client';

import { Settings } from 'lucide-react';
import { NACLHeader } from '@/components/nacl-header';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="系统设置" subtitle="资料·偏好·品牌" />
      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        <div className="metal-panel rounded-lg p-12 text-center space-y-3">
          <Settings className="w-10 h-10 text-on-surface-weakest mx-auto" />
          <h2 className="text-lg text-on-surface font-medium">系统设置</h2>
          <p className="text-sm text-on-surface-variant">个人资料、生成偏好、品牌设置</p>
          <p className="text-xs text-on-surface-weakest font-mono">功能开发中</p>
        </div>
      </main>
    </div>
  );
}

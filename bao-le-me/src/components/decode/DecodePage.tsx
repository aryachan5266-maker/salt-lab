'use client';

import { useState } from 'react';
import { Layers3, RefreshCw } from 'lucide-react';
import { useApp } from '@/lib/store';
import type { BenchmarkAccount } from '@/lib/types';
import { ErrorNotice, PageHeader, StepHint } from '@/components/layout/PageHeader';

const DEMO_ACCOUNTS: BenchmarkAccount[] = [
  { id: '1', name: '同城测评型账号', avatar: '', followers: '示例，不代表真实粉丝', avgPlays: '示例，不代表真实播放', engagementRate: '示例，不代表真实互动', topVideoTitle: '这个价位到底值不值', contentStyle: '测评对比型', source: '示例数据', isDemo: true },
  { id: '2', name: '门店日常型账号', avatar: '', followers: '示例，不代表真实粉丝', avgPlays: '示例，不代表真实播放', engagementRate: '示例，不代表真实互动', topVideoTitle: '精品门店老板的一天', contentStyle: 'Vlog记录型', source: '示例数据', isDemo: true },
  { id: '3', name: '知识教学型账号', avatar: '', followers: '示例，不代表真实粉丝', avgPlays: '示例，不代表真实播放', engagementRate: '示例，不代表真实互动', topVideoTitle: '新手入门教程', contentStyle: '知识教学型', source: '示例数据', isDemo: true },
];

export default function DecodePage() {
  const { brandAssets } = useApp();
  const [accounts, setAccounts] = useState<BenchmarkAccount[]>(DEMO_ACCOUNTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBenchmarks = async () => {
    if (!brandAssets) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/douyin/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: brandAssets.industry,
          city: brandAssets.city,
          storeType: brandAssets.storeType,
          priceRange: brandAssets.priceRange,
          targetAudience: brandAssets.targetAudience,
          role: brandAssets.role,
          occupation: brandAssets.occupation,
        }),
      });
      if (!res.ok) throw new Error('获取竞品失败');
      const data = await res.json();
      if (data.accounts && data.accounts.length > 0) {
        setAccounts(data.accounts);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="BENCHMARK DECODE"
        title="同行拆解"
        description="拆内容结构，不复刻账号数字。没有真实来源时只展示定性样例，避免把示例包装成平台实测。"
        icon={Layers3}
        action={{
          label: loading ? '分析中' : '刷新竞品数据',
          onClick: fetchBenchmarks,
          disabled: loading || !brandAssets,
          loading,
          icon: RefreshCw,
        }}
        next={{ label: '去做差异化卡位', page: 'positioning' }}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {accounts.map(account => (
          <div key={account.id} className="nacl-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="grid size-10 place-items-center rounded-[8px] border border-white/10 bg-white/[0.035] text-[var(--color-accent)]">
                <Layers3 size={17} />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-sm font-semibold">{account.name}</h3>
                <p className="text-white/30 text-xs">{account.contentStyle}</p>
              </div>
            </div>
            <div className="mb-3 grid gap-2 text-xs text-white/38">
              <p>{account.followers}</p>
              <p>{account.avgPlays}</p>
              <p>{account.engagementRate}</p>
            </div>
            <div className="rounded-[8px] bg-white/[0.025] p-3">
              <p className="text-white/30 text-[10px] mb-1">爆款视频</p>
              <p className="text-white/60 text-xs">{account.topVideoTitle}</p>
            </div>
            {account.isDemo && (
              <p className="text-[#A9B8C8]/40 text-[10px] mt-2">示例数据 · 来源: {account.source}</p>
            )}
          </div>
        ))}
      </div>
      <StepHint label="用同行结构反推出自己的差异化空位" page="positioning" />
      <ErrorNotice message={error} onRetry={fetchBenchmarks} />
    </div>
  );
}

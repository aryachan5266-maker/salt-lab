'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import type { BenchmarkAccount } from '@/lib/types';

const DEMO_ACCOUNTS: BenchmarkAccount[] = [
  { id: '1', name: '张大大爱测评', avatar: '', followers: '128.5万', avgPlays: '56.3万', engagementRate: '8.2%', topVideoTitle: '这个价位的咖啡机到底值不值', contentStyle: '测评对比型', source: '示例数据', isDemo: true },
  { id: '2', name: '小美的咖啡日记', avatar: '', followers: '45.2万', avgPlays: '23.1万', engagementRate: '12.5%', topVideoTitle: '精品咖啡店老板的一天', contentStyle: 'Vlog记录型', source: '示例数据', isDemo: true },
  { id: '3', name: '咖啡老陈', avatar: '', followers: '89.7万', avgPlays: '34.8万', engagementRate: '6.7%', topVideoTitle: '手冲入门教程｜5分钟学会', contentStyle: '知识教学型', source: '示例数据', isDemo: true },
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
          targetAudience: brandAssets.targetAudience,
          role: brandAssets.role,
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
    <div className="px-5 py-5">
      <h2 className="text-white text-lg font-bold mb-1">同行拆解</h2>
      <p className="text-white/30 text-xs mb-5">分析竞品爆款逻辑，找到差异化切入点</p>

      <div className="space-y-3">
        {accounts.map(account => (
          <div key={account.id} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 text-sm">
                {account.name[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-white text-sm font-semibold">{account.name}</h3>
                <p className="text-white/30 text-xs">{account.followers}粉丝 · {account.contentStyle}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <p className="text-white text-sm font-bold tabular-nums">{account.avgPlays}</p>
                <p className="text-white/20 text-[10px]">均播</p>
              </div>
              <div className="text-center">
                <p className="text-[#00B894] text-sm font-bold tabular-nums">{account.engagementRate}</p>
                <p className="text-white/20 text-[10px]">互动率</p>
              </div>
              <div className="text-center">
                <p className="text-[#C8A97E] text-sm font-bold tabular-nums">{account.contentStyle}</p>
                <p className="text-white/20 text-[10px]">风格</p>
              </div>
            </div>
            <div className="bg-white/[0.02] rounded-xl p-3">
              <p className="text-white/30 text-[10px] mb-1">爆款视频</p>
              <p className="text-white/60 text-xs">{account.topVideoTitle}</p>
            </div>
            {account.isDemo && (
              <p className="text-[#FDCB6E]/40 text-[10px] mt-2">示例数据 · 来源: {account.source}</p>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={fetchBenchmarks}
        disabled={loading}
        className="w-full mt-5 py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/40 text-sm hover:border-[#C8A97E]/20 transition-colors disabled:opacity-50"
      >
        {loading ? '分析中...' : '刷新竞品数据'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}

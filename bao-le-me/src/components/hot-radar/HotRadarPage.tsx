'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Minus, RefreshCw } from 'lucide-react';
import { useApp } from '@/lib/store';
import type { HotTopic } from '@/lib/types';
import { ErrorNotice, PageHeader, StepHint } from '@/components/layout/PageHeader';

// Demo data — 标注来源
const DEMO_TOPICS: HotTopic[] = [
  { id: '1', title: '早C晚A新搭配，敏感肌救星', heat: 98, trend: 'up', category: '美妆', tags: ['#早C晚A', '#敏感肌', '#护肤'], source: '示例数据', isDemo: true },
  { id: '2', title: '打工人的5分钟快手早餐', heat: 92, trend: 'up', category: '美食', tags: ['#快手早餐', '#打工人', '#5分钟'], source: '示例数据', isDemo: true },
  { id: '3', title: '2026年小户型收纳终极方案', heat: 87, trend: 'up', category: '家居', tags: ['#小户型', '#收纳', '#改造'], source: '示例数据', isDemo: true },
  { id: '4', title: '健身房不会告诉你的3件事', heat: 83, trend: 'stable', category: '健身', tags: ['#健身', '#避坑', '#私教'], source: '示例数据', isDemo: true },
  { id: '5', title: '咖啡店老板的一天vlog', heat: 78, trend: 'up', category: '餐饮', tags: ['#咖啡店', '#创业', '#vlog'], source: '示例数据', isDemo: true },
];

export default function HotRadarPage() {
  const { brandAssets } = useApp();
  const [topics, setTopics] = useState<HotTopic[]>(DEMO_TOPICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHotTopics = async () => {
    if (!brandAssets) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/douyin/hot', {
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
      if (!res.ok) throw new Error('获取热点失败');
      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        setTopics(data.topics);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '获取失败');
    } finally {
      setLoading(false);
    }
  };

  const TrendIcon = ({ trend }: { trend: HotTopic['trend'] }) => {
    if (trend === 'up') return <ArrowUp size={13} />;
    if (trend === 'down') return <ArrowDown size={13} />;
    return <Minus size={13} />;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="HOT RADAR"
        title="热点雷达"
        description="先筛趋势，再判断它是否适合你的真实客户。这里不承诺平台热度，只给可拍方向和来源标注。"
        icon={RefreshCw}
        action={{
          label: loading ? '获取中' : '刷新热点',
          onClick: fetchHotTopics,
          disabled: loading || !brandAssets,
          loading,
          icon: RefreshCw,
        }}
        next={{ label: '去做卡位分析', page: 'positioning' }}
      />

      {brandAssets && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="px-2.5 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] rounded-lg">{brandAssets.city || brandAssets.industry}</span>
          <span className="px-2.5 py-1 bg-white/[0.03] text-white/40 text-[10px] rounded-lg">{brandAssets.storeType || brandAssets.industry}</span>
          {brandAssets.targetAudience.slice(0, 2).map((a, i) => (
            <span key={i} className="px-2.5 py-1 bg-white/[0.03] text-white/40 text-[10px] rounded-lg">{a}</span>
          ))}
        </div>
      )}

      {/* Topics */}
      <div className="grid gap-3 lg:grid-cols-2">
        {topics.map((topic, idx) => (
          <div key={topic.id} className="nacl-card p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[var(--color-accent)] font-bold text-lg tabular-nums w-6">{idx + 1}</span>
                <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                  topic.trend === 'up' ? 'bg-[#00B894]/10 text-[#00B894]' :
                  topic.trend === 'down' ? 'bg-red-500/10 text-red-400' :
                  'bg-white/5 text-white/30'
                }`}>
                  <TrendIcon trend={topic.trend} /> {topic.trend === 'up' ? '上升' : topic.trend === 'down' ? '下降' : '稳定'}
                </span>
              </div>
              <span className="text-white/20 text-xs">AI热度样例 {topic.heat}</span>
            </div>
            <h3 className="text-white text-sm font-medium mb-2">{topic.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {topic.tags.map((tag, i) => (
                <span key={i} className="text-[var(--color-accent)]/60 text-[10px]">{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/15 text-[10px]">来源: {topic.source}</span>
              {topic.isDemo && (
                <span className="text-[#A9B8C8]/50 text-[10px]">示例数据</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <StepHint label="拿这些热点去找不撞车的差异化角度" page="positioning" />
      <ErrorNotice message={error} onRetry={fetchHotTopics} />
    </div>
  );
}

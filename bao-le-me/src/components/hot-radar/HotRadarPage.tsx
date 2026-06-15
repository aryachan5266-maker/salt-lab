'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import type { HotTopic } from '@/lib/types';

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
          targetAudience: brandAssets.targetAudience,
          role: brandAssets.role,
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

  return (
    <div className="px-5 py-5">
      <h2 className="text-white text-lg font-bold mb-1">热点雷达</h2>
      <p className="text-white/30 text-xs mb-5">基于你的客户画像，发现匹配的热点方向</p>

      {brandAssets && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="px-2.5 py-1 bg-[#C8A97E]/10 text-[#C8A97E] text-[10px] rounded-lg">{brandAssets.industry}</span>
          {brandAssets.targetAudience.slice(0, 2).map((a, i) => (
            <span key={i} className="px-2.5 py-1 bg-white/[0.03] text-white/40 text-[10px] rounded-lg">{a}</span>
          ))}
        </div>
      )}

      {/* Topics */}
      <div className="space-y-3">
        {topics.map((topic, idx) => (
          <div key={topic.id} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#C8A97E] font-bold text-lg tabular-nums w-6">{idx + 1}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  topic.trend === 'up' ? 'bg-[#00B894]/10 text-[#00B894]' :
                  topic.trend === 'down' ? 'bg-red-500/10 text-red-400' :
                  'bg-white/5 text-white/30'
                }`}>
                  {topic.trend === 'up' ? '↑' : topic.trend === 'down' ? '↓' : '→'} {topic.trend === 'up' ? '上升' : topic.trend === 'down' ? '下降' : '稳定'}
                </span>
              </div>
              <span className="text-white/20 text-xs">{topic.heat}热度</span>
            </div>
            <h3 className="text-white text-sm font-medium mb-2">{topic.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {topic.tags.map((tag, i) => (
                <span key={i} className="text-[#C8A97E]/60 text-[10px]">{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/15 text-[10px]">来源: {topic.source}</span>
              {topic.isDemo && (
                <span className="text-[#FDCB6E]/50 text-[10px]">示例数据</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Refresh */}
      <button
        onClick={fetchHotTopics}
        disabled={loading}
        className="w-full mt-5 py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/40 text-sm hover:border-[#C8A97E]/20 transition-colors disabled:opacity-50"
      >
        {loading ? '获取中...' : '刷新热点'}
      </button>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}

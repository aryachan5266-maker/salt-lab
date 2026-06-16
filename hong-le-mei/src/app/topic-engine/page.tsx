'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react';
import { NACLHeader } from '@/components/nacl-header';
import { useToast } from '@/components/store';

const MOCK_HOT_TOPICS = [
  { title: '冬季护肤三件套', industry: '美妆', heat: 98200, change: 12.5, trend: 'up' as const },
  { title: '年夜饭预制菜', industry: '餐饮', heat: 87600, change: 8.3, trend: 'up' as const },
  { title: '春节旅游攻略', industry: '文旅', heat: 76500, change: -3.2, trend: 'down' as const },
  { title: '新年健身计划', industry: '健身', heat: 65400, change: 5.7, trend: 'up' as const },
  { title: '开年招人难', industry: '教育', heat: 54300, change: -1.8, trend: 'down' as const },
];

const MOCK_AI_SUGGESTIONS = [
  { title: '冬季干皮救恩！这3款面霜让我告别起皮', score: 92, platform: '小红书', hook: '痛点共鸣+解决方案' },
  { title: '过年回家被问工资？用这招秒杀亲戚', score: 88, platform: '抖音', hook: '情感共鸣+实用话术' },
  { title: '开年第一单！3个获客技巧让你接单到手软', score: 85, platform: '小红书', hook: '利益驱动+方法拆解' },
];

export default function TopicEnginePage() {
  const [filter, setFilter] = useState('全部');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('刚刚');
  const toast = useToast();

  const visibleTopics = filter === '全部'
    ? MOCK_HOT_TOPICS
    : MOCK_HOT_TOPICS.filter((topic) => topic.industry === filter);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
      setRefreshing(false);
      toast.show('热点数据已刷新（演示数据）', 'success');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="选题引擎" subtitle="热点·AI推荐·排期"
        rightSlot={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="hud-btn-ghost px-3 py-1.5 text-xs font-mono rounded-sm flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中' : '刷新数据'}
          </button>
        }
      />

      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full space-y-6">
        {/* 热点追踪 */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-[10px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>HOT TOPICS</div>
            <div className="text-[10px] font-mono text-on-surface-weakest">UPDATED {lastUpdated}</div>
          </div>
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {['全部', '美妆', '餐饮', '教育', '文旅', '健身'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`hud-tag ${filter === f ? 'hud-tag-active' : ''}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {visibleTopics.map((topic, i) => (
              <div key={i} className="metal-panel hud-clip-tr rounded-sm p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs text-on-surface font-medium">{topic.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="hud-tag text-[9px]">{topic.industry}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold" style={{ color: topic.trend === 'up' ? '#FF3B5C' : '#15E0A0' }}>
                    {(topic.heat / 1000).toFixed(1)}K
                  </div>
                  <div className="flex items-center justify-end gap-0.5 text-[10px] font-mono"
                    style={{ color: topic.trend === 'up' ? '#FF3B5C' : '#15E0A0' }}>
                    {topic.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {topic.change > 0 ? '+' : ''}{topic.change}%
                  </div>
                </div>
              </div>
            ))}
            {visibleTopics.length === 0 && (
              <div className="metal-panel rounded-sm p-4 text-xs text-on-surface-variant">
                当前分类暂无热点，切回「全部」查看可用选题。
              </div>
            )}
          </div>
        </section>

        {/* AI 选题推荐 */}
        <section>
          <div className="text-[10px] font-mono tracking-widest mb-3" style={{ color: '#21E6C1' }}>AI SUGGESTIONS</div>
          <div className="space-y-2">
            {MOCK_AI_SUGGESTIONS.map((s, i) => (
              <div key={i} className="metal-panel rounded-sm p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm text-on-surface">{s.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="hud-tag text-[9px]">{s.platform}</span>
                    <span className="text-[10px] text-on-surface-variant">钩子: {s.hook}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-sm font-bold" style={{ color: '#FF3B5C' }}>{s.score}</div>
                  <a href={`/generate?role=operator&q=${encodeURIComponent(s.title)}`}
                    className="hud-btn-primary px-3 py-1.5 rounded-sm text-[10px] flex items-center gap-1">
                    一键生成 <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

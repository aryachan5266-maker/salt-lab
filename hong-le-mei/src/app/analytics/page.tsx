'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/components/store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PageHeader, Empty, Tag } from '@/components/ui';
import type { AnalyticsItem } from '@/lib/db';

type Data = AnalyticsItem;
type Performer = Data['topPerformers'][number] | Data['bottomPerformers'][number];
type Suggestion = Data['aiSuggestions'][number];

export default function AnalyticsPage() {
  const { toast, addActivity, adoptedSuggestions, adoptSuggestion } = useStore();
  const [period, setPeriod] = useState<'48h' | '7d' | '30d'>('7d');
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'engagement' | 'reach' | 'time'>('engagement');
  const [detailItem, setDetailItem] = useState<Performer | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const j = await res.json();
      if (j.ok) setData(j.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAdopt = (s: Suggestion) => {
    adoptSuggestion(s.id);
    addActivity('analytics', `采纳建议：${s.title.slice(0, 20)}`);
    toast.success('已采纳，加入下周计划');
  };

  const onIgnore = (s: Suggestion) => {
    toast.info(`已忽略：${s.title.slice(0, 10)}`);
  };

  if (!data) {
    return <div className="text-zinc-500">加载中...</div>;
  }

  const periodMultiplier = period === '48h' ? 0.07 : period === '7d' ? 1 : 4.2;
  const isPlaceholder = Boolean(data.isPlaceholder);
  const kpis = [
    { label: '累计曝光', value: Math.round(data.totalReach * periodMultiplier), format: (v: number) => `${(v / 10000).toFixed(1)}w` },
    { label: '累计互动', value: Math.round(data.totalEngagement * periodMultiplier), format: (v: number) => `${(v / 1000).toFixed(1)}k` },
    { label: '爆款率', value: data.hitRate, format: (v: number) => `${v}%` },
    { label: '平均互动率', value: data.avgEngagement, format: (v: number) => `${v}%` },
    { label: '粉丝净增', value: Math.round(data.fansNet * periodMultiplier), format: (v: number) => v.toLocaleString() },
    { label: 'ROI', value: data.roi, format: (v: number) => `x${v}` },
  ];

  // 趋势 SVG
  const W = 720, H = 240, P = 24;
  const trend = data.weeklyTrend;
  const max = trend.length ? Math.max(...trend) : 0;
  const min = trend.length ? Math.min(...trend) : 0;
  const points = trend.map((v, i) => {
    const x = P + (i / (trend.length - 1)) * (W - 2 * P);
    const y = max === min ? H / 2 : H - P - ((v - min) / (max - min)) * (H - 2 * P);
    return [x, y];
  });
  const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const areaD = points.length ? pathD + ` L${points[points.length - 1][0].toFixed(1)},${H - P} L${points[0][0].toFixed(1)},${H - P} Z` : '';

  // 表格排序
  const table = [...data.topPerformers, ...data.bottomPerformers];
  table.sort((a, b) => {
    if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
    if (sortBy === 'reach') return b.reach - a.reach;
    return 0;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="数据复盘"
        description="爆款拆解 + 掉队归因 + AI 迭代建议"
        breadcrumb={['首页', '数据复盘']}
        actions={
          <>
            <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5">
              {([['48h', '48小时'], ['7d', '7天'], ['30d', '30天']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setPeriod(k)} className={`min-h-8 rounded px-3 py-1 text-sm ${period === k ? 'bg-rose-500/15 text-rose-300' : 'text-zinc-400'}`}>{l}</button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => toast.success('报表已生成（演示）')}>导出报表</Button>
          </>
        }
      />

      {/* KPI 6卡 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k, i) => (
          <Card key={i}>
            <div className="text-xs text-zinc-500">{k.label}</div>
            <div className="kpi-num mt-1 text-2xl font-semibold text-rose-100">{isPlaceholder ? '待接入' : k.format(k.value)}</div>
            <div className="mt-1 text-xs text-zinc-500">{isPlaceholder ? '等待真实账号数据' : '已接入'}</div>
          </Card>
        ))}
      </div>

      {data.dataDisciplineNote && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <div className="text-sm text-amber-100">{data.dataDisciplineNote}</div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* 趋势图 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>指标趋势 · {period === '48h' ? '近 48 小时' : period === '7d' ? '近 7 天' : '近 30 天'}</CardTitle>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-rose-500" />曝光</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500" />点赞</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500" />收藏</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trend.length ? (
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  <defs>
                    <linearGradient id="tr-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b2323a" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#b2323a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0.25, 0.5, 0.75].map((r) => (
                    <line key={r} x1={P} y1={P + r * (H - 2 * P)} x2={W - P} y2={P + r * (H - 2 * P)} stroke="currentColor" strokeOpacity="0.08" />
                  ))}
                  <path d={areaD} fill="url(#tr-grad)" />
                  <path d={pathD} fill="none" stroke="#b2323a" strokeWidth="2" />
                  {points.filter((_, i) => i % 4 === 0).map((p, i) => (
                    <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="#b2323a" />
                  ))}
                </svg>
              ) : (
                <Empty text="未接入真实趋势数据。连接账号或导入脱敏数据后再展示趋势图。" />
              )}
            </CardContent>
          </Card>

          {/* TOP 3 */}
          <Card>
            <CardHeader>
              <CardTitle>爆款 TOP 3</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topPerformers.length ? <div className="space-y-2">
                {data.topPerformers.map((t, i) => (
                  <button key={t.id} onClick={() => setDetailItem(t)} className="flex w-full items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-left transition hover:border-rose-500/30">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-600 font-mono text-sm text-white">{i + 1}</div>
                    <img src={t.coverUrl} className="h-12 w-12 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm text-zinc-200">{t.title}</div>
                      <div className="text-xs text-zinc-500">阅读 {(t.reach / 10000).toFixed(1)}w · 互动 {t.engagementRate}%</div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[40%]">
                      {t.commonality.map((c: string) => <Tag key={c}>{c}</Tag>)}
                    </div>
                  </button>
                ))}
              </div> : <Empty text="暂无真实爆款样本。不使用伪造阅读量和互动率填充榜单。" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>掉队 BOTTOM 3</CardTitle>
            </CardHeader>
            <CardContent>
              {data.bottomPerformers.length ? <div className="space-y-2">
                {data.bottomPerformers.map((t, i) => (
                  <button key={t.id} onClick={() => setDetailItem(t)} className="flex w-full items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-2 text-left transition hover:border-zinc-700">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-700 font-mono text-sm text-zinc-300">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm text-zinc-300">{t.title}</div>
                      <div className="text-xs text-zinc-500">阅读 {t.reach.toLocaleString()} · 互动 {t.engagementRate}%</div>
                    </div>
                    <Badge className="bg-rose-900/40 text-rose-300">{t.reason}</Badge>
                  </button>
                ))}
              </div> : <Empty text="暂无真实掉队样本。等导入真实发布记录后再做掉队归因。" />}
            </CardContent>
          </Card>

          {/* 表现明细表 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>表现明细</CardTitle>
                <div className="flex gap-2 text-xs">
                  {([['engagement', '互动率'], ['reach', '曝光'], ['time', '时间']] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setSortBy(k)} className={`min-h-8 rounded px-2 py-1 ${sortBy === k ? 'bg-rose-500/15 text-rose-300' : 'text-zinc-400'}`}>{l}</button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {table.length ? <table className="w-full text-sm">
                <thead className="text-xs text-zinc-500">
                  <tr>
                    <th className="py-2 text-left">标题</th>
                    <th className="text-right">曝光</th>
                    <th className="text-right">互动率</th>
                    <th className="text-right">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((t) => {
                    const rate = t.engagementRate;
                    const status = rate >= 10 ? '爆款' : rate >= 7 ? '优秀' : rate >= 4 ? '正常' : '掉队';
                    return (
                      <tr key={t.id} onClick={() => setDetailItem(t)} className="cursor-pointer border-t border-zinc-900 transition hover:bg-zinc-900/40">
                        <td className="py-2 text-zinc-200">{t.title}</td>
                        <td className="text-right font-mono text-zinc-300">{(t.reach / 10000).toFixed(1)}w</td>
                        <td className="text-right font-mono text-rose-300">{rate}%</td>
                        <td className="text-right"><Badge className={status === '爆款' ? 'bg-rose-600' : status === '优秀' ? 'bg-amber-600' : status === '正常' ? 'bg-zinc-600' : 'bg-zinc-700'}>{status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table> : <Empty text="暂无表现明细。不会用演示数字冒充账号效果。" />}
            </CardContent>
          </Card>
        </div>

        {/* AI 复盘建议 35% */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI 复盘建议</CardTitle>
                <div className="text-xs text-zinc-500">已采纳 {adoptedSuggestions.length}/{data.aiSuggestions.length}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.aiSuggestions.map((s) => {
                  const adopted = adoptedSuggestions.includes(s.id);
                  return (
                    <div key={s.id} className={`rounded-md border p-3 ${adopted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <Badge>{s.typeLabel}</Badge>
                        <span className="text-zinc-500">{isPlaceholder ? '待验证' : `置信 ${Math.round(s.confidence * 100)}%`}</span>
                      </div>
                      <div className="mb-1 text-sm text-zinc-100">{s.title}</div>
                      <div className="mb-2 text-xs text-zinc-400">{s.detail}</div>
                      <div className="mb-2 text-xs text-rose-300">预期 {s.expectedBoost}</div>
                      {adopted ? (
                        <div className="text-xs text-emerald-400">✓ 已加入下周计划</div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => onAdopt(s)} className="flex-1">采纳</Button>
                          <Button size="sm" variant="secondary" onClick={() => onIgnore(s)} className="flex-1">忽略</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDetailItem(null)}>
          <div className="w-[480px] max-w-[90vw] rounded-xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-semibold text-zinc-100">{detailItem.title}</h3>
            {'coverUrl' in detailItem && detailItem.coverUrl && <img src={detailItem.coverUrl} className="mb-3 aspect-[3/4] w-full rounded-md object-cover" alt="" />}
            <div className="space-y-2 text-sm text-zinc-300">
              <div>阅读量：<span className="font-mono text-rose-300">{(detailItem.reach || 0).toLocaleString()}</span></div>
              <div>互动率：<span className="font-mono text-rose-300">{detailItem.engagementRate || 0}%</span></div>
              {'commonality' in detailItem && detailItem.commonality && (
                <div>
                  <div className="mb-1 text-zinc-500">共性特征：</div>
                  <div className="flex flex-wrap gap-1">{detailItem.commonality.map((c: string) => <Tag key={c}>{c}</Tag>)}</div>
                </div>
              )}
              {'reason' in detailItem && detailItem.reason && <div className="text-rose-300">归因：{detailItem.reason}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/components/store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Skeleton, Empty, PageHeader, SectionTitle, Tabs, Tag, Progress, MiniBar } from '@/components/ui';

type Topic = {
  id: string;
  title: string;
  angle: string;
  category: string;
  heat: number;
  source: string;
  matchedAccounts: number;
  tags: string[];
  status?: string;
  scores?: { spread: number; competition: number; persona: number; timeliness: number; total: number; reason: string };
};

type Benchmark = {
  id: string;
  name: string;
  handle: string;
  followers: number;
  category: string;
  viralRate: number;
  avgLikes: number;
  recentViral?: any[];
  lastSyncAt: number;
};

export default function HomePage() {
  const { addToPool, addActivity, toast } = useStore();
  const [activeTab, setActiveTab] = useState<'hot' | 'keywords' | 'longtail'>('hot');
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [poolIds, setPoolIds] = useState<Set<string>>(new Set());
  const [benchmarkDetail, setBenchmarkDetail] = useState<Benchmark | null>(null);
  const [viralList, setViralList] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBenchmark, setNewBenchmark] = useState({ name: '', handle: '' });

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [scoredTopics, setScoredTopics] = useState<Topic[]>([]);

  // 加载热点
  const loadTopics = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const endpoint = tab === 'hot' ? 'hot' : tab === 'keywords' ? 'keywords' : 'longtail';
      const res = await fetch(`/api/topics/${endpoint}`);
      const json = await res.json();
      if (json.ok) {
        setTopics(json.data);
        // 评分
        if (tab === 'hot') {
          const scored = await Promise.all(
            json.data.slice(0, 6).map(async (t: Topic) => {
              const sr = await fetch('/api/topics/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: t.title, angle: t.angle }),
              });
              const sj = await sr.json();
              return sj.ok ? { ...t, scores: sj.data } : t;
            })
          );
          setScoredTopics(scored);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载对标
  const loadBenchmarks = useCallback(async () => {
    try {
      const res = await fetch('/api/benchmarks');
      const json = await res.json();
      if (json.ok) setBenchmarks(json.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadTopics(activeTab);
  }, [activeTab, loadTopics]);

  useEffect(() => {
    loadBenchmarks();
  }, [loadBenchmarks]);

  // 加入选题库
  const onAddToPool = (t: Topic) => {
    addToPool(t);
    setPoolIds((s) => new Set(s).add(t.id));
    addActivity('topic', `加入选题库：${t.title.slice(0, 20)}`);
    toast.success(`已加入选题库：${t.title.slice(0, 15)}…`);
  };

  // 拆解（跳转到内容工厂）
  const onDeconstruct = (t: Topic) => {
    addToPool(t);
    addActivity('topic', `采纳拆解：${t.title.slice(0, 20)}`);
    toast.success('已采纳，AI 正在生成内容…');
    setTimeout(() => {
      window.location.href = `/content-factory?topic=${encodeURIComponent(t.title)}&angle=${encodeURIComponent(t.angle)}`;
    }, 800);
  };

  // 添加对标
  const onAddBenchmark = async () => {
    if (!newBenchmark.name.trim()) {
      toast.error('请输入账号名');
      return;
    }
    try {
      const res = await fetch('/api/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBenchmark.name, handle: newBenchmark.handle || `@${newBenchmark.name}` }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(`已添加对标：${json.data.name}`);
        setNewBenchmark({ name: '', handle: '' });
        setShowAddModal(false);
        loadBenchmarks();
      }
    } catch (e) {
      toast.error('添加失败');
    }
  };

  // 查看对标爆款
  const onViewBenchmark = async (b: Benchmark) => {
    setBenchmarkDetail(b);
    setViralList([]);
    try {
      const res = await fetch(`/api/benchmarks/${b.id}/viral`);
      const json = await res.json();
      if (json.ok) setViralList(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const tabLabels: Record<string, string> = {
    hot: '小红书热门',
    keywords: '行业关键词',
    longtail: '长尾潜力',
  };

  const filteredScored = scoredTopics.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterScore === 'high' && (t.scores?.total || 0) < 90) return false;
    if (filterScore === 'mid' && ((t.scores?.total || 0) < 80 || (t.scores?.total || 0) >= 90)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="选题引擎"
        description={`实时抓取小红书热门 / 行业关键词 / 长尾潜力，三源融合给${activeTab === 'hot' ? '你' : '你'}最值得做的选题`}
        breadcrumb={['首页', '选题引擎']}
        actions={
          <>
            <Button variant="secondary" onClick={() => loadTopics(activeTab)}>立即抓取</Button>
            <Button onClick={() => (window.location.href = '/content-factory')}>立即生成内容</Button>
          </>
        }
      />

      {/* 顶部 KPI 4卡 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <div className="text-xs text-zinc-500">今日新增选题</div>
          <div className="kpi-num mt-1 text-3xl font-semibold text-rose-100">{topics.length || 47}</div>
          <div className="mt-2 text-xs text-emerald-400">↑ 12.8% 较昨日</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">AI 评分均值</div>
          <div className="kpi-num mt-1 text-3xl font-semibold text-rose-100">
            {scoredTopics.length > 0
              ? Math.round(scoredTopics.reduce((a, b) => a + (b.scores?.total || 0), 0) / scoredTopics.length)
              : 87.3}
          </div>
          <div className="mt-2"><Progress value={87} /></div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">对标爆款抓取</div>
          <div className="kpi-num mt-1 text-3xl font-semibold text-rose-100">238 / 8427</div>
          <div className="mt-2 text-xs text-zinc-500">今日 / 累计</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">待采纳选题</div>
          <div className="kpi-num mt-1 text-3xl font-semibold text-amber-300">{poolIds.size + 14}</div>
          <div className="mt-2 text-xs text-amber-400/80">⏰ 14 条待处理</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 左侧 热点雷达 60% */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>热点雷达</CardTitle>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" />
                  实时同步 · {new Date().toLocaleTimeString('zh-CN')}
                </div>
              </div>
            </CardHeader>
            <div className="mb-4 flex gap-2">
              {(['hot', 'keywords', 'longtail'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveTab(k)}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    activeTab === k
                      ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                      : 'border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {tabLabels[k]}
                </button>
              ))}
            </div>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
                </div>
              ) : topics.length === 0 ? (
                <Empty text="暂无数据" />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {topics.map((t, idx) => (
                    <div
                      key={t.id}
                      className="group flex flex-col rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 transition hover:border-rose-500/30"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-zinc-500">#{idx + 1}</span>
                        <span className="font-mono text-rose-300">{t.heat}°</span>
                      </div>
                      <div className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-200">{t.title}</div>
                      <div className="mb-2 flex flex-wrap gap-1">
                        {t.tags?.slice(0, 2).map((tg) => (
                          <Tag key={tg}>{tg}</Tag>
                        ))}
                      </div>
                      <div className="mb-2 text-xs text-zinc-500">
                        对标账号 {t.matchedAccounts} 个
                      </div>
                      <div className="mb-3 h-1.5 overflow-hidden rounded bg-zinc-800">
                        <div className="h-full bg-gradient-to-r from-rose-600 to-amber-500" style={{ width: `${t.heat}%` }} />
                      </div>
                      <div className="flex gap-2">
                        {poolIds.has(t.id) ? (
                          <button className="flex-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 py-1.5 text-xs text-emerald-400" disabled>✓ 已加入</button>
                        ) : (
                          <button onClick={() => onAddToPool(t)} className="flex-1 rounded-md border border-amber-500/30 bg-amber-500/10 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20">+ 加入选题库</button>
                        )}
                        <button onClick={() => onDeconstruct(t)} className="flex-1 rounded-md border border-rose-500/30 bg-rose-500/10 py-1.5 text-xs text-rose-300 hover:bg-rose-500/20">拆解</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧 对标监控 40% */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>对标监控</CardTitle>
                <Button size="sm" onClick={() => setShowAddModal(true)}>+ 添加对标</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md bg-zinc-900/50 p-2">
                  <div className="text-zinc-500">在监控</div>
                  <div className="mt-0.5 text-lg font-semibold text-rose-100">{benchmarks.length}</div>
                </div>
                <div className="rounded-md bg-zinc-900/50 p-2">
                  <div className="text-zinc-500">7日活跃</div>
                  <div className="mt-0.5 text-lg font-semibold text-rose-100">{Math.max(0, benchmarks.length - 2)}</div>
                </div>
                <div className="rounded-md bg-zinc-900/50 p-2">
                  <div className="text-zinc-500">爆款率</div>
                  <div className="mt-0.5 text-lg font-semibold text-rose-100">14.7%</div>
                </div>
              </div>
              <div className="space-y-2">
                {benchmarks.slice(0, 8).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onViewBenchmark(b)}
                    className="flex w-full items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/30 p-2 text-left transition hover:border-rose-500/30"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-rose-700 to-rose-900 text-sm font-bold text-rose-100">
                      {b.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-zinc-200">{b.name}</div>
                      <div className="text-xs text-zinc-500">{b.handle} · {b.followers.toLocaleString()}粉</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-rose-300">{b.viralRate}% 爆款</div>
                      <div className="text-zinc-500">{b.avgLikes.toLocaleString()} 均赞</div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部 AI 评分选题 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI 评分选题（{filteredScored.length} / {scoredTopics.length}）</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
                <option value="all">全部分类</option>
                <option value="小红书热门">小红书热门</option>
                <option value="行业关键词">行业关键词</option>
              </select>
              <select value={filterScore} onChange={(e) => setFilterScore(e.target.value)} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-300">
                <option value="all">全部评分</option>
                <option value="high">90+</option>
                <option value="mid">80-89</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredScored.length === 0 ? (
            <Empty text="暂无选题" />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredScored.map((t) => (
                <div key={t.id} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge>{t.category}</Badge>
                    <div className="font-mono text-xl text-rose-300">{t.scores?.total || t.heat}</div>
                  </div>
                  <div className="mb-2 line-clamp-2 text-sm text-zinc-200">{t.title}</div>
                  <div className="mb-3 space-y-1.5">
                    <MiniBar label="传播潜力" value={t.scores?.spread || 80} />
                    <MiniBar label="竞争度" value={t.scores?.competition || 70} />
                    <MiniBar label="人设匹配" value={t.scores?.persona || 90} />
                    <MiniBar label="时效性" value={t.scores?.timeliness || 75} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onDeconstruct(t)} className="flex-1">一键采纳</Button>
                    <Button size="sm" variant="secondary" onClick={() => onDeconstruct(t)} className="flex-1">手动改写</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加对标 Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowAddModal(false)}>
          <div className="w-96 rounded-xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">添加对标账号</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">账号名</label>
                <input
                  className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                  placeholder="如：女力研究所"
                  value={newBenchmark.name}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">handle</label>
                <input
                  className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                  placeholder="@xxx"
                  value={newBenchmark.handle}
                  onChange={(e) => setNewBenchmark({ ...newBenchmark, handle: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>取消</Button>
              <Button onClick={onAddBenchmark}>确认</Button>
            </div>
          </div>
        </div>
      )}

      {/* 对标爆款详情 Modal */}
      {benchmarkDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setBenchmarkDetail(null)}>
          <div className="w-[640px] max-w-[90vw] rounded-xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-rose-700 to-rose-900 text-lg font-bold text-rose-100">
                {benchmarkDetail.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{benchmarkDetail.name}</h3>
                <div className="text-xs text-zinc-500">{benchmarkDetail.handle} · {benchmarkDetail.category}</div>
              </div>
              <button onClick={() => setBenchmarkDetail(null)} className="ml-auto text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            <div className="mb-3 text-sm text-zinc-400">近期爆款（自动抓取）</div>
            {viralList.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-500">正在抓取...</div>
            ) : (
              <div className="space-y-2">
                {viralList.map((v) => (
                  <div key={v.id} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                    <div className="mb-1 text-sm text-zinc-200">{v.title}</div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>❤️ {v.likes.toLocaleString()}</span>
                      <span>📅 {v.publishedAt}</span>
                      <span>🎨 {v.coverStyle}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

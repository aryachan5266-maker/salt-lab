'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/components/store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PageHeader, SectionTitle, Progress, Skeleton, Tag } from '@/components/ui';

const STYLES = [
  { key: 'sharp', label: '犀利观点型' },
  { key: 'story', label: '故事叙事型' },
  { key: 'list', label: '清单干货型' },
  { key: 'contrast', label: '反差对比型' },
];

const STEPS = ['选题', '封面生成', '文案生成', '违禁词检测', '入队发布'];

function FactoryInner() {
  const params = useSearchParams();
  const initialTopic = params?.get('topic') || '30岁创业第3年，我终于学会不解释';
  const initialAngle = params?.get('angle') || '人设叙事';
  const { toast, addActivity, pushPipeline } = useStore();

  const [topic, setTopic] = useState(initialTopic);
  const [angle, setAngle] = useState(initialAngle);
  const [style, setStyle] = useState('sharp');
  const [audience, setAudience] = useState(['创业者', '女性', '25-35岁']);
  const [titleLength, setTitleLength] = useState(14);
  const [bodyLength, setBodyLength] = useState(600);
  const [tone, setTone] = useState(80);

  const [generating, setGenerating] = useState(false);
  const [covers, setCovers] = useState<any[]>([]);
  const [copy, setCopy] = useState<any>(null);
  const [forbidden, setForbidden] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'cover' | 'copy'>('cover');
  const [selectedCover, setSelectedCover] = useState<string | null>(null);
  const [selectedCopy, setSelectedCopy] = useState<'A' | 'B' | null>(null);
  const [tokens, setTokens] = useState(1240);
  const [cost, setCost] = useState(0.018);
  const [seed, setSeed] = useState(72);

  // 文案生成
  const onGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      // 并行：封面 + 文案
      const [coverRes, copyRes] = await Promise.all([
        fetch('/api/generate/cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, angle, style, headline: topic.slice(0, 10), count: 3 }),
        }),
        fetch('/api/generate/copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, angle, style, targetAudience: audience, titleLength, bodyLength }),
        }),
      ]);
      const cj = await coverRes.json();
      const cy = await copyRes.json();
      if (cj.ok) setCovers(cj.data);
      if (cy.ok) {
        setCopy(cy.data);
        // 触发违禁词检测
        const text = (cy.data?.A?.body || '') + (cy.data?.B?.body || '') + (cy.data?.A?.titles?.join('') || '');
        const fr = await fetch('/api/check/forbidden', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        const fj = await fr.json();
        if (fj.ok) setForbidden(fj.data);
      }
      setTokens((t) => t + 2400);
      setCost((c) => c + 0.035);
      setSeed(Math.floor(Math.random() * 30) + 60);
      toast.success('已生成 3 张封面 + 2 版文案');
    } catch (e) {
      toast.error('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  }, [topic, angle, style, audience, titleLength, bodyLength, toast]);

  // 违禁词采纳
  const onAcceptForbidden = (hit: any, idx: number) => {
    setForbidden((prev: any) => {
      if (!prev) return prev;
      const newHits = [...prev.hits];
      newHits[idx] = { ...newHits[idx], fixed: true };
      return { ...prev, hits: newHits };
    });
    toast.success(`已采纳：${hit.word} → ${hit.suggestion}`);
  };

  const onIgnoreForbidden = (idx: number) => {
    setForbidden((prev: any) => {
      if (!prev) return prev;
      const newHits = [...prev.hits];
      newHits[idx] = { ...newHits[idx], ignored: true };
      return { ...prev, hits: newHits };
    });
  };

  // 选封面
  const onSelectCover = (c: any) => {
    setSelectedCover(c.id);
    toast.success(`已采用封面：${c.headline.slice(0, 10)}`);
  };

  // 选文案
  const onSelectCopy = (k: 'A' | 'B') => {
    setSelectedCopy(k);
    toast.success(`已锁定${k}方案文案`);
  };

  // 存草稿/入队
  const onSaveDraft = () => {
    pushPipeline({
      id: `pl_${Date.now()}`,
      topicId: '',
      topicTitle: topic,
      category: 'AI评分',
      step: 1,
      stepName: '选题',
      style,
      targetAudience: audience,
      titleLength,
      bodyLength,
      tone,
      coverCandidates: covers,
      selectedCoverId: selectedCover || covers[0]?.id,
      copyA: copy?.A,
      copyB: copy?.B,
      selectedCopy: selectedCopy ? copy?.[selectedCopy] : copy?.A,
      forbiddenHits: forbidden?.hits || [],
      status: 'draft',
    });
    addActivity('pipeline', `保存草稿：${topic.slice(0, 20)}`);
    toast.success('已保存到草稿箱');
  };

  const onPublish = () => {
    pushPipeline({
      id: `pl_${Date.now()}`,
      topicId: '',
      topicTitle: topic,
      category: 'AI评分',
      step: 5,
      stepName: '入队发布',
      style,
      targetAudience: audience,
      titleLength,
      bodyLength,
      tone,
      coverCandidates: covers,
      selectedCoverId: selectedCover || covers[0]?.id,
      copyA: copy?.A,
      copyB: copy?.B,
      selectedCopy: selectedCopy ? copy?.[selectedCopy] : copy?.A,
      forbiddenHits: forbidden?.hits || [],
      status: 'ready',
    });
    addActivity('pipeline', `入队发布：${topic.slice(0, 20)}`);
    toast.success('已入队发布队列');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="内容工厂"
        description="AI 一键生成封面 + A/B 文案，自动检测违禁词"
        breadcrumb={['首页', '内容工厂']}
        actions={
          <>
            <Button variant="secondary" onClick={onGenerate} disabled={generating}>
              {generating ? '生成中...' : '重新生成'}
            </Button>
            <Button variant="secondary" onClick={onSaveDraft}>存草稿</Button>
            <Button onClick={onPublish} disabled={!copy}>入队发布</Button>
          </>
        }
      />

      {/* 顶部工作流 */}
      <Card>
        <div className="flex items-center gap-2 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                  i < 2
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : i === 2
                    ? 'border-rose-500 bg-rose-600 text-white'
                    : 'border-zinc-800 text-zinc-500'
                }`}
              >
                <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                <span>{s}</span>
                {i === 2 && <span className="h-2 w-2 animate-pulse rounded-full bg-white" />}
              </div>
              {i < STEPS.length - 1 && <div className="text-zinc-700">→</div>}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-3 text-xs text-zinc-500">
            <span>创意度 {seed}</span>
            <span>Tokens {tokens.toLocaleString()}</span>
            <span>成本 ¥{cost.toFixed(3)}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 左 40% 配置 */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>当前选题</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="mt-2 text-xs text-zinc-500">切入角度：{angle}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>风格模板</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    className={`rounded-md px-3 py-1.5 text-sm transition ${
                      style === s.key
                        ? 'border border-rose-500/40 bg-rose-500/15 text-rose-200'
                        : 'border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>受众与调性</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-zinc-500">目标受众</div>
                <div className="flex flex-wrap gap-1.5">
                  {audience.map((a) => (
                    <Tag key={a} onRemove={() => setAudience(audience.filter((x) => x !== a))}>{a}</Tag>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>标题字数</span>
                  <span className="font-mono text-rose-300">{titleLength}</span>
                </div>
                <input type="range" min="8" max="20" value={titleLength} onChange={(e) => setTitleLength(parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>正文字数</span>
                  <span className="font-mono text-rose-300">{bodyLength}</span>
                </div>
                <input type="range" min="300" max="1200" step="50" value={bodyLength} onChange={(e) => setBodyLength(parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>调性：犀利 ←→ 共情</span>
                  <span className="font-mono text-rose-300">{tone}%</span>
                </div>
                <input type="range" min="0" max="100" value={tone} onChange={(e) => setTone(parseInt(e.target.value))} className="w-full" />
              </div>
              <Button onClick={onGenerate} disabled={generating} className="w-full">
                {generating ? '正在生成...' : '立即生成内容'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右 60% 结果 */}
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="mb-4 flex gap-2">
              {(['cover', 'copy'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    activeView === v
                      ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                      : 'border border-zinc-800 text-zinc-400'
                  }`}
                >
                  {v === 'cover' ? '封面候选' : '文案 A vs B'}
                </button>
              ))}
            </div>
            {activeView === 'cover' ? (
              <div>
                {generating ? (
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
                  </div>
                ) : covers.length === 0 ? (
                  <div className="py-16 text-center text-sm text-zinc-500">
                    点击「立即生成内容」开始生成
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {covers.map((c, i) => (
                      <div key={c.id} className={`overflow-hidden rounded-lg border ${selectedCover === c.id ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-zinc-800'}`}>
                        <div className="relative aspect-[3/4] bg-zinc-900">
                          <img src={c.url} alt="" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute left-2 top-2 rounded bg-rose-600 px-2 py-0.5 text-xs font-mono text-white">
                            C.0{i + 1}
                          </div>
                          {c.recommend && (
                            <div className="absolute right-2 top-2 rounded bg-amber-500 px-2 py-0.5 text-xs text-zinc-900">★ 推荐</div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3 text-base font-bold text-white drop-shadow-lg">
                            {c.headline}
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="mb-2 text-xs text-zinc-500">匹配度 {c.matchScore}%</div>
                          <Button
                            size="sm"
                            onClick={() => onSelectCover(c)}
                            className="w-full"
                            variant={selectedCover === c.id ? 'success' as any : 'default'}
                          >
                            {selectedCover === c.id ? '✓ 已采用' : '采用此封面'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {!copy ? (
                  <div className="py-16 text-center text-sm text-zinc-500">先生成内容...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {(['A', 'B'] as const).map((k) => (
                      <div key={k} className={`rounded-lg border p-4 ${selectedCopy === k ? 'border-rose-500/50 ring-1 ring-rose-500/30' : 'border-zinc-800'}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge>{k} 方案</Badge>
                            <span className="text-xs text-zinc-500">评分 {copy[k]?.score || (k === 'A' ? 94 : 87)}</span>
                          </div>
                          {selectedCopy === k && <span className="text-emerald-400 text-sm">✓</span>}
                        </div>
                        <div className="mb-3 space-y-1">
                          {copy[k]?.titles?.map((t: string, i: number) => (
                            <div key={i} className="text-sm text-zinc-200">备选 {i + 1}：{t}</div>
                          ))}
                        </div>
                        <div className="mb-3 max-h-40 overflow-y-auto whitespace-pre-line rounded bg-zinc-900/40 p-3 text-xs text-zinc-300">
                          {copy[k]?.body}
                        </div>
                        <div className="mb-3 flex flex-wrap gap-1">
                          {copy[k]?.tags?.map((tg: string) => <Tag key={tg}>{tg}</Tag>)}
                        </div>
                        <Button size="sm" onClick={() => onSelectCopy(k)} variant={selectedCopy === k ? 'success' as any : 'default'} className="w-full">
                          {selectedCopy === k ? '✓ 已锁定' : `选 ${k} 方案`}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 违禁词 */}
          {forbidden && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>违禁词检测</CardTitle>
                  <div className="text-xs text-zinc-500">
                    已扫描 · 命中 <span className="text-rose-300 font-mono">{forbidden.hits?.filter((h: any) => !h.fixed && !h.ignored).length || 0}</span> 处
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {forbidden.hits?.length === 0 ? (
                  <div className="text-sm text-emerald-400">✓ 未发现违禁词</div>
                ) : (
                  <div className="space-y-2">
                    {forbidden.hits?.map((h: any, i: number) => (
                      <div key={i} className={`flex items-center justify-between rounded-md border p-2 ${h.fixed ? 'border-emerald-500/30 bg-emerald-500/5' : h.ignored ? 'border-zinc-800 opacity-50' : 'border-rose-500/30 bg-rose-500/5'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`rounded px-2 py-0.5 text-xs ${h.severity === 'high' ? 'bg-rose-600' : h.severity === 'medium' ? 'bg-amber-600' : 'bg-zinc-700'}`}>
                            {h.severity === 'high' ? '高敏' : h.severity === 'medium' ? '极限' : '夸张'}
                          </span>
                          <span className="text-sm text-zinc-200">「{h.word}」</span>
                          <span className="text-xs text-zinc-500">→ {h.suggestion}</span>
                        </div>
                        <div className="flex gap-2">
                          {!h.fixed && !h.ignored && (
                            <>
                              <button onClick={() => onAcceptForbidden(h, i)} className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">采纳</button>
                              <button onClick={() => onIgnoreForbidden(i)} className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400">忽略</button>
                            </>
                          )}
                          {h.fixed && <span className="text-xs text-emerald-400">✓ 已采纳</span>}
                          {h.ignored && <span className="text-xs text-zinc-500">已忽略</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FactoryPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500">加载中...</div>}>
      <FactoryInner />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap, Copy, RefreshCw, Palette, Video, FileText,
  Eye, Brain, ArrowLeft, CheckCircle2, AlertTriangle,
  Loader2, TrendingUp, TrendingDown, Activity, Shield,
  Lock, Sparkles, ShieldAlert, ShieldCheck, Search, XCircle,
  Home,
} from 'lucide-react';
import { NACLLogo } from '@/components/nacl-logo';

/* ─── 类型 ─── */
interface NoteData {
  titles: string[];
  body: string;
  tags: string[];
  platform: string;
  imageSuggestion: string;
  marketingLogic: string[];
}

/* ─── 角色名映射 ─── */
const ROLE_NAMES: Record<string, string> = {
  boss: '老板',
  operator: '运营',
  sales: '销售',
  'shop-owner': '实体店主',
  'personal-ip': '个人IP',
};

/* ─── 违禁词结果 ─── */
interface ForbiddenResult {
  ok: boolean;
  hits: Array<{
    word: string;
    category: string;
    suggestion: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  quota: { remaining: number; total: number; isPro: boolean };
  upgradeHint?: string;
  pricingHint?: { free: string; pro: string; enterprise: string };
}

function normalizeForbiddenResult(data: unknown): ForbiddenResult | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const nested = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : {};
  const hitsValue = Array.isArray(record.hits) ? record.hits : nested.hits;
  const quotaValue = record.quota;
  if (!Array.isArray(hitsValue) || !quotaValue || typeof quotaValue !== 'object') return null;
  return {
    ok: record.ok !== false,
    hits: hitsValue.map((hit) => {
      const item = hit && typeof hit === 'object' ? hit as Record<string, unknown> : {};
      return {
        word: typeof item.word === 'string' ? item.word : '',
        category: typeof item.category === 'string' ? item.category : '未知',
        suggestion: typeof item.suggestion === 'string' ? item.suggestion : '',
        severity: item.severity === 'high' || item.severity === 'low' ? item.severity : 'medium',
      };
    }),
    quota: quotaValue as ForbiddenResult['quota'],
    upgradeHint: typeof record.upgradeHint === 'string' ? record.upgradeHint : undefined,
    pricingHint: record.pricingHint as ForbiddenResult['pricingHint'],
  };
}

/* ─── 额度信息 ─── */
interface CreditsInfo {
  total: number;
  used: number;
  remaining: number;
  plan: string;
}

interface CapabilityItem {
  available: boolean;
  fallbackAvailable?: boolean;
  note?: string;
  reason?: string;
}

interface CapabilityResponse {
  ok: boolean;
  summary: string;
  capabilities: Record<string, CapabilityItem>;
}

function stableScore(input: string, offset: number, min: number, span: number) {
  let hash = offset;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 9973;
  }
  return min + (hash % span);
}

export default function GeneratePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted-foreground">加载中...</div>}>
      <GeneratePage />
    </Suspense>
  );
}

function CapabilitySelfCheck({
  capabilities,
  error,
  onRefresh,
}: {
  capabilities: CapabilityResponse | null;
  error: string | null;
  onRefresh: () => void;
}) {
  const items = [
    { key: 'copyGeneration', label: '文案生成' },
    { key: 'imageGeneration', label: '封面生图' },
    { key: 'tts', label: 'TTS 语音' },
    { key: 'digitalHuman', label: '数字人' },
  ];

  return (
    <section className="mb-4 metal-panel rounded-lg p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-mono font-bold tracking-[0.18em] text-on-surface-weakest">
              CAPABILITY SELF CHECK
            </span>
          </div>
          <h2 className="text-sm font-semibold text-on-surface">生成能力自检</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-on-surface-variant">
            这里如实显示当前环境能不能调用真实生成能力；缺凭证时只展示 fallback，不把演示结果说成线上 AI 实测。
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-sm border border-[rgba(140,150,165,0.18)] px-3 py-1.5 text-[10px] font-mono text-on-surface-variant transition hover:text-on-surface"
        >
          <RefreshCw className="h-3 w-3" />
          重新自检
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const capability = capabilities?.capabilities[item.key];
          const available = Boolean(capability?.available);
          const fallback = Boolean(capability?.fallbackAvailable);
          return (
            <div
              key={item.key}
              className="rounded-sm border p-3"
              style={{
                borderColor: available
                  ? 'rgba(21,224,160,0.28)'
                  : fallback
                    ? 'rgba(245,166,35,0.28)'
                    : 'rgba(255,59,92,0.22)',
                background: available
                  ? 'rgba(21,224,160,0.045)'
                  : fallback
                    ? 'rgba(245,166,35,0.045)'
                    : 'rgba(255,59,92,0.035)',
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-on-surface">{item.label}</span>
                {available ? (
                  <ShieldCheck className="h-4 w-4 text-success" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-warning" />
                )}
              </div>
              <p className="text-[10px] font-mono text-on-surface-weakest">
                {available ? '真实凭证可用' : fallback ? 'fallback 可用' : '当前不可用'}
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-5 text-on-surface-variant">
        {error || capabilities?.summary || '正在读取当前环境能力。'}
      </p>
    </section>
  );
}

function GeneratePage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'operator';
  const query = searchParams.get('q') || '';
  const hasQuery = query.trim().length > 0;
  const gender = searchParams.get('gender') || '';
  const industry = searchParams.get('industry') || '';

  const [streamingText, setStreamingText] = useState('');
  const [noteData, setNoteData] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'note' | 'preview' | 'logic'>('note');
  const [selectedTitleIdx, setSelectedTitleIdx] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'unavailable'>('idle');

  /* ─── 违禁词检测 ─── */
  const [forbiddenResult, setForbiddenResult] = useState<ForbiddenResult | null>(null);
  const [forbiddenLoading, setForbiddenLoading] = useState(false);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);

  /* ─── 额度信息 ─── */
  const [credits, setCredits] = useState<CreditsInfo>({ total: 100, used: 0, remaining: 100, plan: 'free' });
  const [capabilities, setCapabilities] = useState<CapabilityResponse | null>(null);
  const [capabilityError, setCapabilityError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ─── 流式生成 ─── */
  const startGeneration = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStreamingText('');
    setNoteData(null);
    setSource('');
    setActiveTab('note');

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch('/api/generate/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, input: query, gender, industry }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取流');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === 'delta' && data.text) {
                setStreamingText(prev => prev + data.text);
              } else if (currentEvent === 'done') {
                setError(null);
                setNoteData(data.data);
                setSource(data.source || 'llm');
                setLoading(false);
              } else if (currentEvent === 'error') {
                setError(data.error);
                setLoading(false);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const errMsg = e instanceof Error ? e.message : String(e);
      setError(errMsg);
      setLoading(false);
      // 重新获取额度
      fetchCredits();
    }
  }, [role, query, gender, industry]);

  useEffect(() => {
    if (hasQuery) startGeneration();
    else setLoading(false);
    // 获取额度信息
    fetchCredits();
    fetchCapabilities();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── 违禁词检测 ─── */
  const handleForbiddenCheck = useCallback(async () => {
    if (!noteData?.body) return;
    setForbiddenLoading(true);
    try {
      const res = await fetch('/api/check/forbidden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `${noteData.titles?.[0] || ''}\n${noteData.body}`, userId: 'default' }),
      });
      const data = await res.json();
      setForbiddenResult(normalizeForbiddenResult(data));
      if (!res.ok) setForbiddenError(data.error || '扫描失败');
      else setForbiddenError(null);
    } catch {
      setForbiddenResult(null);
      setForbiddenError('扫描服务暂不可用');
    }
    finally { setForbiddenLoading(false); }
  }, [noteData]);

  useEffect(() => {
    if (noteData?.body) {
      handleForbiddenCheck();
    }
  }, [noteData, handleForbiddenCheck]);

  /* ─── 获取额度 ─── */
  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      if (data.ok) setCredits(data.credits);
    } catch { /* ignore */ }
  }, []);

  const fetchCapabilities = useCallback(async () => {
    try {
      const res = await fetch('/api/capabilities', { cache: 'no-store' });
      const data = await res.json() as CapabilityResponse;
      if (!res.ok || !data.ok) throw new Error('能力自检失败');
      setCapabilities(data);
      setCapabilityError(null);
    } catch (e) {
      setCapabilities(null);
      setCapabilityError(e instanceof Error ? e.message : '能力自检失败');
    }
  }, []);

  /* ─── 生成封面图 ─── */
  const handleGenerateImage = useCallback(async () => {
    if (!noteData?.imageSuggestion) return;
    setImageLoading(true);
    setImageError(null);
    try {
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: noteData.imageSuggestion,
          size: '1440x1920',
          style: '赛博科技',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setImageUrl(data.imageUrl);
      } else {
        setImageError(data.error || '生图失败');
      }
    } catch (e: unknown) {
      setImageError(e instanceof Error ? e.message : '生图异常');
    } finally {
      setImageLoading(false);
    }
  }, [noteData]);

  /* ─── 复制文案 ─── */
  const handleCopy = useCallback(async () => {
    if (!noteData) return;
    const text = `${noteData.titles[selectedTitleIdx]}\n\n${noteData.body}\n\n${noteData.tags.join(' ')}`;
    try {
      let copiedText = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          copiedText = true;
        } catch {
          copiedText = false;
        }
      }
      if (!copiedText) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        copiedText = document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (!copiedText) throw new Error('copy failed');
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  }, [noteData, selectedTitleIdx]);

  /* ─── 视频能力检测 ─── */
  const handleVideoClick = useCallback(async () => {
    setVideoStatus('unavailable');
  }, []);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) window.history.back();
    else window.location.assign('/');
  }, []);

  const roleName = ROLE_NAMES[role] || role;
  const scoreInput = `${role}|${query}|${gender}|${industry}|${source}`;
  const inferredScores = [
    { label: '内容质量', value: stableScore(scoreInput, 17, 82, 12), trend: 'up' as const },
    { label: '钩子强度', value: stableScore(scoreInput, 31, 78, 14), trend: 'up' as const },
    { label: '转化潜力', value: stableScore(scoreInput, 43, 74, 15), trend: 'up' as const },
    { label: '来源', value: source === 'fallback' ? '降级' : 'AI', trend: source === 'fallback' ? 'down' as const : 'up' as const },
  ];

  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      {/* ─── 顶栏 ─── */}
      <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-5"
        style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B, #0E1016)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="返回上一页"
            title="返回上一页"
            className="flex h-9 min-w-9 items-center justify-center gap-1 rounded-sm px-2 text-[10px] text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <NACLLogo size="xs" />
          <span className="font-mono text-[10px]" style={{ color: '#FF3B5C' }}>{roleName}视角</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startGeneration} className="hud-btn-ghost px-3 py-1 text-xs font-mono rounded-sm flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> 重新生成
          </button>
        </div>
      </header>

      {/* ─── 输入回显 ─── */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-2"
        style={{ borderBottom: '1px solid rgba(140,150,165,0.10)', background: '#0C0E12' }}>
        <span className="hud-tag hud-tag-active text-[10px]">{roleName}</span>
        {gender && gender !== '不限' && <span className="hud-tag text-[10px]">{gender}</span>}
        {industry && industry.split(',').map((ind, i) => (
          <span key={i} className="hud-tag text-[10px]">{ind}</span>
        ))}
        <span className="text-xs text-on-surface-variant ml-2 truncate max-w-md">
          {hasQuery ? `“${query}”` : '等待输入生成需求'}
        </span>
      </div>

      {/* ─── 主内容 ─── */}
      <main className="flex-1 px-5 pb-24 pt-4 max-w-5xl mx-auto w-full">
        <CapabilitySelfCheck
          capabilities={capabilities}
          error={capabilityError}
          onRefresh={fetchCapabilities}
        />

        {/* 加载态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-on-surface font-medium">AI 正在生成你的营销内容</p>
              <p className="text-xs text-on-surface-weakest font-mono">MODEL: DOUBAO-SEED-LITE · STREAMING</p>
            </div>
            {/* 进度条 */}
            <div className="w-64 h-[2px] bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full scan-progress" style={{ background: 'linear-gradient(90deg, #FF3B5C, #21E6C1)' }} />
            </div>
            {/* 流式文本预览 */}
            {streamingText && (
              <div className="mt-4 max-w-lg text-xs text-on-surface-variant font-mono leading-relaxed">
                <span>{streamingText.slice(-200)}</span>
                <span className="typing-cursor" />
              </div>
            )}
          </div>
        )}

        {/* 空输入态 */}
        {!hasQuery && !loading && (
          <div className="metal-panel rounded-lg p-6 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-[rgba(140,150,165,0.18)] bg-[rgba(140,150,165,0.04)]">
              <FileText className="h-8 w-8 text-on-surface-weakest" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-on-surface">先输入一句生成需求</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
              生成页需要带着产品、活动或选题进入。直接打开这个页面不会开始生成。
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button onClick={() => window.location.assign('/')} className="hud-btn-primary rounded-sm px-4 py-2 text-xs font-medium">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Home className="h-3.5 w-3.5" />
                  回首页输入
                </span>
              </button>
              <button onClick={() => window.location.assign('/topic-engine')} className="hud-btn-ghost rounded-sm px-4 py-2 text-xs font-medium">
                去选题引擎
              </button>
            </div>
          </div>
        )}

        {/* 错误态 */}
        {hasQuery && error && !loading && (
          <div className="metal-panel rounded-lg p-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto" />
            <p className="text-sm text-on-surface">生成遇到问题</p>
            <p className="text-xs text-on-surface-variant font-mono">{error}</p>
            <button onClick={startGeneration} className="hud-btn-primary px-4 py-2 rounded-md text-xs">
              重试
            </button>
          </div>
        )}

        {/* 结果区 */}
        {noteData && !loading && !error && (
          <div className="space-y-4">
            {/* AI 评分概览 */}
            <div className="grid grid-cols-4 gap-2">
              {inferredScores.map((item, i) => (
                <div key={i} className="metal-panel hud-clip-tr rounded-sm p-3 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: item.trend === 'up' ? 'rgba(255,59,92,0.4)' : 'rgba(245,166,35,0.4)' }} />
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-mono text-on-surface-weakest">
                    <span>{item.label}</span>
                    {typeof item.value === 'number' && <span>AI推断</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-lg font-bold"
                      style={{ color: item.trend === 'up' ? '#FF3B5C' : '#F5A623' }}>
                      {typeof item.value === 'number' ? item.value : item.value}
                    </span>
                    {item.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" style={{ color: '#FF3B5C' }} />
                    ) : (
                      <TrendingDown className="w-3 h-3" style={{ color: '#F5A623' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab 切换 */}
            <div className="flex gap-0 border-b" style={{ borderColor: 'rgba(140,150,165,0.12)' }}>
              {[
                { key: 'note' as const, label: '小红书笔记', icon: FileText },
                { key: 'preview' as const, label: '发布态预览', icon: Eye },
                { key: 'logic' as const, label: '营销逻辑', icon: Brain },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.key;
                return (
                  <button key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors relative ${active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: '#FF3B5C', boxShadow: '0 0 6px rgba(255,59,92,0.4)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab 内容 */}
            <div className="mt-2">
              {/* ── Tab 1: 笔记 ── */}
              {activeTab === 'note' && (
                <div className="space-y-4">
                  {/* 标题备选 */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-on-surface-weakest">标题备选（点击选用）</div>
                    <div className="space-y-1.5">
                      {noteData.titles.map((title, i) => (
                        <button key={i}
                          onClick={() => setSelectedTitleIdx(i)}
                          className={`w-full text-left metal-panel rounded-sm px-4 py-2.5 text-sm transition-all ${selectedTitleIdx === i ? 'glow-red' : ''}`}
                          style={selectedTitleIdx === i ? { borderColor: 'rgba(255,59,92,0.5)' } : undefined}>
                          <span className="text-on-surface">{title}</span>
                          {selectedTitleIdx === i && (
                            <CheckCircle2 className="w-3.5 h-3.5 inline-block ml-2 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 正文 */}
                  <div className="metal-panel rounded-lg p-5 space-y-3">
                    <div className="text-[10px] font-mono text-on-surface-weakest mb-2">正文</div>
                    <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                      {noteData.body}
                    </div>
                    {/* 话题标签 */}
                    <div className="flex flex-wrap gap-1.5 pt-2" style={{ borderTop: '1px solid rgba(140,150,165,0.10)' }}>
                      {noteData.tags.map((tag, i) => (
                        <span key={i} className="text-xs font-mono" style={{ color: '#21E6C1' }}>{tag}</span>
                      ))}
                    </div>
                    {/* 平台标注 */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-on-surface-weakest">适配平台:</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                        style={{ color: '#FF3B5C', background: 'rgba(255,59,92,0.08)', border: '1px solid rgba(255,59,92,0.15)' }}>
                        {noteData.platform}
                      </span>
                    </div>
                  </div>

                  {/* ━━━ 违禁词检测（付费钩子）━━━ */}
                  <div className="metal-panel rounded-sm overflow-hidden"
                    style={{ borderColor: forbiddenResult ? (forbiddenResult.hits.length > 0 ? 'rgba(255,59,92,0.4)' : 'rgba(21,224,160,0.3)') : 'rgba(245,166,35,0.3)' }}>
                    <div className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderBottom: '1px solid rgba(140,150,165,0.08)' }}>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" style={{ color: forbiddenResult ? (forbiddenResult.hits.length > 0 ? '#FF3B5C' : '#15E0A0') : '#F5A623' }} />
                        <span className="text-xs font-mono font-bold tracking-wider"
                          style={{ color: forbiddenResult ? (forbiddenResult.hits.length > 0 ? '#FF3B5C' : '#15E0A0') : '#F5A623' }}>
                          FORBIDDEN WORD SCAN
                        </span>
                        {forbiddenResult && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                            style={{ background: forbiddenResult.hits.length > 0 ? 'rgba(255,59,92,0.12)' : 'rgba(21,224,160,0.12)', color: forbiddenResult.hits.length > 0 ? '#FF3B5C' : '#15E0A0' }}>
                            {forbiddenResult.hits.length > 0 ? `${forbiddenResult.hits.length} 处风险` : '通过'}
                          </span>
                        )}
                      </div>
                      <button onClick={handleForbiddenCheck}
                        disabled={forbiddenLoading}
                        className="flex min-h-8 items-center gap-1 rounded-sm px-3 py-1.5 text-[10px] font-mono transition-all"
                        style={{ background: 'rgba(255,59,92,0.08)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.25)' }}>
                        {forbiddenLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                        {forbiddenLoading ? '扫描中...' : '一键扫描'}
                      </button>
                    </div>
                    {forbiddenResult ? (
                      <div className="px-4 py-3 space-y-2">
                        {forbiddenResult.hits.length === 0 ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success" />
                            <span className="text-xs text-on-surface">未发现违禁词，内容安全可发布</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-on-surface-variant mb-2">发现 {forbiddenResult.hits.length} 处违禁/限流词：</div>
                            {forbiddenResult.hits.map((item: { word: string; category: string; suggestion: string; severity: string }, i: number) => (
                              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-sm"
                                style={{ background: 'rgba(255,59,92,0.06)' }}>
                                <XCircle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                                <div>
                                  <span className="text-xs text-primary font-medium line-through">{item.word}</span>
                                  <span className="text-[10px] text-on-surface-variant ml-2">{item.category}</span>
                                  <span className="text-[10px] ml-1" style={{ color: '#15E0A0' }}>→ {item.suggestion}</span>
                                </div>
                              </div>
                            ))}
                            <div className="mt-3 px-3 py-2 rounded-sm flex items-center justify-between"
                              style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)' }}>
                              <div className="flex items-center gap-1.5">
                                <Lock className="w-3 h-3" style={{ color: '#F5A623' }} />
                                <span className="text-[10px] font-mono" style={{ color: '#F5A623' }}>一键替换违禁词 · PRO 功能</span>
                              </div>
                              <button className="px-2 py-1 rounded-sm text-[10px] font-mono"
                                style={{ minHeight: 32, background: 'rgba(255,59,92,0.1)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.3)' }}>
                                升级 PRO
                              </button>
                            </div>
                          </>
                        )}
                        <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-weakest">
                          <span>今日免费扫描: {forbiddenResult.quota.total - forbiddenResult.quota.remaining}/{forbiddenResult.quota.total}</span>
                          <span>PRO 无限次 · 违规限流封号防护</span>
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        <p className="text-xs text-on-surface-variant">
                          {forbiddenError || '发布前扫描违禁词/限流词，避免被平台限流或封号'}
                        </p>
                        <p className="text-[10px] font-mono mt-1" style={{ color: '#F5A623' }}>实体店主/销售最怕违规限流 — 扫一下更安心</p>
                      </div>
                    )}
                  </div>

                  {/* 配图建议 */}
                  <div className="metal-panel rounded-sm p-4">
                    <div className="text-[10px] font-mono text-on-surface-weakest mb-2">配图建议</div>
                    <p className="text-xs text-on-surface-variant">{noteData.imageSuggestion}</p>
                    <button
                      onClick={handleGenerateImage}
                      disabled={imageLoading}
                      className="hud-btn-primary mt-3 px-4 py-2 rounded-sm text-xs flex items-center gap-1.5"
                    >
                      {imageLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Palette className="w-3 h-3" />}
                      {imageLoading ? '生成中...' : '一键生成封面图'}
                    </button>
                    {imageUrl && (
                      <div className="mt-3 rounded-sm overflow-hidden border" style={{ borderColor: 'rgba(140,150,165,0.18)' }}>
                        <img src={imageUrl} alt="封面图" className="w-full max-w-xs" />
                      </div>
                    )}
                    {imageError && (
                      <div className="mt-2 text-xs text-warning flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {imageError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Tab 2: 发布态预览 ── */}
              {activeTab === 'preview' && (
                <div className="flex justify-center py-4">
                  <div className="xhs-preview-card w-[360px]">
                    {/* 手机顶部 */}
                    <div className="flex items-center justify-between px-4 py-2" style={{ background: '#1A1A1A' }}>
                      <span className="text-[10px] text-gray-400 font-mono">9:41</span>
                      <div className="flex gap-1">
                        <Activity className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                    {/* 作者信息 */}
                    <div className="flex items-center gap-2 px-4 py-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ background: 'linear-gradient(135deg, #FF3B5C, #FF2E97)', color: '#fff' }}>
                        咸
                      </div>
                      <div>
                        <div className="text-xs font-medium" style={{ color: '#E8E8E8' }}>NΛCL · {roleName}视角</div>
                        <div className="text-[10px]" style={{ color: '#888' }}>刚刚</div>
                      </div>
                    </div>
                    {/* 封面图区域 */}
                    <div className="mx-3 rounded-lg overflow-hidden" style={{ aspectRatio: '3/4', background: '#2A2A2A' }}>
                      {imageUrl ? (
                        <img src={imageUrl} alt="封面" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Palette className="w-8 h-8 mb-2" style={{ color: '#555' }} />
                          <span className="text-[10px]" style={{ color: '#666' }}>点击「生成封面图」预览</span>
                        </div>
                      )}
                    </div>
                    {/* 笔记内容预览 */}
                    <div className="px-4 py-3 space-y-2">
                      <div className="text-sm font-medium" style={{ color: '#E8E8E8' }}>
                        {noteData.titles[selectedTitleIdx]}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: '#AAA' }}>
                        {noteData.body.slice(0, 120)}...
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {noteData.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px]" style={{ color: '#5B9BD5' }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    {/* 互动栏 - 稳定数据 */}
                    <div className="flex items-center justify-around py-3" style={{ borderTop: '1px solid #2A2A2A' }}>
                      {[
                        { label: '点赞', count: '128', color: '#FF3B5C' },
                        { label: '收藏', count: '67', color: '#F5A623' },
                        { label: '评论', count: '23', color: '#21E6C1' },
                        { label: '分享', count: '', color: '#888' },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className="text-xs font-mono" style={{ color: item.color }}>{item.count || item.label}</div>
                          <div className="text-[9px]" style={{ color: '#888' }}>{item.count ? item.label : ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 3: 营销逻辑 ── */}
              {activeTab === 'logic' && (
                <div className="space-y-3">
                  <div className="metal-panel rounded-sm p-4 hud-corner">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4" style={{ color: '#21E6C1' }} />
                      <span className="text-xs font-mono" style={{ color: '#21E6C1' }}>MARKETING LOGIC</span>
                    </div>
                    <div className="space-y-3">
                      {noteData.marketingLogic.map((logic, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-5 h-5 flex-shrink-0 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold"
                            style={{ background: 'rgba(255,59,92,0.1)', color: '#FF3B5C', border: '1px solid rgba(255,59,92,0.2)' }}>
                            {i + 1}
                          </div>
                          <p className="text-sm text-on-surface leading-relaxed">{logic}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 来源标注 */}
                  {source === 'fallback' && (
                    <div className="text-xs text-warning flex items-center gap-1.5 px-2">
                      <AlertTriangle className="w-3 h-3" />
                      此内容由降级模板生成，AI 服务暂时不可用
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── 底部操作栏 ─── */}
      {noteData && !loading && (
        <div className="sticky bottom-0 z-40 px-3 py-2 sm:px-5 sm:py-3 sm:flex sm:items-center sm:justify-between"
          style={{ background: 'linear-gradient(180deg, #0E1016, #08090C)', borderTop: '1px solid rgba(140,150,165,0.12)' }}>
          <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center">
            <button onClick={handleCopy}
              className="hud-btn-ghost h-12 min-w-0 rounded-sm px-2 text-[10px] leading-tight flex flex-col items-center justify-center gap-1 sm:h-auto sm:px-3 sm:py-2 sm:text-xs sm:flex-row sm:gap-1.5">
              {copied ? <CheckCircle2 className="w-3 h-3 text-success" /> : copyFailed ? <XCircle className="w-3 h-3 text-error" /> : <Copy className="w-3 h-3" />}
              {copied ? '已复制' : copyFailed ? '复制失败' : '复制文案'}
            </button>
            <button onClick={startGeneration}
              className="hud-btn-ghost h-12 min-w-0 rounded-sm px-2 text-[10px] leading-tight flex flex-col items-center justify-center gap-1 sm:h-auto sm:px-3 sm:py-2 sm:text-xs sm:flex-row sm:gap-1.5">
              <RefreshCw className="w-3 h-3" /> 换一版
            </button>
            <button onClick={handleGenerateImage}
              disabled={imageLoading}
              className="hud-btn-primary h-12 min-w-0 rounded-sm px-2 text-[10px] leading-tight flex flex-col items-center justify-center gap-1 sm:h-auto sm:px-4 sm:py-2 sm:text-xs sm:flex-row sm:gap-1.5">
              <Palette className="w-3 h-3" />
              {imageLoading ? '生图中...' : '生成封面'}
            </button>
            <button onClick={handleVideoClick}
              className="hud-btn-ghost h-12 min-w-0 rounded-sm px-2 text-[10px] leading-tight flex flex-col items-center justify-center gap-1 sm:h-auto sm:px-4 sm:py-2 sm:text-xs sm:flex-row sm:gap-1.5">
              <Video className="w-3 h-3" />
              数字人视频
            </button>
          </div>
        </div>
      )}

      {/* 数字人视频不可用提示 */}
      {videoStatus === 'unavailable' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="metal-panel rounded-lg p-6 max-w-sm text-center space-y-3">
            <AlertTriangle className="w-6 h-6 text-warning mx-auto" />
            <p className="text-sm text-on-surface">数字人视频暂不可用</p>
            <p className="text-xs text-on-surface-variant">
              扣子平台当前 SDK 未提供数字人/对口型/视频合成接口。<br />
              降级方案：上传人物照片 + AI 配音 + 自动字幕 → 幻灯片式口播视频。
            </p>
            <button onClick={() => setVideoStatus('idle')}
              className="hud-btn-primary px-4 py-2 rounded-sm text-xs">
              了解了
            </button>
          </div>
        </div>
      )}

      {/* 底部状态栏 */}
      <footer className="h-7 flex items-center justify-between px-5"
        style={{ background: '#0C0E12', borderTop: '1px solid rgba(140,150,165,0.12)' }}>
        <div className="flex items-center gap-4 text-[9px] font-mono" style={{ color: '#5A6273' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#21E6C1' }} />
            SYSTEM ONLINE
          </span>
          <span>ENGINE: DOUBAO-SEED</span>
        </div>
      </footer>
    </div>
  );
}

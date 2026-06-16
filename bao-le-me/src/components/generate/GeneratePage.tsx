'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clapperboard, Copy, FileText, Loader2, Mic2, RefreshCw, StickyNote } from 'lucide-react';
import { DouyinPreview } from '@/components/media/DouyinPreview';
import { createRecordFromScript, readContentLoopState, writeContentLoopState } from '@/lib/content-loop';
import { useApp } from '@/lib/store';
import type { DouyinScript, ScriptSection, ForbiddenCheck, GenerateScriptResponse } from '@/lib/types';
import { ErrorNotice, PageHeader, StepHint } from '@/components/layout/PageHeader';

export default function GeneratePage() {
  const { brandAssets, setCurrentPage } = useApp();
  const [script, setScript] = useState<DouyinScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState('');
  const [copied, setCopied] = useState('');
  const [scriptSource, setScriptSource] = useState('');

  const generateScript = async () => {
    if (!brandAssets) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate/douyin-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            targetAudience: brandAssets.targetAudience,
            contentStrategy: brandAssets.contentStrategy,
            tone: brandAssets.tone,
            contentFormats: brandAssets.contentFormats,
            differentiator: brandAssets.differentiator,
            industry: brandAssets.industry,
            city: brandAssets.city,
            storeType: brandAssets.storeType,
            priceRange: brandAssets.priceRange,
            businessName: brandAssets.businessName,
            competitors: brandAssets.competitors,
            goalType: brandAssets.goalType,
            goalDetail: brandAssets.goalDetail,
          },
          topic: topic || brandAssets.contentFormats[0] || '探店vlog',
          role: brandAssets.role,
          occupation: brandAssets.occupation,
        }),
      });
      if (!res.ok) throw new Error('生成失败');
      const data = await res.json() as GenerateScriptResponse;
      setScript(data.script);
      setScriptSource(data.source || 'AI生成（非实时数据）');
      setCopied('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', 'true');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(ok ? label : '复制失败，请手动选择文本');
    }
  };

  const buildDeliverableText = (value: DouyinScript) => [
    `标题：${value.title}`,
    `来源：${scriptSource || 'AI生成（非实时数据）'}`,
    `标签：${value.tags.join(' ')}`,
    `BGM：${value.bgm}`,
    '',
    `黄金3秒：${value.hook.visual} / ${value.hook.audio}`,
    ...value.body.map((section, index) => `段落${index + 1}（${section.seconds}）：${section.visual} / ${section.audio}`),
    `反转：${value.twist.visual} / ${value.twist.audio}`,
    `CTA：${value.cta.visual} / ${value.cta.audio}`,
    '',
    `TTS：${value.ttsText}`,
    '',
    `封面提示词：${value.coverPrompt}`,
    `违禁词体检：${value.forbiddenCheck.hasForbidden ? value.forbiddenCheck.suggestion : '未检测到违禁词'}`,
  ].join('\n');

  const sendToContentLoop = () => {
    if (!script) return;
    const current = readContentLoopState();
    const record = createRecordFromScript(script, current.calibrationSamples);
    writeContentLoopState({
      ...current,
      records: [record, ...current.records].slice(0, 24),
    });
    setCopied('已创建发布前盲预测');
    setCurrentPage('content-loop');
  };

  const renderSection = (label: string, section: ScriptSection, highlight?: boolean) => (
    <div className={`rounded-[8px] border p-4 ${highlight ? 'bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20' : 'border-white/8 bg-white/[0.02]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[var(--color-accent)] text-xs font-bold">{label}</span>
        <span className="text-white/20 text-[10px]">{section.seconds}</span>
      </div>
      <p className="text-white/60 text-xs mb-1.5">节拍: {section.beat}</p>
      <p className="flex gap-2 text-white/70 text-sm mb-1"><Clapperboard size={14} className="mt-0.5 shrink-0 text-white/30" />{section.visual}</p>
      <p className="flex gap-2 text-white/50 text-sm mb-1"><Mic2 size={14} className="mt-0.5 shrink-0 text-white/30" />{section.audio}</p>
      {section.note && <p className="mt-1 flex gap-2 text-white/30 text-xs"><StickyNote size={13} className="shrink-0" />{section.note}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="SCRIPT ENGINE"
        title="脚本生成"
        description="输出一套能直接交给拍摄的人：黄金 3 秒、分镜节拍、口播文本、封面提示和风险体检。"
        icon={FileText}
        action={{
          label: loading ? '生成中' : script ? '重新生成' : '生成脚本',
          onClick: generateScript,
          disabled: loading || !brandAssets,
          loading,
          icon: RefreshCw,
        }}
        next={{ label: '看品牌资产', page: 'brand-assets' }}
      />

      {/* Topic Input */}
      <div className="nacl-card p-5">
        <label className="text-white/50 text-xs mb-1.5 block">选题方向</label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={brandAssets?.contentFormats[0] || '例如：探店vlog、知识分享'}
          className="w-full rounded-[8px] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[var(--color-accent)]/40"
        />
        {brandAssets && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {brandAssets.contentFormats.map((f, i) => (
              <button
                key={i}
                onClick={() => setTopic(f)}
                className="rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 px-2.5 py-1 text-[10px] text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/20"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      {!script && !loading && (
        <button
          onClick={generateScript}
          className="w-full rounded-[8px] bg-[var(--color-accent)] py-4 font-bold tracking-[0.16em] text-black transition hover:bg-white"
        >
          生成差异化脚本
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="mb-4 animate-spin text-[var(--color-accent)]" size={34} />
          <p className="text-white/50 text-sm">正在生成差异化脚本...</p>
          <p className="text-white/20 text-xs mt-1">黄金3秒钩子 + beat节奏 + 反转 + 强CTA</p>
          <p className="mt-1 text-xs text-white/20">通常 10 秒左右；外部模型超时会自动给安全兜底脚本。</p>
        </div>
      )}

      {/* Script Result */}
      {script && (
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Title & Tags */}
          <div className="nacl-card p-5 lg:col-span-2">
            <h3 className="text-white text-base font-semibold mb-2">{script.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {script.tags.map((tag, i) => (
                <span key={i} className="text-[var(--color-accent)]/60 text-xs">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-white/30 text-xs">
              <span>BGM: {script.bgm}</span>
              <span>来源: {scriptSource || 'AI生成（非实时数据）'}</span>
            </div>
          </div>

          <div className="nacl-card p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/35">封面预览</p>
              <h3 className="mt-1 text-lg font-bold text-white">先看它像不像能发</h3>
            </div>
            <DouyinPreview title={script.title} subtitle={script.hook.audio} source={scriptSource || 'AI生成（非实时数据）'} />
          </div>

          <div className="nacl-card p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/35">分镜预览条</p>
              <h3 className="mt-1 text-lg font-bold text-white">拍摄节奏一眼能看懂</h3>
            </div>
            <ScriptStoryboard script={script} />
          </div>

          {/* Hook */}
          {renderSection('黄金3秒钩子', script.hook, true)}

          {/* Body */}
          <div className="space-y-4">
            {script.body.map((section, i) => (
              <div key={`${section.seconds}-${section.beat}-${i}`}>
                {renderSection(`段落${i + 1}`, section)}
              </div>
            ))}
          </div>

          {/* Twist */}
          {renderSection('反转节点', script.twist, true)}

          {/* CTA */}
          {renderSection('强CTA', script.cta, true)}

          {/* TTS Text */}
          <div className="nacl-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white/50 text-xs">配音文本 (TTS)</h3>
              <button
                onClick={() => copyText('TTS 已复制', script.ttsText)}
                className="inline-flex items-center gap-1 text-[var(--color-accent)]/70 text-[10px] hover:text-[var(--color-accent)] transition-colors"
              >
                <Copy size={12} />
                复制
              </button>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{script.ttsText}</p>
          </div>

          {/* Cover Prompt */}
          <div className="nacl-card overflow-hidden p-0 lg:col-span-2">
            <div className="grid gap-0 md:grid-cols-[220px_1fr]">
              <div className="relative min-h-[240px] bg-black">
                <img src="/demo-media/baoleme-cover.svg" alt="封面本地样例" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-xs font-semibold tracking-[0.18em] text-white/40">封面提示词 (9:16)</h3>
                <p className="text-sm leading-7 text-white/62">{script.coverPrompt}</p>
                <p className="mt-4 text-xs leading-5 text-white/34">
                  当前展示为本地样例封面，后续接入素材生成后再替换为真实生成图。
                </p>
              </div>
            </div>
          </div>

          {/* Forbidden Check */}
          <div className="lg:col-span-2">
            <ForbiddenCheckCard check={script.forbiddenCheck} />
          </div>

          <div className="nacl-card p-5 lg:col-span-2">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">交付动作</h3>
                <p className="mt-1 text-xs leading-5 text-white/38">复制给拍摄同事；发布前建议先进入盲预测，锁定判断再看数据。</p>
              </div>
              <button
                onClick={() => copyText('整套脚本已复制', buildDeliverableText(script))}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-black transition hover:bg-white"
              >
                <Copy size={15} />
                复制整套脚本
              </button>
              <button
                onClick={sendToContentLoop}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[var(--color-accent)]/34 bg-[var(--color-accent)]/8 px-4 py-3 text-sm font-bold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/14"
              >
                <CheckCircle2 size={15} />
                进入盲预测
              </button>
            </div>
            {copied && <p className="mt-3 text-xs text-[var(--color-accent)]">{copied}</p>}
          </div>

          {/* Regenerate */}
          <button
            onClick={generateScript}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/48 transition hover:border-[var(--color-accent)]/35 hover:text-white lg:col-span-2"
          >
            <RefreshCw size={15} />
            重新生成
          </button>
        </div>
      )}

      {script && <StepHint label="回到品牌资产，确认这套内容是否符合长期定位" page="brand-assets" />}
      <ErrorNotice message={error} onRetry={generateScript} />
    </div>
  );
}

function ScriptStoryboard({ script }: { script: DouyinScript }) {
  const sections = [
    { label: '钩子', value: script.hook },
    ...script.body.slice(0, 3).map((value, index) => ({ label: `段落${index + 1}`, value })),
    { label: '转折', value: script.twist },
    { label: '转化', value: script.cta },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {sections.map((item, index) => (
        <div
          key={`${item.label}-${item.value.seconds}-${index}`}
          className="min-h-[118px] rounded-[10px] border border-white/10 bg-black/18 p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[var(--color-accent)]/12 px-2 py-1 text-[10px] font-bold text-[var(--color-accent)]">
              {item.value.seconds}
            </span>
            <span className="text-[10px] text-white/34">{item.label}</span>
          </div>
          <p className="text-sm font-semibold leading-5 text-white line-clamp-2">{item.value.beat}</p>
          <p className="mt-2 text-xs leading-5 text-white/46 line-clamp-2">{item.value.visual}</p>
        </div>
      ))}
    </div>
  );
}

function ForbiddenCheckCard({ check }: { check: ForbiddenCheck }) {
  return (
    <div className={`rounded-[8px] p-5 ${check.hasForbidden ? 'bg-red-500/5 border border-red-500/20' : 'bg-[#00B894]/5 border border-[#00B894]/20'}`}>
      <div className="flex items-center gap-2 mb-2">
        {check.hasForbidden ? <AlertTriangle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-[#00B894]" />}
        <h3 className={`text-xs ${check.hasForbidden ? 'text-red-400' : 'text-[#00B894]'}`}>
          违禁词体检
        </h3>
      </div>
      {check.hasForbidden ? (
        <>
          <p className="text-red-400/60 text-xs mb-1">发现违禁词: {check.forbiddenWords.join('、')}</p>
          <p className="text-white/40 text-xs">{check.suggestion}</p>
        </>
      ) : (
        <p className="text-[#00B894]/60 text-xs">未检测到违禁词，可以放心发布</p>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import type { DouyinScript, ScriptSection, ForbiddenCheck } from '@/lib/types';

export default function GeneratePage() {
  const { brandAssets } = useApp();
  const [script, setScript] = useState<DouyinScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topic, setTopic] = useState('');

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
          },
          topic: topic || brandAssets.contentFormats[0] || '探店vlog',
          role: brandAssets.role,
        }),
      });
      if (!res.ok) throw new Error('生成失败');
      const data = await res.json();
      setScript(data.script);
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (label: string, section: ScriptSection, highlight?: boolean) => (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-[#C8A97E]/5 border border-[#C8A97E]/20' : 'bg-white/[0.02]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#C8A97E] text-xs font-bold">{label}</span>
        <span className="text-white/20 text-[10px]">{section.seconds}</span>
      </div>
      <p className="text-white/60 text-xs mb-1.5">节拍: {section.beat}</p>
      <p className="text-white/70 text-sm mb-1">🎬 {section.visual}</p>
      <p className="text-white/50 text-sm mb-1">🗣 {section.audio}</p>
      {section.note && <p className="text-white/30 text-xs mt-1">📝 {section.note}</p>}
    </div>
  );

  return (
    <div className="px-5 py-5">
      <h2 className="text-white text-lg font-bold mb-1">脚本生成</h2>
      <p className="text-white/30 text-xs mb-5">差异化脚本三件套 — 完播率工程</p>

      {/* Topic Input */}
      <div className="mb-5">
        <label className="text-white/50 text-xs mb-1.5 block">选题方向</label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={brandAssets?.contentFormats[0] || '例如：探店vlog、知识分享'}
          className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-[#C8A97E]/40"
        />
        {brandAssets && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {brandAssets.contentFormats.map((f, i) => (
              <button
                key={i}
                onClick={() => setTopic(f)}
                className="px-2.5 py-1 bg-[#C8A97E]/10 text-[#C8A97E] text-[10px] rounded-md hover:bg-[#C8A97E]/20 transition-colors"
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
          className="w-full py-4 bg-gradient-to-r from-[#C8A97E] to-[#A88B65] text-[#0D0D12] font-bold rounded-xl active:scale-[0.98] transition-transform"
        >
          生成差异化脚本
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <div className="w-12 h-12 border-2 border-[#C8A97E]/30 border-t-[#C8A97E] rounded-full animate-spin mb-4" />
          <p className="text-white/50 text-sm">正在生成差异化脚本...</p>
          <p className="text-white/20 text-xs mt-1">黄金3秒钩子 + beat节奏 + 反转 + 强CTA</p>
        </div>
      )}

      {/* Script Result */}
      {script && (
        <div className="space-y-4">
          {/* Title & Tags */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <h3 className="text-white text-base font-semibold mb-2">{script.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {script.tags.map((tag, i) => (
                <span key={i} className="text-[#C8A97E]/60 text-xs">{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-white/30 text-xs">
              <span>BGM: {script.bgm}</span>
            </div>
          </div>

          {/* Hook */}
          {renderSection('黄金3秒钩子', script.hook, true)}

          {/* Body */}
          {script.body.map((section, i) => renderSection(`段落${i + 1}`, section))}

          {/* Twist */}
          {renderSection('反转节点', script.twist, true)}

          {/* CTA */}
          {renderSection('强CTA', script.cta, true)}

          {/* TTS Text */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white/50 text-xs">配音文本 (TTS)</h3>
              <button
                onClick={() => navigator.clipboard.writeText(script.ttsText)}
                className="text-[#C8A97E]/60 text-[10px] hover:text-[#C8A97E] transition-colors"
              >
                复制
              </button>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{script.ttsText}</p>
          </div>

          {/* Cover Prompt */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5">
            <h3 className="text-white/50 text-xs mb-2">封面提示词 (9:16)</h3>
            <p className="text-white/60 text-sm">{script.coverPrompt}</p>
          </div>

          {/* Forbidden Check */}
          <ForbiddenCheckCard check={script.forbiddenCheck} />

          {/* Regenerate */}
          <button
            onClick={generateScript}
            className="w-full py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/40 text-sm hover:border-[#C8A97E]/20 transition-colors"
          >
            重新生成
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  );
}

function ForbiddenCheckCard({ check }: { check: ForbiddenCheck }) {
  return (
    <div className={`rounded-2xl p-5 ${check.hasForbidden ? 'bg-red-500/5 border border-red-500/20' : 'bg-[#00B894]/5 border border-[#00B894]/20'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{check.hasForbidden ? '⚠️' : '✅'}</span>
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

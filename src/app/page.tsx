'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Crown, BarChart3, Phone, Store, UserCircle, Plus,
  Mic, X, ChevronRight, Activity,
} from 'lucide-react';

/* ─── 角色配置 ─── */
const ROLES = [
  { key: 'boss', label: '老板', icon: Crown, desc: '品牌定位·思想领导力·行业观点' },
  { key: 'operator', label: '运营', icon: BarChart3, desc: '选题节奏·对标拆解·可复用模板' },
  { key: 'sales', label: '销售', icon: Phone, desc: '获客转化·私域引流·产品种草' },
  { key: 'shop-owner', label: '实体店主', icon: Store, desc: '同城引流·到店转化·本地生活' },
  { key: 'personal-ip', label: '个人IP', icon: UserCircle, desc: '人设打造·涨粉钩子·记忆点' },
] as const;

const GENDERS = ['男', '女', '不限'] as const;

const INDUSTRIES = [
  '餐饮', '美妆', '教育', '汽车租车', '母婴',
  '健身', '家居', '金融', '本地生活', '电商', '文旅',
] as const;

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<string>('operator');
  const [input, setInput] = useState('');
  const [gender, setGender] = useState<string>('不限');
  const [industries, setIndustries] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const toggleIndustry = useCallback((ind: string) => {
    setIndustries(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  }, []);

  const handleGenerate = useCallback(() => {
    if (!input.trim()) return;
    setGenerating(true);
    const params = new URLSearchParams({
      role,
      q: input.trim(),
      gender,
      industry: industries.join(','),
    });
    router.push(`/generate?${params.toString()}`);
  }, [role, input, gender, industries, router]);

  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      {/* ─── 顶部 LOGO ─── */}
      <header className="sticky top-0 z-40 h-12 flex items-center justify-between px-5"
        style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B 0%, #0E1016 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center hud-clip-tr"
            style={{ background: 'linear-gradient(180deg, #1A1E26, #12151B)', border: '1px solid rgba(140,150,165,0.2)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: '#FF3B5C' }} />
          </div>
          <span className="font-display font-bold text-sm tracking-[0.2em] metal-text">XIANLIAO</span>
          <span className="text-[10px] font-mono tracking-wider" style={{ color: '#5A6273' }}>AI</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 ml-1"
            style={{ color: '#21E6C1', background: 'rgba(33,230,193,0.08)', border: '1px solid rgba(33,230,193,0.15)' }}>
            v2.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="hud-btn-ghost px-3 py-1.5 text-xs font-mono rounded-sm"
            onClick={() => router.push('/brand-assets')}>
            品牌资产
          </button>
          <button className="hud-btn-ghost px-3 py-1.5 text-xs font-mono rounded-sm"
            onClick={() => router.push('/topic-engine')}>
            进阶区
          </button>
        </div>
      </header>

      {/* ─── 主内容区 ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8">

          {/* 标题 */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-[0.15em] metal-text">
              XIANLIAO AI
            </h1>
            <p className="text-on-surface-variant text-sm font-mono">
              对小咸说一句，它就懂你要什么结果
            </p>
          </div>

          {/* STEP 1：选角色 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>STEP 01</span>
              <span className="text-xs text-on-surface-variant">你是谁</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon;
                const active = role === r.key;
                return (
                  <button key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`metal-panel rounded-sm p-3 text-center transition-all relative overflow-hidden ${active ? 'glow-red' : ''}`}
                    style={active ? { borderColor: 'rgba(255,59,92,0.5)' } : undefined}>
                    {/* 顶部霓虹分隔线 */}
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: active ? 'rgba(255,59,92,0.6)' : 'rgba(140,150,165,0.2)' }} />
                    <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: active ? '#FF3B5C' : '#9AA3B2' }} />
                    <div className={`text-xs font-medium ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {r.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2：一句话 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>STEP 02</span>
              <span className="text-xs text-on-surface-variant">对小咸说一句</span>
            </div>
            <div className="metal-panel rounded-lg p-1 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="我是做XX的，想发给XX人群，关于XX..."
                className="flex-1 bg-surface-container border-none rounded-md px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-weakest focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="p-2.5 rounded-md transition-colors"
                style={{ color: '#21E6C1' }}
                title="语音输入">
                <Mic className="w-5 h-5" />
              </button>
              {input && (
                <button className="p-2.5 rounded-md text-on-surface-weakest hover:text-on-surface" onClick={() => setInput('')}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>

          {/* STEP 3：快速标签 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>STEP 03</span>
              <span className="text-xs text-on-surface-variant">快速标签</span>
            </div>

            {/* 性别/人设 */}
            <div className="mb-3">
              <span className="text-[10px] font-mono text-on-surface-weakest mr-2">人设</span>
              <div className="inline-flex gap-1.5">
                {GENDERS.map(g => (
                  <button key={g}
                    onClick={() => setGender(g)}
                    className={`hud-tag ${gender === g ? 'hud-tag-active' : ''}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* 行业 */}
            <div>
              <span className="text-[10px] font-mono text-on-surface-weakest mr-2">行业</span>
              <div className="inline-flex flex-wrap gap-1.5">
                {INDUSTRIES.map(ind => (
                  <button key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`hud-tag ${industries.includes(ind) ? 'hud-tag-active' : ''}`}>
                    {ind}
                  </button>
                ))}
                <button className="hud-tag flex items-center gap-1">
                  <Plus className="w-3 h-3" /> 自定义
                </button>
              </div>
            </div>
          </section>

          {/* 一键生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || generating}
            className={`hud-btn-primary w-full py-3.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${!input.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Zap className="w-4 h-4" />
            {generating ? '正在跳转...' : '一键生成'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* ─── 底部状态栏 ─── */}
      <footer className="h-7 flex items-center justify-between px-5"
        style={{ background: '#0C0E12', borderTop: '1px solid rgba(140,150,165,0.12)' }}>
        <div className="flex items-center gap-4 text-[9px] font-mono" style={{ color: '#5A6273' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#21E6C1' }} />
            SYSTEM ONLINE
          </span>
          <span>ENGINE: DOUBAO-SEED</span>
          <span>MODEL: LITE-260215</span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono" style={{ color: '#5A6273' }}>
          <Activity className="w-3 h-3" />
          <span>READY</span>
        </div>
      </footer>
    </div>
  );
}

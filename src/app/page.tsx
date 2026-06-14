'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Crown, BarChart3, Phone, Store, UserCircle, Plus,
  Mic, X, ChevronRight, Activity, TrendingUp, TrendingDown,
  Eye, Target, Flame,
} from 'lucide-react';
import { NACLLogo } from '@/components/nacl-logo';

/* ─── 角色配置 — 紧凑行 ─── */
const ROLES = [
  { key: 'boss', label: '老板', icon: Crown, color: '#FF3B5C' },
  { key: 'operator', label: '运营', icon: BarChart3, color: '#21E6C1' },
  { key: 'sales', label: '销售', icon: Phone, color: '#FF2E97' },
  { key: 'shop-owner', label: '店主', icon: Store, color: '#F5A623' },
  { key: 'personal-ip', label: 'IP', icon: UserCircle, color: '#8B5CFF' },
] as const;

const GENDERS = ['男', '女', '不限'] as const;

const INDUSTRIES = [
  '餐饮', '美妆', '教育', '汽车', '母婴',
  '健身', '家居', '金融', '本地生活', '电商', '文旅',
] as const;

/* ─── 迷你 Sparkline 组件 — 股票走势线 ─── */
function Sparkline({ data, color, width = 60, height = 20 }: {
  data: number[]; color: string; width?: number; height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      {/* 末端发光点 */}
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * (height - 2) - 1}
        r="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}

/* ─── 模拟行情数据 ─── */
const MOCK_TICKERS = [
  { label: '笔记曝光', value: '12.8K', change: +8.3, data: [40, 55, 48, 62, 58, 75, 82, 78, 90, 95] },
  { label: '互动率', value: '6.2%', change: +2.1, data: [20, 25, 22, 28, 32, 30, 35, 38, 36, 42] },
  { label: '获客成本', value: '¥3.2', change: -12.5, data: [80, 72, 68, 65, 60, 55, 50, 48, 42, 38] },
  { label: '转化率', value: '4.7%', change: +1.5, data: [30, 32, 35, 33, 38, 40, 42, 44, 43, 47] },
];

/* ─── 滚动数字动画 ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(target);
  useEffect(() => {
    ref.current = target;
    let frame: number;
    const start = current;
    const diff = target - start;
    const duration = 800;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return <>{current}{suffix}</>;
}

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<string>('operator');
  const [input, setInput] = useState('');
  const [gender, setGender] = useState<string>('不限');
  const [industries, setIndustries] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  // 获取额度
  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.json())
      .then(d => { if (d.credits_total !== undefined) setCredits(d.credits_total - (d.credits_used ?? 0)); })
      .catch(() => {});
  }, []);

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
      <header className="sticky top-0 z-40 h-11 flex items-center justify-between px-4"
        style={{ borderBottom: '1px solid rgba(140,150,165,0.18)', background: 'linear-gradient(180deg, #12151B 0%, #0E1016 100%)' }}>
        <div className="flex items-center gap-3">
          <NACLLogo size="sm" />
          <span className="text-[9px] font-mono px-1.5 py-0.5"
            style={{ color: '#21E6C1', background: 'rgba(33,230,193,0.08)', border: '1px solid rgba(33,230,193,0.15)' }}>
            v2.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* 额度显示 */}
          {credits !== null && (
            <span className="text-[9px] font-mono px-2 py-0.5"
              style={{ color: '#FF3B5C', background: 'rgba(255,59,92,0.06)', border: '1px solid rgba(255,59,92,0.12)' }}>
              <Zap className="w-2.5 h-2.5 inline mr-0.5" />
              {credits}
            </span>
          )}
          <button className="hud-btn-ghost px-2.5 py-1 text-[10px] font-mono rounded-sm"
            onClick={() => router.push('/brand-assets')}>
            资产
          </button>
          <button className="hud-btn-ghost px-2.5 py-1 text-[10px] font-mono rounded-sm"
            onClick={() => router.push('/topic-engine')}>
            进阶
          </button>
        </div>
      </header>

      {/* ─── 行情 Ticker 条 ─── */}
      <div className="flex items-center gap-0 overflow-hidden"
        style={{ height: 24, background: '#0C0E12', borderBottom: '1px solid rgba(140,150,165,0.08)' }}>
        {MOCK_TICKERS.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 border-r"
            style={{ borderRightColor: 'rgba(140,150,165,0.06)' }}>
            <span className="text-[8px] font-mono whitespace-nowrap" style={{ color: '#5A6273' }}>{t.label}</span>
            <span className="text-[9px] font-mono font-medium" style={{ color: '#E8EBF0' }}>{t.value}</span>
            <span className="text-[8px] font-mono flex items-center gap-0.5"
              style={{ color: t.change > 0 ? '#FF3B5C' : '#15E0A0' }}>
              {t.change > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {t.change > 0 ? '+' : ''}{t.change}%
            </span>
            <Sparkline data={t.data} color={t.change > 0 ? '#FF3B5C' : '#15E0A0'} width={40} height={14} />
          </div>
        ))}
      </div>

      {/* ─── 主内容区 ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl space-y-5">

          {/* 品牌 Hero */}
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-2">
              <NACLLogo size="lg" showText={false} />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-[0.25em] metal-text">
              NACL
            </h1>
            <p className="text-[11px] font-mono" style={{ color: '#5A6273' }}>
              选角色 · 说一句 · 一键出成品
            </p>
          </div>

          {/* STEP 1：角色 — 紧凑胶囊行 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>01</span>
              <span className="text-[10px]" style={{ color: '#5A6273' }}>你是谁</span>
            </div>
            <div className="flex gap-1.5">
              {ROLES.map(r => {
                const Icon = r.icon;
                const active = role === r.key;
                return (
                  <button key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] font-medium transition-all ${active ? 'glow-red' : ''}`}
                    style={active ? {
                      background: `${r.color}12`,
                      border: `1px solid ${r.color}55`,
                      color: r.color,
                    } : {
                      background: 'rgba(140,150,165,0.04)',
                      border: '1px solid rgba(140,150,165,0.10)',
                      color: '#8A94A6',
                    }}>
                    <Icon className="w-3.5 h-3.5" />
                    {r.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* STEP 2：一句话 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>02</span>
              <span className="text-[10px]" style={{ color: '#5A6273' }}>说一句</span>
            </div>
            <div className="metal-panel rounded-sm p-0.5 flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="我是做XX的，想发给XX人群，关于XX..."
                className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-weakest focus:outline-none"
              />
              <button className="p-2 rounded-sm transition-colors" style={{ color: '#21E6C1' }} title="语音输入">
                <Mic className="w-4 h-4" />
              </button>
              {input && (
                <button className="p-1.5 rounded-sm text-on-surface-weakest hover:text-on-surface" onClick={() => setInput('')}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </section>

          {/* STEP 3：快速标签 — 内联式 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>03</span>
              <span className="text-[10px]" style={{ color: '#5A6273' }}>标签</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {/* 性别标签 */}
              {GENDERS.map(g => (
                <button key={g}
                  onClick={() => setGender(g)}
                  className={`hud-tag text-[10px] px-2 py-0.5 ${gender === g ? 'hud-tag-active' : ''}`}>
                  {g}
                </button>
              ))}

              <span className="text-[9px] font-mono self-center mx-1" style={{ color: '#2A2E36' }}>│</span>

              {/* 行业标签 */}
              {INDUSTRIES.map(ind => (
                <button key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`hud-tag text-[10px] px-2 py-0.5 ${industries.includes(ind) ? 'hud-tag-active' : ''}`}>
                  {ind}
                </button>
              ))}
              <button className="hud-tag text-[10px] px-2 py-0.5 flex items-center gap-0.5">
                <Plus className="w-2.5 h-2.5" /> 自定义
              </button>
            </div>
          </section>

          {/* 一键生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || generating}
            className={`hud-btn-primary w-full py-2.5 rounded-sm font-medium text-xs flex items-center justify-center gap-2 ${!input.trim() ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Zap className="w-3.5 h-3.5" />
            {generating ? '正在跳转...' : '一键生成'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* 快速灵感 — 小卡片行 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-3 h-3" style={{ color: '#FF3B5C' }} />
              <span className="text-[10px]" style={{ color: '#5A6273' }}>热门灵感</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: Eye, text: '新手博主涨粉', sub: '0→1K' },
                { icon: Target, text: '同城到店引流', sub: 'ROI 3.2x' },
                { icon: TrendingUp, text: '爆款选题钩子', sub: '播放 10W+' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i}
                    onClick={() => setInput(item.text)}
                    className="metal-panel rounded-sm p-2 text-left transition-all hover:border-[rgba(210,216,226,0.25)]">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className="w-3 h-3" style={{ color: '#8A94A6' }} />
                      <span className="text-[9px] font-mono" style={{ color: '#FF3B5C' }}>{item.sub}</span>
                    </div>
                    <div className="text-[10px]" style={{ color: '#8A94A6' }}>{item.text}</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* ─── 底部状态栏 ─── */}
      <footer className="h-6 flex items-center justify-between px-4"
        style={{ background: '#0C0E12', borderTop: '1px solid rgba(140,150,165,0.10)' }}>
        <div className="flex items-center gap-3 text-[8px] font-mono" style={{ color: '#3A3E46' }}>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full pulse-dot" style={{ background: '#21E6C1' }} />
            ONLINE
          </span>
          <span>DOUBAO-SEED</span>
          <span>LITE-260215</span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-mono" style={{ color: '#3A3E46' }}>
          <Activity className="w-2.5 h-2.5" />
          READY
        </div>
      </footer>
    </div>
  );
}

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

/* ─── 真实股市走势线 — 半透明背景动画 ─── */
function BackgroundSparklines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* 两条走势线：红线(涨) + 绿线(跌)，真实价格模型 */
    const MAX_POINTS = 60;
    const ADD_INTERVAL = 1200; // 每 1.2 秒加一个点
    const LINE_CONFIGS = [
      { stroke: 'rgba(255,59,92,0.20)', node: 'rgba(255,59,92,0.40)', baseY: 0.35, vol: 0.012, drift: 0.0002 },
      { stroke: 'rgba(21,224,160,0.16)', node: 'rgba(21,224,160,0.35)', baseY: 0.65, vol: 0.010, drift: -0.0001 },
    ];

    /* 每条线的价格历史 — 随机游走 */
    const priceHistories = LINE_CONFIGS.map(cfg => {
      const arr: number[] = [];
      let price = cfg.baseY;
      for (let i = 0; i < 30; i++) {
        price += (Math.random() - 0.48 + cfg.drift) * cfg.vol;
        price = Math.max(0.1, Math.min(0.9, price));
        arr.push(price);
      }
      return arr;
    });

    let lastAddTime = 0;
    let animProgress = 1;

    const draw = (timestamp: number) => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width;
      const h = canvas.height;
      const logW = w / dpr;
      const logH = h / dpr;

      ctx.clearRect(0, 0, w, h);

      /* 网格线 — 极淡 */
      ctx.strokeStyle = 'rgba(140,150,165,0.04)';
      ctx.lineWidth = 0.5 * dpr;
      for (let gy = 0; gy < logH; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(0, gy * dpr);
        ctx.lineTo(w, gy * dpr);
        ctx.stroke();
      }
      for (let gx = 0; gx < logW; gx += 36) {
        ctx.beginPath();
        ctx.moveTo(gx * dpr, 0);
        ctx.lineTo(gx * dpr, h);
        ctx.stroke();
      }

      /* 判断是否该加新点 */
      if (timestamp - lastAddTime > ADD_INTERVAL) {
        lastAddTime = timestamp;
        animProgress = 0;
        LINE_CONFIGS.forEach((cfg, i) => {
          const arr = priceHistories[i];
          const last = arr[arr.length - 1];
          let next = last + (Math.random() - 0.48 + cfg.drift) * cfg.vol;
          next = Math.max(0.1, Math.min(0.9, next));
          arr.push(next);
          if (arr.length > MAX_POINTS) arr.shift();
        });
      }

      animProgress = Math.min(1, animProgress + 0.025);
      const ease = 1 - Math.pow(1 - animProgress, 3);

      /* 画每条线 */
      LINE_CONFIGS.forEach((cfg, li) => {
        const arr = priceHistories[li];
        if (arr.length < 2) return;

        const pointSpacing = logW / (MAX_POINTS - 1);
        const offsetX = (MAX_POINTS - arr.length) * pointSpacing;

        /* 计算点坐标 */
        const points: { x: number; y: number }[] = arr.map((p, idx) => ({
          x: (offsetX + idx * pointSpacing) * dpr,
          y: p * h,
        }));

        /* 最后一个点做缓动插值 */
        if (points.length >= 2 && animProgress < 1) {
          const prev = points[points.length - 2];
          const curr = points[points.length - 1];
          curr.x = prev.x + (curr.x - prev.x) * ease;
          curr.y = prev.y + (curr.y - prev.y) * ease;
        }

        /* 画平滑贝塞尔曲线 */
        ctx.beginPath();
        ctx.strokeStyle = cfg.stroke;
        ctx.lineWidth = 1.5 * dpr;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];
          const cpx = (prev.x + curr.x) / 2;
          ctx.bezierCurveTo(
            prev.x + (cpx - prev.x) * 0.6, prev.y,
            curr.x - (curr.x - cpx) * 0.6, curr.y,
            curr.x, curr.y
          );
        }
        ctx.stroke();

        /* 数据节点 — 小圆点 */
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const isLast = i === points.length - 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, isLast ? 2.5 * dpr : 1 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = cfg.node;
          ctx.globalAlpha = isLast ? 1 : 0.5;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        /* 最新节点脉冲光圈 */
        if (points.length > 0) {
          const last = points[points.length - 1];
          const pulse = (Math.sin(timestamp * 0.003) + 1) / 2;
          ctx.beginPath();
          ctx.arc(last.x, last.y, (5 + pulse * 5) * dpr, 0, Math.PI * 2);
          ctx.fillStyle = cfg.stroke.replace(/[\d.]+\)$/, `${0.10 + pulse * 0.06})`);
          ctx.fill();
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    /* 响应式尺寸 */
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
    };

    resize();
    window.addEventListener('resize', resize);
    lastAddTime = performance.now();
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}

/* ─── 迷你行情指标 (热点灵感下方) ─── */
function MiniTicker({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[8px] font-mono" style={{ color: '#5A6273' }}>{label}</span>
      <span className="text-[9px] font-mono font-medium" style={{ color: '#E8EBF0' }}>{value}</span>
      {typeof change === 'number' && (
        <span className="text-[8px] font-mono" style={{ color: change > 0 ? '#FF3B5C' : '#15E0A0' }}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<string>('operator');
  const [input, setInput] = useState('');
  const [gender, setGender] = useState<string>('不限');
  const [industries, setIndustries] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);
  const [inputHint, setInputHint] = useState('');
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

  const addCustomIndustry = useCallback(() => {
    const value = customIndustry.trim();
    if (!value) return;
    setIndustries(prev => prev.includes(value) ? prev : [...prev, value]);
    setCustomIndustry('');
    setShowCustomIndustry(false);
    setInputHint('');
  }, [customIndustry]);

  const handleVoiceInput = useCallback(() => {
    setInputHint('当前浏览器未开放语音输入，请先用文字输入');
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
          <NACLLogo size="xs" />
          <span className="text-[9px] font-mono px-1.5 py-0.5"
            style={{ color: '#21E6C1', background: 'rgba(33,230,193,0.08)', border: '1px solid rgba(33,230,193,0.15)' }}>
            v2.0
          </span>
        </div>
        <div className="flex items-center gap-2">
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

      {/* ─── 主内容区 ─── */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl space-y-5">

          {/* 品牌 Hero — NACL Logo + 半透明走势线背景 */}
          <div className="relative overflow-hidden rounded-sm" style={{ minHeight: 120 }}>
            {/* 半透明实时跳动走势线 */}
            <BackgroundSparklines />

            {/* Logo 居中叠在走势线上 */}
            <div className="relative z-10 flex flex-col items-center justify-center py-6">
              <NACLLogo size="lg" />
              <p className="text-[11px] font-mono mt-2" style={{ color: '#5A6273' }}>
                选角色 · 说一句 · 一键出成品
              </p>
            </div>
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
                    className={`flex min-h-9 items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px] font-medium transition-all ${active ? 'glow-red' : ''}`}
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
              <button
                onClick={handleVoiceInput}
                aria-label="语音输入"
                className="flex h-9 w-9 items-center justify-center rounded-sm transition-colors"
                style={{ color: '#21E6C1' }}
                title="语音输入"
              >
                <Mic className="w-4 h-4" />
              </button>
              {input && (
                <button
                  aria-label="清空输入"
                  title="清空输入"
                  className="flex h-9 w-9 items-center justify-center rounded-sm text-on-surface-weakest hover:text-on-surface"
                  onClick={() => setInput('')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {inputHint && (
              <p className="mt-1 text-[10px] text-on-surface-weakest">{inputHint}</p>
            )}
          </section>

          {/* STEP 3：快速标签 — 内联式 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono tracking-widest" style={{ color: '#FF3B5C' }}>03</span>
              <span className="text-[10px]" style={{ color: '#5A6273' }}>标签</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {GENDERS.map(g => (
                <button key={g}
                  onClick={() => setGender(g)}
                  className={`hud-tag text-[10px] px-2 py-0.5 ${gender === g ? 'hud-tag-active' : ''}`}>
                  {g}
                </button>
              ))}

              <span className="text-[9px] font-mono self-center mx-1" style={{ color: '#2A2E36' }}>│</span>

              {INDUSTRIES.map(ind => (
                <button key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`hud-tag text-[10px] px-2 py-0.5 ${industries.includes(ind) ? 'hud-tag-active' : ''}`}>
                  {ind}
                </button>
              ))}
              {industries.filter(ind => !INDUSTRIES.includes(ind as typeof INDUSTRIES[number])).map(ind => (
                <button key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className="hud-tag hud-tag-active text-[10px] px-2 py-0.5">
                  {ind}
                </button>
              ))}
              <button
                onClick={() => setShowCustomIndustry((value) => !value)}
                className="hud-tag text-[10px] px-2 py-0.5 flex items-center gap-0.5"
              >
                <Plus className="w-2.5 h-2.5" /> 自定义
              </button>
            </div>
            {showCustomIndustry && (
              <div className="mt-2 flex gap-2">
                <input
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomIndustry()}
                  placeholder="输入行业标签"
                  className="min-w-0 flex-1 rounded-sm border border-[rgba(140,150,165,0.18)] bg-transparent px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-weakest focus:outline-none"
                />
                <button onClick={addCustomIndustry} className="hud-btn-primary rounded-sm px-3 py-1.5 text-xs">
                  添加
                </button>
              </div>
            )}
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

          {/* 快速灵感 + 行情指标 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-3 h-3" style={{ color: '#FF3B5C' }} />
              <span className="text-[10px]" style={{ color: '#5A6273' }}>热门灵感</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: Eye, text: '新手博主涨粉', sub: '待测' },
                { icon: Target, text: '同城到店引流', sub: '待接入' },
                { icon: TrendingUp, text: '爆款选题钩子', sub: 'AI推断' },
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

            {/* 行情指标 — 紧凑行，灵感卡片下方 */}
            <div className="flex items-center justify-between mt-2 px-1 py-1.5 rounded-sm"
              style={{ background: 'rgba(140,150,165,0.03)', border: '1px solid rgba(140,150,165,0.06)' }}>
              <MiniTicker label="曝光" value="待接入" />
              <span className="text-[6px]" style={{ color: '#2A2E36' }}>│</span>
              <MiniTicker label="互动" value="待接入" />
              <span className="text-[6px]" style={{ color: '#2A2E36' }}>│</span>
              <MiniTicker label="成本" value="待接入" />
              <span className="text-[6px]" style={{ color: '#2A2E36' }}>│</span>
              <MiniTicker label="转化" value="待接入" />
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

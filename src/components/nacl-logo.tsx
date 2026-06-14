'use client';

/**
 * NACL Logo — 几何三角形符号 + NACL 字样
 * 基于「盐·连接·系统·Agent」品牌视觉：NaCl 化学式 → 三角形 A 符号 + 前卫等宽字
 */

interface NACLLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const SIZES = {
  sm: { symbol: 16, text: 'text-xs', gap: 1.5 },
  md: { symbol: 22, text: 'text-sm', gap: 2 },
  lg: { symbol: 40, text: 'text-3xl', gap: 3 },
} as const;

export function NACLLogo({ size = 'md', showText = true, className = '' }: NACLLogoProps) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center ${className}`} style={{ gap: s.gap }}>
      {/* 三角形 A 符号 */}
      <svg
        width={s.symbol}
        height={s.symbol}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 外三角 — 金属银描边 */}
        <path
          d="M16 3L29 27H3L16 3Z"
          stroke="url(#nacl-grad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="miter"
        />
        {/* 内三角 — 红色填充点缀 */}
        <path
          d="M16 9L23 24H9L16 9Z"
          fill="rgba(255,59,92,0.08)"
          stroke="rgba(255,59,92,0.35)"
          strokeWidth="0.75"
          strokeLinejoin="miter"
        />
        {/* 中心横杠 — A 的横线 */}
        <line
          x1="10.5"
          y1="20"
          x2="21.5"
          y2="20"
          stroke="rgba(255,59,92,0.6)"
          strokeWidth="1"
        />
        {/* 顶部顶点发光点 */}
        <circle cx="16" cy="4" r="1" fill="#FF3B5C" opacity="0.8" />
        <defs>
          <linearGradient id="nacl-grad" x1="3" y1="27" x2="29" y2="3">
            <stop stopColor="#D6DCE6" />
            <stop offset="0.5" stopColor="#9AA3B2" />
            <stop offset="1" stopColor="#D6DCE6" />
          </linearGradient>
        </defs>
      </svg>

      {/* NACL 字样 */}
      {showText && (
        <span
          className={`font-display font-bold tracking-[0.25em] metal-text ${s.text}`}
        >
          NACL
        </span>
      )}
    </div>
  );
}

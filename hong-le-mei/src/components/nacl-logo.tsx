'use client';

/**
 * NACL Logo — 严格还原品牌视觉指南
 * N: 左竖+斜线+右竖 / A: 两斜线交顶点+短横杠 / C: 圆弧开口方切 / L: 竖+横直角
 * 配色：纯白 #FFFFFF + 微辉光
 */

interface NACLLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

const SIZES = {
  xs: 56,
  sm: 80,
  md: 120,
  lg: 200,
  xl: 320,
} as const;

export function NACLLogo({ size = 'md', className = '', showGlow = true }: NACLLogoProps) {
  const w = SIZES[size];
  /* viewBox 0 0 200 50，字母间保持统一间距 */
  return (
    <svg
      width={w}
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 微辉光滤镜 */}
      <defs>
        <filter id="nacl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={showGlow ? 'url(#nacl-glow)' : undefined}>
        {/* N — 左竖 + 斜线 + 右竖 */}
        <path d="M10 42V14L36 42V14" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />

        {/* A — 两斜线交顶点 + 短横杠 */}
        <path d="M54 42L70 8L86 42" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="59" y1="30" x2="81" y2="30" stroke="white" strokeWidth="3.5" strokeLinecap="square" />

        {/* C — 圆弧开口，末端方切 */}
        <path d="M126 14A22 22 0 1 0 126 36" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />

        {/* L — 竖 + 横直角 */}
        <path d="M142 8V42H168" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
      </g>
    </svg>
  );
}

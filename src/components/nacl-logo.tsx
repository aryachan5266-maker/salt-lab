'use client';

/**
 * NACL Logo — 严格还原品牌视觉指南
 * N: 几何直线构成 / A: 无横杠锐角三角 / C: 圆弧开口方切 / L: 直角折线
 * 配色：白色 (#FFFFFF)，保持品牌纯粹性
 */

interface NACLLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  xs: 56,
  sm: 80,
  md: 120,
  lg: 200,
  xl: 320,
} as const;

export function NACLLogo({ size = 'md', className = '' }: NACLLogoProps) {
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
      {/* N — 左竖短 + 斜线 + 右竖长 */}
      <path d="M10 42V14L36 42V14" stroke="white" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />

      {/* A — 无横杠，两斜线交于顶点 */}
      <path d="M54 42L70 8L86 42" stroke="white" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />

      {/* C — 圆弧开口，末端方切 */}
      <path d="M126 14A22 22 0 1 0 126 36" stroke="white" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />

      {/* L — 横线短 + 竖线长，直角 */}
      <path d="M142 8V42H168" stroke="white" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

'use client';

/**
 * NΛCL Logo — uses the official brand SVG asset.
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
  return (
    <img
      src="/brand/nacl-logo-white.svg"
      width={w}
      height={Math.round(w / 4.72)}
      alt="NΛCL"
      className={className}
      style={{
        filter: showGlow ? 'drop-shadow(0 0 5px rgba(255,255,255,0.45))' : undefined,
        display: 'block',
      }}
    />
  );
}

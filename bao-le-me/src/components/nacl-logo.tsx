'use client';

interface NACLLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

const SIZES = {
  xs: 86,
  sm: 118,
  md: 180,
  lg: 280,
  xl: 420,
} as const;

export function NACLLogo({ size = 'md', className = '', showGlow = false }: NACLLogoProps) {
  const width = SIZES[size];

  return (
    <img
      src="/nacl-logo-white.svg"
      width={width}
      height={Math.round(width * 180 / 850)}
      className={className}
      alt="NACL logo"
      style={showGlow ? { filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.45))' } : undefined}
    />
  );
}

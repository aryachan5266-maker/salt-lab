import type { PageKey } from './types';

export function isValidPage(page: string): page is PageKey {
  const validPages: PageKey[] = [
    'home', 'onboarding', 'hot-radar', 'decode',
    'positioning', 'generate', 'brand-assets', 'settings',
  ];
  return validPages.includes(page as PageKey);
}

export function formatNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return String(num);
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(Math.round(n));
}

export function getHeatColor(heat: number): string {
  if (heat >= 80) return 'var(--color-accent)';
  if (heat >= 50) return 'rgba(99, 230, 255, 0.7)';
  return 'rgba(255,255,255,0.4)';
}

export function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'up': return '↑';
    case 'down': return '↓';
    default: return '→';
  }
}

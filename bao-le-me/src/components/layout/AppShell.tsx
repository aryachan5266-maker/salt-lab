'use client';

import { useApp } from '@/lib/store';
import BottomNav from './BottomNav';
import { NACLLogo } from '@/components/nacl-logo';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import HomePage from '@/components/home/HomePage';
import HotRadarPage from '@/components/hot-radar/HotRadarPage';
import DecodePage from '@/components/decode/DecodePage';
import PositioningPage from '@/components/positioning/PositioningPage';
import GeneratePage from '@/components/generate/GeneratePage';
import ContentLoopPage from '@/components/content-loop/ContentLoopPage';
import BrandAssetsPage from '@/components/brand-assets/BrandAssetsPage';
import SettingsPage from '@/components/settings/SettingsPage';
import {
  Crosshair,
  FileText,
  Gauge,
  ChevronLeft,
  Home,
  Layers3,
  Lock,
  Repeat2,
  Settings,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home' as const, label: '总控台', icon: Home },
  { id: 'hot-radar' as const, label: '热点雷达', icon: Gauge },
  { id: 'decode' as const, label: '同行拆解', icon: Layers3 },
  { id: 'positioning' as const, label: '差异化卡位', icon: Crosshair },
  { id: 'generate' as const, label: '脚本生成', icon: FileText },
  { id: 'content-loop' as const, label: '预测复盘', icon: Repeat2 },
  { id: 'brand-assets' as const, label: '品牌资产', icon: Sparkles },
  { id: 'settings' as const, label: '设置', icon: Settings },
];

export default function AppShell() {
  const { currentPage, setCurrentPage, goBack, canGoBack, customerProfile, brandAssets } = useApp();

  const renderPage = () => {
    if (!customerProfile && currentPage !== 'home' && currentPage !== 'onboarding' && currentPage !== 'content-loop') {
      return (
        <div className="mx-auto max-w-2xl rounded-[14px] border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-6 md:p-8">
          <div className="mb-5 grid size-12 place-items-center rounded-[10px] border border-[var(--color-accent)]/28 bg-black/20 text-[var(--color-accent)]">
            <Lock size={20} />
          </div>
          <p className="nacl-kicker mb-3">NEED AUDIENCE FIRST</p>
          <h1 className="text-3xl font-semibold text-white">先完成真实客户反推</h1>
          <p className="mt-3 text-sm leading-7 text-white/58">
            爆了么的热点、卡位和脚本都依赖客户上下文。先测出“谁会买、为什么买、别怎么拍”，后面的按钮才会给出能用的结果。
          </p>
          <button
            type="button"
            onClick={() => setCurrentPage('onboarding')}
            className="mt-6 rounded-[8px] bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black transition hover:bg-white"
          >
            开始 30 秒测客户
          </button>
        </div>
      );
    }

    switch (currentPage) {
      case 'onboarding':
        return <OnboardingFlow />;
      case 'hot-radar':
        return <HotRadarPage />;
      case 'decode':
        return <DecodePage />;
      case 'positioning':
        return <PositioningPage />;
      case 'generate':
        return <GeneratePage />;
      case 'content-loop':
        return <ContentLoopPage />;
      case 'brand-assets':
        return <BrandAssetsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  if (currentPage === 'onboarding') {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(100,211,255,0.14),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="absolute inset-0 nacl-grid opacity-[0.18]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(7,9,13,0.82)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="flex shrink-0 items-center text-left"
          >
            <NACLLogo size="xs" className="w-[112px]" />
          </button>

          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack || currentPage === 'home'}
            className="hidden items-center gap-1.5 rounded-[8px] border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-semibold text-white/48 transition hover:border-white/22 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 md:inline-flex lg:hidden xl:inline-flex"
          >
            <ChevronLeft size={14} />
            返回
          </button>

          <nav className="hidden min-w-0 items-center gap-1 rounded-[10px] border border-white/10 bg-white/[0.03] p-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isLocked = !customerProfile && item.id !== 'home' && item.id !== 'content-loop';
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setCurrentPage(item.id)}
                  className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-[8px] px-3 text-sm transition ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-white/58 hover:bg-white/[0.065] hover:text-white'
                  } ${isLocked ? 'cursor-not-allowed opacity-35' : ''}`}
                >
                  {isLocked ? <Lock size={14} /> : <Icon size={15} />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden max-w-[260px] truncate text-right text-xs leading-5 text-white/42 2xl:block">
              {brandAssets
                ? `${brandAssets.businessName || '未命名项目'} · ${brandAssets.city || '未定城市'}`
                : '先完成客户反推'}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage('onboarding')}
              className="rounded-[8px] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white active:translate-y-px"
            >
              {brandAssets ? '重测客户' : '开始测客户'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[1320px] px-4 py-5 pb-24 sm:px-6 md:py-8 lg:px-8">
        {renderPage()}
      </main>

      <BottomNav />
    </div>
  );
}

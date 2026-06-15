'use client';

import { useApp } from '@/lib/store';
import BottomNav from './BottomNav';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import HomePage from '@/components/home/HomePage';
import HotRadarPage from '@/components/hot-radar/HotRadarPage';
import DecodePage from '@/components/decode/DecodePage';
import PositioningPage from '@/components/positioning/PositioningPage';
import GeneratePage from '@/components/generate/GeneratePage';
import BrandAssetsPage from '@/components/brand-assets/BrandAssetsPage';
import SettingsPage from '@/components/settings/SettingsPage';

export default function AppShell() {
  const { currentPage } = useApp();

  const renderPage = () => {
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
      case 'brand-assets':
        return <BrandAssetsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-white max-w-[480px] mx-auto relative">
      <main className="pb-20">
        {renderPage()}
      </main>
      {currentPage !== 'onboarding' && <BottomNav />}
    </div>
  );
}

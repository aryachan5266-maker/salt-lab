'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { BrandAssets, PageKey, RoleKey, RoleDef } from '@/lib/types';
import { ROLES } from '@/lib/roles';

interface AppState {
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
  goBack: () => void;
  canGoBack: boolean;
  brandAssets: BrandAssets | null;
  setBrandAssets: (assets: BrandAssets) => void;
  customerProfile: BrandAssets | null;
  roleConfig: RoleDef | null;
  hasBrand: boolean;
  currentRole: RoleKey;
  setCurrentRole: (role: RoleKey) => void;
}

const AppContext = createContext<AppState | null>(null);

const PAGE_KEYS: PageKey[] = [
  'home',
  'onboarding',
  'hot-radar',
  'decode',
  'positioning',
  'generate',
  'content-loop',
  'brand-assets',
  'settings',
];

function getHashPage(): PageKey | null {
  if (typeof window === 'undefined') return null;
  const value = window.location.hash.replace(/^#/, '') as PageKey;
  return PAGE_KEYS.includes(value) ? value : null;
}

function writeHashPage(page: PageKey, mode: 'push' | 'replace' = 'push') {
  if (typeof window === 'undefined') return;
  const next = `#${page}`;
  if (window.location.hash === next) return;
  const method = mode === 'push' ? 'pushState' : 'replaceState';
  window.history[method](null, '', next);
}

function normalizeBrandAssets(assets: BrandAssets): BrandAssets {
  const role = assets.role && ROLES[assets.role] ? assets.role : 'boss';
  return {
    ...assets,
    role,
    occupation: assets.occupation || ROLES[role].label,
    targetAudience: Array.isArray(assets.targetAudience) ? assets.targetAudience : [],
    contentFormats: Array.isArray(assets.contentFormats) ? assets.contentFormats : [],
    avoid: Array.isArray(assets.avoid) ? assets.avoid : [],
    operationAdvice: Array.isArray(assets.operationAdvice) ? assets.operationAdvice : [],
    riskWarnings: Array.isArray(assets.riskWarnings) ? assets.riskWarnings : [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPageState] = useState<PageKey>('home');
  const [pageHistory, setPageHistory] = useState<PageKey[]>([]);
  const [brandAssets, setBrandAssetsState] = useState<BrandAssets | null>(null);
  const [currentRole, setCurrentRole] = useState<RoleKey>('boss');

  useEffect(() => {
    try {
      const hashPage = getHashPage();
      const saved = localStorage.getItem('nacl-brand-assets');
      if (saved) {
        const parsed = normalizeBrandAssets(JSON.parse(saved) as BrandAssets);
        setBrandAssetsState(parsed);
        setCurrentRole(parsed.role || 'boss');
        const savedPage = localStorage.getItem('nacl-current-page') as PageKey | null;
        setCurrentPageState(hashPage || savedPage || 'home');
      } else {
        setCurrentPageState(hashPage || 'onboarding');
      }
    } catch {
      try {
        localStorage.removeItem('nacl-brand-assets');
        localStorage.removeItem('nacl-current-page');
      } catch {
        // ignore cleanup failure
      }
      setCurrentPageState('onboarding');
    }

    const onHashChange = () => {
      const page = getHashPage();
      if (page) setCurrentPageState(page);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setCurrentPage = useCallback((page: PageKey) => {
    if (currentPage === page) return;
    setPageHistory((history) => [...history, currentPage].slice(-16));
    setCurrentPageState(page);
    try {
      localStorage.setItem('nacl-current-page', page);
    } catch {
      // localStorage not available
    }
    writeHashPage(page);
  }, [currentPage]);

  const goBack = useCallback(() => {
    const previous = pageHistory.at(-1);
    if (!previous) return;
    setPageHistory(pageHistory.slice(0, -1));
    setCurrentPageState(previous);
    try {
      localStorage.setItem('nacl-current-page', previous);
    } catch {
      // localStorage not available
    }
    writeHashPage(previous, 'replace');
  }, [pageHistory]);

  const setBrandAssets = useCallback((assets: BrandAssets) => {
    const normalized = normalizeBrandAssets(assets);
    setBrandAssetsState(normalized);
    setCurrentRole(normalized.role || 'boss');
    try {
      localStorage.setItem('nacl-brand-assets', JSON.stringify(normalized));
      localStorage.setItem('nacl-current-page', 'home');
    } catch {
      // localStorage not available
    }
    writeHashPage('home');
    setPageHistory([]);
    setCurrentPageState('home');
  }, []);

  const hasBrand = brandAssets !== null;
  const customerProfile = brandAssets;
  const roleConfig = currentRole ? ROLES[currentRole] : null;

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        goBack,
        canGoBack: pageHistory.length > 0,
        brandAssets,
        setBrandAssets,
        customerProfile,
        roleConfig,
        hasBrand,
        currentRole,
        setCurrentRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

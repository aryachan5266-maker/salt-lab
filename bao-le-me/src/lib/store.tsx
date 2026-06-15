'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { BrandAssets, PageKey, RoleKey, RoleDef } from '@/lib/types';
import { ROLES } from '@/lib/roles';

interface AppState {
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
  brandAssets: BrandAssets | null;
  setBrandAssets: (assets: BrandAssets) => void;
  customerProfile: BrandAssets | null;
  roleConfig: RoleDef | null;
  hasBrand: boolean;
  currentRole: RoleKey;
  setCurrentRole: (role: RoleKey) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageKey>('home');
  const [brandAssets, setBrandAssetsState] = useState<BrandAssets | null>(null);
  const [currentRole, setCurrentRole] = useState<RoleKey>('boss');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nacl-brand-assets');
      if (saved) {
        const parsed = JSON.parse(saved) as BrandAssets;
        setBrandAssetsState(parsed);
        setCurrentRole(parsed.role || 'boss');
      } else {
        setCurrentPage('onboarding');
      }
    } catch {
      setCurrentPage('onboarding');
    }
  }, []);

  const setBrandAssets = useCallback((assets: BrandAssets) => {
    setBrandAssetsState(assets);
    setCurrentRole(assets.role || 'boss');
    try {
      localStorage.setItem('nacl-brand-assets', JSON.stringify(assets));
    } catch {
      // localStorage not available
    }
  }, []);

  const hasBrand = brandAssets !== null;
  const customerProfile = brandAssets;
  const roleConfig = currentRole ? ROLES[currentRole] : null;

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
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

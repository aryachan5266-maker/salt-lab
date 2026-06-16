'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

// ========== 轻量 Store（基于 localStorage）==========
const STORAGE_KEYS = {
  topicPool: 'xhs_topic_pool_v1',
  pipeline: 'xhs_pipeline_v1',
  calendar: 'xhs_calendar_v1',
  benchmarks: 'xhs_benchmarks_v1',
  knowledge: 'xhs_knowledge_v1',
  activities: 'xhs_activities_v1',
  analyticsAdopted: 'xhs_analytics_adopted_v1',
  settings: 'xhs_settings_v1',
};

type StoredTopic = { id: string } & Record<string, unknown>;
type StoredItem = Record<string, unknown>;
type StoredActivity = { id: string; type: string; text: string; at: number };
type Settings = Record<string, unknown>;

type Store = {
  topicPool: StoredTopic[];
  pipeline: StoredItem[];
  calendar: StoredItem[];
  benchmarks: StoredItem[];
  knowledge: StoredItem[];
  activities: StoredActivity[];
  analyticsAdopted: string[];
  adoptedSuggestions: string[];
  settings: Settings;
  // 操作
  addToPool: (topic: StoredTopic) => void;
  hasTopic: (id: string) => boolean;
  pushPipeline: (item: StoredItem) => void;
  pushCalendar: (item: StoredItem) => void;
  addActivity: (type: string, text: string) => void;
  adoptSuggestion: (id: string) => void;
  saveSettings: (patch: Settings) => void;
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
};

const StoreCtx = createContext<Store | null>(null);

function readArr<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeArr(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent('store:update', { detail: { key } })
    );
  } catch {}
}

function readObj<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeObj(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent('store:update', { detail: { key } })
    );
  } catch {}
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [topicPool, setTopicPool] = useState<StoredTopic[]>([]);
  const [pipeline, setPipeline] = useState<StoredItem[]>([]);
  const [calendar, setCalendar] = useState<StoredItem[]>([]);
  const [benchmarks, setBenchmarks] = useState<StoredItem[]>([]);
  const [knowledge, setKnowledge] = useState<StoredItem[]>([]);
  const [activities, setActivities] = useState<StoredActivity[]>([]);
  const [analyticsAdopted, setAnalyticsAdopted] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [toastBump, setToastBump] = useState(0);

  useEffect(() => {
    setTopicPool(readArr<StoredTopic>(STORAGE_KEYS.topicPool, []));
    setPipeline(readArr<StoredItem>(STORAGE_KEYS.pipeline, []));
    setCalendar(readArr<StoredItem>(STORAGE_KEYS.calendar, []));
    setBenchmarks(readArr<StoredItem>(STORAGE_KEYS.benchmarks, []));
    setKnowledge(readArr<StoredItem>(STORAGE_KEYS.knowledge, []));
    setActivities(readArr<StoredActivity>(STORAGE_KEYS.activities, []));
    setAnalyticsAdopted(readArr(STORAGE_KEYS.analyticsAdopted, []));
    setSettings(readObj<Settings>(STORAGE_KEYS.settings, {}));
    setHydrated(true);

    // 跨标签页同步
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === STORAGE_KEYS.topicPool) setTopicPool(readArr<StoredTopic>(STORAGE_KEYS.topicPool, []));
      if (e.key === STORAGE_KEYS.pipeline) setPipeline(readArr<StoredItem>(STORAGE_KEYS.pipeline, []));
      if (e.key === STORAGE_KEYS.calendar) setCalendar(readArr<StoredItem>(STORAGE_KEYS.calendar, []));
      if (e.key === STORAGE_KEYS.benchmarks) setBenchmarks(readArr<StoredItem>(STORAGE_KEYS.benchmarks, []));
      if (e.key === STORAGE_KEYS.activities) setActivities(readArr<StoredActivity>(STORAGE_KEYS.activities, []));
      if (e.key === STORAGE_KEYS.analyticsAdopted)
        setAnalyticsAdopted(readArr(STORAGE_KEYS.analyticsAdopted, []));
      if (e.key === STORAGE_KEYS.settings) setSettings(readObj<Settings>(STORAGE_KEYS.settings, {}));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const store: Store = {
    topicPool,
    pipeline,
    calendar,
    benchmarks,
    knowledge,
    activities,
    analyticsAdopted,
    adoptedSuggestions: analyticsAdopted,
    settings,
    addToPool: (topic: StoredTopic) => {
      setTopicPool((prev) => {
        if (prev.find((t) => t.id === topic.id)) return prev;
        const next = [{ addedAt: Date.now(), ...topic }, ...prev];
        writeArr(STORAGE_KEYS.topicPool, next);
        return next;
      });
    },
    hasTopic: (id: string) => topicPool.some((t) => t.id === id),
    pushPipeline: (item: StoredItem) => {
      setPipeline((prev) => {
        const next = [{ id: `pl_${Date.now()}`, createdAt: Date.now(), ...item }, ...prev];
        writeArr(STORAGE_KEYS.pipeline, next);
        return next;
      });
    },
    pushCalendar: (item: StoredItem) => {
      setCalendar((prev) => {
        const next = [item, ...prev];
        writeArr(STORAGE_KEYS.calendar, next);
        return next;
      });
    },
    addActivity: (type: string, text: string) => {
      setActivities((prev) => {
        const next = [{ id: `act_${Date.now()}`, type, text, at: Date.now() }, ...prev].slice(0, 50);
        writeArr(STORAGE_KEYS.activities, next);
        return next;
      });
    },
    adoptSuggestion: (id: string) => {
      setAnalyticsAdopted((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        writeArr(STORAGE_KEYS.analyticsAdopted, next);
        return next;
      });
    },
    saveSettings: (patch: Settings) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        writeObj(STORAGE_KEYS.settings, next);
        return next;
      });
    },
    toast: {
      success: (msg: string) => { setToastBump((b) => b + 1); showToast(msg, 'success'); },
      error: (msg: string) => { showToast(msg, 'error'); },
      warning: (msg: string) => { showToast(msg, 'warning'); },
      info: (msg: string) => { showToast(msg, 'info'); },
    },
  };

  return (
    <StoreCtx.Provider value={store}>
      <div data-hydrated={hydrated} data-bump={toastBump}>{children}</div>
    </StoreCtx.Provider>
  );
}

export function useStore(): Store {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}

// ========== Toast 通知 ==========
type Toast = {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

const ToastCtx = createContext<{
  show: (message: string, type?: Toast['type']) => void;
} | null>(null);

// Simple event-based toast (used by store before ToastProvider might be ready)
function showToast(message: string, type: Toast['type'] = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { id: Date.now() + Math.random(), type, message } }));
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as Toast;
      setToasts((prev) => [...prev, detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, 3000);
    };
    window.addEventListener('app:toast', onToast as EventListener);
    return () => window.removeEventListener('app:toast', onToast as EventListener);
  }, []);

  const show = (message: string, type: Toast['type'] = 'info') => {
    showToast(message, type);
  };

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed top-6 left-1/2 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => {
          const Icon =
            t.type === 'success'
              ? CheckCircle2
              : t.type === 'error'
                ? XCircle
                : t.type === 'warning'
                  ? AlertCircle
                  : Info;
          const colorClass =
            t.type === 'success'
              ? 'border-emerald-500/50 text-emerald-100'
              : t.type === 'error'
                ? 'border-rose-500/50 text-rose-100'
                : t.type === 'warning'
                  ? 'border-amber-500/50 text-amber-100'
                  : 'border-sky-500/50 text-sky-100';
          return (
            <div
              key={t.id}
              className={`animate-toast-in pointer-events-auto flex items-center gap-2 rounded-lg border bg-zinc-900/95 px-4 py-2.5 text-sm shadow-2xl backdrop-blur ${colorClass}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const v = useContext(ToastCtx);
  if (!v) throw new Error('useToast must be used inside ToastProvider');
  return v;
}

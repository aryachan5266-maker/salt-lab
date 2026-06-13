'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Radar,
  Sparkles,
  Calendar,
  LineChart,
  BookOpen,
  Settings,
  Plus,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore, useToast } from './store';

const navItems = [
  { href: '/home', label: '选题引擎', icon: Radar, key: 'radar', badge: 'topicPool' },
  { href: '/content-factory', label: '内容工厂', icon: Sparkles, key: 'factory', badge: 'pipeline' },
  { href: '/publish', label: '发布管理', icon: Calendar, key: 'publish', badge: 'calendar' },
  { href: '/analytics', label: '数据复盘', icon: LineChart, key: 'analytics' },
  { href: '/knowledge', label: '知识库', icon: BookOpen, key: 'knowledge' },
  { href: '/settings', label: '系统设置', icon: Settings, key: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const store = useStore();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const toast = useToast();

  const getBadgeCount = (badge?: string) => {
    if (!badge) return 0;
    if (badge === 'topicPool') return store.topicPool.length;
    if (badge === 'pipeline') return store.pipeline.length;
    if (badge === 'calendar') return store.calendar.length;
    return 0;
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiInput }),
      });
      const data = await res.json();
      setAiResponse(data.answer || data.error || '暂无回复');
    } catch (e) {
      setAiResponse('网络错误，请稍后再试');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/80 backdrop-blur">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-4">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-600 shadow-lg shadow-rose-900/40">
            <span className="text-base font-semibold text-white">咸</span>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide">咸聊 AI</span>
            <span className="text-[10px] text-zinc-500">内容中台 · 小红书版</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const count = getBadgeCount(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-key={item.key}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active
                    ? 'border border-rose-700/40 bg-gradient-to-r from-rose-900/30 to-amber-900/15 text-rose-100 shadow-inner'
                    : 'border border-transparent text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    active ? 'text-rose-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {count > 0 && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                      active
                        ? 'bg-rose-500/20 text-rose-200'
                        : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI 助手按钮 */}
        <div className="border-t border-white/[0.06] p-3">
          <button
            onClick={() => setAiOpen(true)}
            className="group flex w-full items-center gap-2.5 rounded-lg border border-amber-700/30 bg-gradient-to-r from-rose-900/20 to-amber-900/15 px-3 py-2.5 text-left text-sm text-amber-100 transition-all hover:from-rose-900/35 hover:to-amber-900/25"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-xs font-semibold text-white">
              小
            </span>
            <div className="flex-1 leading-tight">
              <div className="text-sm">问问小咸</div>
              <div className="text-[10px] text-amber-200/60">AI 智能助手</div>
            </div>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </button>
          <div className="mt-3 text-center text-[10px] text-zinc-600">
            v2.0 · XHS_CORE
          </div>
        </div>
      </aside>

      {/* AI 助手浮窗 */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setAiOpen(false)}
          />
          <div className="relative w-[420px] max-w-[95vw] overflow-hidden rounded-2xl border border-amber-700/30 bg-zinc-900 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-white/[0.06] bg-gradient-to-r from-rose-900/30 to-amber-900/20 px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-semibold text-white">
                小咸
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">咸聊 AI 助手</div>
                <div className="text-[10px] text-zinc-400">基于豆包大模型 · 实时分析</div>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                className="rounded p-1 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-5">
              {aiResponse ? (
                <div className="rounded-lg border border-amber-700/20 bg-amber-900/10 p-4 text-sm leading-relaxed text-amber-50">
                  {aiResponse}
                </div>
              ) : (
                <div className="space-y-2 text-sm text-zinc-400">
                  <div className="text-xs text-zinc-500">试试问我：</div>
                  {[
                    '今天适合发什么选题？',
                    '30岁女性创业可以做哪些内容？',
                    '近7天表现最好的内容有什么共性？',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAiInput(q)}
                      className="block w-full rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-left text-xs text-zinc-300 transition-all hover:border-rose-700/30 hover:bg-rose-900/10"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              {aiLoading && (
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                  小咸思考中…
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-white/[0.06] bg-zinc-950/50 p-3">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !aiLoading) askAI();
                }}
                placeholder="问点什么…"
                className="flex-1 rounded-lg border border-white/[0.06] bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-rose-700/40 focus:outline-none"
              />
              <button
                onClick={askAI}
                disabled={aiLoading || !aiInput.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-rose-500 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

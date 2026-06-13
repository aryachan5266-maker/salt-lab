'use client';

import { Bell, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from './store';

const titleMap: Record<string, string> = {
  '/home': '选题引擎',
  '/content-factory': '内容工厂',
  '/publish': '发布管理',
  '/analytics': '数据复盘',
  '/knowledge': '知识库',
  '/settings': '系统设置',
};

const descMap: Record<string, string> = {
  '/home': '发现下一个爆款选题 · 监控对标账号',
  '/content-factory': '一键生成标题、正文、封面、违禁词扫描',
  '/publish': '周/月视图排期 · 多账号管理 · 自动推送',
  '/analytics': '数据回传 · 复盘建议 · 迭代方向',
  '/knowledge': '品牌定位 · 人设语料 · 对标账号分析',
  '/settings': 'AI 模型 · 抓取规则 · 通知 · 团队',
};

export function Topbar() {
  const pathname = usePathname();
  const title = titleMap[pathname] || '咸聊 AI 内容中台';
  const desc = descMap[pathname] || '';
  const toast = useToast();
  const [time, setTime] = useState('');

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
      setTime(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 周${w}`
      );
    };
    fmt();
    const t = setInterval(fmt, 60_000);
    return () => clearInterval(t);
  }, []);

  const onRefresh = () => {
    toast.show('已刷新数据', 'success');
    window.dispatchEvent(new CustomEvent('page:refresh'));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-zinc-950/70 px-6 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2.5 text-base font-semibold text-zinc-100">
          {title}
          <span className="rounded-md border border-rose-700/30 bg-rose-900/20 px-1.5 py-0.5 text-[10px] font-medium text-rose-300">
            LIVE
          </span>
        </div>
        <div className="mt-0.5 text-xs text-zinc-500">{desc}</div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden text-xs text-zinc-500 md:block">
          <span className="tabular-nums">{time}</span>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-300 transition-all hover:border-rose-700/30 hover:bg-rose-900/10"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新
        </button>

        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-300 transition-all hover:border-amber-700/30 hover:bg-amber-900/10">
          <Bell className="h-3.5 w-3.5" />
          消息
        </button>

        <LinkGenerateButton />
      </div>
    </header>
  );
}

function LinkGenerateButton() {
  return (
    <a
      href="/content-factory"
      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-1.5 text-xs font-medium text-white shadow-md shadow-rose-900/30 transition-all hover:from-rose-500 hover:to-amber-500"
    >
      <Sparkles className="h-3.5 w-3.5" />
      立即生成内容
    </a>
  );
}

'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { useStore } from '@/components/store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PageHeader, Tag } from '@/components/ui';

type Item = {
  id: string;
  pipelineId?: string;
  title: string;
  coverUrl?: string;
  account: string;
  scheduledAt: number;
  status: 'draft' | 'pending' | 'scheduled' | 'published';
  type: string;
};

const ACCOUNTS = [
  { handle: '@xianliao_ai', name: '主号', sent: 5, queue: 6 },
  { handle: '@xianliao_biz', name: '副号1', sent: 3, queue: 2 },
  { handle: '@xianliao_journal', name: '复盘号', sent: 2, queue: 1 },
  { handle: '@xianliao_lab', name: '实验号', sent: 1, queue: 0 },
];

const HOURS = ['6:00', '12:00', '18:00', '21:00'];

function dayName(d: Date) { return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]; }

export default function PublishPage() {
  const { toast, addActivity, calendar: storeCalendar, pushCalendar } = useStore();
  const [view, setView] = useState<'week' | 'month' | 'list'>('week');
  const [account, setAccount] = useState(ACCOUNTS[0]);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [queueTab, setQueueTab] = useState<'pending' | 'today' | 'published'>('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', date: '', time: '18:00' });
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  // 加载
  const load = useCallback(async () => {
    const res = await fetch('/api/calendar');
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 本周日期
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // 月视图数据
  const monthDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i - 6);
    return d;
  });

  const statusColor = (s: string) => {
    return {
      draft: 'border-zinc-700 bg-zinc-800/60 text-zinc-400',
      pending: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      scheduled: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
      published: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    }[s] || '';
  };
  const statusLabel = (s: string) => ({ draft: '草稿', pending: '待审', scheduled: '已排', published: '已发' }[s] || s);

  // 新建
  const onCreate = async () => {
    if (!newItem.title) {
      toast.error('请输入标题');
      return;
    }
    const dt = new Date(`${newItem.date || today.toISOString().slice(0, 10)}T${newItem.time}:00`);
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newItem.title, account: account.handle, scheduledAt: dt.getTime(), status: 'scheduled' }),
    });
    const j = await res.json();
    if (j.ok) {
      pushCalendar(j.data);
      addActivity('calendar', `新建排期：${j.data.title.slice(0, 15)}`);
      toast.success('已新建排期');
      setShowCreate(false);
      setNewItem({ title: '', date: '', time: '18:00' });
      load();
    }
  };

  // 改状态
  const onStatusChange = async (item: Item, status: Item['status']) => {
    const res = await fetch(`/api/calendar/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`已${statusLabel(status)}`);
      load();
    }
  };

  const onDelete = async (item: Item) => {
    if (!confirm(`确定删除「${item.title}」?`)) return;
    await fetch(`/api/calendar/${item.id}`, { method: 'DELETE' });
    toast.success('已删除');
    load();
  };

  // 当周/当天/已发
  const weekStartMs = weekDays[0].getTime();
  const weekEndMs = weekDays[6].getTime() + 86400000;
  const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);

  const queuePending = items.filter((i) => i.status === 'pending');
  const queueToday = items.filter((i) => i.scheduledAt >= todayStart.getTime() && i.scheduledAt <= todayEnd.getTime() && (i.status === 'scheduled' || i.status === 'pending'));
  const queuePublished = items.filter((i) => i.status === 'published');
  const queueList = queueTab === 'pending' ? queuePending : queueTab === 'today' ? queueToday : queuePublished;

  const currentHour = today.getHours();
  const nowRatio = (currentHour * 60 + today.getMinutes()) / (24 * 60);

  return (
    <div className="space-y-6">
      <PageHeader
        title="发布管理"
        description={`本周排期 · ${weekDays[0].toLocaleDateString('zh-CN')} ~ ${weekDays[6].toLocaleDateString('zh-CN')}`}
        breadcrumb={['首页', '发布管理']}
        actions={
          <>
            <div className="flex rounded-md border border-zinc-800 bg-zinc-900 p-0.5">
              {(['month', 'week', 'list'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded px-3 py-1 text-sm ${view === v ? 'bg-rose-500/15 text-rose-300' : 'text-zinc-400'}`}>
                  {v === 'month' ? '月' : v === 'week' ? '周' : '列表'}
                </button>
              ))}
            </div>
            <div className="relative">
              <button onClick={() => setShowAccountMenu(!showAccountMenu)} className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200">
                {account.handle} ▾
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-zinc-800 bg-zinc-950 shadow-xl">
                  {ACCOUNTS.map((a) => (
                    <button key={a.handle} onClick={() => { setAccount(a); setShowAccountMenu(false); toast.success(`已切换到 ${a.handle}`); }} className="flex w-full items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900">
                      <span>{a.handle} <span className="text-xs text-zinc-500">({a.name})</span></span>
                      <span className="text-xs text-zinc-500">{a.sent}发 / {a.queue}排</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={() => setShowCreate(true)}>+ 新建排期</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 日历 60% */}
        <div className="lg:col-span-3">
          <Card>
            {view === 'week' && (
              <div>
                <div className="mb-3 flex items-center justify-between text-xs">
                  <div className="flex gap-3 text-zinc-500">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-zinc-500" />草稿</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-amber-500" />待审</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-rose-500" />已排</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500" />已发</span>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-px overflow-hidden rounded-md border border-zinc-800 bg-zinc-800 text-xs">
                  <div className="bg-zinc-950 p-2 text-zinc-500">时段</div>
                  {weekDays.map((d, i) => (
                    <div key={i} className={`p-2 text-center ${d.toDateString() === today.toDateString() ? 'bg-rose-500/10 text-rose-300' : 'bg-zinc-950 text-zinc-400'}`}>
                      <div>周{dayName(d)}</div>
                      <div className="font-mono">{d.getMonth() + 1}/{d.getDate()}</div>
                    </div>
                  ))}
                  {HOURS.map((h) => (
                    <Fragment key={h}>
                      <div className="bg-zinc-950 p-2 text-zinc-500">{h}</div>
                      {weekDays.map((d, di) => {
                        const dayMs = new Date(d).setHours(0, 0, 0, 0);
                        const hourMs = parseInt(h.split(':')[0]) * 3600000;
                        const cellMs = dayMs + hourMs;
                        const cellItems = items.filter((it) => {
                          const itDay = new Date(it.scheduledAt);
                          return itDay.toDateString() === d.toDateString() && itDay.getHours() === parseInt(h.split(':')[0]);
                        });
                        const isToday = d.toDateString() === today.toDateString();
                        return (
                          <div key={`c_${h}_${di}`} className="relative min-h-[64px] bg-zinc-950 p-1">
                            {isToday && Math.abs(cellMs + hourMs - today.getTime()) < 86400000 && (() => {
                              const ratio = nowRatio * 100;
                              if (ratio < 25 || ratio > 90) return null;
                              return <div className="absolute left-0 right-0 z-10 h-px bg-rose-500" style={{ top: `${(nowRatio * 100) % 25}%` }} />;
                            })()}
                            {cellItems.map((it) => (
                              <button key={it.id} onClick={() => setDetailItem(it)} className={`mb-1 block w-full truncate rounded border px-1 py-0.5 text-left ${statusColor(it.status)}`}>
                                {it.title.slice(0, 8)}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div className="rounded-md bg-zinc-900/50 p-2 text-center"><div className="text-zinc-500">已发</div><div className="text-rose-100 font-mono">{queuePublished.length}</div></div>
                  <div className="rounded-md bg-zinc-900/50 p-2 text-center"><div className="text-zinc-500">已排</div><div className="text-rose-100 font-mono">{items.filter((i) => i.status === 'scheduled').length}</div></div>
                  <div className="rounded-md bg-zinc-900/50 p-2 text-center"><div className="text-zinc-500">待审</div><div className="text-rose-100 font-mono">{queuePending.length}</div></div>
                  <div className="rounded-md bg-zinc-900/50 p-2 text-center"><div className="text-zinc-500">草稿</div><div className="text-rose-100 font-mono">{items.filter((i) => i.status === 'draft').length}</div></div>
                </div>
              </div>
            )}
            {view === 'month' && (
              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-zinc-800 bg-zinc-800 text-xs">
                {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
                  <div key={d} className="bg-zinc-950 p-2 text-center text-zinc-500">周{d}</div>
                ))}
                {monthDays.map((d, i) => {
                  const isCurrentMonth = d.getMonth() === today.getMonth();
                  const isToday = d.toDateString() === today.toDateString();
                  const dayItems = items.filter((it) => new Date(it.scheduledAt).toDateString() === d.toDateString());
                  return (
                    <div key={i} className={`min-h-[80px] bg-zinc-950 p-1 ${isCurrentMonth ? '' : 'opacity-30'}`}>
                      <div className={`mb-1 text-right font-mono text-xs ${isToday ? 'rounded bg-rose-500 px-1.5 text-white' : 'text-zinc-500'}`}>{d.getDate()}</div>
                      {dayItems.slice(0, 2).map((it) => (
                        <button key={it.id} onClick={() => setDetailItem(it)} className={`mb-0.5 block w-full truncate rounded border px-1 py-0.5 text-left ${statusColor(it.status)}`}>
                          {it.title.slice(0, 6)}
                        </button>
                      ))}
                      {dayItems.length > 2 && <div className="text-xs text-zinc-500">+{dayItems.length - 2}</div>}
                    </div>
                  );
                })}
              </div>
            )}
            {view === 'list' && (
              <div className="space-y-2">
                {items.length === 0 ? <div className="py-8 text-center text-zinc-500">暂无内容</div> :
                  items.map((it) => (
                    <div key={it.id} className={`flex items-center gap-3 rounded-md border p-3 ${statusColor(it.status)}`}>
                      <div className="flex-1">
                        <div className="text-sm text-zinc-200">{it.title}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">{it.account} · {new Date(it.scheduledAt).toLocaleString('zh-CN')}</div>
                      </div>
                      <Badge>{statusLabel(it.status)}</Badge>
                      <Button size="sm" variant="secondary" onClick={() => setDetailItem(it)}>详情</Button>
                    </div>
                  ))
                }
              </div>
            )}
          </Card>
        </div>

        {/* 队列 40% */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-3 flex gap-2 text-sm">
              {([['pending', `待审 ${queuePending.length}`], ['today', `今日 ${queueToday.length}`], ['published', `已发 ${queuePublished.length}`]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setQueueTab(k)} className={`rounded-md px-3 py-1 ${queueTab === k ? 'bg-rose-500/15 text-rose-300' : 'text-zinc-400'}`}>{l}</button>
              ))}
            </div>
            <div className="space-y-2">
              {queueList.length === 0 ? <div className="py-8 text-center text-zinc-500 text-sm">暂无内容</div> :
                queueList.map((it) => (
                  <div key={it.id} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge>{statusLabel(it.status)}</Badge>
                      <span className="text-xs text-zinc-500">{it.account}</span>
                    </div>
                    <div className="text-sm text-zinc-200">{it.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">{new Date(it.scheduledAt).toLocaleString('zh-CN')}</div>
                    <div className="mt-2 flex gap-2">
                      {it.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => onStatusChange(it, 'scheduled')}>审核</Button>
                          <Button size="sm" variant="secondary" onClick={() => onStatusChange(it, 'draft')}>退回</Button>
                        </>
                      )}
                      {it.status === 'scheduled' && <Button size="sm" variant="secondary" onClick={() => onStatusChange(it, 'pending')}>取消排期</Button>}
                      {it.status === 'published' && <Button size="sm" variant="secondary" onClick={() => onDelete(it)}>删除</Button>}
                      {it.status === 'draft' && <Button size="sm" onClick={() => onStatusChange(it, 'scheduled')}>排期</Button>}
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 详情 Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setDetailItem(null)}>
          <div className="w-[480px] max-w-[90vw] rounded-xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <Badge>{statusLabel(detailItem.status)}</Badge>
              <button onClick={() => setDetailItem(null)} className="text-zinc-500">✕</button>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-100">{detailItem.title}</h3>
            <div className="mb-3 text-sm text-zinc-400">{detailItem.account}</div>
            <div className="mb-4 text-sm text-zinc-400">⏰ {new Date(detailItem.scheduledAt).toLocaleString('zh-CN')}</div>
            {detailItem.coverUrl && <img src={detailItem.coverUrl} className="mb-4 aspect-[3/4] w-full rounded-md object-cover" alt="" />}
            <div className="flex gap-2">
              {detailItem.status === 'pending' && <Button onClick={() => { onStatusChange(detailItem, 'scheduled'); setDetailItem(null); }}>审核通过</Button>}
              {detailItem.status === 'scheduled' && <Button variant="secondary" onClick={() => { onStatusChange(detailItem, 'pending'); setDetailItem(null); }}>取消排期</Button>}
              <Button variant="secondary" onClick={() => { onDelete(detailItem); setDetailItem(null); }}>删除</Button>
            </div>
          </div>
        </div>
      )}

      {/* 新建 Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowCreate(false)}>
          <div className="w-96 rounded-xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">新建排期</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">标题</label>
                <input className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">日期</label>
                  <input type="date" className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" value={newItem.date} onChange={(e) => setNewItem({ ...newItem, date: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">时间</label>
                  <input type="time" className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" value={newItem.time} onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button>
              <Button onClick={onCreate}>确认</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

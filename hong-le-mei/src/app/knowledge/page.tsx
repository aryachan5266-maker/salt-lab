'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/components/store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PageHeader, Tag, Empty } from '@/components/ui';

const CATEGORIES = ['品牌定位', '人设语料', '往期内容库', '对标账号分析', '爆款拆解', '选题素材', '平台规则'];

type Doc = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updatedAt: number;
};

export default function KnowledgePage() {
  const { toast, addActivity, pipeline } = useStore();
  const [category, setCategory] = useState('品牌定位');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', content: '', category: '品牌定位' });
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/knowledge?category=${encodeURIComponent(category)}${searchQ ? `&q=${encodeURIComponent(searchQ)}` : ''}`);
    const j = await res.json();
    if (j.ok) {
      setDocs(j.data);
      if (j.data.length > 0 && !activeDoc) {
        setActiveDoc(j.data[0]);
        setEditContent(j.data[0].content);
      }
    }
  }, [category, searchQ, activeDoc]);

  useEffect(() => { load(); }, [load]);

  // 选择 doc
  useEffect(() => {
    if (docs.length > 0) {
      setActiveDoc(docs[0]);
      setEditContent(docs[0].content);
    } else {
      setActiveDoc(null);
    }
  }, [category]);

  const onNew = async () => {
    if (!newDoc.title) {
      toast.error('请输入标题');
      return;
    }
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDoc),
    });
    const j = await res.json();
    if (j.ok) {
      const created = j.data as Doc;
      toast.success('已新建文档');
      setShowNew(false);
      setSearchQ('');
      setNewDoc({ title: '', content: '', category: created.category });
      setCategory(created.category);
      setActiveDoc(created);
      setEditContent(created.content);
      setDocs((prev) => [created, ...prev.filter((doc) => doc.id !== created.id)]);
    }
  };

  const onSave = async () => {
    if (!activeDoc) return;
    const res = await fetch(`/api/knowledge/${activeDoc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });
    const j = await res.json();
    if (j.ok) {
      setActiveDoc(j.data);
      setEditing(false);
      toast.success('已保存');
      addActivity('knowledge', `更新文档：${j.data.title}`);
    }
  };

  const onSync = () => {
    toast.success('品牌定位已同步到所有 AI 生成场景');
    addActivity('knowledge', '同步品牌定位到 AI');
  };

  const onAddToPipeline = async (text: string) => {
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicTitle: text, category: '选题素材', step: 1, stepName: '选题', status: 'draft' }),
    });
    if (res.ok) {
      toast.success('已加入选题流水线');
      addActivity('pipeline', `从知识库入队：${text.slice(0, 15)}`);
    }
  };

  const onAddBenchmark = async (name: string) => {
    const res = await fetch('/api/benchmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, handle: `@${name}` }),
    });
    if (res.ok) {
      toast.success(`已添加对标：${name}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="知识库"
        description="品牌定位 · 人设语料 · 往期内容 · 对标账号"
        breadcrumb={['首页', '知识库']}
        actions={
          <>
            <input
              type="text"
              placeholder="🔍 全文检索..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="input-soft w-48 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200"
            />
            <Button variant="secondary" onClick={onSync}>同步品牌定位</Button>
            <Button onClick={() => setShowNew(true)}>+ 新建文档</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* 左侧分类 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>分类</CardTitle>
            </CardHeader>
            <div className="space-y-1">
              {CATEGORIES.map((c) => {
                const isActive = category === c;
                return (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setActiveDoc(null); setEditing(false); }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                      isActive
                        ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300'
                        : 'border border-transparent text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <span>{c}</span>
                    <span className="text-xs text-zinc-500">
                      {c === '品牌定位' ? '12' : c === '往期内容库' ? '124' : c === '对标账号分析' ? '8' : c === '爆款拆解' ? '23' : c === '选题素材' ? '47' : c === '人设语料' ? '6' : '5'} 篇
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 主区 */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <Badge>{activeDoc?.category || category}</Badge>
                <h2 className="mt-2 text-xl font-semibold text-zinc-100">{activeDoc?.title || `暂无文档，点击新建`}</h2>
                {activeDoc && <div className="mt-1 text-xs text-zinc-500">上次更新：{new Date(activeDoc.updatedAt).toLocaleString('zh-CN')}</div>}
              </div>
              {activeDoc && (
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditContent(activeDoc.content); setEditing(false); }}>取消</Button>
                      <Button size="sm" onClick={onSave}>保存</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>编辑</Button>
                      <Button size="sm" variant="secondary" onClick={() => toast.info('共 5 个历史版本（演示）')}>版本历史</Button>
                    </>
                  )}
                </div>
              )}
            </div>
            {editing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={12}
                className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200"
              />
            ) : (
              <div className="prose prose-invert max-w-none whitespace-pre-line rounded-md bg-zinc-900/40 p-4 text-sm text-zinc-300">
                {activeDoc?.content || '该分类暂无文档，请点击右上角「+ 新建文档」开始。'}
              </div>
            )}
            {activeDoc && activeDoc.tags && activeDoc.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeDoc.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            )}
          </Card>

          {/* 分类特定：往期内容库 */}
          {category === '往期内容库' && (
            <Card>
              <CardHeader><CardTitle>往期内容 ({docs.length})</CardTitle></CardHeader>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
                    <img src={`https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=240&fit=crop`} className="h-16 w-16 rounded object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm text-zinc-200">创业第3年的复盘：{i}</div>
                      <div className="text-xs text-zinc-500">2024-12-{(15 + i).toString()}</div>
                      <div className="text-xs text-rose-300">阅读 {(5 + i * 3).toFixed(1)}w · 点赞 {1 + i}k</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 分类特定：对标账号 */}
          {category === '对标账号分析' && (
            <Card>
              <CardHeader><CardTitle>对标账号</CardTitle></CardHeader>
              <div className="space-y-2">
                {['女力研究所', '创业她说', '清醒Girl的商业课', '33岁姐姐说'].map((n) => (
                  <div key={n} className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-rose-700 to-rose-900 text-sm font-bold text-rose-100">{n.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="text-sm text-zinc-200">{n}</div>
                      <div className="text-xs text-zinc-500">粉丝 12-30w · 商业认知</div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => onAddBenchmark(n)}>+ 添加监控</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 分类特定：选题素材 */}
          {category === '选题素材' && (
            <Card>
              <CardHeader><CardTitle>选题素材</CardTitle></CardHeader>
              <div className="space-y-2">
                {[
                  { t: '30+女性的5个反常识消费观', h: 92 },
                  { t: '私域复购的3个隐性触发器', h: 88 },
                  { t: '为什么我劝你少听播客', h: 76 },
                ].map((s) => (
                  <div key={s.t} className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
                    <span className="font-mono text-rose-300">{s.h}°</span>
                    <span className="flex-1 text-sm text-zinc-200">{s.t}</span>
                    <Button size="sm" onClick={() => onAddToPipeline(s.t)}>+ 加入流水线</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* 右侧快速操作 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => toast.info('导入素材面板（演示）')}>📥 导入素材</Button>
              <Button variant="secondary" className="w-full justify-start" onClick={onSync}>🔄 同步品牌定位</Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setShowNew(true)}>📄 新建文档</Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder*="全文"]')?.focus()}>🔍 全文检索</Button>
            </div>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <div className="space-y-1.5 text-xs text-zinc-400">
              {pipeline.slice(0, 5).map((p, index) => (
                <div key={typeof p.id === 'string' ? p.id : index} className="truncate">· {typeof p.topicTitle === 'string' ? p.topicTitle : '未命名选题'}</div>
              ))}
              {pipeline.length === 0 && <div className="text-zinc-500">暂无活动</div>}
            </div>
          </Card>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowNew(false)}>
          <div className="w-[520px] max-w-[90vw] rounded-xl border border-zinc-800 bg-zinc-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-zinc-100">新建文档</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="new-doc-category" className="mb-1 block text-xs text-zinc-500">分类</label>
                <select id="new-doc-category" className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm" value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="new-doc-title" className="mb-1 block text-xs text-zinc-500">标题</label>
                <input
                  id="new-doc-title"
                  placeholder="输入文档标题"
                  className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="new-doc-content" className="mb-1 block text-xs text-zinc-500">内容</label>
                <textarea
                  id="new-doc-content"
                  rows={6}
                  placeholder="输入内容"
                  className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                  value={newDoc.content}
                  onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowNew(false)}>取消</Button>
              <Button onClick={onNew}>保存</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

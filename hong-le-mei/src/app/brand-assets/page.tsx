'use client';

import { useState, useCallback } from 'react';
import { Upload, Star, Download, Trash2, X, Plus, Image, FileText, Video, User, Palette, BookOpen } from 'lucide-react';
import { NACLHeader } from '@/components/nacl-header';

const TABS = [
  { key: 'logo', label: 'Logo', icon: Image },
  { key: 'person', label: '人物照片', icon: User },
  { key: 'product', label: '产品图', icon: Palette },
  { key: 'brand', label: '品牌资料', icon: BookOpen },
  { key: 'style', label: '风格参考', icon: FileText },
  { key: 'generated', label: '生成物', icon: Video },
] as const;

const MOCK_ASSETS: Record<string, { name: string; type: string; time: string }[]> = {
  logo: [
    { name: '主色版Logo', type: 'image', time: '2024-01-15' },
    { name: '白底版Logo', type: 'image', time: '2024-01-15' },
  ],
  person: [
    { name: '创始人形象照', type: 'image', time: '2024-01-10' },
  ],
  product: [
    { name: '产品主图-A', type: 'image', time: '2024-01-12' },
    { name: '产品主图-B', type: 'image', time: '2024-01-12' },
    { name: '场景图-办公', type: 'image', time: '2024-01-08' },
  ],
  brand: [],
  style: [
    { name: '爆款封面参考-1', type: 'image', time: '2024-01-05' },
  ],
  generated: [
    { name: '美妆种草笔记', type: 'text', time: '2024-01-18' },
    { name: '健身打卡文案', type: 'text', time: '2024-01-17' },
    { name: '封面图-赛博风格', type: 'image', time: '2024-01-17' },
  ],
};

export default function BrandAssetsPage() {
  const [activeTab, setActiveTab] = useState<string>('logo');
  const [starred, setStarred] = useState<Set<string>>(new Set());

  const toggleStar = useCallback((name: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const assets = MOCK_ASSETS[activeTab] || [];

  return (
    <div className="min-h-screen bg-background hud-grid-bg flex flex-col">
      <NACLHeader title="品牌资产" subtitle="一次上传，全程复用" />

      <main className="flex-1 px-5 py-4 max-w-5xl mx-auto w-full">
        {/* Tab 栏 */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm transition-all whitespace-nowrap ${active ? 'glow-red' : 'metal-panel'}`}
                style={active ? { borderColor: 'rgba(255,59,92,0.5)', color: '#FF3B5C' } : undefined}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 品牌资料特殊布局 */}
        {activeTab === 'brand' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="metal-panel rounded-sm p-4">
              <div className="text-[10px] font-mono text-on-surface-weakest mb-2">品牌色</div>
              <div className="flex gap-2">
                {['#FF3B5C', '#21E6C1', '#FF2E97', '#0A0E14'].map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full border" style={{ background: c, borderColor: 'rgba(140,150,165,0.2)' }} />
                    <span className="text-[10px] font-mono text-on-surface-variant">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="metal-panel rounded-sm p-4">
              <div className="text-[10px] font-mono text-on-surface-weakest mb-2">品牌主张</div>
              <p className="text-sm text-on-surface">NACL · 连接一切·构建未来</p>
            </div>
            <div className="metal-panel rounded-sm p-4">
              <div className="text-[10px] font-mono text-on-surface-weakest mb-2">人设语料</div>
              <p className="text-xs text-on-surface-variant">暂无，请上传品牌语料文档</p>
            </div>
            <div className="metal-panel rounded-sm p-4">
              <div className="text-[10px] font-mono text-on-surface-weakest mb-2">过往爆款</div>
              <p className="text-xs text-on-surface-variant">暂无，生成内容会自动沉淀</p>
            </div>
          </div>
        )}

        {/* 资产网格 */}
        {activeTab !== 'brand' && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {assets.map((asset, i) => (
              <div key={i} className="metal-panel hud-clip-tr rounded-sm overflow-hidden group">
                <div className="aspect-square flex items-center justify-center"
                  style={{ background: 'rgba(140,150,165,0.04)' }}>
                  {asset.type === 'image' ? (
                    <Image className="w-8 h-8 text-on-surface-weakest" />
                  ) : (
                    <FileText className="w-8 h-8 text-on-surface-weakest" />
                  )}
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <span className="text-xs text-on-surface truncate">{asset.name}</span>
                  <button onClick={() => toggleStar(asset.name)}
                    className="transition-colors">
                    <Star className={`w-3 h-3 ${starred.has(asset.name) ? 'text-warning fill-warning' : 'text-on-surface-weakest'}`} />
                  </button>
                </div>
              </div>
            ))}
            {/* 上传区 */}
            <div className="border-2 border-dashed rounded-sm aspect-square flex flex-col items-center justify-center gap-2 transition-colors"
              style={{ borderColor: 'rgba(140,150,165,0.2)' }}>
              <Upload className="w-6 h-6 text-on-surface-weakest" />
              <span className="text-[10px] text-on-surface-weakest">上传新资产</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

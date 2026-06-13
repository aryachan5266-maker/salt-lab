'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/components/store';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, PageHeader } from '@/components/ui';

const GROUPS = ['账号接入', 'AI模型', '抓取规则', '发布通道', '通知推送', '数据备份', '团队成员', '计费与额度', '关于系统'];
const MODELS = [
  { id: 'doubao-seed-1-6', name: '豆包 Seed-1.6', tag: '推荐', latency: '320ms', tokens: '1.2M', active: true },
  { id: 'deepseek-v3', name: 'DeepSeek V3', tag: '备选', latency: '480ms', tokens: '420k', active: false },
  { id: 'kimi-k2', name: 'Kimi K2', tag: '长文', latency: '650ms', tokens: '85k', active: false },
];

export default function SettingsPage() {
  const { toast, addActivity } = useStore();
  const [group, setGroup] = useState('AI模型');
  const [activeModel, setActiveModel] = useState('doubao-seed-1-6');
  const [saving, setSaving] = useState(false);
  const [webhook, setWebhook] = useState('https://open.feishu.cn/open-apis/bot/v2/hook/xxxxx');
  const [emailOn, setEmailOn] = useState(true);
  const [toggles, setToggles] = useState([true, true, false, true, true]);
  const [freq, setFreq] = useState('6h');
  const [range, setRange] = useState('100');
  const [threshold, setThreshold] = useState('1000');
  const [savingOk, setSavingOk] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setSavingOk(false);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSavingOk(true);
    setTimeout(() => setSavingOk(false), 2500);
    addActivity('settings', '保存系统配置');
    toast.success('配置已保存');
  };

  const onReset = () => {
    if (!confirm('确定重置为默认配置？此操作不可恢复。')) return;
    toast.info('配置已重置（演示）');
  };

  const onExport = () => {
    const blob = new Blob([JSON.stringify({ exported: true, at: Date.now(), group }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `xhs_settings_${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出配置 JSON');
  };

  const onTestWebhook = () => {
    toast.success('测试消息已发送（演示）');
  };

  const onClearCache = () => {
    if (!confirm('清空所有缓存？')) return;
    toast.success('缓存已清空（演示）');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="系统设置"
        description="AI 模型 · 抓取规则 · 发布通道 · 通知推送"
        breadcrumb={['首页', '系统设置']}
        actions={
          <>
            <Button variant="secondary" onClick={onReset}>放弃修改</Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? '保存中...' : savingOk ? '✓ 已保存' : '保存配置'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* 左侧二级导航 */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-1">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => { setGroup(g); document.getElementById(`sec-${g}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                    group === g ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border border-transparent text-zinc-400 hover:border-zinc-800'
                  }`}
                >
                  <span>{g}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-zinc-800 pt-3">
              <div className="mb-1 text-xs text-zinc-500">本月用量</div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-zinc-200">78,420</span>
                <span className="text-zinc-500">/ 100,000</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-zinc-800">
                <div className="h-full bg-gradient-to-r from-rose-600 to-amber-500" style={{ width: '78%' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* 主区 */}
        <div className="space-y-6 lg:col-span-4">
          {/* AI 模型 */}
          <section id="sec-AI模型">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">AI 模型配置</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setActiveModel(m.id); toast.success(`已切换到 ${m.name}`); }}
                  className={`rounded-lg border p-4 text-left transition ${
                    activeModel === m.id ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/30' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-zinc-200">{m.name}</span>
                    {activeModel === m.id && <Badge>已启用</Badge>}
                  </div>
                  <div className="mb-1 text-xs text-zinc-500">标签：{m.tag}</div>
                  <div className="text-xs text-zinc-500">时延 {m.latency} · Tokens {m.tokens}</div>
                </button>
              ))}
            </div>
          </section>

          {/* 抓取规则 */}
          <section id="sec-抓取规则">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">抓取规则</h2>
            <Card>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">抓取频率</label>
                  <select value={freq} onChange={(e) => setFreq(e.target.value)} className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
                    <option value="6h">每 6 小时</option>
                    <option value="12h">每 12 小时</option>
                    <option value="24h">每 24 小时</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">抓取范围</label>
                  <select value={range} onChange={(e) => setRange(e.target.value)} className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
                    <option value="50">热门前 50</option>
                    <option value="100">热门前 100</option>
                    <option value="200">热门前 200</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">爆款阈值</label>
                  <select value={threshold} onChange={(e) => setThreshold(e.target.value)} className="input-soft w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
                    <option value="1000">点赞 ≥ 1000</option>
                    <option value="5000">点赞 ≥ 5000</option>
                    <option value="10000">点赞 ≥ 10000</option>
                  </select>
                </div>
              </div>
            </Card>
          </section>

          {/* 通知推送 */}
          <section id="sec-通知推送">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300">通知推送</h2>
            <Card>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">飞书 Webhook</label>
                  <div className="flex gap-2">
                    <input
                      className="input-soft flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                      value={webhook}
                      onChange={(e) => setWebhook(e.target.value)}
                      onBlur={() => toast.success('Webhook 已保存')}
                    />
                    <Button variant="secondary" onClick={onTestWebhook}>测试</Button>
                  </div>
                  <div className="mt-1 text-xs text-emerald-400">● 已连接</div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div>
                    <div className="text-sm text-zinc-200">邮件推送</div>
                    <div className="text-xs text-zinc-500">每周复盘报告 + 关键事件</div>
                  </div>
                  <button onClick={() => setEmailOn(!emailOn)} className={`toggle-track ${emailOn ? 'on' : ''}`}>
                    <span className="toggle-thumb" />
                  </button>
                </div>
                {['内容生成完成', '违禁词命中', '排期提醒', '数据复盘周报'].map((label, i) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="text-sm text-zinc-200">{label}</div>
                    <button onClick={() => { const t = [...toggles]; t[i] = !t[i]; setToggles(t); toast.success(`${label}：${t[i] ? '开' : '关'}`); }} className={`toggle-track ${toggles[i] ? 'on' : ''}`}>
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 危险区 */}
          <section id="sec-数据备份">
            <h2 className="mb-3 text-sm font-semibold text-rose-400">⚠ 危险操作</h2>
            <Card>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-zinc-200">清空所有缓存</div>
                    <div className="text-xs text-zinc-500">清空选题缓存、生成结果缓存</div>
                  </div>
                  <Button variant="danger" onClick={onClearCache}>清空缓存</Button>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div>
                    <div className="text-sm text-zinc-200">重置为默认配置</div>
                    <div className="text-xs text-zinc-500">所有设置项恢复出厂值，不可恢复</div>
                  </div>
                  <Button variant="danger" onClick={onReset}>重置配置</Button>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div>
                    <div className="text-sm text-zinc-200">导出全量数据</div>
                    <div className="text-xs text-zinc-500">导出所有知识库、排期、配置为 JSON</div>
                  </div>
                  <Button variant="danger" onClick={onExport}>导出 JSON</Button>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

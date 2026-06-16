'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Lock,
  Plus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  TimerReset,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  RETRO_WINDOW_DAYS,
  buildLoopActionItems,
  createDefaultContentLoopState,
  createPredictionRecord,
  buildPredictionMarkdown,
  getActualCompleteness,
  getRetroDueInfo,
  persistContentLoopState,
  publishRecord,
  readContentLoopState,
  readPersistedContentLoopState,
  retroRecord,
  writeContentLoopState,
  type LoopActionItem,
  type ContentLoopState,
  type ContentPredictionRecord,
} from '@/lib/content-loop';

const LOOP_STEPS = [
  { label: '打', title: '打分', desc: '先看稿子强弱，不写实绩', icon: BarChart3 },
  { label: '盲', title: '盲预测', desc: '发布前锁定判断', icon: Lock },
  { label: '发', title: '发布', desc: '记录链接和时间', icon: Rocket },
  { label: '复', title: `T+${RETRO_WINDOW_DAYS} 复盘`, desc: '只录真实数据和评论信号', icon: TimerReset },
  { label: '升', title: '升级 rubric', desc: '样本够了再调权重', icon: TrendingUp },
];

export default function ContentLoopPage() {
  const [state, setState] = useState<ContentLoopState>(() => createDefaultContentLoopState());
  const [title, setTitle] = useState('同城避坑短视频');
  const [draft, setDraft] = useState('别先下单，先看这三点。第一，看真实现场有没有证据；第二，看老板怎么解释失败案例；第三，看评论区有没有同类客户追问。最后评论区留一个“避坑”，我把判断清单发你。');
  const [publishUrl, setPublishUrl] = useState<Record<string, string>>({});
  const [actualInputs, setActualInputs] = useState<Record<string, NonNullable<ContentPredictionRecord['actual']>>>({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let mounted = true;
    setState(readContentLoopState());
    readPersistedContentLoopState()
      .then((persisted) => {
        if (mounted && persisted) {
          setState(persisted);
          writeContentLoopState(persisted);
        }
      })
      .catch(() => {
        if (mounted) setNotice('未读取到本地落盘记录，已使用浏览器缓存。');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openRecords = useMemo(
    () => state.records.filter((record) => record.status !== 'retrospected').length,
    [state.records],
  );

  const pendingRetros = useMemo(
    () => state.records.filter((record) => record.status === 'published').length,
    [state.records],
  );

  const actionItems = useMemo(() => buildLoopActionItems(state), [state]);

  const saveState = (next: ContentLoopState) => {
    setState(next);
    writeContentLoopState(next);
    persistContentLoopState(next).catch((error) => {
      setNotice(error instanceof Error ? error.message : '内容闭环落盘失败');
    });
  };

  const resetLoop = () => {
    const next = createDefaultContentLoopState();
    saveState(next);
    setNotice('已重新初始化内容预测复盘系统。');
  };

  const createPrediction = () => {
    if (!draft.trim()) {
      setNotice('先写一段稿子，再做盲预测。');
      return;
    }
    const record = createPredictionRecord({ title, draft, source: 'manual', calibrationSamples: state.calibrationSamples });
    saveState({
      ...state,
      records: [record, ...state.records].slice(0, 24),
    });
    setNotice('已生成一条发布前盲预测。预测段现在视为锁定，不要用实绩反改。');
  };

  const markPublished = (record: ContentPredictionRecord) => {
    const nextRecord = publishRecord(record, publishUrl[record.id] || '');
    saveState({
      ...state,
      records: state.records.map((item) => item.id === record.id ? nextRecord : item),
    });
    setNotice(`已登记发布。T+${RETRO_WINDOW_DAYS} 后回来录入真实数据和评论信号。`);
  };

  const markRetro = (record: ContentPredictionRecord) => {
    const actual = actualInputs[record.id];
    if (!actual || !actual.commentSignals.trim()) {
      setNotice('复盘至少要填评论信号。只填播放量没有校准价值。');
      return;
    }
    if (getActualCompleteness(actual) < 55) {
      setNotice('复盘数据太薄：至少填一个真实指标，并写清楚评论信号。否则这条不能当校准样本。');
      return;
    }
    const nextRecord = retroRecord(record, actual);
    const nextSamples = state.calibrationSamples + 1;
    saveState({
      ...state,
      calibrationSamples: nextSamples,
      records: state.records.map((item) => item.id === record.id ? nextRecord : item),
    });
    setNotice('复盘已记录。它现在是一个校准样本，可以用于后续升级 rubric。');
  };

  const upgradeRubric = () => {
    const candidates = state.records
      .filter((record) => record.retro?.rubricCandidate)
      .map((record) => record.retro?.rubricCandidate)
      .filter(Boolean) as string[];

    if (candidates.length === 0) {
      setNotice('还没有复盘观察，不能升级 rubric。');
      return;
    }

    const versionNumber = Number(state.rubricVersion.replace(/^v/, '')) || 0;
    saveState({
      ...state,
      rubricVersion: `v${versionNumber + 1}`,
      rubricUpgradeNotes: [candidates[0], ...state.rubricUpgradeNotes].slice(0, 8),
    });
    setNotice('已生成本地 rubric 升级记录。真正改权重前仍需要更多样本验证。');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="CHEAT ON CONTENT"
        title="内容预测复盘系统"
        description="爆了么把 cheat-on-content 复刻成本地闭环：发布前先锁判断，发布后只录真实数据和评论信号。"
        icon={ClipboardCheck}
        action={{
          label: '初始化',
          onClick: resetLoop,
          icon: RefreshCw,
        }}
        next={{ label: '去生成脚本', page: 'generate' }}
      />

      <section className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="nacl-card p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-white/35">NEXT BEST ACTION</p>
              <h2 className="mt-1 text-2xl font-black text-white">今天先干哪一步</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-xs text-white/48">
              打 盲 发 复 升
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {actionItems.map((item) => (
              <ActionItemCard key={`${item.action}-${item.title}`} item={item} />
            ))}
            <div className="rounded-[12px] border border-white/8 bg-black/18 p-4">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Lock size={16} className="text-[var(--color-accent)]" />
                <span className="text-sm font-semibold">产品边界</span>
              </div>
              <p className="text-xs leading-6 text-white/46">
                本页只用本地演示数据，不抓抖音后台，不编播放数字。预测会写进本机私有文件，评论信号仍需手动填。
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/7 p-5 md:p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-accent)]">已按 skill 跑通流程</p>
          <h2 className="mt-2 text-xl font-bold text-white">保留核心纪律，不照搬文件系统</h2>
          <p className="mt-3 text-sm leading-7 text-white/58">
            原 skill 会创建 scripts、predictions、videos 和 rubric 文件。爆了么第一版先把这套变成可点的产品流程：生成脚本后进入盲预测，发布后进入 T+{RETRO_WINDOW_DAYS} 复盘，样本够了再升级规则。
          </p>
        </div>
      </section>

      {state.calibrationSamples < 6 && (
        <section className="rounded-[14px] border border-[var(--color-accent)]/28 bg-[var(--color-accent)]/9 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-accent)]">COLD START</p>
              <h2 className="mt-1 text-xl font-black text-white">这套判断会越用越准</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/60">
              前几条不是拿来装神，是拿来校准。每次盲预测后都要回填真实表现和评论信号，爆了么只显示结果和回喂数据，rubric 真身仍归 Hermes/cheat。
            </p>
          </div>
        </section>
      )}

      <section className="grid gap-3 lg:grid-cols-5">
        {LOOP_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="rounded-[14px] border border-white/10 bg-white/[0.025] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-2xl font-black text-[var(--color-accent)]">{step.label}</span>
                <span className="grid size-9 place-items-center rounded-[9px] bg-white/[0.055] text-white/62">
                  <Icon size={17} />
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">{step.title}</h2>
              <p className="mt-2 text-xs leading-5 text-white/44">{step.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="nacl-card p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-white/35">发布前</p>
              <h2 className="mt-1 text-xl font-bold text-white">打分并写盲预测</h2>
            </div>
            <span className="rounded-full border border-[var(--color-accent)]/28 bg-[var(--color-accent)]/8 px-3 py-1 text-xs text-[var(--color-accent)]">
              rubric {state.rubricVersion}
            </span>
          </div>

          <label className="mb-2 block text-xs text-white/42">标题</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mb-3 w-full rounded-[8px] border border-white/10 bg-black/18 px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-accent)]/45"
          />

          <label className="mb-2 block text-xs text-white/42">最终稿 / 口播 / 分镜</label>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={9}
            className="w-full resize-none rounded-[8px] border border-white/10 bg-black/18 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-[var(--color-accent)]/45"
          />

          <div className="mt-4 rounded-[10px] border border-white/8 bg-black/18 p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--color-accent)]">
              <ShieldCheck size={16} />
              <span className="text-sm font-semibold">盲预测纪律</span>
            </div>
            <p className="text-xs leading-6 text-white/48">
              这里永远只做发布前判断。已经看到播放、点赞、评论之后，不再允许回头改预测，只能进入复盘。
            </p>
          </div>

          <button
            type="button"
            onClick={createPrediction}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--color-accent)] px-5 py-3.5 text-sm font-bold text-black transition hover:bg-white"
          >
            <Plus size={17} />
            打分并生成盲预测
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="校准样本" value={state.calibrationSamples.toString()} note="来自已复盘内容" />
            <MetricCard label="待处理" value={openRecords.toString()} note="未完成闭环" />
            <MetricCard label="待复盘" value={pendingRetros.toString()} note="已发未复盘" />
          </div>

          <div className="nacl-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-white/35">STATUS</p>
                <h2 className="mt-1 text-xl font-bold text-white">状态看板</h2>
              </div>
              <button
                type="button"
                onClick={upgradeRubric}
                className="rounded-[8px] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 px-3 py-2 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/14"
              >
                升级 rubric
              </button>
            </div>
            <p className="text-sm leading-7 text-white/56">
              当前是本地版闭环。它不会抓平台数据，也不会替你编播放量；复盘时必须手动录入真实数据和评论信号。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {state.rubricUpgradeNotes.length > 0 ? state.rubricUpgradeNotes.map((note) => (
                <span key={note} className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-xs text-white/50">
                  {note}
                </span>
              )) : (
                <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-xs text-white/42">
                  等第一条复盘后再产生升级观察
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/35">PREDICTIONS</p>
            <h2 className="mt-1 text-xl font-bold text-white">预测记录</h2>
          </div>
          <p className="text-sm text-white/38">最新记录在前，预测段视为不可改</p>
        </div>

        {state.records.length === 0 ? (
          <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-6 text-sm leading-7 text-white/48">
            还没有预测记录。先把一条脚本丢进上面的框，或者在“脚本生成”页点击“送去预测复盘”。
          </div>
        ) : (
          <div className="grid gap-4">
            {state.records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                publishUrl={publishUrl[record.id] || ''}
                setPublishUrl={(value) => setPublishUrl((prev) => ({ ...prev, [record.id]: value }))}
                actual={actualInputs[record.id] || { plays: '', likes: '', comments: '', shares: '', commentSignals: '' }}
                setActual={(value) => setActualInputs((prev) => ({ ...prev, [record.id]: value }))}
                onPublish={() => markPublished(record)}
                onRetro={() => markRetro(record)}
                calibrationSamples={state.calibrationSamples}
                onNotice={setNotice}
              />
            ))}
          </div>
        )}
      </section>

      {notice && (
        <div className="rounded-[10px] border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/8 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-6 text-white/68">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice('')}
              className="shrink-0 rounded-[7px] border border-white/10 px-2 py-1 text-xs text-white/46 transition hover:text-white"
            >
              收起
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-xs tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-xs text-white/36">{note}</p>
    </div>
  );
}

function ActionItemCard({ item }: { item: LoopActionItem }) {
  const toneClass = {
    danger: 'border-red-300/22 bg-red-400/[0.055] text-red-100',
    warning: 'border-amber-300/22 bg-amber-400/[0.055] text-amber-100',
    ready: 'border-[var(--color-accent)]/28 bg-[var(--color-accent)]/8 text-[var(--color-accent)]',
    steady: 'border-white/10 bg-white/[0.025] text-white',
  }[item.tone];

  return (
    <div className={`rounded-[12px] border p-4 ${toneClass}`}>
      <div className="mb-3 flex items-center gap-2">
        {item.tone === 'danger' ? <AlertTriangle size={17} /> : <CalendarClock size={17} />}
        <span className="text-sm font-bold">{item.title}</span>
      </div>
      <p className="text-xs leading-6 text-white/52">{item.body}</p>
    </div>
  );
}

function RecordCard({
  record,
  publishUrl,
  setPublishUrl,
  actual,
  setActual,
  onPublish,
  onRetro,
  calibrationSamples,
  onNotice,
}: {
  record: ContentPredictionRecord;
  publishUrl: string;
  setPublishUrl: (value: string) => void;
  actual: NonNullable<ContentPredictionRecord['actual']>;
  setActual: (value: NonNullable<ContentPredictionRecord['actual']>) => void;
  onPublish: () => void;
  onRetro: () => void;
  calibrationSamples: number;
  onNotice: (message: string) => void;
}) {
  const dueInfo = getRetroDueInfo(record);
  const completeness = getActualCompleteness(actual);

  const copyPrediction = async () => {
    const markdown = buildPredictionMarkdown(record, calibrationSamples);
    try {
      await navigator.clipboard.writeText(markdown);
      onNotice('预测日志 Markdown 已复制。可以贴进真实 predictions/ 文件。');
    } catch {
      onNotice('复制失败：浏览器没有开放剪贴板权限。');
    }
  };

  return (
    <article className="rounded-[14px] border border-white/10 bg-white/[0.025] p-4 md:p-5">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 px-3 py-1 text-xs text-[var(--color-accent)]">
              {statusLabel(record.status)}
            </span>
            <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/42">
              {record.source === 'script-engine' ? '来自脚本生成' : '手动录入'}
            </span>
            {record.status === 'published' && dueInfo && (
              <span
                className={`rounded-full border px-3 py-1 text-xs ${
                  dueInfo.overdue
                    ? 'border-red-300/24 bg-red-400/[0.06] text-red-200'
                    : 'border-amber-300/24 bg-amber-400/[0.06] text-amber-100'
                }`}
              >
                {dueInfo.overdue ? '可以复盘' : `${dueInfo.daysRemaining} 天后复盘`}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white">{record.title}</h3>
          <p className="mt-2 line-clamp-4 text-sm leading-7 text-white/48">{record.draft}</p>

          <div className="mt-4 rounded-[10px] border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/7 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">盲预测</span>
              <span className="text-2xl font-black text-[var(--color-accent)]">{record.composite}</span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-xs text-white/52">
                bucket: {record.bucket}
              </span>
              <span className="rounded-full border border-white/10 bg-black/18 px-2.5 py-1 text-xs text-white/52">
                v0 等权
              </span>
            </div>
            <p className="text-sm leading-6 text-white/58">{record.blindBet}</p>
            <p className="mt-2 text-xs leading-5 text-white/34">{record.confidence}</p>
            <button
              type="button"
              onClick={copyPrediction}
              className="mt-3 inline-flex items-center gap-2 rounded-[8px] border border-[var(--color-accent)]/28 bg-black/18 px-3 py-2 text-xs font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/10"
            >
              <Copy size={14} />
              导出预测日志
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {record.scores.map((score) => (
              <div key={score.key} className="rounded-[10px] border border-white/8 bg-black/18 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-accent)]">{score.key}</span>
                  <span className="text-lg font-black text-white">{score.score}</span>
                </div>
                <p className="text-xs font-semibold text-white">{score.label}</p>
                <p className="mt-1 text-xs leading-5 text-white/38">{score.reason}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[10px] border border-white/8 bg-black/18 p-4">
              <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-white/35">概率分布</p>
              <div className="space-y-2">
                {record.probability.map((item) => (
                  <div key={item.bucket}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-white/58">{item.bucket}</span>
                      <span className="tabular-nums text-[var(--color-accent)]">{item.probability}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${item.probability}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-white/8 bg-black/18 p-4">
              <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-white/35">锚点 / 反事实</p>
              <p className="text-xs leading-5 text-white/42">{record.anchorNote}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {record.counterfactuals.map((item) => (
                  <p key={item} className="rounded-[8px] border border-white/8 bg-white/[0.025] p-3 text-xs leading-5 text-white/48">
                    {item}
                  </p>
                ))}
              </div>
              <p className="mt-3 rounded-[8px] border border-[var(--color-accent)]/18 bg-[var(--color-accent)]/6 p-3 text-xs leading-5 text-[var(--color-accent)]/88">
                {record.calibrationHypothesis}
              </p>
            </div>
          </div>

          {record.status === 'predicted' && (
            <div className="rounded-[10px] border border-white/10 bg-black/18 p-4">
              <label className="mb-2 block text-xs text-white/42">发布链接（可空）</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={publishUrl}
                  onChange={(event) => setPublishUrl(event.target.value)}
                  placeholder="发布后填链接"
                  className="min-w-0 flex-1 rounded-[8px] border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-accent)]/45"
                />
                <button
                  type="button"
                  onClick={onPublish}
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black transition hover:bg-white"
                >
                  已发布
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {record.status === 'published' && (
            <div className="rounded-[10px] border border-white/10 bg-black/18 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <TimerReset size={16} />
                  <span className="text-sm font-semibold">T+{RETRO_WINDOW_DAYS} 复盘录入</span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/46">
                  完整度 {completeness}%
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                {(['plays', 'likes', 'comments', 'shares'] as const).map((field) => (
                  <input
                    key={field}
                    value={actual[field] || ''}
                    onChange={(event) => setActual({ ...actual, [field]: event.target.value })}
                    placeholder={fieldPlaceholder(field)}
                    className="rounded-[8px] border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-accent)]/45"
                  />
                ))}
              </div>
              <textarea
                value={actual.commentSignals}
                onChange={(event) => setActual({ ...actual, commentSignals: event.target.value })}
                placeholder="粘评论信号：高赞评论、反复出现的词、用户真实追问。没有评论信号，不建议复盘。"
                rows={3}
                className="mt-2 w-full resize-none rounded-[8px] border border-white/10 bg-white/[0.035] px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/22 focus:border-[var(--color-accent)]/45"
              />
              <button
                type="button"
                onClick={onRetro}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-[8px] bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black transition hover:bg-white"
              >
                写入复盘
                <CheckCircle2 size={15} />
              </button>
              <p className="mt-3 text-xs leading-5 text-white/32">
                要成为校准样本，至少需要一个真实指标和评论信号。没有评论，不升级规则。
              </p>
            </div>
          )}

          {record.retro && (
            <div className="rounded-[10px] border border-emerald-300/18 bg-emerald-400/[0.045] p-4">
              <p className="mb-2 text-sm font-semibold text-emerald-200">复盘结论</p>
              <p className="text-sm leading-7 text-white/60">{record.retro.summary}</p>
              <p className="mt-2 text-xs leading-5 text-white/42">{record.retro.lesson}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-accent)]">{record.retro.rubricCandidate}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function statusLabel(status: ContentPredictionRecord['status']) {
  if (status === 'predicted') return '已盲预测';
  if (status === 'published') return '已发布';
  if (status === 'retrospected') return '已复盘';
  return '草稿';
}

function fieldPlaceholder(field: 'plays' | 'likes' | 'comments' | 'shares') {
  const map = {
    plays: '播放',
    likes: '点赞',
    comments: '评论',
    shares: '分享',
  };
  return map[field];
}

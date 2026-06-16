import type { DouyinScript } from '@/lib/types';

export type ContentRecordStatus = 'draft' | 'predicted' | 'published' | 'retrospected';

export interface RubricScore {
  key: string;
  label: string;
  score: number;
  reason: string;
}

export interface ContentPredictionRecord {
  id: string;
  title: string;
  draft: string;
  source: 'manual' | 'script-engine';
  status: ContentRecordStatus;
  createdAt: string;
  predictedAt: string;
  publishedAt?: string;
  publishUrl?: string;
  scores: RubricScore[];
  composite: number;
  bucket: string;
  probability: Array<{ bucket: string; probability: number }>;
  blindBet: string;
  confidence: string;
  anchorNote: string;
  counterfactuals: string[];
  calibrationHypothesis: string;
  riskNotes: string[];
  actual?: {
    plays?: string;
    likes?: string;
    comments?: string;
    shares?: string;
    commentSignals: string;
  };
  retro?: {
    summary: string;
    lesson: string;
    rubricCandidate: string;
    createdAt: string;
  };
}

export interface ContentLoopState {
  initializedAt: string;
  rubricVersion: string;
  calibrationSamples: number;
  records: ContentPredictionRecord[];
  rubricUpgradeNotes: string[];
}

export const CONTENT_LOOP_STORAGE_KEY = 'baoleme-content-loop-v1';
export const RETRO_WINDOW_DAYS = 3;

export type LoopActionTone = 'danger' | 'warning' | 'ready' | 'steady';

export interface LoopActionItem {
  tone: LoopActionTone;
  title: string;
  body: string;
  action: 'predict' | 'publish' | 'retro' | 'upgrade';
}

export const RUBRIC_DIMENSIONS = [
  { key: 'ER', label: '情感共鸣' },
  { key: 'HP', label: '钩子强度' },
  { key: 'QL', label: '金句密度' },
  { key: 'NA', label: '叙事性' },
  { key: 'AB', label: '受众广度' },
  { key: 'SR', label: '社会议题共振' },
  { key: 'SAT', label: '讽刺深度' },
] as const;

export function createDefaultContentLoopState(): ContentLoopState {
  return {
    initializedAt: new Date().toISOString(),
    rubricVersion: 'v0',
    calibrationSamples: 0,
    records: [],
    rubricUpgradeNotes: [],
  };
}

export function readContentLoopState(): ContentLoopState {
  if (typeof window === 'undefined') return createDefaultContentLoopState();
  try {
    const raw = window.localStorage.getItem(CONTENT_LOOP_STORAGE_KEY);
    if (!raw) return createDefaultContentLoopState();
    const parsed = JSON.parse(raw) as ContentLoopState;
    return {
      ...createDefaultContentLoopState(),
      ...parsed,
      records: Array.isArray(parsed.records) ? parsed.records.map((record) => normalizeRecord(record)) : [],
      rubricUpgradeNotes: Array.isArray(parsed.rubricUpgradeNotes) ? parsed.rubricUpgradeNotes : [],
    };
  } catch {
    return createDefaultContentLoopState();
  }
}

export function writeContentLoopState(state: ContentLoopState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONTENT_LOOP_STORAGE_KEY, JSON.stringify(state));
}

export async function readPersistedContentLoopState(): Promise<ContentLoopState | null> {
  if (typeof window === 'undefined') return null;
  const response = await fetch('/api/content-loop', { cache: 'no-store' });
  if (!response.ok) return null;
  const payload = (await response.json()) as { state?: ContentLoopState | null };
  return payload.state || null;
}

export async function persistContentLoopState(state: ContentLoopState) {
  if (typeof window === 'undefined') return;
  const response = await fetch('/api/content-loop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error || '内容闭环落盘失败');
  }
}

function normalizeRecord(record: ContentPredictionRecord): ContentPredictionRecord {
  const scores = Array.isArray(record.scores) && record.scores.length ? record.scores : scoreDraft(record.draft || '');
  const composite = typeof record.composite === 'number'
    ? record.composite
    : Number((scores.reduce((sum, item) => sum + item.score, 0) / scores.length * 2).toFixed(1));
  const probability = Array.isArray(record.probability) && record.probability.length
    ? record.probability
    : buildProbability(composite, 0);
  const bucket = record.bucket || probability.reduce((best, item) => item.probability > best.probability ? item : best, probability[0]).bucket;
  return {
    ...record,
    scores,
    composite,
    bucket,
    probability,
    blindBet: record.blindBet || buildBlindBet(composite, scores),
    confidence: record.confidence || getConfidenceLabel(0),
    anchorNote: record.anchorNote || '锚点对比 N/A：这是旧记录自动迁移，缺少当时的校准池信息。',
    counterfactuals: Array.isArray(record.counterfactuals) && record.counterfactuals.length ? record.counterfactuals : buildCounterfactuals(bucket, scores),
    calibrationHypothesis: record.calibrationHypothesis || buildCalibrationHypothesis(scores),
    riskNotes: Array.isArray(record.riskNotes) ? record.riskNotes : [],
  };
}

export function scriptToDraft(script: DouyinScript) {
  return [
    `标题：${script.title}`,
    '',
    `黄金3秒：${script.hook.visual} / ${script.hook.audio}`,
    ...script.body.map((section, index) => `段落${index + 1}（${section.seconds}）：${section.visual} / ${section.audio}`),
    `反转：${script.twist.visual} / ${script.twist.audio}`,
    `CTA：${script.cta.visual} / ${script.cta.audio}`,
    '',
    `口播：${script.ttsText}`,
    '',
    `封面：${script.coverPrompt}`,
  ].join('\n');
}

export function createRecordFromScript(script: DouyinScript, calibrationSamples = 0): ContentPredictionRecord {
  return createPredictionRecord({
    title: script.title,
    draft: scriptToDraft(script),
    source: 'script-engine',
    calibrationSamples,
  });
}

export function createPredictionRecord(input: {
  title: string;
  draft: string;
  source?: ContentPredictionRecord['source'];
  calibrationSamples?: number;
}): ContentPredictionRecord {
  const scores = scoreDraft(input.draft);
  const composite = Number((scores.reduce((sum, item) => sum + item.score, 0) / scores.length * 2).toFixed(1));
  const now = new Date().toISOString();
  const probability = buildProbability(composite, input.calibrationSamples || 0);
  const bucket = probability.reduce((best, item) => item.probability > best.probability ? item : best, probability[0]).bucket;
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim() || '未命名内容',
    draft: input.draft.trim(),
    source: input.source || 'manual',
    status: 'predicted',
    createdAt: now,
    predictedAt: now,
    scores,
    composite,
    bucket,
    probability,
    blindBet: buildBlindBet(composite, scores),
    confidence: getConfidenceLabel(input.calibrationSamples || 0),
    anchorNote: input.calibrationSamples ? '用本地已复盘样本做弱锚点；样本少时仍以方向判断为主。' : '锚点对比 N/A：校准池为 0，这条预测的价值是采集第一批数据。',
    counterfactuals: buildCounterfactuals(bucket, scores),
    calibrationHypothesis: buildCalibrationHypothesis(scores),
    riskNotes: buildRiskNotes(input.draft, scores),
  };
}

export function publishRecord(record: ContentPredictionRecord, url: string): ContentPredictionRecord {
  return {
    ...record,
    status: 'published',
    publishedAt: new Date().toISOString(),
    publishUrl: url.trim() || undefined,
  };
}

export function getRetroDueInfo(record: ContentPredictionRecord, now = new Date()) {
  if (!record.publishedAt) return null;
  const publishedAt = new Date(record.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return null;
  const dueAt = new Date(publishedAt);
  dueAt.setDate(dueAt.getDate() + RETRO_WINDOW_DAYS);
  const diffMs = dueAt.getTime() - now.getTime();
  const days = Math.ceil(diffMs / 86400000);
  return {
    dueAt: dueAt.toISOString(),
    daysRemaining: Math.max(0, days),
    overdue: diffMs <= 0,
  };
}

export function getActualCompleteness(actual?: ContentPredictionRecord['actual']) {
  if (!actual) return 0;
  const metricCount = [actual.plays, actual.likes, actual.comments, actual.shares]
    .filter((value) => Boolean(value && value.trim())).length;
  const hasComments = actual.commentSignals.trim().length >= 8;
  return Math.round(((metricCount / 4) * 60) + (hasComments ? 40 : 0));
}

export function buildLoopActionItems(state: ContentLoopState): LoopActionItem[] {
  const predictedCount = state.records.filter((record) => record.status === 'predicted').length;
  const published = state.records.filter((record) => record.status === 'published');
  const dueRetros = published.filter((record) => getRetroDueInfo(record)?.overdue);
  const candidates = state.records.filter((record) => record.retro?.rubricCandidate).length;

  if (dueRetros.length > 0) {
    return [{
      tone: 'danger',
      title: `有 ${dueRetros.length} 条该复盘了`,
      body: `先别继续生成新脚本。把 T+${RETRO_WINDOW_DAYS} 的真实数据和评论信号录回来，系统才会变准。`,
      action: 'retro',
    }];
  }

  if (published.length > 0) {
    return [{
      tone: 'warning',
      title: `有 ${published.length} 条已发布待复盘`,
      body: `发布后先等数据沉淀。到 T+${RETRO_WINDOW_DAYS} 后录播放、互动和高赞评论，不要提前改预测。`,
      action: 'retro',
    }];
  }

  if (predictedCount > 0) {
    return [{
      tone: 'ready',
      title: `有 ${predictedCount} 条已盲预测`,
      body: '下一步是拍摄和发布。发布前可以改稿，但一旦看到数据，就只能复盘，不能倒推预测。',
      action: 'publish',
    }];
  }

  if (candidates >= 3) {
    return [{
      tone: 'ready',
      title: '可以考虑升级 rubric',
      body: '已经有多条复盘观察。真正调权重前仍要看同向证据，不能因为单条表现就改规则。',
      action: 'upgrade',
    }];
  }

  return [{
    tone: 'steady',
    title: '先做第一条盲预测',
    body: '把脚本生成页的一条结果送进来，或者手动粘一段口播。第一批预测的价值是建立校准池。',
    action: 'predict',
  }];
}

export function retroRecord(
  record: ContentPredictionRecord,
  actual: NonNullable<ContentPredictionRecord['actual']>,
): ContentPredictionRecord {
  const summary = buildRetroSummary(record, actual);
  return {
    ...record,
    status: 'retrospected',
    actual,
    retro: {
      summary,
      lesson: buildRetroLesson(record, actual),
      rubricCandidate: buildRubricCandidate(record, actual),
      createdAt: new Date().toISOString(),
    },
  };
}

function scoreDraft(draft: string): RubricScore[] {
  const text = draft.trim();
  const length = text.length;
  const hasQuestion = /[？?]/.test(text);
  const hasEmotion = /怕|卡|难|亏|焦虑|尴尬|崩|救命|痛|踩坑|后悔|不敢|撑不住/.test(text);
  const hasEvidence = /案例|证据|数据|现场|对比|评论|真实|后台|截图|样本/.test(text);
  const hasHook = /别|不要|先|为什么|怎么|真正|不是|反常识|避坑/.test(text);
  const hasQuote = /“|”|"|金句|一句话|真正|不是|而是|你以为|其实/.test(text);
  const hasNarrative = /第一|第二|第三|最后|开头|然后|转折|结果|以前|后来/.test(text);
  const hasBroadAudience = /客户|老板|用户|门店|同城|顾客|普通人|很多人|我们|你/.test(text);
  const hasSocialPattern = /平台|算法|同行|模板|流量|焦虑|消费|职场|生意|内容|时代|结构/.test(text);
  const hasSatire = /荒谬|讽刺|离谱|装作|假装|反着|笑死|谁懂|打工|赛博/.test(text);

  return [
    {
      key: 'ER',
      label: '情感共鸣',
      score: clampScore((hasEmotion ? 3 : 1) + (hasEvidence ? 1 : 0)),
      reason: hasEmotion ? '有具体情绪或痛感' : '情绪还偏理性说明',
    },
    {
      key: 'HP',
      label: '钩子强度',
      score: clampScore((hasHook ? 3 : 1) + (hasQuestion ? 1 : 0) + (length > 80 ? 1 : 0)),
      reason: hasHook ? '开头有反差或避坑承诺' : '钩子还偏通用开场',
    },
    {
      key: 'QL',
      label: '金句密度',
      score: clampScore((hasQuote ? 3 : 1) + (/别|不是|真正/.test(text) ? 1 : 0)),
      reason: hasQuote ? '有可截图传播的句式' : '缺少能单独传播的句子',
    },
    {
      key: 'NA',
      label: '叙事性',
      score: clampScore((hasNarrative ? 3 : 1) + (length > 120 ? 1 : 0)),
      reason: hasNarrative ? '有可跟随的段落推进' : '更像列表，不像故事',
    },
    {
      key: 'AB',
      label: '受众广度',
      score: clampScore((hasBroadAudience ? 3 : 1) + (/同城|老板|普通人|很多人/.test(text) ? 1 : 0)),
      reason: hasBroadAudience ? '受众对象清楚且不太窄' : '受众可能过窄',
    },
    {
      key: 'SR',
      label: '社会议题共振',
      score: clampScore((hasSocialPattern ? 3 : 1) + (/平台|算法|流量|结构/.test(text) ? 1 : 0)),
      reason: hasSocialPattern ? '触到平台/生意/内容结构' : '更偏个人经验',
    },
    {
      key: 'SAT',
      label: '讽刺深度',
      score: clampScore((hasSatire ? 3 : 1) + (/反着|假装|荒谬/.test(text) ? 1 : 0)),
      reason: hasSatire ? '有轻讽刺或反向表达' : '真诚直给，讽刺层较少',
    },
  ];
}

function buildBlindBet(composite: number, scores: RubricScore[]) {
  const lowest = [...scores].sort((a, b) => a.score - b.score)[0];
  if (composite >= 8) return `盲押：强候选，但这是 cold-start 纪律训练，不用它替你决定发不发；复盘重点看 ${lowest.key} 是否拖后腿。`;
  if (composite >= 6.5) return `盲押：可测，方向成立；发布前最好补强 ${lowest.key}（${lowest.label}）。`;
  return `盲押：先重写 ${lowest.key}（${lowest.label}），否则这条的复盘信息量会偏低。`;
}

function buildRiskNotes(draft: string, scores: RubricScore[]) {
  const notes = ['预测只记录发布前判断，不代表平台实绩。'];
  if (scores.some((item) => item.key === 'SR' && item.score <= 2)) notes.push('社会议题托底弱，别把它包装成大趋势判断。');
  if (/第一|唯一|保证|必爆|稳赚|暴富|100%|百分百/.test(draft)) notes.push('有绝对化表达，发布前先降风险。');
  return notes;
}

export function buildPredictionMarkdown(record: ContentPredictionRecord, calibrationSamples: number) {
  const scoresText = record.scores.map((score) => `${score.key}${score.score}`).join(' / ');
  const probabilityText = record.probability.map((item) => `- ${item.bucket} -> ${item.probability}%`).join('\n');
  return [
    `# ${record.title} — 预测日志`,
    '',
    `**Article ID**: ${record.id}`,
    `**Title**: ${record.title}`,
    '**Rubric Version**: v0',
    `**预测时间**: ${record.predictedAt}`,
    `**Calibration Samples (at predict time)**: ${calibrationSamples}`,
    `**Confidence**: ${record.confidence}`,
    '**Prediction Basis**: pre_shoot',
    '**Scored By**: baoleme-local',
    '**BlindScored By**: local-rubric-v0',
    '**User Override**: none',
    '**预测时数据状态**: blind',
    '',
    '## 输入快照',
    '',
    `**分数 (v0)**: ${scoresText} -> composite=${record.composite}`,
    '',
    '用户原创/脚本生成稿，未接入历史实绩锚点。',
    '',
    '## 预测 v1',
    '',
    `**Bucket**: ${record.bucket}`,
    '',
    '**内心概率分布**:',
    probabilityText,
    '',
    `**一句话 reason**: ${record.blindBet}`,
    '',
    '## 推理因素',
    '',
    '| 因素 | 方向 | 置信度 | 说明 |',
    '|---|---|---|---|',
    ...record.scores.map((score) => `| ${score.key}=${score.score} | ${score.score >= 4 ? '强 +' : score.score <= 2 ? '强 -' : '中 ?'} | ${calibrationSamples >= 6 ? '中' : '低'} | ${score.reason} |`),
    '',
    '## 锚点对比',
    '',
    record.anchorNote,
    '',
    '## 反事实场景',
    '',
    ...record.counterfactuals.map((item) => `- ${item}`),
    '',
    '## 关键校准假设',
    '',
    record.calibrationHypothesis,
    '',
    '## 复盘',
    '',
    `（待填：发布 T+${RETRO_WINDOW_DAYS} 后录入真实数据和 top 评论信号）`,
  ].join('\n');
}

function buildProbability(composite: number, calibrationSamples: number) {
  const buckets = ['底部', '基础盘', '命中', '小爆', '大爆'];
  if (calibrationSamples === 0) {
    if (composite >= 8) return [
      { bucket: '底部', probability: 18 },
      { bucket: '基础盘', probability: 32 },
      { bucket: '命中', probability: 30 },
      { bucket: '小爆', probability: 15 },
      { bucket: '大爆', probability: 5 },
    ];
    if (composite >= 6.5) return [
      { bucket: '底部', probability: 25 },
      { bucket: '基础盘', probability: 40 },
      { bucket: '命中', probability: 23 },
      { bucket: '小爆', probability: 9 },
      { bucket: '大爆', probability: 3 },
    ];
    return [
      { bucket: '底部', probability: 38 },
      { bucket: '基础盘', probability: 40 },
      { bucket: '命中', probability: 15 },
      { bucket: '小爆', probability: 5 },
      { bucket: '大爆', probability: 2 },
    ];
  }
  const headline = composite >= 8 ? 2 : composite >= 6.5 ? 1 : 0;
  if (headline === 0) return [
    { bucket: '底部', probability: 46 },
    { bucket: '基础盘', probability: 28 },
    { bucket: '命中', probability: 14 },
    { bucket: '小爆', probability: 8 },
    { bucket: '大爆', probability: 4 },
  ];
  return buckets.map((bucket, index) => ({
    bucket,
    probability: index === headline ? 46 : index === headline + 1 ? 24 : index === headline - 1 ? 18 : 6,
  }));
}

function getConfidenceLabel(samples: number) {
  if (samples === 0) return '🔴 极低：占星级别，纯纪律训练';
  if (samples <= 2) return '🟠 低：方向感优于绝对数字';
  if (samples <= 5) return '🟡 偏低：bucket 排序可参考';
  if (samples <= 10) return '🟢 中：可参与决策';
  if (samples <= 20) return '🟢 较高：rubric 形态逐渐稳定';
  return '🔵 高：可数据驱动升级';
}

function buildCounterfactuals(bucket: string, scores: RubricScore[]) {
  const strongest = [...scores].sort((a, b) => b.score - a.score)[0];
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0];
  return [
    `如果高于「${bucket}」：说明 ${strongest.key}（${strongest.label}）可能比 v0 权重更高。`,
    `如果落在「${bucket}」：说明 v0 对这条的方向判断暂时成立。`,
    `如果低于「${bucket}」：优先检查 ${weakest.key}（${weakest.label}）是否被高估。`,
    '如果评论信号和播放反向：优先相信评论信号，它决定下次怎么改稿。',
  ];
}

function buildCalibrationHypothesis(scores: RubricScore[]) {
  const strongest = [...scores].sort((a, b) => b.score - a.score)[0];
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0];
  return `核心赌注：这条内容由 ${strongest.key}（${strongest.label}）驱动。如果 T+${RETRO_WINDOW_DAYS} 评论没有对应信号，而 ${weakest.key}（${weakest.label}）被反复吐槽，下一轮 rubric 要降低前者或提高后者权重。`;
}

function buildRetroSummary(record: ContentPredictionRecord, actual: NonNullable<ContentPredictionRecord['actual']>) {
  const hasSignals = actual.commentSignals.trim().length > 0;
  if (record.composite >= 8 && hasSignals) return '这条内容的强弱要看评论信号是否验证了发布前判断，而不是只看播放数字。';
  if (!hasSignals) return '这次复盘缺少评论信号，暂时只能记录结果，不能轻易升级 rubric。';
  return '已记录真实表现和评论信号，可作为后续 rubric 校准样本。';
}

function buildRetroLesson(record: ContentPredictionRecord, actual: NonNullable<ContentPredictionRecord['actual']>) {
  const low = [...record.scores].sort((a, b) => a.score - b.score)[0];
  if (!actual.commentSignals.trim()) return `下次补评论信号，否则无法判断 ${low.label} 是否真的影响转化。`;
  return `复盘时优先核对：发布前最低维度「${low.label}」有没有在评论区暴露问题。`;
}

function buildRubricCandidate(record: ContentPredictionRecord, actual: NonNullable<ContentPredictionRecord['actual']>) {
  if (!actual.commentSignals.trim()) return '暂不建议升级：缺少评论信号。';
  const top = [...record.scores].sort((a, b) => b.score - a.score)[0];
  return `候选观察：如果多条内容都由「${top.label}」带动评论信号，可在 v1 rubric 中提高它的权重。`;
}

function clampScore(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

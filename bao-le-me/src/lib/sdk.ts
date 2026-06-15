import { HeaderUtils } from 'coze-coding-dev-sdk';

export function extractHeaders(requestHeaders?: Headers | Record<string, string>): Record<string, string> {
  if (!requestHeaders) return {};
  return HeaderUtils.extractForwardHeaders(requestHeaders);
}

/**
 * 数据中台 Agent 调用
 * 通过 Coze Bot API 调用盐粒粒智能体获取数据
 * 红线：拿到的数字必须标真实来源；拿不到就不写、不编
 */
const BOT_ID = '7650871805393010734';
const API_BASE = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';

export async function callDataCenter(query: string): Promise<string> {
  const token = process.env.COZE_WORKLOAD_API_TOKEN;
  if (!token) {
    throw new Error('COZE_WORKLOAD_API_TOKEN not configured');
  }

  const res = await fetch(`${API_BASE}/v3/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      bot_id: BOT_ID,
      user_id: 'bao-le-mei-server',
      stream: false,
      auto_save_history: false,
      additional_messages: [{
        role: 'user',
        content: query,
        content_type: 'text',
      }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Data center API error: ${res.status} ${text}`);
  }

  // Poll for chat completion
  const data = await res.json();
  const chatId = data?.data?.id;
  const conversationId = data?.data?.conversation_id;

  if (!chatId) {
    throw new Error('No chat_id returned from data center');
  }

  // Poll for result
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const pollRes = await fetch(
      `${API_BASE}/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    const pollData = await pollRes.json();
    if (pollData?.data?.status === 'completed') {
      // Get message list
      const msgRes = await fetch(
        `${API_BASE}/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const msgData = await msgRes.json();
      const answer = msgData?.data?.find(
        (m: { role: string; type: string }) => m.role === 'assistant' && m.type === 'answer'
      );
      return answer?.content || '';
    }
  }

  throw new Error('Data center timeout');
}

/**
 * 直接调用 webhook（兼容红了没的 URL）
 */
export async function callWebhook(payload: Record<string, unknown>): Promise<string> {
  const token = process.env.COZE_WORKLOAD_API_TOKEN;
  const res = await fetch('https://fnk7ksn2ss.coze.site/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook error: ${res.status} ${text}`);
  }

  return res.text();
}

import { Config, HeaderUtils, LLMClient } from 'coze-coding-dev-sdk';
import type { NextRequest } from 'next/server';

type ChatMessage = { role: 'user' | 'system' | 'assistant'; content: string };

interface InvokeOptions {
  temperature?: number;
  model?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export function forwardHeaders(request: NextRequest): Record<string, string> {
  return HeaderUtils.extractForwardHeaders(request.headers);
}

function withTimeout<T>(request: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    request,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`LLM timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function invokeLLM(messages: ChatMessage[], options: InvokeOptions = {}): Promise<string> {
  const temperature = options.temperature ?? 0.7;
  const timeoutMs = options.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS || 12000);

  if (process.env.DEEPSEEK_API_KEY) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await withTimeout(fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'deepseek-chat',
        messages,
        temperature,
      }),
    }), timeoutMs).finally(() => clearTimeout(timer));

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`DeepSeek 推理失败：${res.status}${text ? ` ${text.slice(0, 160)}` : ''}`);
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content || '';
  }

  const config = new Config();
  const client = new LLMClient(config, options.headers || {});
  const request = client.invoke(messages.map((message) => ({
    role: 'user' as const,
    content: message.content,
  })), {
    model: 'doubao-seed-2-0-lite-260215',
    temperature,
  });
  const response = await withTimeout(request, timeoutMs);
  return response.content || '';
}

export function parseJsonObject<T>(raw: string): Partial<T> {
  try {
    return JSON.parse(raw) as Partial<T>;
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const object = fenced?.[1] || raw.match(/\{[\s\S]*\}/)?.[0];
    if (!object) return {};
    try {
      return JSON.parse(object) as Partial<T>;
    } catch {
      return {};
    }
  }
}

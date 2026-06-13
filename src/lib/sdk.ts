// 咸聊AI · 小红书内容中台 · 后端服务封装
// 集中初始化 coze-coding-dev-sdk 客户端

import {
  SearchClient,
  LLMClient,
  ImageGenerationClient,
  S3Storage,
} from 'coze-coding-dev-sdk';

// 单例客户端（避免每个请求都重新初始化）
let _search: SearchClient | null = null;
let _llm: LLMClient | null = null;
let _image: ImageGenerationClient | null = null;
let _storage: S3Storage | null = null;

export function getSearchClient(): SearchClient {
  if (!_search) _search = new SearchClient();
  return _search;
}

export function getLLMClient(): LLMClient {
  if (!_llm) _llm = new LLMClient();
  return _llm;
}

export function getImageClient(): ImageGenerationClient {
  if (!_image) _image = new ImageGenerationClient();
  return _image;
}

export function getStorage(): S3Storage {
  if (!_storage) {
    _storage = new S3Storage({
      bucketName: process.env.STORAGE_BUCKET || 'xhs-core-public',
    });
  }
  return _storage;
}

// 默认 LLM 模型
export const DEFAULT_LLM_MODEL =
  process.env.DEFAULT_LLM_MODEL || 'doubao-seed-2-0-lite-260215';

// 默认 Image 模型
export const DEFAULT_IMAGE_MODEL =
  process.env.DEFAULT_IMAGE_MODEL || 'doubao-seedream-5-0-260128';

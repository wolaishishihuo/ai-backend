import { createDeepSeek } from '@ai-sdk/deepseek';

/**
 * 创建 DeepSeek provider 实例
 * 使用 API Key 直连 DeepSeek API
 */
export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? ''
});

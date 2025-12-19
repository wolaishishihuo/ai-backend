import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_INTERCEPTOR = 'skipResponseInterceptor';

/**
 * 跳过全局响应拦截器的装饰器
 * 用于流式响应（SSE/Stream）等需要直接返回原始响应的场景
 */
export const SkipResponseInterceptor = () =>
  SetMetadata(SKIP_RESPONSE_INTERCEPTOR, true);

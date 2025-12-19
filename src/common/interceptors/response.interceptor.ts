import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SKIP_RESPONSE_INTERCEPTOR } from '../decorators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 检查是否需要跳过响应拦截器（用于流式响应等场景）
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_INTERCEPTOR,
      [context.getHandler(), context.getClass()]
    );

    // 如果标记了跳过，直接返回原始响应
    if (skipInterceptor) {
      return next.handle();
    }

    const [res] = context.getArgs();
    // 响应统一数据结构
    return next.handle().pipe(
      map((data) => {
        if (typeof data === 'object' && Object.keys(data).includes('code')) {
          return {
            data: data?.data || '',
            code: data.code,
            message: data?.message || (+data.code === 1 ? 'ok' : 'fail')
          };
        }
        return { data, code: res.statusCode || 1, message: 'ok' };
      })
    );
  }
}

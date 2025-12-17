import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';

import * as StackTrace from 'stacktrace-js';

// 异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor() {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const msg = `ExceptionsFilter: ${request.method} ${request.url} ${request.ip} Query: ${JSON.stringify(request.query)} Params: ${JSON.stringify(request.params)} Body: ${JSON.stringify(request.body)} Code: ${status} Response: ${exception.toString()}`;
    this.logger.error(msg, StackTrace.get());

    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = (exceptionResponse as any).message;
        // 如果是数组，只取第一条错误
        message = Array.isArray(msg) ? msg[0] : msg;
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      data: null,
      code: status,
      message
    });
  }
}

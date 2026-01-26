/**
 * 日志拦截器
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const duration = Date.now() - startTime;

        // 开发环境打印日志
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[${method}] ${url} - ${statusCode} - ${duration}ms - ${ip} - ${userAgent.slice(0, 50)}`,
          );
        }
      }),
    );
  }
}

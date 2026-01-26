/**
 * HTTP 异常过滤器
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * 错误码定义
 */
export const ErrorCodes = {
  SUCCESS: 0,

  // 通用错误 1xxx
  UNKNOWN_ERROR: 1000,
  VALIDATION_ERROR: 1001,
  NOT_FOUND: 1002,
  FORBIDDEN: 1003,

  // 认证错误 2xxx
  UNAUTHORIZED: 2000,
  TOKEN_EXPIRED: 2001,
  TOKEN_INVALID: 2002,
  LOGIN_FAILED: 2003,

  // 业务错误 3xxx
  QUOTA_EXCEEDED: 3001,
  TASK_FAILED: 3002,
  USER_BANNED: 3003,

  // 系统错误 5xxx
  INTERNAL_ERROR: 5000,
  SERVICE_UNAVAILABLE: 5001,
} as const;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCodes.UNKNOWN_ERROR;
    let message = '服务器内部错误';
    let errors: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string) || exception.message;
        code = (res.code as number) || this.getCodeByStatus(status);
        errors = res.errors;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      console.error('Unhandled Error:', exception);
    }

    // 打印错误日志
    console.error(`[${request.method}] ${request.url} - ${status} - ${message}`);

    response.status(status).json({
      code,
      message,
      errors,
      timestamp: Date.now(),
      path: request.url,
    });
  }

  private getCodeByStatus(status: number): number {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCodes.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCodes.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCodes.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCodes.NOT_FOUND;
      default:
        return ErrorCodes.UNKNOWN_ERROR;
    }
  }
}

/**
 * 日志服务 - 使用 Winston
 */
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logLevel = this.configService.get<string>('LOG_LEVEL') || 'info';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        isProduction
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                const contextStr = context ? `[${context}]` : '';
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
              }),
            ),
      ),
      transports: [
        new winston.transports.Console(),
        ...(isProduction
          ? [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
              }),
            ]
          : []),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  /**
   * 记录请求日志
   */
  logRequest(data: {
    method: string;
    url: string;
    userId?: number;
    ip?: string;
    duration?: number;
    statusCode?: number;
  }) {
    this.logger.info('HTTP Request', { type: 'request', ...data });
  }

  /**
   * 记录业务日志
   */
  logBusiness(data: {
    action: string;
    module: string;
    userId?: number;
    targetId?: number;
    extra?: Record<string, unknown>;
  }) {
    this.logger.info('Business Log', { type: 'business', ...data });
  }
}

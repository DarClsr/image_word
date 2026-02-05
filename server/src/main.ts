/**
 * 应用入口
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 安全头
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      hidePoweredBy: true,
    }),
  );

  // CORS 配置
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'];
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // 本地存储静态资源（uploads）
  const uploadDir = process.env.STORAGE_LOCAL_DIR || join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  // 全局前缀
  app.setGlobalPrefix(process.env.API_PREFIX || '/api');

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // 启动服务
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 API prefix: ${process.env.API_PREFIX || '/api'}`);
}

bootstrap();

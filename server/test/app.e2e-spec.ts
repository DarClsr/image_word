/**
 * 应用端到端测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health/live (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
        });
    });
  });

  describe('Category', () => {
    it('/client/category/styles (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/client/category/styles')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(0);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/client/category/models (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/client/category/models')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe(0);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});

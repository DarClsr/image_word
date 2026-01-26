/**
 * Redis 服务
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.client = new Redis(redisUrl as string);

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * 获取 Redis 客户端
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 设置值
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * 自增
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * SETNX (仅当键不存在时设置)
   */
  async setnx(key: string, value: string, ttl?: number): Promise<boolean> {
    if (ttl) {
      const result = await this.client.set(key, value, 'EX', ttl, 'NX');
      return result === 'OK';
    }
    const result = await this.client.setnx(key, value);
    return result === 1;
  }

  /**
   * 获取并删除
   */
  async getdel(key: string): Promise<string | null> {
    const value = await this.client.get(key);
    if (value) {
      await this.client.del(key);
    }
    return value;
  }

  /**
   * 哈希表操作
   */
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  /**
   * 集合操作
   */
  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  async srem(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }
}

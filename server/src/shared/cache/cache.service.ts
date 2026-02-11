/**
 * 简单缓存服务（内存）
 */
import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
}

@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number) {
    const entry: CacheEntry<T> = { value };
    if (ttlSeconds && ttlSeconds > 0) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000;
    }
    this.store.set(key, entry);
  }

  del(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

/**
 * 系统配置服务
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { UpdateGenerationConfigInput, UpdateSystemConfigInput } from './schemas/system.schema';

@Injectable()
export class SystemService {
  private readonly GENERATION_CACHE_KEY = 'generation:config';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getSystemConfig() {
    const values = await this.prisma.systemConfig.findMany({
      where: {
        key: {
          in: [
            'system_site_name',
            'system_logo',
            'system_quota_free',
            'system_quota_basic',
            'system_quota_pro',
            'system_auto_audit',
            'system_sensitive_filter',
          ],
        },
      },
    });

    const map = new Map(values.map((item) => [item.key, item.value]));

    return {
      siteName: map.get('system_site_name') || '图文生成管理系统',
      logo: map.get('system_logo') || '',
      freeQuotaDaily: Number(map.get('system_quota_free') || 5),
      basicQuotaDaily: Number(map.get('system_quota_basic') || 30),
      proQuotaDaily: Number(map.get('system_quota_pro') || 100),
      autoAudit: map.get('system_auto_audit') === 'true',
      sensitiveFilter: map.get('system_sensitive_filter') !== 'false',
    };
  }

  async updateSystemConfig(input: UpdateSystemConfigInput) {
    const entries: Array<[string, string]> = [];

    if (input.siteName !== undefined) entries.push(['system_site_name', input.siteName]);
    if (input.logo !== undefined) entries.push(['system_logo', input.logo]);
    if (input.freeQuotaDaily !== undefined) entries.push(['system_quota_free', String(input.freeQuotaDaily)]);
    if (input.basicQuotaDaily !== undefined) entries.push(['system_quota_basic', String(input.basicQuotaDaily)]);
    if (input.proQuotaDaily !== undefined) entries.push(['system_quota_pro', String(input.proQuotaDaily)]);
    if (input.autoAudit !== undefined) entries.push(['system_auto_audit', String(input.autoAudit)]);
    if (input.sensitiveFilter !== undefined) entries.push(['system_sensitive_filter', String(input.sensitiveFilter)]);

    await Promise.all(entries.map(([key, value]) => this.upsertConfig(key, value)));

    return this.getSystemConfig();
  }

  async getGenerationConfig() {
    const values = await this.prisma.systemConfig.findMany({
      where: {
        key: { in: ['generation_ratios', 'generation_counts', 'generation_defaults', 'generation_max_size'] },
      },
    });

    const map = new Map(values.map((item) => [item.key, item.value]));

    const ratios = map.get('generation_ratios');
    const counts = map.get('generation_counts');
    const defaults = map.get('generation_defaults');

    return {
      ratios: ratios ? JSON.parse(ratios) : [],
      counts: counts ? JSON.parse(counts) : [],
      defaults: defaults ? JSON.parse(defaults) : null,
      maxSize: Number(map.get('generation_max_size') || 2048),
    };
  }

  async updateGenerationConfig(input: UpdateGenerationConfigInput) {
    if (input.ratios) {
      await this.upsertConfig('generation_ratios', JSON.stringify(input.ratios));
    }
    if (input.counts) {
      await this.upsertConfig('generation_counts', JSON.stringify(input.counts));
    }
    if (input.defaults) {
      let defaults = input.defaults;
      if (defaults.styleId === undefined) {
        const existing = await this.prisma.systemConfig.findUnique({
          where: { key: 'generation_defaults' },
        });
        if (existing?.value) {
          try {
            const parsed = JSON.parse(existing.value);
            if (parsed?.styleId) {
              defaults = { ...defaults, styleId: parsed.styleId };
            }
          } catch {}
        }
      }
      await this.upsertConfig('generation_defaults', JSON.stringify(defaults));
    }
    if (input.maxSize !== undefined) {
      await this.upsertConfig('generation_max_size', String(input.maxSize));
    }

    await this.redis.del(this.GENERATION_CACHE_KEY);

    return this.getGenerationConfig();
  }

  private async upsertConfig(key: string, value: string) {
    await this.prisma.systemConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

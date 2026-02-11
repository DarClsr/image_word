/**
 * 系统配置相关 Schema
 */
import { z } from 'zod';

export const UpdateSystemConfigSchema = z.object({
  siteName: z.string().max(100).optional(),
  logo: z.string().max(500).optional(),
  freeQuotaDaily: z.number().int().min(0).optional(),
  basicQuotaDaily: z.number().int().min(0).optional(),
  proQuotaDaily: z.number().int().min(0).optional(),
  autoAudit: z.boolean().optional(),
  sensitiveFilter: z.boolean().optional(),
});

export type UpdateSystemConfigInput = z.infer<typeof UpdateSystemConfigSchema>;

const RatioSchema = z.object({
  id: z.number().int(),
  label: z.string().max(50),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  sort: z.number().int().min(0),
  status: z.union([z.literal(0), z.literal(1)]),
});

const CountSchema = z.object({
  id: z.number().int(),
  value: z.number().int().min(1),
  label: z.string().max(50),
  multiplier: z.number().min(0.1),
  sort: z.number().int().min(0),
  status: z.union([z.literal(0), z.literal(1)]),
});

export const UpdateGenerationConfigSchema = z.object({
  ratios: z.array(RatioSchema).optional(),
  counts: z.array(CountSchema).optional(),
  defaults: z
    .object({
      styleId: z.number().int().positive().optional(),
      modelId: z.number().int().positive(),
      ratioIndex: z.number().int().min(0),
      countIndex: z.number().int().min(0),
    })
    .optional(),
  maxSize: z.number().int().min(512).max(4096).optional(),
});

export type UpdateGenerationConfigInput = z.infer<typeof UpdateGenerationConfigSchema>;

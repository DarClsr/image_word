/**
 * 任务相关 Schema
 */
import { z } from 'zod';

export const QueryTaskSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

export type QueryTaskInput = z.infer<typeof QueryTaskSchema>;

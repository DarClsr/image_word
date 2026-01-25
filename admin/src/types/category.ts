import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(50),
  code: z.string().regex(/^[a-z0-9_]+$/),
  type: z.enum(['style', 'model']),
  icon: z.string().optional(),
  cover: z.string().url().optional(),
  description: z.string().max(200).optional(),
  parentId: z.number().int().positive().optional(),
  sort: z.number().int().min(0),
  status: z.union([z.literal(0), z.literal(1)]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryCreateSchema = CategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CategoryCreate = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategorySchema.partial().required({ id: true });

export type CategoryUpdate = z.infer<typeof CategoryUpdateSchema>;

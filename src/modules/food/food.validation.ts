import { z } from 'zod';

export const createFoodSchema = z.object({
  body: z.object({
    kitchenId: z.string().uuid(),
    menuName: z.string().min(1),
    portionCount: z.number().int().positive(),
    cookedAt: z.string().datetime({ offset: true }).or(z.date().transform(d => d.toISOString())),
  }),
});

export const updateFoodStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(['AVAILABLE', 'MATCHED', 'EXPIRED', 'DISTRIBUTED']),
  }),
});

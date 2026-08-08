import { z } from 'zod';

export const createRecipientSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['PANTI', 'PENERIMA']),
    address: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    capacity: z.number().int().positive(),
  }),
});

export const updateRecipientSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.enum(['PANTI', 'PENERIMA']).optional(),
    address: z.string().min(1).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    capacity: z.number().int().positive().optional(),
  }),
});

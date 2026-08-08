import { z } from 'zod';
import { config } from '../../config/index.js';

export const findMatchSchema = z.object({
  body: z.object({
    foodStockId: z.string().uuid(),
    radiusKm: z.number().positive().default(config.defaultMatchingRadiusKm),
  }),
});

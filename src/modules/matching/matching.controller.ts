import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { haversine } from '../../utils/math.js';

export const findMatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodStockId, radiusKm } = req.body;

    const food = await prisma.foodStock.findUnique({
      where: { id: foodStockId },
      include: { kitchen: true },
    });

    if (!food) {
      throw new AppError(404, 'FOOD_NOT_FOUND', 'Food stock not found');
    }

    if (food.status !== 'AVAILABLE') {
      throw new AppError(400, 'FOOD_NOT_AVAILABLE', 'Food stock is not available for matching');
    }

    if (food.safeUntil && new Date() >= food.safeUntil) {
      throw new AppError(400, 'FOOD_EXPIRED', 'Food stock has expired');
    }

    const recipients = await prisma.recipient.findMany();

    const matches = recipients
      .map((recipient: any) => {
        const distanceKm = haversine(
          food.kitchen.latitude,
          food.kitchen.longitude,
          recipient.latitude,
          recipient.longitude
        );
        return {
          recipientId: recipient.id,
          name: recipient.name,
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          capacity: recipient.capacity,
        };
      })
      .filter((match: any) => match.distanceKm <= radiusKm)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

    return sendSuccess(res, {
      food: {
        id: food.id,
        menuName: food.menuName,
        portionCount: food.portionCount,
        cookedAt: food.cookedAt,
        safeUntil: food.safeUntil,
      },
      matches,
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { calculateSafeUntil } from '../../utils/math.js';
import { ocrService } from '../../services/ocr.service.js';

export const createFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { kitchenId, menuName, portionCount, cookedAt, tags } = req.body;
    const cookedAtDate = new Date(cookedAt);
    const safeUntil = calculateSafeUntil(cookedAtDate);

    const food = await prisma.foodStock.create({
      data: {
        kitchenId,
        menuName,
        portionCount: parseInt(portionCount, 10),
        cookedAt: cookedAtDate,
        safeUntil,
        tags: Array.isArray(tags) ? tags : [],
      },
      include: { kitchen: true, recipient: true },
    });

    return sendSuccess(res, food, 201);
  } catch (error) {
    next(error);
  }
};

export const getFoods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, expired, recipientId } = req.query;
    let where: any = {};
    if (status) {
      where.status = status as string;
    }
    if (recipientId) {
      where.recipientId = recipientId as string;
    }
    if (expired === 'false') {
      where.safeUntil = {
        gt: new Date(),
      };
    }
    
    const foods = await prisma.foodStock.findMany({
      where,
      include: { kitchen: true, recipient: true },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, foods);
  } catch (error) {
    next(error);
  }
};

export const getFoodById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const food = await prisma.foodStock.findUnique({
      where: { id },
      include: { kitchen: true, recipient: true },
    });
    if (!food) {
      throw new AppError(404, 'FOOD_NOT_FOUND', 'Food stock not found');
    }
    return sendSuccess(res, food);
  } catch (error) {
    next(error);
  }
};

export const updateFoodStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status, recipientId } = req.body;
    
    const updateData: any = { status };
    if (recipientId) {
      updateData.recipientId = recipientId;
      updateData.claimedAt = new Date();
    }

    const food = await prisma.foodStock.update({
      where: { id },
      data: updateData,
      include: { kitchen: true, recipient: true },
    }).catch(() => null);

    if (!food) {
      throw new AppError(404, 'FOOD_NOT_FOUND', 'Food stock not found');
    }
    return sendSuccess(res, food);
  } catch (error) {
    next(error);
  }
};

export const deleteFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.foodStock.delete({
      where: { id },
    }).catch(() => {
      throw new AppError(404, 'FOOD_NOT_FOUND', 'Food stock not found');
    });
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

export const createFoodFromOcr = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'IMAGE_REQUIRED', 'Image is required');
    }
    const { kitchenId, portionCount, tags } = req.body;
    
    if (!kitchenId || !portionCount) {
      throw new AppError(400, 'INVALID_INPUT', 'kitchenId and portionCount are required');
    }

    const ocrResult = await ocrService.extractText(req.file.path);
    
    if (!ocrResult.cookedAt) {
      throw new AppError(400, 'OCR_TIME_NOT_FOUND', 'Could not detect cooking time from image');
    }
    if (!ocrResult.menuName) {
      throw new AppError(400, 'OCR_MENU_NOT_FOUND', 'Could not detect menu name from image');
    }

    const safeUntil = calculateSafeUntil(ocrResult.cookedAt);

    const food = await prisma.foodStock.create({
      data: {
        kitchenId,
        menuName: ocrResult.menuName,
        portionCount: parseInt(portionCount, 10),
        cookedAt: ocrResult.cookedAt,
        safeUntil,
        tags: Array.isArray(tags) ? tags : [],
      },
      include: { kitchen: true, recipient: true },
    });

    return sendSuccess(res, { ocr: ocrResult, food }, 201);
  } catch (error) {
    next(error);
  }
};

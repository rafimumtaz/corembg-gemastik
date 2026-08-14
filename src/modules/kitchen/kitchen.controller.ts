import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';

export const createKitchen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kitchen = await prisma.kitchen.create({
      data: req.body,
    });
    return sendSuccess(res, kitchen, 201);
  } catch (error) {
    next(error);
  }
};

export const getKitchens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kitchens = await prisma.kitchen.findMany();
    return sendSuccess(res, kitchens);
  } catch (error) {
    next(error);
  }
};

export const getKitchenById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const kitchen = await prisma.kitchen.findUnique({
      where: { id },
    });
    if (!kitchen) {
      throw new AppError(404, 'KITCHEN_NOT_FOUND', 'Kitchen not found');
    }
    return sendSuccess(res, kitchen);
  } catch (error) {
    next(error);
  }
};

export const updateKitchen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const kitchen = await prisma.kitchen.update({
      where: { id },
      data: req.body,
    }).catch(() => null);

    if (!kitchen) {
      throw new AppError(404, 'KITCHEN_NOT_FOUND', 'Kitchen not found');
    }
    return sendSuccess(res, kitchen);
  } catch (error) {
    next(error);
  }
};

export const deleteKitchen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.kitchen.delete({
      where: { id },
    }).catch(() => {
      throw new AppError(404, 'KITCHEN_NOT_FOUND', 'Kitchen not found');
    });
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';

export const createRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipient = await prisma.recipient.create({
      data: req.body,
    });
    return sendSuccess(res, recipient, 201);
  } catch (error) {
    next(error);
  }
};

export const getRecipients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipients = await prisma.recipient.findMany();
    return sendSuccess(res, recipients);
  } catch (error) {
    next(error);
  }
};

export const getRecipientById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const recipient = await prisma.recipient.findUnique({
      where: { id },
    });
    if (!recipient) {
      throw new AppError(404, 'RECIPIENT_NOT_FOUND', 'Recipient not found');
    }
    return sendSuccess(res, recipient);
  } catch (error) {
    next(error);
  }
};

export const updateRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const recipient = await prisma.recipient.update({
      where: { id },
      data: req.body,
    }).catch(() => null);

    if (!recipient) {
      throw new AppError(404, 'RECIPIENT_NOT_FOUND', 'Recipient not found');
    }
    return sendSuccess(res, recipient);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.recipient.delete({
      where: { id },
    }).catch(() => {
      throw new AppError(404, 'RECIPIENT_NOT_FOUND', 'Recipient not found');
    });
    return sendSuccess(res, null);
  } catch (error) {
    next(error);
  }
};

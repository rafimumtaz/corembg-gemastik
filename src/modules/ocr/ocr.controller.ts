import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { ocrService } from '../../services/ocr.service.js';

export const processOcr = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError(400, 'IMAGE_REQUIRED', 'Image is required for OCR');
    }

    const ocrResult = await ocrService.extractText(req.file.path);
    return sendSuccess(res, ocrResult);
  } catch (error) {
    next(error);
  }
};

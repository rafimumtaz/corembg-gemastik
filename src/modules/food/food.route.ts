import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { upload } from '../../middleware/upload.middleware.js';
import {
  createFoodSchema,
  updateFoodStatusSchema,
} from './food.validation.js';
import {
  createFood,
  getFoods,
  getFoodById,
  updateFoodStatus,
  deleteFood,
  createFoodFromOcr,
} from './food.controller.js';

const router = Router();

router.post('/', validate(createFoodSchema), createFood);
router.post('/from-ocr', upload.single('image'), createFoodFromOcr);
router.get('/', getFoods);
router.get('/:id', getFoodById);
router.patch('/:id/status', validate(updateFoodStatusSchema), updateFoodStatus);
router.delete('/:id', deleteFood);

export default router;

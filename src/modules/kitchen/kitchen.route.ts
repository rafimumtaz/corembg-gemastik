import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createKitchenSchema,
  updateKitchenSchema,
} from './kitchen.validation.js';
import {
  createKitchen,
  getKitchens,
  getKitchenById,
  updateKitchen,
  deleteKitchen,
} from './kitchen.controller.js';

const router = Router();

router.post('/', validate(createKitchenSchema), createKitchen);
router.get('/', getKitchens);
router.get('/:id', getKitchenById);
router.patch('/:id', validate(updateKitchenSchema), updateKitchen);
router.delete('/:id', deleteKitchen);

export default router;

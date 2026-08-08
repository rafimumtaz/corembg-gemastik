import { Router } from 'express';
import kitchenRoutes from '../modules/kitchen/kitchen.route.js';
import foodRoutes from '../modules/food/food.route.js';
import recipientRoutes from '../modules/recipient/recipient.route.js';
import matchingRoutes from '../modules/matching/matching.route.js';
import ocrRoutes from '../modules/ocr/ocr.route.js';

const router = Router();

router.use('/kitchens', kitchenRoutes);
router.use('/foods', foodRoutes);
router.use('/recipients', recipientRoutes);
router.use('/matching', matchingRoutes);
router.use('/ocr', ocrRoutes);

export default router;

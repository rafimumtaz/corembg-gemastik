import { Router } from 'express';
import { processOcr } from './ocr.controller.js';
import { upload } from '../../middleware/upload.middleware.js';

const router = Router();

router.post('/', upload.single('image'), processOcr);

export default router;

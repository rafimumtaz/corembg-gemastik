import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import { findMatchSchema } from './matching.validation.js';
import { findMatches } from './matching.controller.js';

const router = Router();

router.post('/find', validate(findMatchSchema), findMatches);

export default router;

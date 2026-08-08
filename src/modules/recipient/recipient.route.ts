import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createRecipientSchema,
  updateRecipientSchema,
} from './recipient.validation.js';
import {
  createRecipient,
  getRecipients,
  getRecipientById,
  updateRecipient,
  deleteRecipient,
} from './recipient.controller.js';

const router = Router();

router.post('/', validate(createRecipientSchema), createRecipient);
router.get('/', getRecipients);
router.get('/:id', getRecipientById);
router.patch('/:id', validate(updateRecipientSchema), updateRecipient);
router.delete('/:id', deleteRecipient);

export default router;

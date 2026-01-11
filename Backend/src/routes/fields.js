import express from 'express';
import {
  createField,
  getFields,
  getFieldById,
  updateField,
  deleteField,
  addCropToField,
  updateCropInField,
  addNoteToField,
  addImageToField,
  getFieldStats,
  getFieldsByLocation
} from '../controllers/fieldController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateField } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Field routes
router.post('/', validateField, createField);
router.get('/', getFields);
router.get('/stats', getFieldStats);
router.get('/nearby', getFieldsByLocation);
router.get('/:id', getFieldById);
router.put('/:id', updateField);
router.delete('/:id', deleteField);

// Crop management
router.post('/:id/crops', addCropToField);
router.put('/:fieldId/crops/:cropId', updateCropInField);

// Field notes and images
router.post('/:id/notes', addNoteToField);
router.post('/:id/images', addImageToField);

export default router;
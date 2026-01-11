import express from 'express';
import {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
  addCrop,
  updateCrop,
  addExpense,
  addRevenue,
  getFarmAnalytics,
  getMockFarmData
} from '../controllers/farmController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Farm routes
router.get('/', getFarms);
router.get('/mock', (req, res) => {
  res.status(200).json({
    success: true,
    data: { farms: getMockFarmData() }
  });
});
router.get('/:id', getFarm);
router.post('/', createFarm);
router.put('/:id', updateFarm);
router.delete('/:id', deleteFarm);

// Crop routes
router.post('/:id/crops', addCrop);
router.put('/:farmId/crops/:cropId', updateCrop);

// Financial routes
router.post('/:farmId/crops/:cropId/expenses', addExpense);
router.post('/:farmId/crops/:cropId/revenue', addRevenue);

// Analytics
router.get('/:id/analytics', getFarmAnalytics);

export default router;
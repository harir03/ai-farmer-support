import express from 'express';
import {
  getMarketPrices,
  getSpecificPrice,
  updateMarketPrice,
  getPriceTrends,
  getCropsByCategory,
  getMockMarketPrices
} from '../controllers/marketPriceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (market prices can be accessed without authentication)
router.get('/', getMarketPrices);
router.get('/mock', (req, res) => {
  res.status(200).json({
    success: true,
    data: { prices: getMockMarketPrices() }
  });
});
router.get('/trends', getPriceTrends);
router.get('/categories', getCropsByCategory);
router.get('/:crop/:state/:city', getSpecificPrice);

// Protected routes (for updating prices - admin/verified users only)
router.use(authenticateToken);
router.post('/', updateMarketPrice);

export default router;
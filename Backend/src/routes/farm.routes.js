import express from 'express';
import {
  getUserFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmInfoForAssistant,
  updateFarmSoilData
} from '../controllers/farm.controller.js';

const router = express.Router();

// Get all farms for a user
router.get('/user/:userId', getUserFarms);

// Get farm info for voice assistant (with all details and coordinates)
router.get('/user/:userId/assistant-info', getFarmInfoForAssistant);

// Get a specific farm by ID
router.get('/:farmId', getFarmById);

// Create a new farm
router.post('/', createFarm);

// Update farm information
router.put('/:farmId', updateFarm);

// Update soil data for a farm
router.put('/:farmId/soil-data', updateFarmSoilData);

// Delete a farm (soft delete)
router.delete('/:farmId', deleteFarm);

export default router;
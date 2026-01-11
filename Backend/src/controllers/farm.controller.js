import Farm from '../models/Farm.js';

// Get all farms for a user
export const getUserFarms = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const farms = await Farm.find({ userId, isActive: true }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      farms,
      total: farms.length
    });
  } catch (error) {
    console.error('Error fetching user farms:', error);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
};

// Get a specific farm by ID
export const getFarmById = async (req, res) => {
  try {
    const { farmId } = req.params;
    
    const farm = await Farm.findById(farmId);
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json({
      success: true,
      farm
    });
  } catch (error) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
};

// Create a new farm
export const createFarm = async (req, res) => {
  try {
    const farmData = req.body;
    
    if (!farmData.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!farmData.name) {
      return res.status(400).json({ error: 'Farm name is required' });
    }

    if (!farmData.center || !farmData.center.lat || !farmData.center.lng) {
      return res.status(400).json({ error: 'Farm center coordinates are required' });
    }

    const farm = new Farm(farmData);
    await farm.save();
    
    res.status(201).json({
      success: true,
      farm,
      message: 'Farm created successfully'
    });
  } catch (error) {
    console.error('Error creating farm:', error);
    res.status(500).json({ error: 'Failed to create farm' });
  }
};

// Update farm information
export const updateFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const updateData = req.body;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    const farm = await Farm.findByIdAndUpdate(
      farmId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json({
      success: true,
      farm,
      message: 'Farm updated successfully'
    });
  } catch (error) {
    console.error('Error updating farm:', error);
    res.status(500).json({ error: 'Failed to update farm' });
  }
};

// Delete a farm (soft delete)
export const deleteFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    
    const farm = await Farm.findByIdAndUpdate(
      farmId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting farm:', error);
    res.status(500).json({ error: 'Failed to delete farm' });
  }
};

// Get farm info for voice assistant (with coordinates and detailed info)
export const getFarmInfoForAssistant = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const farms = await Farm.find({ userId, isActive: true }).sort({ createdAt: -1 });
    
    // Format data for the voice assistant with all necessary information
    const farmInfo = farms.map(farm => ({
      id: farm._id,
      name: farm.name,
      cropType: farm.cropType,
      soilType: farm.soilType,
      irrigationType: farm.irrigationType,
      totalArea: farm.totalArea,
      areaInSquareMeters: farm.areaInSquareMeters,
      coordinates: farm.coordinates,
      center: farm.center,
      latitude: farm.center?.lat,
      longitude: farm.center?.lng,
      perimeter: farm.perimeter,
      soilData: farm.soilData,
      notes: farm.notes,
      createdAt: farm.createdAt,
      updatedAt: farm.updatedAt
    }));

    res.json({
      success: true,
      farmInfo,
      total: farmInfo.length,
      summary: {
        totalFarms: farmInfo.length,
        totalArea: farmInfo.reduce((sum, farm) => sum + (farm.totalArea || 0), 0),
        avgFarmSize: farmInfo.length > 0 ? 
          (farmInfo.reduce((sum, farm) => sum + (farm.totalArea || 0), 0) / farmInfo.length) : 0,
        cropTypes: [...new Set(farmInfo.map(farm => farm.cropType).filter(Boolean))],
        soilTypes: [...new Set(farmInfo.map(farm => farm.soilType).filter(Boolean))],
        irrigationTypes: [...new Set(farmInfo.map(farm => farm.irrigationType).filter(Boolean))]
      }
    });
  } catch (error) {
    console.error('Error fetching farm info for assistant:', error);
    res.status(500).json({ error: 'Failed to fetch farm information' });
  }
};

// Update soil data for a farm
export const updateFarmSoilData = async (req, res) => {
  try {
    const { farmId } = req.params;
    const soilData = req.body;
    
    const farm = await Farm.findByIdAndUpdate(
      farmId,
      { 
        soilData: {
          ...soilData,
          fetchedAt: new Date()
        },
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' });
    }
    
    res.json({
      success: true,
      farm,
      message: 'Soil data updated successfully'
    });
  } catch (error) {
    console.error('Error updating soil data:', error);
    res.status(500).json({ error: 'Failed to update soil data' });
  }
};
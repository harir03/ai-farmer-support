import { Farm } from '../models/index.js';

// Get user's farms
export const getFarms = async (req, res) => {
  try {
    const userId = req.user.userId;

    const farms = await Farm.find({ owner: userId, isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { farms }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single farm
export const getFarm = async (req, res) => {
  try {
    const farmId = req.params.id;
    const userId = req.user.userId;

    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { farm }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new farm
export const createFarm = async (req, res) => {
  try {
    const userId = req.user.userId;
    const farmData = { ...req.body, owner: userId };

    const farm = new Farm(farmData);
    await farm.save();

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: { farm }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update farm
export const updateFarm = async (req, res) => {
  try {
    const farmId = req.params.id;
    const userId = req.user.userId;

    const farm = await Farm.findOneAndUpdate(
      { _id: farmId, owner: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Farm updated successfully',
      data: { farm }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete farm
export const deleteFarm = async (req, res) => {
  try {
    const farmId = req.params.id;
    const userId = req.user.userId;

    const farm = await Farm.findOneAndUpdate(
      { _id: farmId, owner: userId },
      { isActive: false },
      { new: true }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add crop to farm
export const addCrop = async (req, res) => {
  try {
    const farmId = req.params.id;
    const userId = req.user.userId;

    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    farm.crops.push(req.body);
    await farm.save();

    res.status(200).json({
      success: true,
      message: 'Crop added successfully',
      data: { farm }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update crop
export const updateCrop = async (req, res) => {
  try {
    const { farmId, cropId } = req.params;
    const userId = req.user.userId;

    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const crop = farm.crops.id(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    Object.assign(crop, req.body);
    await farm.save();

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      data: { farm }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add expense to crop
export const addExpense = async (req, res) => {
  try {
    const { farmId, cropId } = req.params;
    const userId = req.user.userId;

    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const crop = farm.crops.id(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    crop.expenses.push(req.body);
    await farm.save();

    res.status(200).json({
      success: true,
      message: 'Expense added successfully',
      data: { crop }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add revenue to crop
export const addRevenue = async (req, res) => {
  try {
    const { farmId, cropId } = req.params;
    const userId = req.user.userId;

    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const crop = farm.crops.id(cropId);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    crop.revenue.push(req.body);
    await farm.save();

    res.status(200).json({
      success: true,
      message: 'Revenue added successfully',
      data: { crop }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get farm analytics
export const getFarmAnalytics = async (req, res) => {
  try {
    const farmId = req.params.id;
    const userId = req.user.userId;

    const farm = await Farm.findOne({ _id: farmId, owner: userId });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Calculate analytics
    let totalExpenses = 0;
    let totalRevenue = 0;
    let activeCrops = 0;
    let harvestedCrops = 0;

    farm.crops.forEach(crop => {
      crop.expenses.forEach(expense => {
        totalExpenses += expense.amount;
      });
      crop.revenue.forEach(sale => {
        totalRevenue += sale.totalAmount;
      });
      
      if (crop.status === 'growing' || crop.status === 'planted') {
        activeCrops++;
      } else if (crop.status === 'harvested') {
        harvestedCrops++;
      }
    });

    const analytics = {
      totalExpenses,
      totalRevenue,
      profit: totalRevenue - totalExpenses,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0,
      activeCrops,
      harvestedCrops,
      totalCrops: farm.crops.length,
      equipmentCount: farm.equipment ? farm.equipment.length : 0,
      certificationCount: farm.certifications ? farm.certifications.length : 0
    };

    res.status(200).json({
      success: true,
      data: { analytics }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get mock farm data
export const getMockFarmData = () => {
  return [
    {
      _id: 'mock_farm_1',
      name: 'Green Valley Farm',
      totalArea: { value: 5.5, unit: 'acres' },
      location: {
        city: 'Ludhiana',
        state: 'Punjab',
        pincode: '141001'
      },
      crops: [
        {
          name: 'Wheat',
          area: { value: 2.5, unit: 'acres' },
          plantingDate: new Date('2024-11-01'),
          expectedHarvestDate: new Date('2025-04-15'),
          status: 'growing',
          yield: { expected: 1200, unit: 'kg' }
        },
        {
          name: 'Rice',
          area: { value: 3, unit: 'acres' },
          plantingDate: new Date('2024-07-15'),
          expectedHarvestDate: new Date('2024-11-30'),
          status: 'harvested',
          yield: { expected: 1800, actual: 1650, unit: 'kg' }
        }
      ],
      soilType: 'loamy',
      irrigationType: 'tube_well'
    }
  ];
};
import { Field } from '../models/index.js';
import mongoose from 'mongoose';

// Create a new field
export const createField = async (req, res) => {
  try {
    const fieldData = {
      ...req.body,
      userId: req.user.userId
    };

    const field = new Field(fieldData);
    await field.save();

    res.status(201).json({
      success: true,
      message: 'Field created successfully',
      data: { field }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all fields for a user
export const getFields = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const fields = await Field.find({ userId: req.user.userId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Field.countDocuments({ userId: req.user.userId });

    // Add virtual fields
    const fieldsWithVirtuals = fields.map(field => ({
      ...field,
      activeCrops: field.crops.filter(crop => 
        ['planted', 'growing', 'flowering', 'fruiting'].includes(crop.status)
      )
    }));

    res.status(200).json({
      success: true,
      data: {
        fields: fieldsWithVirtuals,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get field by ID
export const getFieldById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    const field = await Field.findOne({ _id: id, userId: req.user.userId });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { field }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update field
export const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    const field = await Field.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Field updated successfully',
      data: { field }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete field
export const deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    const field = await Field.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Field deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add crop to field
export const addCropToField = async (req, res) => {
  try {
    const { id } = req.params;
    const cropData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    const field = await Field.findOne({ _id: id, userId: req.user.userId });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    field.crops.push(cropData);
    if (!field.currentCrop) {
      field.currentCrop = cropData.cropName;
    }

    await field.save();

    res.status(200).json({
      success: true,
      message: 'Crop added to field successfully',
      data: { field }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update crop in field
export const updateCropInField = async (req, res) => {
  try {
    const { fieldId, cropId } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(fieldId) || !mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID or crop ID'
      });
    }

    const field = await Field.findOneAndUpdate(
      { 
        _id: fieldId, 
        userId: req.user.userId,
        'crops._id': cropId
      },
      {
        $set: Object.keys(updates).reduce((acc, key) => {
          acc[`crops.$.${key}`] = updates[key];
          return acc;
        }, {})
      },
      { new: true, runValidators: true }
    );

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field or crop not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      data: { field }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add note to field
export const addNoteToField = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, category } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    const field = await Field.findOne({ _id: id, userId: req.user.userId });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    field.notes.push({
      content,
      category: category || 'observation',
      date: new Date()
    });

    await field.save();

    res.status(200).json({
      success: true,
      message: 'Note added to field successfully',
      data: { field }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add image to field
export const addImageToField = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, caption } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field ID'
      });
    }

    const field = await Field.findOne({ _id: id, userId: req.user.userId });

    if (!field) {
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    field.images.push({
      url,
      caption,
      takenAt: new Date()
    });

    await field.save();

    res.status(200).json({
      success: true,
      message: 'Image added to field successfully',
      data: { field }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get field statistics
export const getFieldStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Field.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: { path: '$crops', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalFields: { $addToSet: '$_id' },
          totalArea: { $sum: '$size.value' },
          activeCrops: {
            $sum: {
              $cond: [
                { $in: ['$crops.status', ['planted', 'growing', 'flowering', 'fruiting']] },
                1,
                0
              ]
            }
          },
          harvestedCrops: {
            $sum: {
              $cond: [{ $eq: ['$crops.status', 'harvested'] }, 1, 0]
            }
          },
          cropTypes: { $addToSet: '$crops.cropName' }
        }
      },
      {
        $project: {
          totalFields: { $size: '$totalFields' },
          totalArea: 1,
          activeCrops: 1,
          harvestedCrops: 1,
          uniqueCropTypes: { $size: { $filter: { input: '$cropTypes', cond: { $ne: ['$$this', null] } } } }
        }
      }
    ]);

    const fieldStats = stats[0] || {
      totalFields: 0,
      totalArea: 0,
      activeCrops: 0,
      harvestedCrops: 0,
      uniqueCropTypes: 0
    };

    res.status(200).json({
      success: true,
      data: { stats: fieldStats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get fields by location
export const getFieldsByLocation = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const fields = await Field.find({
      userId: req.user.userId,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { fields }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
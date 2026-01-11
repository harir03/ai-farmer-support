import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true,
    maxlength: [100, 'Field name cannot be more than 100 characters']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Field location is required'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    area: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    }
  },
  size: {
    value: {
      type: Number,
      required: [true, 'Field size is required'],
      min: [0.1, 'Field size must be at least 0.1']
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'bigha', 'katha', 'sq_feet', 'sq_meters'],
      default: 'acres'
    }
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'saline'],
    default: 'loamy'
  },
  soilPH: {
    type: Number,
    min: 0,
    max: 14
  },
  irrigation: {
    type: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'furrow', 'rainfed'],
      default: 'rainfed'
    },
    waterSource: {
      type: String,
      enum: ['borewell', 'canal', 'river', 'pond', 'rainwater'],
      default: 'rainwater'
    }
  },
  crops: [{
    cropName: {
      type: String,
      required: true,
      trim: true
    },
    variety: {
      type: String,
      trim: true
    },
    plantedDate: {
      type: Date,
      required: true
    },
    expectedHarvestDate: {
      type: Date
    },
    actualHarvestDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['planted', 'growing', 'flowering', 'fruiting', 'harvested', 'failed'],
      default: 'planted'
    },
    yield: {
      expected: {
        value: Number,
        unit: {
          type: String,
          enum: ['kg', 'quintals', 'tons'],
          default: 'kg'
        }
      },
      actual: {
        value: Number,
        unit: {
          type: String,
          enum: ['kg', 'quintals', 'tons'],
          default: 'kg'
        }
      }
    },
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid', 'perennial'],
      required: true
    }
  }],
  currentCrop: {
    type: String,
    trim: true
  },
  plannedDate: {
    type: Date
  },
  weatherConditions: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    temperature: {
      current: Number,
      min: Number,
      max: Number
    },
    humidity: Number,
    rainfall: Number,
    windSpeed: Number
  },
  farmingPractices: {
    organic: {
      type: Boolean,
      default: false
    },
    pesticides: [{
      name: String,
      appliedDate: Date,
      quantity: String,
      purpose: String
    }],
    fertilizers: [{
      name: String,
      appliedDate: Date,
      quantity: String,
      type: {
        type: String,
        enum: ['organic', 'chemical', 'bio-fertilizer']
      }
    }]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  images: [{
    url: String,
    caption: String,
    takenAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['observation', 'activity', 'issue', 'reminder'],
      default: 'observation'
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
fieldSchema.index({ userId: 1 });
fieldSchema.index({ 'location.coordinates': '2dsphere' });
fieldSchema.index({ currentCrop: 1 });

// Virtual for active crops
fieldSchema.virtual('activeCrops').get(function() {
  return this.crops.filter(crop => 
    ['planted', 'growing', 'flowering', 'fruiting'].includes(crop.status)
  );
});

const Field = mongoose.model('Field', fieldSchema);

export default Field;
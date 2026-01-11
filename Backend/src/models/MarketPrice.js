import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  crop: {
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      lowercase: true
    },
    variety: {
      type: String,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      enum: ['cereals', 'pulses', 'vegetables', 'fruits', 'spices', 'cash_crops', 'fodder', 'other'],
      required: true
    }
  },
  market: {
    name: {
      type: String,
      required: [true, 'Market name is required'],
      trim: true
    },
    location: {
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      district: {
        type: String,
        trim: true
      }
    },
    type: {
      type: String,
      enum: ['mandi', 'wholesale', 'retail', 'online', 'direct'],
      default: 'mandi'
    }
  },
  price: {
    current: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price cannot be negative']
    },
    previous: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    unit: {
      type: String,
      enum: ['per_kg', 'per_quintal', 'per_ton', 'per_piece', 'per_dozen', 'per_bag'],
      default: 'per_quintal'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  priceHistory: [{
    date: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    volume: Number, // Quantity traded
    source: String
  }],
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'FAQ', 'Premium', 'Standard'],
      default: 'Standard'
    },
    specifications: [{
      parameter: String,
      value: String,
      unit: String
    }]
  },
  trends: {
    weekly: {
      change: Number, // Percentage change
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable'],
        default: 'stable'
      }
    },
    monthly: {
      change: Number,
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable'],
        default: 'stable'
      }
    },
    seasonal: {
      peak_season: [String], // Months when price is highest
      low_season: [String],  // Months when price is lowest
      average_seasonal_variation: Number
    }
  },
  demandSupply: {
    demand: {
      type: String,
      enum: ['very_high', 'high', 'moderate', 'low', 'very_low'],
      default: 'moderate'
    },
    supply: {
      type: String,
      enum: ['very_high', 'high', 'moderate', 'low', 'very_low'],
      default: 'moderate'
    },
    notes: String
  },
  weatherImpact: {
    currentWeatherEffect: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    },
    description: String
  },
  dataSource: {
    type: String,
    enum: ['government', 'private', 'market_committee', 'farmer_reported', 'automated'],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reliability: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    verifiedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
marketPriceSchema.index({ 'crop.name': 1, 'market.location.state': 1, 'market.location.city': 1 });
marketPriceSchema.index({ 'crop.category': 1, lastUpdated: -1 });
marketPriceSchema.index({ 'market.location.state': 1, lastUpdated: -1 });
marketPriceSchema.index({ isActive: 1, lastUpdated: -1 });

// Virtual for price change percentage
marketPriceSchema.virtual('priceChangePercent').get(function() {
  if (this.price.previous && this.price.previous > 0) {
    return ((this.price.current - this.price.previous) / this.price.previous) * 100;
  }
  return 0;
});

// Method to add price history entry
marketPriceSchema.methods.addPriceHistory = function(price, volume, source) {
  this.priceHistory.push({
    date: new Date(),
    price: price,
    volume: volume,
    source: source
  });
  
  // Keep only last 30 entries
  if (this.priceHistory.length > 30) {
    this.priceHistory = this.priceHistory.slice(-30);
  }
};

// Method to calculate trend
marketPriceSchema.methods.calculateTrend = function(period = 'weekly') {
  const now = new Date();
  let periodStart;
  
  switch(period) {
    case 'weekly':
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  const relevantHistory = this.priceHistory.filter(entry => entry.date >= periodStart);
  
  if (relevantHistory.length < 2) {
    return { change: 0, trend: 'stable' };
  }
  
  const oldPrice = relevantHistory[0].price;
  const newPrice = relevantHistory[relevantHistory.length - 1].price;
  const change = ((newPrice - oldPrice) / oldPrice) * 100;
  
  let trend = 'stable';
  if (change > 2) trend = 'increasing';
  else if (change < -2) trend = 'decreasing';
  
  return { change: parseFloat(change.toFixed(2)), trend };
};

const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

export default MarketPrice;
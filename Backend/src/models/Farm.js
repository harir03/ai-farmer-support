import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  cropType: {
    type: String,
    default: 'Mixed Crops'
  },
  soilType: String,
  irrigationType: String,
  notes: String,
  totalArea: {
    type: Number,
    required: true
  },
  areaInSquareMeters: {
    type: Number,
    required: true
  },
  coordinates: [{
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }],
  perimeter: Number,
  center: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  soilData: {
    clay: Number,
    sand: Number,
    silt: Number,
    ph: Number,
    organicCarbon: Number,
    soilType: String,
    soilDescription: String,
    textureClass: String,
    recommendations: [String],
    source: String,
    fetchedAt: Date,
    isSimulated: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
farmSchema.index({ userId: 1, isActive: 1 });
farmSchema.index({ 'center.lat': 1, 'center.lng': 1 });

const Farm = mongoose.model('Farm', farmSchema);

export default Farm;
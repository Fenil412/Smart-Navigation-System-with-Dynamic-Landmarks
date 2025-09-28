import mongoose from 'mongoose';
import { NODE_TYPES } from '../utils/constants.js';

const nodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  type: {
    type: String,
    enum: Object.values(NODE_TYPES),
    default: NODE_TYPES.INTERSECTION
  },
  name: {
    type: String,
    trim: true
  },
  properties: {
    elevation: Number,
    isTrafficLight: Boolean,
    isRoundabout: Boolean,
    additionalInfo: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
nodeSchema.index({ latitude: 1, longitude: 1 });

// Static method to find nodes within radius
nodeSchema.statics.findWithinRadius = function(latitude, longitude, radiusMeters = 1000) {
  return this.find({
    latitude: { 
      $gte: latitude - (radiusMeters / 111320),
      $lte: latitude + (radiusMeters / 111320)
    },
    longitude: {
      $gte: longitude - (radiusMeters / (111320 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radiusMeters / (111320 * Math.cos(latitude * Math.PI / 180)))
    }
  });
};

export default mongoose.model('Node', nodeSchema);
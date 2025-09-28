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

// Static method to find nodes within radius - FIXED
nodeSchema.statics.findWithinRadius = function(latitude, longitude, radiusMeters = 1000) {
  // Convert parameters to numbers to avoid string concatenation
  const lat = Number(latitude);
  const lng = Number(longitude);
  const radius = Number(radiusMeters);
  
  // Calculate approximate degrees for latitude and longitude
  const latDelta = radius / 111320; // meters per degree latitude
  const lngDelta = radius / (111320 * Math.cos(lat * Math.PI / 180)); // meters per degree longitude
  
  return this.find({
    latitude: { 
      $gte: lat - latDelta,
      $lte: lat + latDelta
    },
    longitude: {
      $gte: lng - lngDelta,
      $lte: lng + lngDelta
    }
  });
};

export default mongoose.model('Node', nodeSchema);
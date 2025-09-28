import mongoose from 'mongoose';
import { ROAD_TYPES } from '../utils/constants.js';

const edgeSchema = new mongoose.Schema({
  edgeId: {
    type: String,
    required: true,
    unique: true
  },
  fromNode: {
    type: String,
    ref: 'Node',
    required: true
  },
  toNode: {
    type: String,
    ref: 'Node',
    required: true
  },
  weight: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  originalWeight: {
    type: Number,
    required: true,
    default: 1
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  travelTime: {
    type: Number,
    min: 0
  },
  roadType: {
    type: String,
    enum: Object.values(ROAD_TYPES),
    default: ROAD_TYPES.LOCAL
  },
  maxSpeed: {
    type: Number,
    min: 0
  },
  bidirectional: {
    type: Boolean,
    default: true
  },
  properties: {
    hasToll: Boolean,
    laneCount: Number,
    roadCondition: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for frequent queries
edgeSchema.index({ fromNode: 1, toNode: 1 });
edgeSchema.index({ roadType: 1 });

export default mongoose.model('Edge', edgeSchema);
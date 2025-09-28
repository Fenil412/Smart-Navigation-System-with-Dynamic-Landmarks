import mongoose from 'mongoose';
import { EVENT_TYPES, EVENT_SEVERITY, EVENT_IMPACT_FACTORS } from '../utils/constants.js';

const dynamicEventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: Object.values(EVENT_TYPES),
    required: true
  },
  severity: {
    type: String,
    enum: Object.values(EVENT_SEVERITY),
    default: EVENT_SEVERITY.MEDIUM
  },
  affectedEdges: [{
    edgeId: {
      type: String,
      required: true
    },
    impactFactor: {
      type: Number,
      default: function() {
        // Auto-calculate impact factor based on event type and severity
        return EVENT_IMPACT_FACTORS[this.type]?.[this.severity] || 2;
      }
    },
    originalWeight: Number // Store original weight for reversal
  }],
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  radius: {
    type: Number,
    default: 500, // meters
    min: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Index for active events and location-based queries
dynamicEventSchema.index({ isActive: 1 });
dynamicEventSchema.index({ location: '2dsphere' });
dynamicEventSchema.index({ startTime: 1, endTime: 1 });

// Method to check if event is currently active
dynamicEventSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.endTime && now > this.endTime) return false;
  return true;
};

// Static method to find active events affecting a location
dynamicEventSchema.statics.findActiveEventsNearLocation = function(latitude, longitude, radiusMeters = 500) {
  return this.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusMeters
      }
    }
  });
};

export default mongoose.model('DynamicEvent', dynamicEventSchema);
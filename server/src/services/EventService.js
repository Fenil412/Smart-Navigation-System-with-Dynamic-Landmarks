import DynamicEvent from '../models/DynamicEvent.js';
import GraphService from './GraphService.js';
import { EVENT_IMPACT_FACTORS, SEARCH_RADIUS } from '../utils/constants.js';

class EventService {
  async createEvent(eventData) {
    try {
      // Auto-calculate affected edges if not provided
      let affectedEdges = eventData.affectedEdges;
      
      if (!affectedEdges || affectedEdges.length === 0) {
        affectedEdges = await this.calculateAffectedEdges(
          eventData.location.latitude,
          eventData.location.longitude,
          eventData.radius || SEARCH_RADIUS.EVENT_RADIUS,
          eventData.type,
          eventData.severity
        );
      }

      const event = new DynamicEvent({
        ...eventData,
        eventId: this.generateEventId(),
        affectedEdges
      });

      await event.save();
      
      // Update graph weights based on event
      this.applyEventToGraph(event);
      
      return event;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async calculateAffectedEdges(latitude, longitude, radius, eventType, severity) {
    const graph = GraphService.getGraph();
    const affectedEdges = [];
    
    // Find edges near the event location
    const nearbyEdges = GraphService.findEdgesNearLocation(latitude, longitude, radius);
    
    for (let edge of nearbyEdges) {
      const impactFactor = EVENT_IMPACT_FACTORS[eventType]?.[severity] || 2;
      
      affectedEdges.push({
        edgeId: edge.edgeId,
        impactFactor: impactFactor,
        originalWeight: edge.originalWeight
      });
    }

    return affectedEdges;
  }

  applyEventToGraph(event) {
    const graph = GraphService.getGraph();
    
    event.affectedEdges.forEach(affectedEdge => {
      const originalEdge = graph.getEdge(affectedEdge.edgeId);
      if (originalEdge) {
        const newWeight = originalEdge.originalWeight * affectedEdge.impactFactor;
        graph.updateEdgeWeight(affectedEdge.edgeId, newWeight);
        
        // Update the affectedEdge with original weight if not set
        if (!affectedEdge.originalWeight) {
          affectedEdge.originalWeight = originalEdge.originalWeight;
        }
      }
    });

    // Save the updated event with original weights
    event.save().catch(console.error);
  }

  async getActiveEvents() {
    return await DynamicEvent.find({ isActive: true });
  }

  async getEventsAffectingLocation(latitude, longitude, radius = SEARCH_RADIUS.EVENT_RADIUS) {
    return await DynamicEvent.findActiveEventsNearLocation(latitude, longitude, radius);
  }

  async deactivateEvent(eventId) {
    const event = await DynamicEvent.findById(eventId);
    if (event) {
      event.isActive = false;
      event.endTime = new Date();
      await event.save();
      
      // Revert graph weights
      this.revertEventFromGraph(event);
    }
    return event;
  }

  revertEventFromGraph(event) {
    const graph = GraphService.getGraph();
    
    event.affectedEdges.forEach(affectedEdge => {
      const originalEdge = graph.getEdge(affectedEdge.edgeId);
      if (originalEdge && affectedEdge.originalWeight) {
        graph.updateEdgeWeight(affectedEdge.edgeId, affectedEdge.originalWeight);
      }
    });
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to clean up expired events
  async cleanupExpiredEvents() {
    const now = new Date();
    const expiredEvents = await DynamicEvent.find({
      isActive: true,
      endTime: { $lt: now }
    });

    for (let event of expiredEvents) {
      await this.deactivateEvent(event._id);
    }

    return expiredEvents.length;
  }
}

export default new EventService();
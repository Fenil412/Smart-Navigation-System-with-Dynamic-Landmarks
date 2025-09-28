import DynamicEvent from '../models/DynamicEvent.js';
import GraphService from './GraphService.js';
import { EVENT_IMPACT_FACTORS, SEARCH_RADIUS, EVENT_TYPES, EVENT_SEVERITY } from '../utils/constants.js';

class EventService {
  async createEvent(eventData) {
    try {
      console.log('Creating event with data:', eventData);
      
      // Validate required fields
      if (!eventData.type || !eventData.location) {
        throw new Error('Event type and location are required');
      }

      // Auto-calculate affected edges if not provided
      let affectedEdges = eventData.affectedEdges || [];
      
      if (affectedEdges.length === 0) {
        affectedEdges = await this.calculateAffectedEdges(
          eventData.location.latitude,
          eventData.location.longitude,
          eventData.radius || SEARCH_RADIUS.EVENT_RADIUS,
          eventData.type,
          eventData.severity || EVENT_SEVERITY.MEDIUM
        );
      }

      const event = new DynamicEvent({
        ...eventData,
        eventId: this.generateEventId(),
        affectedEdges
      });

      const savedEvent = await event.save();
      console.log('Event saved successfully:', savedEvent.eventId);
      
      // Update graph weights based on event
      this.applyEventToGraph(savedEvent);
      
      return savedEvent;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  async calculateAffectedEdges(latitude, longitude, radius, eventType, severity) {
    try {
      const graph = GraphService.getGraph();
      const affectedEdges = [];
      
      // Convert to numbers
      const lat = Number(latitude);
      const lng = Number(longitude);
      const rad = Number(radius);
      
      // Find edges near the event location
      const nearbyEdges = GraphService.findEdgesNearLocation(lat, lng, rad);
      console.log(`Found ${nearbyEdges.length} nearby edges for event`);
      
      for (let edge of nearbyEdges) {
        const impactFactor = EVENT_IMPACT_FACTORS[eventType]?.[severity] || 2;
        
        affectedEdges.push({
          edgeId: edge.edgeId,
          impactFactor: impactFactor,
          originalWeight: edge.originalWeight || edge.weight
        });
      }

      return affectedEdges;
    } catch (error) {
      console.error('Error calculating affected edges:', error);
      return [];
    }
  }

  applyEventToGraph(event) {
    try {
      const graph = GraphService.getGraph();
      
      event.affectedEdges.forEach(affectedEdge => {
        const originalEdge = graph.getEdge(affectedEdge.edgeId);
        if (originalEdge) {
          const newWeight = (originalEdge.originalWeight || originalEdge.weight) * affectedEdge.impactFactor;
          graph.updateEdgeWeight(affectedEdge.edgeId, newWeight);
          
          console.log(`Updated edge ${affectedEdge.edgeId} weight to ${newWeight}`);
        }
      });
    } catch (error) {
      console.error('Error applying event to graph:', error);
    }
  }

  async getActiveEvents() {
    try {
      return await DynamicEvent.find({ isActive: true });
    } catch (error) {
      console.error('Error getting active events:', error);
      return [];
    }
  }

  async getEventsAffectingLocation(latitude, longitude, radius = SEARCH_RADIUS.EVENT_RADIUS) {
    try {
      return await DynamicEvent.findActiveEventsNearLocation(latitude, longitude, radius);
    } catch (error) {
      console.error('Error getting events for location:', error);
      return [];
    }
  }

  async deactivateEvent(eventId) {
    try {
      const event = await DynamicEvent.findOne({ eventId: eventId });
      if (!event) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      event.isActive = false;
      event.endTime = new Date();
      const updatedEvent = await event.save();
      
      // Revert graph weights
      this.revertEventFromGraph(updatedEvent);
      
      return updatedEvent;
    } catch (error) {
      console.error('Error deactivating event:', error);
      throw error;
    }
  }

  revertEventFromGraph(event) {
    try {
      const graph = GraphService.getGraph();
      
      event.affectedEdges.forEach(affectedEdge => {
        const originalEdge = graph.getEdge(affectedEdge.edgeId);
        if (originalEdge && affectedEdge.originalWeight) {
          graph.updateEdgeWeight(affectedEdge.edgeId, affectedEdge.originalWeight);
          console.log(`Reverted edge ${affectedEdge.edgeId} weight to ${affectedEdge.originalWeight}`);
        }
      });
    } catch (error) {
      console.error('Error reverting event from graph:', error);
    }
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to clean up expired events
  async cleanupExpiredEvents() {
    try {
      const now = new Date();
      const expiredEvents = await DynamicEvent.find({
        isActive: true,
        endTime: { $lt: now }
      });

      for (let event of expiredEvents) {
        await this.deactivateEvent(event.eventId);
      }

      console.log(`Cleaned up ${expiredEvents.length} expired events`);
      return expiredEvents.length;
    } catch (error) {
      console.error('Error cleaning up expired events:', error);
      return 0;
    }
  }
}

export default new EventService();
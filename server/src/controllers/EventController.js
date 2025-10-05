import EventService from '../services/EventService.js';
import { API_RESPONSES } from '../utils/constants.js';

class EventController {
  async createEvent(req, res) {
    try {
      const eventData = req.body;
      console.log('Creating event with data:', eventData);
      
      const event = await EventService.createEvent(eventData);

      res.status(201).json({
        status: API_RESPONSES.SUCCESS,
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ 
        status: API_RESPONSES.ERROR,
        error: error.message 
      });
    }
  }

  async getActiveEvents(req, res) {
    try {
      const events = await EventService.getActiveEvents();
      res.json({ 
        status: API_RESPONSES.SUCCESS, 
        events 
      });
    } catch (error) {
      console.error('Get active events error:', error);
      res.status(500).json({ 
        status: API_RESPONSES.ERROR,
        error: error.message 
      });
    }
  }

  async deactivateEvent(req, res) {
    try {
      const { eventId } = req.params;
      console.log(`Deactivating event: ${eventId}`);
      
      const event = await EventService.deactivateEvent(eventId);

      if (!event) {
        return res.status(404).json({ 
          status: API_RESPONSES.NOT_FOUND,
          error: 'Event not found' 
        });
      }

      res.json({ 
        status: API_RESPONSES.SUCCESS, 
        event 
      });
    } catch (error) {
      console.error('Deactivate event error:', error);
      res.status(500).json({ 
        status: API_RESPONSES.ERROR,
        error: error.message 
      });
    }
  }

  async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const updates = req.body;
      const event = await EventService.updateEvent(eventId, updates);
      if (!event) {
        return res.status(404).json({ status: API_RESPONSES.NOT_FOUND, error: 'Event not found' });
      }
      res.json({ status: API_RESPONSES.SUCCESS, event });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ status: API_RESPONSES.ERROR, error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const deleted = await EventService.deleteEvent(eventId);
      if (!deleted) {
        return res.status(404).json({ status: API_RESPONSES.NOT_FOUND, error: 'Event not found' });
      }
      res.json({ status: API_RESPONSES.SUCCESS, deleted: true });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ status: API_RESPONSES.ERROR, error: error.message });
    }
  }
}

export default new EventController();
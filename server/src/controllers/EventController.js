import EventService from '../services/EventService.js';

class EventController {
  async createEvent(req, res) {
    try {
      const eventData = req.body;
      const event = await EventService.createEvent(eventData);

      res.status(201).json({
        success: true,
        event
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getActiveEvents(req, res) {
    try {
      const events = await EventService.getActiveEvents();
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deactivateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.deactivateEvent(eventId);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ success: true, event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new EventController();
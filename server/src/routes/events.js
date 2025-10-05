import express from 'express';
import EventController from '../controllers/EventController.js';

const router = express.Router();

router.post('/', EventController.createEvent);
router.get('/active', EventController.getActiveEvents);
router.put('/:eventId', EventController.updateEvent);
router.delete('/:eventId', EventController.deleteEvent);
router.put('/:eventId/deactivate', EventController.deactivateEvent);

export default router;
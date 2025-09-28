import express from 'express';
import routeRoutes from './routes.js';
import eventRoutes from './events.js';

const router = express.Router();

router.use('/routes', routeRoutes);
router.use('/events', eventRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
import express from 'express';
import RouteController from '../controllers/RouteController.js';

const router = express.Router();

router.post('/calculate', RouteController.calculateRoute);
router.get('/algorithms', RouteController.getAvailableAlgorithms);
router.get('/:routeId', RouteController.getRoute);
router.put('/:routeId/update', RouteController.updateRoute);

export default router;
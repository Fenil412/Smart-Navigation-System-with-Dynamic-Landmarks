import NavigationService from '../services/NavigationService.js';
import GraphService from '../services/GraphService.js';
import { ALGORITHMS, API_RESPONSES } from '../utils/constants.js';

class RouteController {
  async calculateRoute(req, res) {
    try {
      const { startLat, startLng, endLat, endLng, algorithm = ALGORITHMS.ASTAR, options = {} } = req.body;

      if (!startLat || !startLng || !endLat || !endLng) {
        return res.status(400).json({ 
          status: API_RESPONSES.ERROR,
          error: 'Start and end coordinates are required' 
        });
      }

      // Validate algorithm
      if (!Object.values(ALGORITHMS).includes(algorithm)) {
        return res.status(400).json({
          status: API_RESPONSES.INVALID_INPUT,
          error: `Invalid algorithm. Must be one of: ${Object.values(ALGORITHMS).join(', ')}`
        });
      }

      // Find nearest nodes to coordinates
      const startNode = await GraphService.findNearestNode(startLat, startLng);
      const endNode = await GraphService.findNearestNode(endLat, endLng);

      if (!startNode || !endNode) {
        return res.status(404).json({ 
          status: API_RESPONSES.NOT_FOUND,
          error: 'Could not find suitable start or end node near the specified coordinates' 
        });
      }

      let route;
      if (algorithm === ALGORITHMS.DSTAR_LITE) {
        route = NavigationService.initializeDStarLite(startNode.nodeId, endNode.nodeId);
      } else {
        route = NavigationService.calculateRoute(startNode.nodeId, endNode.nodeId, algorithm, options);
      }

      res.json({
        status: API_RESPONSES.SUCCESS,
        data: {
          routeId: route.routeId,
          startNode: startNode.nodeId,
          endNode: endNode.nodeId,
          startLocation: { latitude: startNode.latitude, longitude: startNode.longitude },
          endLocation: { latitude: endNode.latitude, longitude: endNode.longitude },
          path: route.path,
          totalDistance: route.totalDistance,
          algorithm: route.algorithm,
          estimatedTime: route.totalDistance / 50 * 3600 // Simple estimation: 50 km/h average
        }
      });
    } catch (error) {
      console.error('Route calculation error:', error);
      res.status(500).json({ 
        status: API_RESPONSES.ERROR,
        error: error.message 
      });
    }
  }

  async getRoute(req, res) {
    try {
      const { routeId } = req.params;
      const route = NavigationService.getRoute(routeId);

      if (!route) {
        return res.status(404).json({ 
          status: API_RESPONSES.NOT_FOUND,
          error: 'Route not found' 
        });
      }

      res.json({ 
        status: API_RESPONSES.SUCCESS,
        data: { route }
      });
    } catch (error) {
      res.status(500).json({ 
        status: API_RESPONSES.ERROR,
        error: error.message 
      });
    }
  }

  async updateRoute(req, res) {
    try {
      const { routeId } = req.params;
      const { affectedEdges } = req.body;

      const updatedRoute = NavigationService.updateRouteForDynamicEvent(routeId, affectedEdges);
      
      res.json({
        status: API_RESPONSES.SUCCESS,
        data: { route: updatedRoute }
      });
    } catch (error) {
      res.status(500).json({ 
        status: API_RESPONSES.ERROR,
        error: error.message 
      });
    }
  }

  async getAvailableAlgorithms(req, res) {
    res.json({
      status: API_RESPONSES.SUCCESS,
      data: { algorithms: ALGORITHMS }
    });
  }
}

export default new RouteController();
import Dijkstra from '../algorithms/pathfinding/Dijkstra.js';
import AStar from '../algorithms/pathfinding/AStar.js';
import DStarLite from '../algorithms/pathfinding/DStarLite.js';
import GraphService from './GraphService.js';

class NavigationService {
  constructor() {
    this.activeRoutes = new Map(); // Map<routeId, {algorithm, start, end, path}>
  }

  calculateRoute(startNode, endNode, algorithm = 'astar') {
    const graph = GraphService.getGraph();
    
    let pathfinder;
    switch (algorithm.toLowerCase()) {
      case 'dijkstra':
        pathfinder = new Dijkstra(graph);
        break;
      case 'astar':
      default:
        pathfinder = new AStar(graph);
        break;
    }

    const path = pathfinder.findShortestPath(startNode, endNode);
    
    if (!path) {
      throw new Error('No path found between the specified nodes');
    }

    const routeId = this.generateRouteId();
    const route = {
      routeId,
      startNode,
      endNode,
      algorithm,
      path,
      totalDistance: this.calculateTotalDistance(path),
      createdAt: new Date()
    };

    this.activeRoutes.set(routeId, route);
    return route;
  }

  initializeDStarLite(startNode, endNode) {
    const graph = GraphService.getGraph();
    const dStarLite = new DStarLite(graph);
    dStarLite.initialize(startNode, endNode);
    dStarLite.computeShortestPath();

    const routeId = this.generateRouteId();
    const route = {
      routeId,
      startNode,
      endNode,
      algorithm: 'dstar_lite',
      dStarLiteInstance: dStarLite,
      path: dStarLite.getPath(),
      totalDistance: this.calculateTotalDistance(dStarLite.getPath()),
      createdAt: new Date()
    };

    this.activeRoutes.set(routeId, route);
    return route;
  }

  updateRouteForDynamicEvent(routeId, affectedEdges) {
    const route = this.activeRoutes.get(routeId);
    if (!route) {
      throw new Error('Route not found');
    }

    if (route.algorithm === 'dstar_lite') {
      // Update D* Lite for dynamic changes
      for (let edge of affectedEdges) {
        route.dStarLiteInstance.updateEdge(edge.edgeId, edge.newWeight);
      }
      route.dStarLiteInstance.computeShortestPath();
      route.path = route.dStarLiteInstance.getPath();
      route.totalDistance = this.calculateTotalDistance(route.path);
    } else {
      // For static algorithms, recalculate the entire route
      return this.calculateRoute(route.startNode, route.endNode, route.algorithm);
    }

    return route;
  }

  calculateTotalDistance(path) {
    return path.reduce((total, segment) => {
      const edge = GraphService.getGraph().getEdge(segment.edgeId);
      return total + (edge?.distance || 0);
    }, 0);
  }

  generateRouteId() {
    return `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRoute(routeId) {
    return this.activeRoutes.get(routeId);
  }

  removeRoute(routeId) {
    this.activeRoutes.delete(routeId);
  }

  getAllActiveRoutes() {
    return Array.from(this.activeRoutes.values());
  }
}

export default new NavigationService();
import Dijkstra from '../algorithms/pathfinding/Dijkstra.js';
import AStar from '../algorithms/pathfinding/AStar.js';
import DStarLite from '../algorithms/pathfinding/DStarLite.js';
import GraphService from './GraphService.js';

class NavigationService {
  constructor() {
    this.activeRoutes = new Map(); // Map<routeId, {algorithm, start, end, path}>
  }

  calculateRoute(startNode, endNode, algorithm = 'astar', options = {}) {
    try {
      console.log(`Calculating route from ${startNode} to ${endNode} using ${algorithm}`);
      
      const graph = GraphService.getGraph();
      
      // Check if nodes exist
      if (!graph.getNode(startNode) || !graph.getNode(endNode)) {
        throw new Error('Start or end node not found in graph');
      }
      
      // Check if path exists using simple BFS
      if (!this.checkPathExists(graph, startNode, endNode)) {
        throw new Error('No path exists between the specified nodes');
      }
      
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

      const path = pathfinder.findShortestPath(startNode, endNode, options);
      
      if (!path || path.length === 0) {
        console.log(`No path found from ${startNode} to ${endNode}`);
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
      console.log(`Route calculated successfully: ${routeId} with ${path.length} segments`);
      return route;
    } catch (error) {
      console.error('Error calculating route:', error);
      throw error;
    }
  }

  initializeDStarLite(startNode, endNode) {
    try {
      console.log(`Initializing D* Lite from ${startNode} to ${endNode}`);
      
      const graph = GraphService.getGraph();
      
      // Check if nodes exist
      if (!graph.getNode(startNode) || !graph.getNode(endNode)) {
        throw new Error('Start or end node not found in graph');
      }
      
      // Check if path exists
      if (!this.checkPathExists(graph, startNode, endNode)) {
        throw new Error('No path exists between the specified nodes');
      }

      const dStarLite = new DStarLite(graph);
      dStarLite.initialize(startNode, endNode);
      dStarLite.computeShortestPath();
      
      // Debug: print state
      dStarLite.printState();

      const path = dStarLite.getPath();
      
      if (!path || path.length === 0) {
        console.log('D* Lite returned empty path');
        // Try fallback to A* to verify path exists
        const fallbackPathfinder = new AStar(graph);
        const fallbackPath = fallbackPathfinder.findShortestPath(startNode, endNode);
        if (fallbackPath && fallbackPath.length > 0) {
          console.log('Fallback A* found path, D* Lite issue detected');
        }
        throw new Error('No path found with D* Lite');
      }

      const routeId = this.generateRouteId();
      const route = {
        routeId,
        startNode,
        endNode,
        algorithm: 'dstar_lite',
        dStarLiteInstance: dStarLite,
        path: path,
        totalDistance: this.calculateTotalDistance(path),
        createdAt: new Date()
      };

      this.activeRoutes.set(routeId, route);
      console.log(`D* Lite route initialized successfully: ${routeId} with ${path.length} segments`);
      return route;
    } catch (error) {
      console.error('Error initializing D* Lite:', error);
      throw error;
    }
  }

  // Helper method to check if path exists using BFS
  checkPathExists(graph, startNode, endNode) {
    const visited = new Set();
    const queue = [startNode];
    
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current === endNode) {
        return true;
      }
      
      if (visited.has(current)) {
        continue;
      }
      
      visited.add(current);
      const neighbors = graph.getNeighbors(current);
      
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor.node)) {
          queue.push(neighbor.node);
        }
      }
    }
    
    return false;
  }

  updateRouteForDynamicEvent(routeId, affectedEdges) {
    try {
      console.log(`Updating route ${routeId} for dynamic event`);
      
      const route = this.activeRoutes.get(routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      if (route.algorithm === 'dstar_lite' && route.dStarLiteInstance) {
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

      console.log(`Route ${routeId} updated successfully`);
      return route;
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  calculateTotalDistance(path) {
    try {
      return path.reduce((total, segment) => {
        const edge = GraphService.getGraph().getEdge(segment.edgeId);
        return total + (edge?.distance || 0);
      }, 0);
    } catch (error) {
      console.error('Error calculating total distance:', error);
      return 0;
    }
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
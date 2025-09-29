import Dijkstra from '../algorithms/pathfinding/Dijkstra.js';
import AStar from '../algorithms/pathfinding/AStar.js';
import DStarLite from '../algorithms/pathfinding/DStarLiteSimple.js'; // Using simplified version for now
import GraphService from './GraphService.js';
import { getSocketHandler } from '../websocket/socketHandler.js';

class NavigationService {
  constructor() {
    this.activeRoutes = new Map(); // Map<routeId, {algorithm, start, end, path}>
    this.socketHandler = null;
  }

  // Method to set socket handler after initialization
  setSocketHandler(handler) {
    this.socketHandler = handler;
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
      const path = dStarLite.initialize(startNode, endNode);
      
      if (!path || path.length === 0) {
        console.log('D* Lite returned empty path');
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

  updateRouteForDynamicEvent(routeId, affectedEdges) {
    try {
      console.log(`Updating route ${routeId} for dynamic event`);
      
      const route = this.activeRoutes.get(routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      let updatedRoute;
      
      if (route.algorithm === 'dstar_lite' && route.dStarLiteInstance) {
        // Update D* Lite for dynamic changes
        for (let edge of affectedEdges) {
          route.dStarLiteInstance.updateEdge(edge.edgeId, edge.newWeight);
        }
        route.path = route.dStarLiteInstance.getPath();
        route.totalDistance = this.calculateTotalDistance(route.path);
        updatedRoute = route;
      } else {
        // For static algorithms, recalculate the entire route
        updatedRoute = this.calculateRoute(route.startNode, route.endNode, route.algorithm);
      }

      console.log(`Route ${routeId} updated successfully`);
      
      // Broadcast route update to all clients monitoring this route
      if (this.socketHandler) {
        this.socketHandler.broadcastRouteUpdate(routeId, updatedRoute);
        console.log(`Route update broadcasted for ${routeId}`);
      }
      
      return updatedRoute;
    } catch (error) {
      console.error('Error updating route:', error);
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

  // Method to simulate vehicle movement and broadcast position
  simulateVehicleMovement(routeId, updateInterval = 2000) {
    const route = this.getRoute(routeId);
    if (!route) {
      console.log(`Route ${routeId} not found for simulation`);
      return;
    }

    let currentSegmentIndex = 0;
    let progress = 0;
    
    console.log(`Starting vehicle simulation for route ${routeId}`);
    
    const intervalId = setInterval(() => {
      if (currentSegmentIndex >= route.path.length) {
        console.log(`Vehicle reached destination for route ${routeId}`);
        clearInterval(intervalId);
        return;
      }

      const currentSegment = route.path[currentSegmentIndex];
      progress += 0.2; // 20% progress per update
      
      if (progress >= 1.0) {
        progress = 0;
        currentSegmentIndex++;
        
        if (currentSegmentIndex >= route.path.length) {
          console.log(`Vehicle reached destination for route ${routeId}`);
          clearInterval(intervalId);
          return;
        }
      }

      // Calculate intermediate position (simplified)
      const fromNode = this.getNodePosition(currentSegment.fromNode);
      const toNode = this.getNodePosition(currentSegment.toNode);
      
      const currentPosition = {
        latitude: fromNode.latitude + (toNode.latitude - fromNode.latitude) * progress,
        longitude: fromNode.longitude + (toNode.longitude - fromNode.longitude) * progress
      };

      // Broadcast vehicle position
      if (this.socketHandler) {
        const positionData = {
          routeId,
          position: currentPosition,
          currentSegment: currentSegmentIndex,
          progress: Math.min(progress, 1.0),
          timestamp: new Date().toISOString()
        };
        
        this.socketHandler.broadcastVehiclePosition(routeId, positionData);
      }
      
    }, updateInterval);

    return intervalId;
  }

  getNodePosition(nodeId) {
    const graph = GraphService.getGraph();
    const node = graph.getNode(nodeId);
    return node ? { latitude: node.latitude, longitude: node.longitude } : { latitude: 0, longitude: 0 };
  }
}

export default new NavigationService();
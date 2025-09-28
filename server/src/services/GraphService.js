import Node from '../models/Node.js';
import Edge from '../models/Edge.js';
import Graph from '../algorithms/data-structures/Graph.js';
import CoordinateUtils from '../utils/coordinates.js';
import { SEARCH_RADIUS, ROAD_TYPES, DEFAULT_WEIGHTS } from '../utils/constants.js';

class GraphService {
  constructor() {
    this.graph = new Graph();
    this.isLoaded = false;
  }

  async loadGraphFromDatabase() {
    try {
      console.log('Loading graph from database...');
      
      // Load nodes
      const nodes = await Node.find({});
      console.log(`Found ${nodes.length} nodes in database`);
      
      for (let node of nodes) {
        this.graph.addNode(node.nodeId, {
          latitude: node.latitude,
          longitude: node.longitude,
          type: node.type,
          name: node.name,
          ...node.properties
        });
      }

      // Load edges with proper weight calculation
      const edges = await Edge.find({});
      console.log(`Found ${edges.length} edges in database`);
      
      for (let edge of edges) {
        // Calculate weight based on road type and distance if not provided
        const baseWeight = edge.weight || 
          (DEFAULT_WEIGHTS[edge.roadType] || 1) * (edge.distance / 1000); // Normalize by km
        
        this.graph.addEdge(
          edge.edgeId,
          edge.fromNode,
          edge.toNode,
          baseWeight,
          {
            distance: edge.distance,
            travelTime: edge.travelTime,
            roadType: edge.roadType,
            maxSpeed: edge.maxSpeed,
            bidirectional: edge.bidirectional !== false,
            originalWeight: baseWeight,
            ...edge.properties
          }
        );
      }

      this.isLoaded = true;
      console.log(`Graph loaded with ${nodes.length} nodes and ${edges.length} edges`);
      return this.graph;
    } catch (error) {
      console.error('Error loading graph from database:', error);
      throw error;
    }
  }

  getGraph() {
    if (!this.isLoaded) {
      throw new Error('Graph not loaded. Call loadGraphFromDatabase() first.');
    }
    return this.graph;
  }

  async findNearestNode(latitude, longitude, maxDistance = SEARCH_RADIUS.NEAREST_NODE) {
    try {
      console.log(`Finding nearest node for coordinates: ${latitude}, ${longitude}`);
      
      // Convert to numbers to ensure proper handling
      const lat = Number(latitude);
      const lng = Number(longitude);
      const maxDist = Number(maxDistance);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates provided');
      }

      // Use MongoDB's geospatial query
      const nearbyNodes = await Node.findWithinRadius(lat, lng, maxDist);
      console.log(`Found ${nearbyNodes.length} nearby nodes`);
      
      if (nearbyNodes.length === 0) {
        throw new Error(`No nodes found within ${maxDist} meters of the specified location`);
      }

      // Find the closest node using our coordinate utils
      let nearestNode = null;
      let minDistance = Infinity;

      for (let node of nearbyNodes) {
        const distance = CoordinateUtils.calculateDistance(
          lat, lng,
          node.latitude, node.longitude
        ) * 1000; // Convert to meters

        if (distance < minDistance) {
          minDistance = distance;
          nearestNode = node;
        }
      }

      if (!nearestNode) {
        throw new Error('Could not find a suitable node near the specified coordinates');
      }

      console.log(`Found nearest node: ${nearestNode.nodeId} at distance ${minDistance}m`);
      
      return {
        nodeId: nearestNode.nodeId,
        latitude: nearestNode.latitude,
        longitude: nearestNode.longitude,
        type: nearestNode.type,
        name: nearestNode.name,
        distance: minDistance
      };
    } catch (error) {
      console.error('Error finding nearest node:', error);
      throw error;
    }
  }

  findNodesWithinRadius(latitude, longitude, radiusMeters) {
    const nodes = this.graph.getAllNodes();
    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusMeters);
    
    return nodes.filter(node => 
      CoordinateUtils.isPointInRadius(
        lat, lng, 
        node.latitude, node.longitude, 
        radius
      )
    );
  }

  calculateEdgeDistance(fromNodeId, toNodeId) {
    const fromNode = this.graph.getNode(fromNodeId);
    const toNode = this.graph.getNode(toNodeId);
    
    if (!fromNode || !toNode) {
      throw new Error('One or both nodes not found');
    }

    return CoordinateUtils.calculateDistance(
      fromNode.latitude, fromNode.longitude,
      toNode.latitude, toNode.longitude
    ) * 1000; // Return in meters
  }

  updateEdgeWeight(edgeId, newWeight) {
    this.graph.updateEdgeWeight(edgeId, newWeight);
  }

  // Method to find edges affected by an event at a location
  findEdgesNearLocation(latitude, longitude, radiusMeters = SEARCH_RADIUS.EVENT_RADIUS) {
    const nearbyNodes = this.findNodesWithinRadius(latitude, longitude, radiusMeters);
    const affectedEdges = new Set();

    // Find edges connected to nearby nodes
    for (let node of nearbyNodes) {
      const neighbors = this.graph.getNeighbors(node.nodeId);
      for (let neighbor of neighbors) {
        affectedEdges.add(neighbor.edgeId);
      }
    }

    return Array.from(affectedEdges).map(edgeId => this.graph.getEdge(edgeId));
  }
}

export default new GraphService();
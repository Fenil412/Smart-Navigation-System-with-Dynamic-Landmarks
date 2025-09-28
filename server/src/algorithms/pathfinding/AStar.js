import MinHeap from '../data-structures/MinHeap.js';
import CoordinateUtils from '../../utils/coordinates.js';

class AStar {
  constructor(graph) {
    this.graph = graph;
  }

  // Use the CoordinateUtils for consistent distance calculations
  heuristic(node1, node2) {
    const node1Data = this.graph.getNode(node1);
    const node2Data = this.graph.getNode(node2);
    
    if (!node1Data || !node2Data) return Infinity;

    return CoordinateUtils.calculateDistance(
      node1Data.latitude, node1Data.longitude,
      node2Data.latitude, node2Data.longitude
    );
  }

  findShortestPath(startNode, endNode, options = {}) {
    const { avoidHighways = false, preferMainRoads = false } = options;
    const gScore = new Map(); // Cost from start to node
    const fScore = new Map(); // Estimated total cost (g + h)
    const previous = new Map();
    const openSet = new MinHeap();
    const closedSet = new Set();

    // Initialize scores
    for (let nodeId of this.graph.nodes.keys()) {
      gScore.set(nodeId, Infinity);
      fScore.set(nodeId, Infinity);
      previous.set(nodeId, null);
    }

    gScore.set(startNode, 0);
    fScore.set(startNode, this.heuristic(startNode, endNode));
    openSet.insert(startNode, fScore.get(startNode));

    while (!openSet.isEmpty()) {
      const { value: currentNode } = openSet.extractMin();

      if (currentNode === endNode) {
        return this.reconstructPath(previous, endNode);
      }

      closedSet.add(currentNode);

      const neighbors = this.graph.getNeighbors(currentNode);
      for (let neighbor of neighbors) {
        if (closedSet.has(neighbor.node)) continue;

        // Apply road preferences - FIXED: Check if edge exists
        let weight = neighbor.weight;
        const edge = this.graph.getEdge(neighbor.edgeId);
        
        if (edge) {
          if (avoidHighways && edge.roadType === 'highway') {
            weight *= 2; // Penalize highways
          }
          
          if (preferMainRoads && (edge.roadType === 'local' || edge.roadType === 'secondary')) {
            weight *= 1.5; // Penalize local roads
          }
        }

        const tentativeGScore = gScore.get(currentNode) + weight;

        if (tentativeGScore < gScore.get(neighbor.node)) {
          previous.set(neighbor.node, {
            node: currentNode,
            edgeId: neighbor.edgeId
          });
          gScore.set(neighbor.node, tentativeGScore);
          fScore.set(neighbor.node, tentativeGScore + this.heuristic(neighbor.node, endNode));

          // Update priority if already in open set, otherwise insert
          const existingIndex = openSet.heap.findIndex(item => item.value === neighbor.node);
          if (existingIndex !== -1) {
            openSet.heap[existingIndex].priority = fScore.get(neighbor.node);
            openSet.heapifyUp(existingIndex);
          } else {
            openSet.insert(neighbor.node, fScore.get(neighbor.node));
          }
        }
      }
    }

    return null; // No path found
  }

  reconstructPath(previous, endNode) {
    const path = [];
    let currentNode = endNode;

    while (currentNode !== null) {
      const prev = previous.get(currentNode);
      if (prev) {
        const edgeData = this.graph.getEdge(prev.edgeId);
        path.unshift({
          fromNode: prev.node,
          toNode: currentNode,
          edgeId: prev.edgeId,
          edgeData: edgeData || null
        });
        currentNode = prev.node;
      } else {
        break;
      }
    }

    return path;
  }
}

export default AStar;
import MinHeap from '../data-structures/MinHeap.js';
import AStar from './AStar.js';

class DStarLiteSimple {
  constructor(graph) {
    this.graph = graph;
    this.basePathfinder = new AStar(graph);
    this.originalWeights = new Map();
    this.startNode = null;
    this.goalNode = null;
    this.currentPath = null;
  }

  initialize(startNode, goalNode) {
    console.log(`D* Lite Simple: Initializing from ${startNode} to ${goalNode}`);
    this.startNode = startNode;
    this.goalNode = goalNode;
    
    // Store original weights
    const edges = this.graph.getAllEdges();
    for (let edge of edges) {
      this.originalWeights.set(edge.edgeId, edge.weight);
    }
    
    // Calculate initial path
    this.currentPath = this.basePathfinder.findShortestPath(startNode, goalNode);
    console.log(`D* Lite Simple: Initial path calculated with ${this.currentPath?.length || 0} segments`);
    
    return this.currentPath;
  }

  updateEdge(edgeId, newWeight) {
    console.log(`D* Lite Simple: Updating edge ${edgeId} to ${newWeight}`);
    this.graph.updateEdgeWeight(edgeId, newWeight);
    
    // Recalculate path if this edge is in our current path
    if (this.currentPath && this.currentPath.some(segment => segment.edgeId === edgeId)) {
      console.log('D* Lite Simple: Affected edge in current path, recalculating...');
      this.currentPath = this.basePathfinder.findShortestPath(this.startNode, this.goalNode);
    }
  }

  getPath() {
    return this.currentPath;
  }

  updateStart(newStartNode) {
    console.log(`D* Lite Simple: Updating start to ${newStartNode}`);
    this.startNode = newStartNode;
    this.currentPath = this.basePathfinder.findShortestPath(this.startNode, this.goalNode);
  }

  // Revert all edge weights to original
  reset() {
    for (let [edgeId, originalWeight] of this.originalWeights) {
      this.graph.updateEdgeWeight(edgeId, originalWeight);
    }
  }
}

export default DStarLiteSimple;
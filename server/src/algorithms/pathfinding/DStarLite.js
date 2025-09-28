import MinHeap from '../data-structures/MinHeap.js';

class DStarLite {
  constructor(graph) {
    this.graph = graph;
    this.km = 0;
    this.U = new MinHeap();
    this.rhs = new Map();
    this.g = new Map();
    this.previous = new Map();
  }

  initialize(startNode, goalNode) {
    this.startNode = startNode;
    this.goalNode = goalNode;
    this.km = 0;
    this.U = new MinHeap();
    
    // Initialize all nodes
    for (let nodeId of this.graph.nodes.keys()) {
      this.rhs.set(nodeId, Infinity);
      this.g.set(nodeId, Infinity);
    }
    
    this.rhs.set(goalNode, 0);
    this.U.insert(goalNode, this.calculateKey(goalNode));
  }

  calculateKey(node) {
    const gVal = this.g.get(node) || Infinity;
    const rhsVal = this.rhs.get(node) || Infinity;
    const minVal = Math.min(gVal, rhsVal);
    return {
      k1: minVal + this.heuristic(this.startNode, node) + this.km,
      k2: minVal
    };
  }

  heuristic(node1, node2) {
    const node1Data = this.graph.getNode(node1);
    const node2Data = this.graph.getNode(node2);
    
    if (!node1Data || !node2Data) return Infinity;

    // Simple Euclidean distance for now
    const dx = node1Data.latitude - node2Data.latitude;
    const dy = node1Data.longitude - node2Data.longitude;
    return Math.sqrt(dx*dx + dy*dy);
  }

  updateVertex(u) {
    if (u !== this.goalNode) {
      let minRhs = Infinity;
      let bestPredecessor = null;

      const neighbors = this.graph.getNeighbors(u);
      for (let neighbor of neighbors) {
        const cost = this.g.get(neighbor.node) + neighbor.weight;
        if (cost < minRhs) {
          minRhs = cost;
          bestPredecessor = neighbor.node;
        }
      }
      this.rhs.set(u, minRhs);
      this.previous.set(u, bestPredecessor);
    }

    // Remove from priority queue if present
    this.U.heap = this.U.heap.filter(item => item.value !== u);
    
    if (this.g.get(u) !== this.rhs.get(u)) {
      this.U.insert(u, this.calculateKey(u).k1);
    }
  }

  computeShortestPath() {
    while (!this.U.isEmpty() && 
           (this.U.peek().priority < this.calculateKey(this.startNode).k1 || 
            this.rhs.get(this.startNode) !== this.g.get(this.startNode))) {
      
      const u = this.U.extractMin().value;
      const gU = this.g.get(u) || Infinity;
      const rhsU = this.rhs.get(u) || Infinity;

      if (gU > rhsU) {
        this.g.set(u, rhsU);
        const predecessors = this.getPredecessors(u);
        for (let pred of predecessors) {
          this.updateVertex(pred);
        }
      } else {
        this.g.set(u, Infinity);
        this.updateVertex(u);
        const predecessors = this.getPredecessors(u);
        for (let pred of predecessors) {
          this.updateVertex(pred);
        }
      }
    }
  }

  getPredecessors(node) {
    const predecessors = [];
    for (let [nodeId, neighbors] of this.graph.adjacencyList) {
      for (let neighbor of neighbors) {
        if (neighbor.node === node) {
          predecessors.push(nodeId);
          break;
        }
      }
    }
    return predecessors;
  }

  updateEdge(edgeId, newWeight) {
    const edge = this.graph.getEdge(edgeId);
    if (edge) {
      this.graph.updateEdgeWeight(edgeId, newWeight);
      this.updateVertex(edge.fromNode);
      this.updateVertex(edge.toNode);
      this.km += this.heuristic(this.startNode, this.previous.get(this.startNode) || this.startNode);
    }
  }

  getPath() {
    if (this.rhs.get(this.startNode) === Infinity) {
      return null; // No path exists
    }

    const path = [];
    let current = this.startNode;

    while (current !== this.goalNode) {
      const next = this.previous.get(current);
      if (!next) break;

      path.push({
        fromNode: current,
        toNode: next,
        edgeId: this.getEdgeId(current, next)
      });
      current = next;
    }

    return path;
  }

  getEdgeId(fromNode, toNode) {
    const neighbors = this.graph.getNeighbors(fromNode);
    const neighbor = neighbors.find(n => n.node === toNode);
    return neighbor ? neighbor.edgeId : null;
  }
}

export default DStarLite;
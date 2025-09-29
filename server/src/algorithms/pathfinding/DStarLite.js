import MinHeap from '../data-structures/MinHeap.js';

class DStarLite {
  constructor(graph) {
    this.graph = graph;
    this.km = 0;
    this.U = new MinHeap();
    this.rhs = new Map();
    this.g = new Map();
    this.previous = new Map();
    this.startNode = null;
    this.goalNode = null;
  }

  initialize(startNode, goalNode) {
    console.log(`D* Lite: Initializing from ${startNode} to ${goalNode}`);
    
    this.startNode = startNode;
    this.goalNode = goalNode;
    this.km = 0;
    this.U = new MinHeap();
    
    // Initialize all nodes
    const nodeIds = Array.from(this.graph.nodes.keys());
    console.log(`D* Lite: Initializing ${nodeIds.length} nodes`);
    
    for (let nodeId of nodeIds) {
      this.rhs.set(nodeId, Infinity);
      this.g.set(nodeId, Infinity);
      this.previous.set(nodeId, null);
    }
    
    // Set goal node rhs to 0
    this.rhs.set(goalNode, 0);
    this.U.insert(goalNode, this.calculateKey(goalNode).k1);
    
    console.log(`D* Lite: Goal node ${goalNode} initialized with rhs=0`);
    console.log(`D* Lite: Priority queue size: ${this.U.size()}`);
  }

  calculateKey(node) {
    const gVal = this.g.get(node);
    const rhsVal = this.rhs.get(node);
    const minVal = Math.min(gVal, rhsVal);
    const heuristic = this.heuristic(this.startNode, node);
    
    return {
      k1: minVal + heuristic + this.km,
      k2: minVal
    };
  }

  heuristic(node1, node2) {
    try {
      const node1Data = this.graph.getNode(node1);
      const node2Data = this.graph.getNode(node2);
      
      if (!node1Data || !node2Data) {
        return 0;
      }

      const lat1 = Number(node1Data.latitude);
      const lon1 = Number(node1Data.longitude);
      const lat2 = Number(node2Data.latitude);
      const lon2 = Number(node2Data.longitude);
      
      const dLat = lat2 - lat1;
      const dLon = lon2 - lon1;
      
      return Math.sqrt(dLat * dLat + dLon * dLon) * 111;
    } catch (error) {
      return 0;
    }
  }

  updateVertex(u) {
    // Remove from priority queue if present
    this.U.remove(u);
    
    if (this.g.get(u) !== this.rhs.get(u)) {
      this.U.insert(u, this.calculateKey(u).k1);
    }
  }

  computeShortestPath() {
    console.log(`D* Lite: Starting computeShortestPath, queue size: ${this.U.size()}`);
    
    let iterations = 0;
    const maxIterations = 1000;
    
    while (!this.U.isEmpty() && 
           (this.compareKeys(this.U.peek().priority, this.calculateKey(this.startNode).k1) < 0 || 
            this.rhs.get(this.startNode) !== this.g.get(this.startNode))) {
      
      if (iterations++ > maxIterations) {
        console.log('D* Lite: Max iterations reached');
        break;
      }
      
      const u = this.U.extractMin().value;
      const k_old = this.calculateKey(u);
      const gU = this.g.get(u);
      const rhsU = this.rhs.get(u);

      if (gU > rhsU) {
        // Overconsistent - update g value
        this.g.set(u, rhsU);
        
        // Update all predecessors
        const predecessors = this.getPredecessors(u);
        for (let pred of predecessors) {
          this.updateRhs(pred);
          this.updateVertex(pred);
        }
      } else {
        // Underconsistent - set g to infinity and update
        this.g.set(u, Infinity);
        
        // Update this vertex and its predecessors
        this.updateRhs(u);
        this.updateVertex(u);
        
        const predecessors = this.getPredecessors(u);
        for (let pred of predecessors) {
          this.updateRhs(pred);
          this.updateVertex(pred);
        }
      }
    }
    
    console.log(`D* Lite: computeShortestPath completed in ${iterations} iterations`);
  }

  compareKeys(k1, k2) {
    // Handle Infinity comparisons
    if (k1 === Infinity && k2 === Infinity) return 0;
    if (k1 === Infinity) return 1;
    if (k2 === Infinity) return -1;
    return k1 - k2;
  }

  updateRhs(u) {
    if (u === this.goalNode) {
      this.rhs.set(u, 0);
      return;
    }

    let minRhs = Infinity;
    let bestNeighbor = null;

    const neighbors = this.graph.getNeighbors(u);
    
    for (let neighbor of neighbors) {
      const gVal = this.g.get(neighbor.node);
      const totalCost = gVal + neighbor.weight;
      
      if (totalCost < minRhs) {
        minRhs = totalCost;
        bestNeighbor = neighbor.node;
      }
    }

    this.rhs.set(u, minRhs);
    this.previous.set(u, bestNeighbor);
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

  getPath() {
    console.log(`D* Lite: Getting path from ${this.startNode} to ${this.goalNode}`);
    
    if (this.rhs.get(this.startNode) === Infinity) {
      console.log(`D* Lite: No path exists - rhs is Infinity for start node`);
      return null;
    }

    const path = [];
    let current = this.startNode;
    let visited = new Set();
    
    while (current !== this.goalNode && current !== null) {
      if (visited.has(current)) {
        console.log(`D* Lite: Cycle detected at node ${current}`);
        break;
      }
      visited.add(current);

      const next = this.previous.get(current);
      if (!next) break;

      const edgeId = this.getEdgeId(current, next);
      if (!edgeId) break;

      const edgeData = this.graph.getEdge(edgeId);
      path.push({
        fromNode: current,
        toNode: next,
        edgeId: edgeId,
        edgeData: edgeData
      });

      current = next;

      if (path.length > 50) break;
    }

    console.log(`D* Lite: Path reconstruction complete, length: ${path.length}`);
    
    if (path.length === 0 || path[path.length - 1].toNode !== this.goalNode) {
      return null;
    }

    return path;
  }

  getEdgeId(fromNode, toNode) {
    const neighbors = this.graph.getNeighbors(fromNode);
    const neighbor = neighbors.find(n => n.node === toNode);
    return neighbor ? neighbor.edgeId : null;
  }

  // Debug method to print state
  printState() {
    console.log('D* Lite State:');
    console.log(`Start: ${this.startNode}, Goal: ${this.goalNode}`);
    console.log(`KM: ${this.km}`);
    console.log('Queue size:', this.U.size());
    
    const nodes = Array.from(this.graph.nodes.keys()).sort();
    for (let node of nodes) {
      console.log(`${node}: g=${this.g.get(node)}, rhs=${this.rhs.get(node)}, prev=${this.previous.get(node)}`);
    }
  }
}

export default DStarLite;
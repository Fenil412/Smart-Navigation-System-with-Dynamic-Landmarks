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
    const initialKey = this.calculateKey(goalNode);
    this.U.insert(goalNode, initialKey.k1);
    
    console.log(`D* Lite: Goal node ${goalNode} initialized with rhs=0`);
    console.log(`D* Lite: Priority queue size: ${this.U.size()}`);
  }

  calculateKey(node) {
    const gVal = this.g.get(node) || Infinity;
    const rhsVal = this.rhs.get(node) || Infinity;
    const minVal = Math.min(gVal, rhsVal);
    const heuristic = this.heuristic(this.startNode, node);
    
    return {
      k1: minVal + heuristic + this.km,
      k2: minVal
    };
  }

  heuristic(node1, node2) {
    const node1Data = this.graph.getNode(node1);
    const node2Data = this.graph.getNode(node2);
    
    if (!node1Data || !node2Data) {
      console.log(`D* Lite: Missing node data for heuristic: ${node1} or ${node2}`);
      return Infinity;
    }

    // Haversine distance as heuristic
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(node2Data.latitude - node1Data.latitude);
    const dLon = this.toRad(node2Data.longitude - node1Data.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(node1Data.latitude)) * Math.cos(this.toRad(node2Data.latitude)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in km
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  updateVertex(u) {
    // Remove from priority queue if present
    this.U.heap = this.U.heap.filter(item => item.value !== u);
    
    if (this.g.get(u) !== this.rhs.get(u)) {
      const key = this.calculateKey(u);
      this.U.insert(u, key.k1);
    }
  }

  computeShortestPath() {
    console.log(`D* Lite: Starting computeShortestPath, queue size: ${this.U.size()}`);
    let iterations = 0;
    const maxIterations = 1000; // Safety limit
    
    while (!this.U.isEmpty() && iterations < maxIterations) {
      iterations++;
      
      const currentKey = this.calculateKey(this.startNode);
      const topNode = this.U.peek();
      
      // Check termination condition
      if (topNode.priority >= currentKey.k1 && this.rhs.get(this.startNode) === this.g.get(this.startNode)) {
        break;
      }
      
      const u = this.U.extractMin().value;
      const gU = this.g.get(u) || Infinity;
      const rhsU = this.rhs.get(u) || Infinity;
      const keyU = this.calculateKey(u);

      if (gU > rhsU) {
        // Overconsistent
        this.g.set(u, rhsU);
        
        // Update all predecessors
        const predecessors = this.getPredecessors(u);
        for (let pred of predecessors) {
          this.updateRhs(pred);
          this.updateVertex(pred);
        }
      } else {
        // Underconsistent
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
    console.log(`D* Lite: startNode g=${this.g.get(this.startNode)}, rhs=${this.rhs.get(this.startNode)}`);
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
      const gVal = this.g.get(neighbor.node) || Infinity;
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

  updateEdge(edgeId, newWeight) {
    console.log(`D* Lite: Updating edge ${edgeId} to weight ${newWeight}`);
    
    const edge = this.graph.getEdge(edgeId);
    if (edge) {
      const oldWeight = edge.weight;
      this.graph.updateEdgeWeight(edgeId, newWeight);
      
      // Update affected vertices
      this.updateRhs(edge.fromNode);
      this.updateVertex(edge.fromNode);
      
      this.updateRhs(edge.toNode);
      this.updateVertex(edge.toNode);
      
      // Update km based on start node movement (simplified)
      this.km += Math.abs(newWeight - oldWeight);
    }
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
    
    console.log(`D* Lite: Starting path reconstruction from ${current}`);

    while (current !== this.goalNode && current !== null) {
      if (visited.has(current)) {
        console.log(`D* Lite: Cycle detected at node ${current}`);
        break;
      }
      visited.add(current);

      const next = this.previous.get(current);
      console.log(`D* Lite: Current: ${current}, Next: ${next}`);

      if (!next) {
        console.log(`D* Lite: No next node found from ${current}`);
        break;
      }

      const edgeId = this.getEdgeId(current, next);
      if (!edgeId) {
        console.log(`D* Lite: No edge found from ${current} to ${next}`);
        break;
      }

      const edgeData = this.graph.getEdge(edgeId);
      path.push({
        fromNode: current,
        toNode: next,
        edgeId: edgeId,
        edgeData: edgeData
      });

      console.log(`D* Lite: Added segment ${current} -> ${next}`);

      current = next;

      // Safety limit
      if (path.length > 50) {
        console.log(`D* Lite: Path too long, possible infinite loop`);
        break;
      }
    }

    console.log(`D* Lite: Path reconstruction complete, length: ${path.length}`);
    
    if (path.length === 0) {
      console.log(`D* Lite: Empty path generated`);
      return null;
    }

    // Check if we reached the goal
    const lastNode = path[path.length - 1].toNode;
    if (lastNode !== this.goalNode) {
      console.log(`D* Lite: Path does not reach goal. Last node: ${lastNode}, Goal: ${this.goalNode}`);
      return null;
    }

    return path;
  }

  getEdgeId(fromNode, toNode) {
    const neighbors = this.graph.getNeighbors(fromNode);
    const neighbor = neighbors.find(n => n.node === toNode);
    return neighbor ? neighbor.edgeId : null;
  }

  // Method to update start position for replanning
  updateStart(newStartNode) {
    console.log(`D* Lite: Updating start from ${this.startNode} to ${newStartNode}`);
    this.km += this.heuristic(this.startNode, newStartNode);
    this.startNode = newStartNode;
    this.computeShortestPath();
  }

  // Debug method to print state
  printState() {
    console.log('D* Lite State:');
    console.log(`Start: ${this.startNode}, Goal: ${this.goalNode}`);
    console.log(`KM: ${this.km}`);
    console.log('Queue size:', this.U.size());
    
    const nodes = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'];
    for (let node of nodes) {
      console.log(`${node}: g=${this.g.get(node)}, rhs=${this.rhs.get(node)}, prev=${this.previous.get(node)}`);
    }
  }
}

export default DStarLite;
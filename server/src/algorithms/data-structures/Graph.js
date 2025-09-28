class Graph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
  }

  addNode(nodeId, data = {}) {
    if (!this.nodes.has(nodeId)) {
      this.nodes.set(nodeId, { nodeId, ...data });
      this.adjacencyList.set(nodeId, []);
    }
  }

  addEdge(edgeId, fromNode, toNode, weight, data = {}) {
    this.addNode(fromNode);
    this.addNode(toNode);

    const edge = {
      edgeId,
      fromNode,
      toNode,
      weight,
      originalWeight: weight,
      ...data
    };

    this.edges.set(edgeId, edge);
    this.adjacencyList.get(fromNode).push({ 
      node: toNode, 
      weight, 
      edgeId,
      edgeData: edge
    });

    // If bidirectional, add reverse edge
    if (data.bidirectional !== false) {
      const reverseEdgeId = `${edgeId}_reverse`;
      const reverseEdge = {
        ...edge,
        edgeId: reverseEdgeId,
        fromNode: toNode,
        toNode: fromNode
      };
      
      this.edges.set(reverseEdgeId, reverseEdge);
      this.adjacencyList.get(toNode).push({ 
        node: fromNode, 
        weight, 
        edgeId: reverseEdgeId,
        edgeData: reverseEdge
      });
    }
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getEdge(edgeId) {
    return this.edges.get(edgeId);
  }

  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  updateEdgeWeight(edgeId, newWeight) {
    const edge = this.edges.get(edgeId);
    if (edge) {
      edge.weight = newWeight;
      
      // Update adjacency list
      for (let [nodeId, neighbors] of this.adjacencyList) {
        for (let neighbor of neighbors) {
          if (neighbor.edgeId === edgeId) {
            neighbor.weight = newWeight;
            if (neighbor.edgeData) {
              neighbor.edgeData.weight = newWeight;
            }
          }
        }
      }
    }
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    return Array.from(this.edges.values());
  }

  // Check if path exists between two nodes
  hasPath(startNode, endNode, visited = new Set()) {
    if (startNode === endNode) return true;
    if (visited.has(startNode)) return false;

    visited.add(startNode);
    const neighbors = this.getNeighbors(startNode);

    for (let neighbor of neighbors) {
      if (this.hasPath(neighbor.node, endNode, visited)) {
        return true;
      }
    }

    return false;
  }

  // For debugging
  printGraph() {
    console.log('Graph Structure:');
    for (let [nodeId, neighbors] of this.adjacencyList) {
      const neighborList = neighbors.map(n => `${n.node}(${n.weight})`).join(', ');
      console.log(`${nodeId} -> ${neighborList}`);
    }
  }
}

export default Graph;
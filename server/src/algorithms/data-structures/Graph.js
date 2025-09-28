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
    this.adjacencyList.get(fromNode).push({ node: toNode, weight, edgeId });

    // If bidirectional, add reverse edge
    if (data.bidirectional !== false) {
      const reverseEdgeId = `${edgeId}_reverse`;
      this.adjacencyList.get(toNode).push({ node: fromNode, weight, edgeId: reverseEdgeId });
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
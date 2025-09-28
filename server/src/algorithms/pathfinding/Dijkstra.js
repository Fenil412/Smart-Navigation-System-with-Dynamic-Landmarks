import MinHeap from '../data-structures/MinHeap.js';

class Dijkstra {
  constructor(graph) {
    this.graph = graph;
  }

  findShortestPath(startNode, endNode) {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const heap = new MinHeap();

    // Initialize distances
    for (let nodeId of this.graph.nodes.keys()) {
      distances.set(nodeId, Infinity);
      previous.set(nodeId, null);
    }
    distances.set(startNode, 0);

    heap.insert(startNode, 0);

    while (!heap.isEmpty()) {
      const { value: currentNode, priority: currentDistance } = heap.extractMin();

      if (visited.has(currentNode)) continue;
      visited.add(currentNode);

      if (currentNode === endNode) {
        return this.reconstructPath(previous, endNode);
      }

      const neighbors = this.graph.getNeighbors(currentNode);
      for (let neighbor of neighbors) {
        if (visited.has(neighbor.node)) continue;

        const newDistance = currentDistance + neighbor.weight;

        if (newDistance < distances.get(neighbor.node)) {
          distances.set(neighbor.node, newDistance);
          previous.set(neighbor.node, {
            node: currentNode,
            edgeId: neighbor.edgeId
          });
          heap.insert(neighbor.node, newDistance);
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
        path.unshift({
          fromNode: prev.node,
          toNode: currentNode,
          edgeId: prev.edgeId
        });
        currentNode = prev.node;
      } else {
        break;
      }
    }

    return path;
  }
}

export default Dijkstra;
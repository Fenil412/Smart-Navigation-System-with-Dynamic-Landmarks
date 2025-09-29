// scripts/testGraphConnectivity.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GraphService from '../src/services/GraphService.js';

dotenv.config();

const testGraphConnectivity = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Load graph
    await GraphService.loadGraphFromDatabase();
    const graph = GraphService.getGraph();

    console.log('\n=== Testing Graph Connectivity ===');
    
    // Test basic connectivity
    const testPairs = [
      ['N1', 'N2'],
      ['N1', 'N5'],
      ['N1', 'N6'],
      ['N2', 'N5']
    ];

    for (let [start, end] of testPairs) {
      console.log(`\nTesting path from ${start} to ${end}:`);
      
      const startNode = graph.getNode(start);
      const endNode = graph.getNode(end);
      
      if (!startNode || !endNode) {
        console.log(`ERROR: Nodes not found`);
        continue;
      }

      console.log(`Start: ${start} (${startNode.latitude}, ${startNode.longitude})`);
      console.log(`End: ${end} (${endNode.latitude}, ${endNode.longitude})`);
      
      const neighbors = graph.getNeighbors(start);
      console.log(`Neighbors of ${start}:`, neighbors.map(n => n.node));
      
      // Simple BFS to check connectivity
      const visited = new Set();
      const queue = [[start, [start]]];
      let pathFound = null;

      while (queue.length > 0 && !pathFound) {
        const [current, path] = queue.shift();
        
        if (current === end) {
          pathFound = path;
          break;
        }
        
        if (visited.has(current)) continue;
        visited.add(current);
        
        const currentNeighbors = graph.getNeighbors(current);
        for (let neighbor of currentNeighbors) {
          if (!visited.has(neighbor.node)) {
            queue.push([neighbor.node, [...path, neighbor.node]]);
          }
        }
      }
      
      if (pathFound) {
        console.log(`✓ Path found: ${pathFound.join(' -> ')}`);
      } else {
        console.log(`✗ No path found`);
      }
    }

    // Print full graph structure
    console.log('\n=== Full Graph Structure ===');
    const nodes = Array.from(graph.nodes.keys()).sort();
    for (let node of nodes) {
      const neighbors = graph.getNeighbors(node);
      console.log(`${node} -> ${neighbors.map(n => `${n.node}(${n.weight})`).join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testGraphConnectivity();
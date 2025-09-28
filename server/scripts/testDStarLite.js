import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GraphService from '../src/services/GraphService.js';
import DStarLite from '../src/algorithms/pathfinding/DStarLite.js';

dotenv.config();

const testDStarLite = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Load graph
    await GraphService.loadGraphFromDatabase();
    const graph = GraphService.getGraph();

    console.log('\n=== Testing D* Lite Algorithm ===');
    
    // Test case 1: N1 to N5 (should work)
    console.log('\nTest 1: N1 to N5');
    const dstar1 = new DStarLite(graph);
    dstar1.initialize('N1', 'N5');
    dstar1.computeShortestPath();
    const path1 = dstar1.getPath();
    console.log('Path found:', path1 ? `Yes, ${path1.length} segments` : 'No');
    
    // Test case 2: N1 to N6
    console.log('\nTest 2: N1 to N6');
    const dstar2 = new DStarLite(graph);
    dstar2.initialize('N1', 'N6');
    dstar2.computeShortestPath();
    const path2 = dstar2.getPath();
    console.log('Path found:', path2 ? `Yes, ${path2.length} segments` : 'No');

    // Test case 3: Print graph structure
    console.log('\nGraph Structure:');
    const nodes = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'];
    for (let node of nodes) {
      const neighbors = graph.getNeighbors(node);
      console.log(`${node} -> ${neighbors.map(n => n.node).join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testDStarLite();
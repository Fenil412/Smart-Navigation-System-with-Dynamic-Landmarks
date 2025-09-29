// scripts/testSimpleDStar.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GraphService from '../src/services/GraphService.js';
import DStarLite from '../src/algorithms/pathfinding/DStarLite.js';

dotenv.config();

const testSimpleDStar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Load graph
    await GraphService.loadGraphFromDatabase();
    const graph = GraphService.getGraph();

    console.log('\n=== Testing Simple D* Lite ===');
    
    // Test the simplest case: N1 to N2 (direct connection)
    console.log('\nTest: N1 to N2 (direct connection)');
    const dstar = new DStarLite(graph);
    
    console.log('Step 1: Initialize');
    dstar.initialize('N1', 'N2');
    
    console.log('Step 2: Compute shortest path');
    dstar.computeShortestPath();
    
    console.log('Step 3: Get path');
    const path = dstar.getPath();
    
    console.log('Step 4: Print state');
    dstar.printState();
    
    if (path) {
      console.log(`✓ SUCCESS: Path found with ${path.length} segments`);
      console.log('Path:', path.map(segment => `${segment.fromNode}->${segment.toNode}`).join(', '));
    } else {
      console.log('✗ FAILED: No path found');
      
      // Debug: Check direct connection
      console.log('\nDebug: Checking direct connection N1->N2');
      const neighbors = graph.getNeighbors('N1');
      const directNeighbor = neighbors.find(n => n.node === 'N2');
      if (directNeighbor) {
        console.log(`Direct connection exists with weight: ${directNeighbor.weight}`);
      } else {
        console.log('No direct connection found');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testSimpleDStar();
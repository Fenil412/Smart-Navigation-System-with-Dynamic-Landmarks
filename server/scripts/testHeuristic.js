// scripts/testHeuristic.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GraphService from '../src/services/GraphService.js';

dotenv.config();

const testHeuristic = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Load graph
    await GraphService.loadGraphFromDatabase();
    const graph = GraphService.getGraph();

    console.log('\n=== Testing Heuristic Calculation ===');
    
    // Test heuristic between different nodes
    const testPairs = [
      ['N1', 'N2'],
      ['N1', 'N5'],
      ['N1', 'N6']
    ];

    for (let [node1, node2] of testPairs) {
      const node1Data = graph.getNode(node1);
      const node2Data = graph.getNode(node2);
      
      console.log(`\nHeuristic from ${node1} to ${node2}:`);
      console.log(`${node1}: (${node1Data.latitude}, ${node1Data.longitude})`);
      console.log(`${node2}: (${node2Data.latitude}, ${node2Data.longitude})`);
      
      const dLat = node2Data.latitude - node1Data.latitude;
      const dLon = node2Data.longitude - node1Data.longitude;
      const distance = Math.sqrt(dLat * dLat + dLon * dLon) * 111;
      
      console.log(`Calculated distance: ${distance} km`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testHeuristic();
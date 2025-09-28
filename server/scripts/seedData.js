import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Node from '../src/models/Node.js';
import Edge from '../src/models/Edge.js';
import { ROAD_TYPES, NODE_TYPES } from '../src/utils/constants.js';

dotenv.config();

// Enhanced sample data with better connectivity
const sampleNodes = [
  { nodeId: 'N1', latitude: 12.9716, longitude: 77.5946, type: NODE_TYPES.INTERSECTION, name: 'MG Road' },
  { nodeId: 'N2', latitude: 12.9720, longitude: 77.5950, type: NODE_TYPES.INTERSECTION, name: 'Brigade Road' },
  { nodeId: 'N3', latitude: 12.9710, longitude: 77.5930, type: NODE_TYPES.INTERSECTION, name: 'Church Street' },
  { nodeId: 'N4', latitude: 12.9730, longitude: 77.5960, type: NODE_TYPES.LANDMARK, name: 'Commercial Street' },
  { nodeId: 'N5', latitude: 12.9700, longitude: 77.5920, type: NODE_TYPES.INTERSECTION, name: 'St. Marks Road' },
  { nodeId: 'N6', latitude: 12.9695, longitude: 77.5910, type: NODE_TYPES.INTERSECTION, name: 'Residency Road' }
];

// Create a more connected graph with multiple paths
const sampleEdges = [
  // Primary connections
  { edgeId: 'E1', fromNode: 'N1', toNode: 'N2', weight: 1, distance: 500, roadType: ROAD_TYPES.PRIMARY },
  { edgeId: 'E2', fromNode: 'N2', toNode: 'N1', weight: 1, distance: 500, roadType: ROAD_TYPES.PRIMARY },
  
  { edgeId: 'E3', fromNode: 'N1', toNode: 'N3', weight: 1.5, distance: 800, roadType: ROAD_TYPES.SECONDARY },
  { edgeId: 'E4', fromNode: 'N3', toNode: 'N1', weight: 1.5, distance: 800, roadType: ROAD_TYPES.SECONDARY },
  
  { edgeId: 'E5', fromNode: 'N2', toNode: 'N4', weight: 1.2, distance: 600, roadType: ROAD_TYPES.PRIMARY },
  { edgeId: 'E6', fromNode: 'N4', toNode: 'N2', weight: 1.2, distance: 600, roadType: ROAD_TYPES.PRIMARY },
  
  { edgeId: 'E7', fromNode: 'N3', toNode: 'N5', weight: 2, distance: 1000, roadType: ROAD_TYPES.LOCAL },
  { edgeId: 'E8', fromNode: 'N5', toNode: 'N3', weight: 2, distance: 1000, roadType: ROAD_TYPES.LOCAL },
  
  // Additional connections for better pathfinding
  { edgeId: 'E9', fromNode: 'N2', toNode: 'N3', weight: 1.8, distance: 900, roadType: ROAD_TYPES.SECONDARY },
  { edgeId: 'E10', fromNode: 'N3', toNode: 'N2', weight: 1.8, distance: 900, roadType: ROAD_TYPES.SECONDARY },
  
  { edgeId: 'E11', fromNode: 'N4', toNode: 'N5', weight: 2.5, distance: 1200, roadType: ROAD_TYPES.SECONDARY },
  { edgeId: 'E12', fromNode: 'N5', toNode: 'N4', weight: 2.5, distance: 1200, roadType: ROAD_TYPES.SECONDARY },
  
  { edgeId: 'E13', fromNode: 'N5', toNode: 'N6', weight: 1.5, distance: 700, roadType: ROAD_TYPES.LOCAL },
  { edgeId: 'E14', fromNode: 'N6', toNode: 'N5', weight: 1.5, distance: 700, roadType: ROAD_TYPES.LOCAL },
  
  { edgeId: 'E15', fromNode: 'N1', toNode: 'N6', weight: 2.2, distance: 1100, roadType: ROAD_TYPES.SECONDARY },
  { edgeId: 'E16', fromNode: 'N6', toNode: 'N1', weight: 2.2, distance: 1100, roadType: ROAD_TYPES.SECONDARY }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Clear existing data
    await Node.deleteMany({});
    await Edge.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample data
    await Node.insertMany(sampleNodes);
    await Edge.insertMany(sampleEdges);
    console.log('Sample data inserted successfully');

    console.log('\nSample data summary:');
    console.log(`- Nodes: ${sampleNodes.length}`);
    console.log(`- Edges: ${sampleEdges.length}`);
    
    // Verify connectivity
    const nodeCount = await Node.countDocuments();
    const edgeCount = await Edge.countDocuments();
    console.log(`- Verified nodes in DB: ${nodeCount}`);
    console.log(`- Verified edges in DB: ${edgeCount}`);
    
    console.log('\nGraph connectivity:');
    console.log('N1 -> N2 -> N4 -> N5 -> N6 -> N1 (Multiple paths available)');
    console.log('N1 -> N3 -> N5 -> N6 -> N1 (Alternative paths)');
    
    console.log('\nYou can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
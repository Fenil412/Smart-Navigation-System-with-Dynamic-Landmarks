import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Node from '../src/models/Node.js';
import Edge from '../src/models/Edge.js';
import { ROAD_TYPES, NODE_TYPES } from '../src/utils/constants.js';

dotenv.config();

const sampleNodes = [
  { nodeId: 'N1', latitude: 12.9716, longitude: 77.5946, type: NODE_TYPES.INTERSECTION, name: 'MG Road' },
  { nodeId: 'N2', latitude: 12.9720, longitude: 77.5950, type: NODE_TYPES.INTERSECTION, name: 'Brigade Road' },
  { nodeId: 'N3', latitude: 12.9710, longitude: 77.5930, type: NODE_TYPES.INTERSECTION, name: 'Church Street' },
  { nodeId: 'N4', latitude: 12.9730, longitude: 77.5960, type: NODE_TYPES.LANDMARK, name: 'Commercial Street' },
  { nodeId: 'N5', latitude: 12.9700, longitude: 77.5920, type: NODE_TYPES.INTERSECTION, name: 'St. Marks Road' }
];

const sampleEdges = [
  { edgeId: 'E1', fromNode: 'N1', toNode: 'N2', weight: 1, distance: 500, roadType: ROAD_TYPES.PRIMARY },
  { edgeId: 'E2', fromNode: 'N2', toNode: 'N1', weight: 1, distance: 500, roadType: ROAD_TYPES.PRIMARY },
  { edgeId: 'E3', fromNode: 'N1', toNode: 'N3', weight: 1.5, distance: 800, roadType: ROAD_TYPES.SECONDARY },
  { edgeId: 'E4', fromNode: 'N3', toNode: 'N1', weight: 1.5, distance: 800, roadType: ROAD_TYPES.SECONDARY },
  { edgeId: 'E5', fromNode: 'N2', toNode: 'N4', weight: 1.2, distance: 600, roadType: ROAD_TYPES.PRIMARY },
  { edgeId: 'E6', fromNode: 'N4', toNode: 'N2', weight: 1.2, distance: 600, roadType: ROAD_TYPES.PRIMARY },
  { edgeId: 'E7', fromNode: 'N3', toNode: 'N5', weight: 2, distance: 1000, roadType: ROAD_TYPES.LOCAL },
  { edgeId: 'E8', fromNode: 'N5', toNode: 'N3', weight: 2, distance: 1000, roadType: ROAD_TYPES.LOCAL }
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
    console.log('\nYou can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
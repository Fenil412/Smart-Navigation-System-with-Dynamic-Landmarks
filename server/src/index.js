import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import routes from './routes/index.js';
import socketHandler from './websocket/socketHandler.js';
import GraphService from './services/GraphService.js';
import EventService from './services/EventService.js';
import NavigationService from './services/NavigationService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions)); // Apply CORS to Express routes too
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api', routes);

// Initialize Socket.IO
const socketHandlers = socketHandler(io);

// Initialize services with socket handlers
EventService.setSocketHandler(socketHandlers);
NavigationService.setSocketHandler(socketHandlers);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Load graph data on startup
    console.log('Loading graph data...');
    await GraphService.loadGraphFromDatabase();
    console.log('Graph data loaded successfully');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server ready for connections`);
      console.log(`CORS enabled for: http://localhost:5173`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
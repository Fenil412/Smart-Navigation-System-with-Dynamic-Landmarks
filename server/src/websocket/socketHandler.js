import GraphService from '../services/GraphService.js';
import EventService from '../services/EventService.js';
import NavigationService from '../services/NavigationService.js';

let socketHandlerInstance = null;

const socketHandler = (io) => {
  socketHandlerInstance = io;
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    console.log('Client origin:', socket.handshake.headers.origin);

    // Route management
    socket.on('join_route', (routeId) => {
      socket.join(routeId);
      console.log(`Client ${socket.id} joined route ${routeId}`);
    });

    socket.on('leave_route', (routeId) => {
      socket.leave(routeId);
      console.log(`Client ${socket.id} left route ${routeId}`);
    });

    // Vehicle position updates
    socket.on('vehicle_position_update', (data) => {
      // Broadcast vehicle position to all clients in the same route
      socket.to(data.routeId).emit('vehicle_position_update', data);
    });

    // Request graph data
    socket.on('request_graph_data', async () => {
      try {
        const graph = GraphService.getGraph();
        const events = await EventService.getActiveEvents();
        
        socket.emit('graph_data', {
          nodes: graph.getAllNodes(),
          edges: graph.getAllEdges(),
          events
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to load graph data' });
      }
    });

    // Start vehicle simulation
    socket.on('start_vehicle_simulation', (data) => {
      const { routeId, updateInterval = 2000 } = data;
      console.log(`Starting vehicle simulation for route ${routeId}`);
      
      NavigationService.simulateVehicleMovement(routeId, updateInterval);
    });

    // Stop vehicle simulation
    socket.on('stop_vehicle_simulation', (routeId) => {
      console.log(`Stopping vehicle simulation for route ${routeId}`);
      // Note: We would need to track and clear intervals in a real implementation
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  });

  // Function to broadcast route updates
  const broadcastRouteUpdate = (routeId, updatedRoute) => {
    io.to(routeId).emit('route_updated', updatedRoute);
  };

  // Function to broadcast new events
  const broadcastNewEvent = (event) => {
    io.emit('new_event', event);
  };

  // Function to broadcast vehicle position
  const broadcastVehiclePosition = (routeId, positionData) => {
    io.to(routeId).emit('vehicle_position_update', positionData);
  };

  return {
    broadcastRouteUpdate,
    broadcastNewEvent,
    broadcastVehiclePosition
  };
};

// Export function to get socket handler instance
export const getSocketHandler = () => socketHandlerInstance;

export default socketHandler;
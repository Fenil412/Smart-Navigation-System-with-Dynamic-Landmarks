import GraphService from '../services/GraphService.js';
import EventService from '../services/EventService.js';
import NavigationService from '../services/NavigationService.js';

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_route', (routeId) => {
      socket.join(routeId);
      console.log(`Client ${socket.id} joined route ${routeId}`);
    });

    socket.on('leave_route', (routeId) => {
      socket.leave(routeId);
      console.log(`Client ${socket.id} left route ${routeId}`);
    });

    socket.on('vehicle_position_update', (data) => {
      // Broadcast vehicle position to all clients in the same route
      socket.to(data.routeId).emit('vehicle_position_update', data);
    });

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

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
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

  return {
    broadcastRouteUpdate,
    broadcastNewEvent
  };
};

export default socketHandler;
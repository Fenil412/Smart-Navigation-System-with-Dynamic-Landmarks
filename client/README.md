# Smart Navigation System - Frontend

A real-time navigation system frontend built with React, Vite, Tailwind CSS, and Socket.IO.

## Features

- 🗺️ Interactive map visualization using Leaflet
- 🚗 Real-time vehicle tracking and simulation
- 📍 Multiple pathfinding algorithms (Dijkstra, A*, D* Lite)
- ⚡ Live event management (traffic jams, road closures)
- 🔄 WebSocket integration for real-time updates
- 📊 Network statistics and route details
- 🎨 Modern, responsive UI with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:5001`

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Update `.env` with your backend URL if different from default:
\`\`\`env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
\`\`\`

## Development

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be available at `http://localhost:5173`

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## Usage

### Route Planning
1. Enter start and end coordinates in the sidebar
2. Select a pathfinding algorithm (Dijkstra, A*, or D* Lite)
3. Click "Calculate Route" to compute the optimal path
4. View route details including distance and estimated time

### Vehicle Simulation
1. After calculating a route, click "Start Simulation"
2. Watch the vehicle move along the calculated path in real-time
3. Click "Stop Simulation" to halt the vehicle

### Event Management
1. Click the "+" button in the Events panel
2. Fill in event details (type, severity, location, radius)
3. Click "Create Event" to add it to the map
4. Events will affect route calculations dynamically
5. Click the "X" on any event to deactivate it

## Architecture

- **State Management**: Zustand for global state
- **Real-time Communication**: Socket.IO client
- **API Communication**: Fetch API with service layer
- **Map Rendering**: React-Leaflet
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## API Integration

The frontend connects to these backend endpoints:

- `GET /api/health` - Health check
- `POST /api/routes/calculate` - Calculate route
- `GET /api/routes/:routeId` - Get route details
- `PUT /api/routes/:routeId/update` - Update route
- `GET /api/routes/algorithms` - Get available algorithms
- `POST /api/events` - Create event
- `GET /api/events/active` - Get active events
- `PUT /api/events/:eventId/deactivate` - Deactivate event

## Socket.IO Events

### Emitted by Client:
- `request_graph_data` - Request network graph
- `join_route` - Join route room
- `leave_route` - Leave route room
- `start_vehicle_simulation` - Start vehicle movement
- `stop_vehicle_simulation` - Stop vehicle movement
- `ping` - Connection health check

### Received by Client:
- `connection_confirmed` - Connection established
- `graph_data` - Network graph data
- `vehicle_position_update` - Real-time vehicle position
- `new_event` - New event created
- `route_updated` - Route recalculated
- `pong` - Health check response

## License

MIT

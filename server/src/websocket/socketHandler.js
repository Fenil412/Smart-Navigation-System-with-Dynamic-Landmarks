import GraphService from "../services/GraphService.js"
import EventService from "../services/EventService.js"
import NavigationService from "../services/NavigationService.js"

let socketHandlerInstance = null

const socketHandler = (io) => {
  socketHandlerInstance = io

  const connectedClients = new Map()

  io.on("connection", (socket) => {
    console.log("")
    console.log("=".repeat(60))
    console.log(`📡 Client connected: ${socket.id}`)
    console.log(`🌐 Client origin: ${socket.handshake.headers.origin || "unknown"}`)
    console.log(`🔌 Transport: ${socket.conn.transport.name}`)
    console.log(`👥 Total clients: ${io.engine.clientsCount}`)
    console.log("=".repeat(60))
    console.log("")

    connectedClients.set(socket.id, {
      connectedAt: new Date(),
      transport: socket.conn.transport.name,
      origin: socket.handshake.headers.origin,
    })

    // Send connection confirmation immediately
    socket.emit("connection_confirmed", {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      serverTime: Date.now(),
    })

    socket.conn.on("upgrade", (transport) => {
      console.log(`🔄 Client ${socket.id} upgraded transport to: ${transport.name}`)
    })

    // Route management
    socket.on("join_route", (routeId) => {
      socket.join(routeId)
      console.log(`📍 Client ${socket.id} joined route ${routeId}`)
      socket.emit("route_joined", { routeId, timestamp: new Date().toISOString() })
    })

    socket.on("leave_route", (routeId) => {
      socket.leave(routeId)
      console.log(`📍 Client ${socket.id} left route ${routeId}`)
      socket.emit("route_left", { routeId, timestamp: new Date().toISOString() })
    })

    // Vehicle position updates
    socket.on("vehicle_position_update", (data) => {
      // Broadcast vehicle position to all clients in the same route
      socket.to(data.routeId).emit("vehicle_position_update", data)
      console.log(`🚗 Vehicle position broadcasted for route ${data.routeId}`)
    })

    // Request graph data
    socket.on("request_graph_data", async () => {
      try {
        console.log(`🗺️  Graph data requested by ${socket.id}`)

        if (!GraphService.isLoaded) {
          console.warn("⚠️  Graph not loaded yet. Sending empty data.")
          socket.emit("graph_data", {
            nodes: [],
            edges: [],
            events: [],
            error: "Graph data not available. Database may not be connected.",
          })
          return
        }

        const graph = GraphService.getGraph()
        const events = await EventService.getActiveEvents()

        const graphData = {
          nodes: graph.getAllNodes(),
          edges: graph.getAllEdges(),
          events,
        }

        socket.emit("graph_data", graphData)
        console.log(
          `✅ Graph data sent to ${socket.id}: ${graphData.nodes?.length || 0} nodes, ${graphData.edges?.length || 0} edges, ${graphData.events?.length || 0} events`,
        )
      } catch (error) {
        console.error("❌ Error sending graph data:", error)
        socket.emit("error", {
          message: "Failed to load graph data",
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Start vehicle simulation
    socket.on("start_vehicle_simulation", (data) => {
      const { routeId, updateInterval = 2000 } = data
      console.log(`🚗 Starting vehicle simulation for route ${routeId} with ${updateInterval}ms interval`)

      try {
        NavigationService.simulateVehicleMovement(routeId, updateInterval)
        socket.emit("simulation_started", {
          routeId,
          updateInterval,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("❌ Failed to start simulation:", error)
        socket.emit("error", {
          message: "Failed to start vehicle simulation",
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Stop vehicle simulation
    socket.on("stop_vehicle_simulation", (routeId) => {
      console.log(`🚫 Stopping vehicle simulation for route ${routeId}`)
      try {
        // Note: We would need to track and clear intervals in a real implementation
        socket.emit("simulation_stopped", {
          routeId,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("❌ Failed to stop simulation:", error)
        socket.emit("error", {
          message: "Failed to stop vehicle simulation",
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Handle ping/pong for connection health
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() })
    })

    socket.on("disconnect", (reason) => {
      console.log("")
      console.log("=".repeat(60))
      console.log(`❌ Client disconnected: ${socket.id}`)
      console.log(`📋 Reason: ${reason}`)
      console.log(`👥 Remaining clients: ${io.engine.clientsCount}`)
      console.log("=".repeat(60))
      console.log("")

      connectedClients.delete(socket.id)
    })

    socket.on("connect_error", (error) => {
      console.error(`🔴 Socket connection error for ${socket.id}:`, error)
    })

    socket.on("error", (error) => {
      console.error(`🔴 Socket error for ${socket.id}:`, error)
    })
  })

  // Function to broadcast route updates
  const broadcastRouteUpdate = (routeId, updatedRoute) => {
    io.to(routeId).emit("route_updated", updatedRoute)
    console.log(`📢 Route update broadcasted for route ${routeId}`)
  }

  // Function to broadcast new events
  const broadcastNewEvent = (event) => {
    io.emit("new_event", event)
    console.log(`📢 New event broadcasted:`, event)
  }

  // Function to broadcast vehicle position
  const broadcastVehiclePosition = (routeId, positionData) => {
    io.to(routeId).emit("vehicle_position_update", positionData)
  }

  return {
    broadcastRouteUpdate,
    broadcastNewEvent,
    broadcastVehiclePosition,
    getConnectedClients: () => connectedClients,
  }
}

// Export function to get socket handler instance
export const getSocketHandler = () => socketHandlerInstance

export default socketHandler

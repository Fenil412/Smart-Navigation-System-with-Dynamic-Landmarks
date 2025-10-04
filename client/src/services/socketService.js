import { io } from "socket.io-client"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001"

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
    this.isConnecting = false
  }

  connect() {
    if (this.socket?.connected) {
      console.log("[v0] Socket already connected")
      return
    }

    if (this.isConnecting) {
      console.log("[v0] Socket connection already in progress")
      return
    }

    this.isConnecting = true
    console.log("[v0] Attempting to connect to:", SOCKET_URL)

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
    })

    this.socket.on("connect", () => {
      console.log("[v0] ✅ Socket connected successfully:", this.socket.id)
      this.isConnecting = false
    })

    this.socket.on("disconnect", (reason) => {
      console.log("[v0] ❌ Socket disconnected:", reason)
      this.isConnecting = false

      if (reason === "io server disconnect") {
        console.log("[v0] Server disconnected, attempting to reconnect...")
        this.socket.connect()
      }
    })

    this.socket.on("connect_error", (error) => {
      console.error("[v0] 🔴 Socket connection error:", error.message)
      console.error("[v0] Make sure your backend is running on:", SOCKET_URL)
      this.isConnecting = false
    })

    this.socket.on("error", (error) => {
      console.error("[v0] 🔴 Socket error:", error)
    })

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("[v0] 🔄 Socket reconnected after", attemptNumber, "attempts")
    })

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("[v0] 🔄 Reconnection attempt", attemptNumber)
    })

    this.socket.on("reconnect_error", (error) => {
      console.error("[v0] 🔴 Reconnection error:", error.message)
    })

    this.socket.on("reconnect_failed", () => {
      console.error("[v0] 🔴 Reconnection failed after all attempts")
    })

    // Setup ping/pong for connection health
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("ping")
      }
    }, 30000)

    this.socket.on("pong", (data) => {
      console.log("[v0] 🏓 Pong received:", data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)

      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }

      // Remove from listeners
      if (this.listeners.has(event)) {
        if (callback) {
          const callbacks = this.listeners.get(event)
          const index = callbacks.indexOf(callback)
          if (index > -1) {
            callbacks.splice(index, 1)
          }
        } else {
          this.listeners.delete(event)
        }
      }
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn("Socket not connected. Cannot emit:", event)
    }
  }

  // Specific methods for your API
  requestGraphData() {
    this.emit("request_graph_data")
  }

  joinRoute(routeId) {
    this.emit("join_route", routeId)
  }

  leaveRoute(routeId) {
    this.emit("leave_route", routeId)
  }

  startVehicleSimulation(routeId, updateInterval = 2000) {
    this.emit("start_vehicle_simulation", { routeId, updateInterval })
  }

  stopVehicleSimulation(routeId) {
    this.emit("stop_vehicle_simulation", routeId)
  }

  updateVehiclePosition(data) {
    this.emit("vehicle_position_update", data)
  }

  isConnected() {
    return this.socket?.connected || false
  }

  getConnectionState() {
    if (!this.socket) return "disconnected"
    if (this.socket.connected) return "connected"
    if (this.isConnecting) return "connecting"
    return "disconnected"
  }
}

export const socketService = new SocketService()

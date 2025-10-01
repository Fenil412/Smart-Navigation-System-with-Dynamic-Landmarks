"use client"

import { createContext, useContext, useReducer, useEffect, useRef } from "react"
import { io } from "socket.io-client"

const AppContext = createContext()

const initialState = {
  // Map state
  mapCenter: [12.9716, 77.5946],
  zoom: 13,

  // Route state
  startPoint: null,
  endPoint: null,
  currentRoute: null,
  activeRouteId: null,

  // Algorithm state
  selectedAlgorithm: "astar",
  routeOptions: {
    avoidHighways: false,
    preferMainRoads: false,
  },

  // Events state
  activeEvents: [],
  dynamicEvents: [],

  // Vehicle state
  vehiclePosition: null,
  isSimulating: false,

  // UI state
  isLoading: false,
  error: null,
  sidebarOpen: true,

  // Socket state
  socket: null,
  isConnected: false,
}

function appReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    case "SET_ERROR":
      return { ...state, error: action.payload }

    case "SET_START_POINT":
      return { ...state, startPoint: action.payload }

    case "SET_END_POINT":
      return { ...state, endPoint: action.payload }

    case "SET_CURRENT_ROUTE":
      return {
        ...state,
        currentRoute: action.payload,
        activeRouteId: action.payload?.routeId || null,
        error: null,
      }

    case "SET_SELECTED_ALGORITHM":
      return { ...state, selectedAlgorithm: action.payload }

    case "SET_ROUTE_OPTIONS":
      return { ...state, routeOptions: { ...state.routeOptions, ...action.payload } }

    case "SET_ACTIVE_EVENTS":
      return { ...state, activeEvents: action.payload }

    case "ADD_DYNAMIC_EVENT":
      return { ...state, dynamicEvents: [...state.dynamicEvents, action.payload] }

    case "SET_VEHICLE_POSITION":
      return { ...state, vehiclePosition: action.payload }

    case "SET_SIMULATION_STATUS":
      return { ...state, isSimulating: action.payload }

    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen }

    case "CLEAR_ROUTE":
      return {
        ...state,
        currentRoute: null,
        activeRouteId: null,
        vehiclePosition: null,
        isSimulating: false,
      }

    case "SET_SOCKET":
      return { ...state, socket: action.payload }

    case "SET_CONNECTION_STATUS":
      return { ...state, isConnected: action.payload }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const socketRef = useRef(null)
  const isConnectingRef = useRef(false)
  const healthCheckIntervalRef = useRef(null)

  const checkServerHealth = async (socketUrl) => {
    try {
      const healthUrl = socketUrl.replace(/\/$/, "") + "/health"
      const response = await fetch(healthUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Server health check passed:", data)
        return true
      }
      return false
    } catch (error) {
      console.warn("⚠️  Server health check failed:", error.message)
      return false
    }
  }

  // Initialize socket connection with retry logic
  useEffect(() => {
    if (isConnectingRef.current || socketRef.current) {
      return
    }

    let retryTimeout
    let retryCount = 0
    const maxRetries = 5

    const connectSocket = async () => {
      if (isConnectingRef.current) {
        return
      }

      try {
        isConnectingRef.current = true

        // Use environment variable or default to localhost:5001
        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001"

        console.log("🔍 Checking server health...")
        const isHealthy = await checkServerHealth(socketUrl)

        if (!isHealthy) {
          throw new Error("Server health check failed")
        }

        console.log("🔄 Attempting to connect to WebSocket server...")
        console.log(`🔗 Connecting to: ${socketUrl}`)

        const socket = io(socketUrl, {
          transports: ["websocket", "polling"],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          autoConnect: true,
          upgrade: true,
          rememberUpgrade: true,
          forceNew: false, // Changed to false to reuse connections
        })

        socketRef.current = socket
        dispatch({ type: "SET_SOCKET", payload: socket })

        socket.on("connect", () => {
          console.log("")
          console.log("=".repeat(60))
          console.log("✅ Connected to WebSocket server")
          console.log("🔗 Socket ID:", socket.id)
          console.log("🌐 Transport:", socket.io.engine.transport.name)
          console.log("=".repeat(60))
          console.log("")

          dispatch({ type: "SET_CONNECTION_STATUS", payload: true })
          dispatch({ type: "SET_ERROR", payload: null })
          retryCount = 0
          isConnectingRef.current = false

          // Request initial graph data after connection
          socket.emit("request_graph_data")
        })

        socket.on("connection_confirmed", (data) => {
          console.log("✅ Connection confirmed by server:", data)
        })

        socket.on("route_updated", (updatedRoute) => {
          console.log("📍 Route updated:", updatedRoute)
          dispatch({ type: "SET_CURRENT_ROUTE", payload: updatedRoute })
        })

        socket.on("new_event", (event) => {
          console.log("🚨 New event received:", event)
          dispatch({ type: "ADD_DYNAMIC_EVENT", payload: event })
        })

        socket.on("vehicle_position_update", (positionData) => {
          console.log("🚗 Vehicle position update:", positionData)
          dispatch({ type: "SET_VEHICLE_POSITION", payload: positionData })
        })

        socket.on("graph_data", (graphData) => {
          console.log("🗺️  Graph data received:", {
            nodes: graphData.nodes?.length || 0,
            edges: graphData.edges?.length || 0,
            events: graphData.events?.length || 0,
          })

          if (graphData.error) {
            console.warn("⚠️  Graph data warning:", graphData.error)
          }

          if (graphData.events) {
            dispatch({ type: "SET_ACTIVE_EVENTS", payload: graphData.events })
          }
        })

        socket.on("error", (error) => {
          console.error("🔴 Socket error:", error)
          dispatch({ type: "SET_ERROR", payload: `Socket error: ${error.message || error}` })
        })

        socket.on("disconnect", (reason) => {
          console.log("")
          console.log("=".repeat(60))
          console.log("❌ Disconnected from server")
          console.log("📋 Reason:", reason)
          console.log("=".repeat(60))
          console.log("")

          dispatch({ type: "SET_CONNECTION_STATUS", payload: false })
          isConnectingRef.current = false

          if (reason === "io server disconnect") {
            console.log("🔄 Server disconnected, attempting to reconnect...")
            socket.connect()
          }
        })

        socket.on("connect_error", (error) => {
          console.error("🔌 Connection error:", error.message || error)
          dispatch({ type: "SET_CONNECTION_STATUS", payload: false })
          isConnectingRef.current = false
          retryCount++

          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
            console.log(`🔄 Retrying connection in ${delay}ms... (${retryCount}/${maxRetries})`)
            retryTimeout = setTimeout(() => {
              connectSocket()
            }, delay)
          } else {
            console.error("❌ Max retries reached. WebSocket connection failed.")
            const errorMsg = error.message?.includes("ECONNREFUSED")
              ? "Backend server is not running on port 5001. Please start the server first."
              : `Cannot connect to server: ${error.message || "Unknown error"}. Please ensure the backend is running on port 5001.`
            dispatch({
              type: "SET_ERROR",
              payload: errorMsg,
            })
          }
        })

        socket.on("reconnect", (attemptNumber) => {
          console.log(`✅ Reconnected after ${attemptNumber} attempts`)
          dispatch({ type: "SET_CONNECTION_STATUS", payload: true })
          dispatch({ type: "SET_ERROR", payload: null })
          isConnectingRef.current = false
        })

        socket.on("reconnect_error", (error) => {
          console.error("🔄 Reconnection failed:", error.message)
        })

        socket.on("reconnect_failed", () => {
          console.error("❌ All reconnection attempts failed")
          isConnectingRef.current = false
          dispatch({
            type: "SET_ERROR",
            payload: "Lost connection to server. Please refresh the page.",
          })
        })
      } catch (error) {
        console.error("Failed to initialize socket:", error)
        isConnectingRef.current = false

        retryCount++
        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
          console.log(`🔄 Retrying in ${delay}ms... (${retryCount}/${maxRetries})`)
          retryTimeout = setTimeout(() => {
            connectSocket()
          }, delay)
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: `Failed to connect: ${error.message}. Please ensure the backend server is running on port 5001.`,
          })
        }
      }
    }

    // Initial connection
    connectSocket()

    return () => {
      console.log("🧹 Cleaning up socket connection...")
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current)
      }
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
      isConnectingRef.current = false
    }
  }, [])

  const value = {
    ...state,
    dispatch,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

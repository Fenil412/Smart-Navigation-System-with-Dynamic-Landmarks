import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"

import connectDB from "./config/database.js"
import routes from "./routes/index.js"
import socketHandler from "./websocket/socketHandler.js"
import GraphService from "./services/GraphService.js"
import EventService from "./services/EventService.js"
import NavigationService from "./services/NavigationService.js"

dotenv.config()

const app = express()
const server = http.createServer(app)

// Enhanced CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^(https?:)?\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
  exposedHeaders: ["Content-Type"],
}

// Apply CORS to Express routes
app.use(cors(corsOptions))
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
  }),
)
app.use(express.json())

// Handle preflight requests
app.options("*", cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Socket.IO with enhanced CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^(https?:)?\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(origin)) {
        return callback(null, true)
      }
      return callback(null, false)
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
  perMessageDeflate: false,
  upgradeTimeout: 30000,
})

io.engine.on("connection_error", (err) => {
  console.error("🔴 Socket.IO Engine Connection Error:", {
    code: err.code,
    message: err.message,
    context: err.context,
  })
})

let serverReady = false

// Routes
app.use("/api", routes)

app.get("/health", (req, res) => {
  res.json({
    status: serverReady ? "ok" : "initializing",
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    database: GraphService.isLoaded ? "loaded" : "not loaded",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

// Initialize Socket.IO
const socketHandlers = socketHandler(io)

// Initialize services with socket handlers
EventService.setSocketHandler(socketHandlers)
NavigationService.setSocketHandler(socketHandlers)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 5001

const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      console.log("📦 Connecting to MongoDB...")
      await connectDB()
      console.log("✅ MongoDB connected")

      // Load graph data on startup
      console.log("📊 Loading graph data...")
      await GraphService.loadGraphFromDatabase()
      console.log("✅ Graph data loaded successfully")
    } else {
      console.warn("")
      console.warn("=".repeat(60))
      console.warn("⚠️  No MONGODB_URI found. Running without database.")
      console.warn("⚠️  Add MONGODB_URI to .env file to enable database features.")
      console.warn("=".repeat(60))
      console.warn("")
    }

    server.listen(PORT, "0.0.0.0", () => {
      serverReady = true

      console.log("")
      console.log("=".repeat(60))
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 WebSocket server ready for connections`)
      console.log(`🌐 CORS enabled for frontend origins`)
      console.log(`🔗 API available at: http://localhost:${PORT}/api`)
      console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/socket.io/`)
      console.log(`💚 Health check: http://localhost:${PORT}/health`)
      console.log("=".repeat(60))
      console.log("")
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server")
  serverReady = false
  io.close(() => {
    console.log("Socket.IO closed")
    server.close(() => {
      console.log("HTTP server closed")
    })
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server")
  serverReady = false
  io.close(() => {
    console.log("Socket.IO closed")
    server.close(() => {
      console.log("HTTP server closed")
      process.exit(0)
    })
  })
})

startServer()

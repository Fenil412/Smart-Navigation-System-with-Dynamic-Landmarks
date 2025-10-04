"use client"

import { useEffect } from "react"
import MapView from "./components/MapView"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import EventPanel from "./components/EventPanel"
import { useNavigationStore } from "./store/navigationStore"
import { socketService } from "./services/socketService"

function App() {
  const { setConnectionStatus, setGraphData, addEvent } = useNavigationStore()

  useEffect(() => {
    console.log("[v0] Initializing app and socket connection...")

    // Initialize socket connection
    socketService.connect()

    const statusInterval = setInterval(() => {
      const status = socketService.getConnectionState()
      setConnectionStatus(status)
    }, 1000)

    // Listen for connection status
    socketService.on("connect", () => {
      console.log("[v0] ✅ Connected to server")
      setConnectionStatus("connected")

      // Request graph data on connection
      socketService.requestGraphData()
    })

    socketService.on("disconnect", () => {
      console.log("[v0] ❌ Disconnected from server")
      setConnectionStatus("disconnected")
    })

    socketService.on("connection_confirmed", (data) => {
      console.log("[v0] 🔌 Connection confirmed:", data)
    })

    socketService.on("graph_data", (data) => {
      console.log("[v0] 📊 Graph data received:", data)
      setGraphData(data)
    })

    socketService.on("event_broadcast", (event) => {
      console.log("[v0] 📢 Event broadcast received:", event)
      addEvent(event)
    })

    return () => {
      clearInterval(statusInterval)
      socketService.off("event_broadcast")
      socketService.disconnect()
    }
  }, [setConnectionStatus, setGraphData, addEvent])

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative order-first lg:order-none">
          <MapView />
        </div>
        <EventPanel />
      </div>
    </div>
  )
}

export default App

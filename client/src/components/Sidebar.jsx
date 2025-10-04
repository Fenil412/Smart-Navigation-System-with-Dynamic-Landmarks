"use client"

import { useState } from "react"
import { MapPin, Navigation, Settings, Play, Square } from "lucide-react"
import { useNavigationStore } from "../store/navigationStore"
import { apiService } from "../services/apiService"
import { socketService } from "../services/socketService"

export default function Sidebar() {
  const {
    graphData,
    currentRoute,
    setCurrentRoute,
    setSelectedAlgorithm,
    selectedAlgorithm,
    setStartCoords,
    setEndCoords,
    startCoords: storeStartCoords,
    endCoords: storeEndCoords,
  } = useNavigationStore()
  const [startCoords, setLocalStartCoords] = useState({ lat: "12.9716", lng: "77.5946" })
  const [endCoords, setLocalEndCoords] = useState({ lat: "12.9700", lng: "77.5920" })
  const [loading, setLoading] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const algorithms = [
    { value: "dijkstra", label: "Dijkstra", description: "Shortest path" },
    { value: "astar", label: "A* Algorithm", description: "Heuristic search" },
    { value: "dstar_lite", label: "D* Lite", description: "Dynamic replanning" },
  ]

  const handleCalculateRoute = async () => {
    setLoading(true)
    try {
      setStartCoords(startCoords)
      setEndCoords(endCoords)

      const result = await apiService.calculateRoute({
        startLat: startCoords.lat,
        startLng: startCoords.lng,
        endLat: endCoords.lat,
        endLng: endCoords.lng,
        algorithm: selectedAlgorithm,
      })

      if (result.status === "success") {
        setCurrentRoute(result.data)
        console.log("[v0] ✅ Route calculated:", result.data)
      }
    } catch (error) {
      console.error("[v0] ❌ Route calculation failed:", error)
      alert("Failed to calculate route: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSimulation = () => {
    if (currentRoute?.routeId) {
      console.log("[v0] 🚗 Starting vehicle simulation for route:", currentRoute.routeId)
      socketService.startVehicleSimulation(currentRoute.routeId, 2000)
      setIsSimulating(true)
    }
  }

  const handleStopSimulation = () => {
    if (currentRoute?.routeId) {
      console.log("[v0] 🛑 Stopping vehicle simulation for route:", currentRoute.routeId)
      socketService.stopVehicleSimulation(currentRoute.routeId)
      setIsSimulating(false)
    }
  }

  const formatTime = (seconds) => {
    // If the time seems unrealistic (more than 24 hours for short distances),
    // recalculate assuming distance was in meters not km
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDistance = (distance) => {
    // Backend returns distance in meters
    const km = (distance / 1000).toFixed(2)
    return `${km} km`
  }

  return (
    <div className="w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          Route Planning
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
        {/* Start Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-success" />
            Start Location
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Latitude"
              value={startCoords.lat}
              onChange={(e) => setLocalStartCoords({ ...startCoords, lat: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={startCoords.lng}
              onChange={(e) => setLocalStartCoords({ ...startCoords, lng: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* End Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-danger" />
            End Location
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Latitude"
              value={endCoords.lat}
              onChange={(e) => setLocalEndCoords({ ...endCoords, lat: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <input
              type="text"
              placeholder="Longitude"
              value={endCoords.lng}
              onChange={(e) => setLocalEndCoords({ ...endCoords, lng: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Settings className="w-4 h-4 text-secondary" />
            Algorithm
          </label>
          <div className="space-y-2">
            {algorithms.map((algo) => (
              <label
                key={algo.value}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedAlgorithm === algo.value
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  value={algo.value}
                  checked={selectedAlgorithm === algo.value}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{algo.label}</div>
                  <div className="text-xs text-gray-500">{algo.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculateRoute}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Navigation className="w-5 h-5" />
          {loading ? "Calculating..." : "Calculate Route"}
        </button>

        {/* Route Info */}
        {currentRoute && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
            <h3 className="font-semibold text-gray-900">Route Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Algorithm:</span>
                <span className="font-medium text-gray-900 capitalize">{currentRoute.algorithm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium text-gray-900">{formatDistance(currentRoute.totalDistance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Time:</span>
                <span className="font-medium text-gray-900">{formatTime(currentRoute.estimatedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Path Nodes:</span>
                <span className="font-medium text-gray-900">{currentRoute.path?.length || 0}</span>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="pt-3 border-t border-gray-200">
              {!isSimulating ? (
                <button
                  onClick={handleStartSimulation}
                  className="w-full bg-success text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Simulation
                </button>
              ) : (
                <button
                  onClick={handleStopSimulation}
                  className="w-full bg-danger text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop Simulation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Graph Stats */}
        {graphData && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-2 border border-blue-200">
            <h3 className="font-semibold text-gray-900 text-sm">Network Stats</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Nodes</div>
                <div className="text-lg font-bold text-primary">{graphData.nodes?.length || 0}</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="text-gray-600">Edges</div>
                <div className="text-lg font-bold text-primary">{graphData.edges?.length || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, CircleMarker, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import { useNavigationStore } from "../store/navigationStore"
import { socketService } from "../services/socketService"

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Custom icons
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const vehicleIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapController({ currentRoute, startCoords, endCoords, routeCoordinates }) {
  const map = useMap()

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates)
      map.fitBounds(bounds, { padding: [60, 60] })
    } else if (startCoords && endCoords) {
      const bounds = L.latLngBounds([
        [Number.parseFloat(startCoords.lat), Number.parseFloat(startCoords.lng)],
        [Number.parseFloat(endCoords.lat), Number.parseFloat(endCoords.lng)],
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [currentRoute, startCoords, endCoords, routeCoordinates, map])

  return null
}

export default function MapView() {
  const {
    graphData,
    currentRoute,
    events,
    vehiclePosition,
    setVehiclePosition,
    showAllEvents,
    startCoords,
    endCoords,
  } = useNavigationStore()
  const center = [12.9716, 77.5946]

  useEffect(() => {
    // Listen for vehicle position updates
    const onVehicleUpdate = (data) => {
      // Accept both raw {latitude, longitude} or {position:{latitude,longitude}}
      const pos = data?.position || data
      if (pos && typeof pos.latitude === "number" && typeof pos.longitude === "number") {
        setVehiclePosition({ latitude: pos.latitude, longitude: pos.longitude, ...data })
      }
    }

    const onSimulationCompleted = () => {
      console.log("[v0] ✅ Simulation completed")
    }

    socketService.on("vehicle_position_update", onVehicleUpdate)
    socketService.on("simulation_completed", onSimulationCompleted)

    return () => {
      socketService.off("vehicle_position_update", onVehicleUpdate)
      socketService.off("simulation_completed", onSimulationCompleted)
    }
  }, [setVehiclePosition])

  // Convert path to coordinates for polyline
  const getRouteCoordinates = () => {
    if (!currentRoute || !currentRoute.path || !graphData) return []

    const coords = []

    // Add start location
    if (currentRoute.startLocation) {
      coords.push([currentRoute.startLocation.latitude, currentRoute.startLocation.longitude])
    }

    // Add intermediate nodes
    currentRoute.path.forEach((segment) => {
      const node = graphData.nodes?.find((n) => n.nodeId === segment.toNode)
      if (node) {
        coords.push([node.latitude, node.longitude])
      }
    })

    return coords
  }

  const routeCoordinates = getRouteCoordinates()

  // Build ordered route nodes for markers/labels
  const getRouteNodes = () => {
    if (!currentRoute || !currentRoute.path || !graphData) return []

    const nodes = []
    if (currentRoute.startLocation && currentRoute.startNode) {
      nodes.push({
        nodeId: currentRoute.startNode,
        latitude: currentRoute.startLocation.latitude,
        longitude: currentRoute.startLocation.longitude,
      })
    }

    currentRoute.path.forEach((segment) => {
      const node = graphData.nodes?.find((n) => n.nodeId === segment.toNode)
      if (node) {
        nodes.push({ nodeId: node.nodeId, latitude: node.latitude, longitude: node.longitude })
      }
    })

    return nodes
  }

  const routeNodes = getRouteNodes()

  useEffect(() => {
    console.log("[v0] 👁️ Event visibility changed:", showAllEvents ? "showing" : "hiding", events.length, "events")
  }, [showAllEvents, events.length])

  return (
    <MapContainer
      center={center}
      zoom={13}
      className="h-full w-full"
      zoomControl={true}
      minZoom={2}
      maxZoom={19}
      worldCopyJump={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        minZoom={2}
        noWrap={false}
      />

      {/* Draw all nodes from graph */}
      {graphData?.nodes?.map((node) => (
        <Circle
          key={node.nodeId}
          center={[node.latitude, node.longitude]}
          radius={30}
          pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.4 }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{node.nodeId}</div>
              <div className="text-xs text-gray-600">
                {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Draw all edges from graph */}
      {graphData?.edges?.map((edge) => {
        const fromNode = graphData.nodes?.find((n) => n.nodeId === edge.fromNode)
        const toNode = graphData.nodes?.find((n) => n.nodeId === edge.toNode)

        if (fromNode && toNode) {
          return (
            <Polyline
              key={edge.edgeId}
              positions={[
                [fromNode.latitude, fromNode.longitude],
                [toNode.latitude, toNode.longitude],
              ]}
              pathOptions={{ color: "#cbd5e1", weight: 2, opacity: 0.5 }}
            />
          )
        }
        return null
      })}

      {routeCoordinates.length > 0 && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "#2563eb",
            weight: 6,
            opacity: 0.95,
          }}
        />
      )}

      {/* Highlight path nodes in order */}
      {routeNodes.map((node, index) => (
        <CircleMarker
          key={`route-node-${node.nodeId}`}
          center={[node.latitude, node.longitude]}
          radius={6}
          pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 1 }}
        >
          <Tooltip direction="top" offset={[0, -6]} opacity={0.9} permanent={false}>
            <div className="text-xs font-medium">
              {index + 1}. {node.nodeId}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Start marker */}
      {currentRoute?.startLocation && (
        <Marker position={[currentRoute.startLocation.latitude, currentRoute.startLocation.longitude]} icon={startIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-green-600">Start Point</div>
              <div className="text-xs text-gray-600">{currentRoute.startNode}</div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* End marker */}
      {currentRoute?.endLocation && (
        <Marker position={[currentRoute.endLocation.latitude, currentRoute.endLocation.longitude]} icon={endIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-red-600">End Point</div>
              <div className="text-xs text-gray-600">{currentRoute.endNode}</div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Vehicle position */}
      {vehiclePosition && (
        <Marker position={[vehiclePosition.latitude, vehiclePosition.longitude]} icon={vehicleIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold text-blue-600">Vehicle</div>
              <div className="text-xs text-gray-600">Current: {vehiclePosition.currentNode}</div>
            </div>
          </Popup>
        </Marker>
      )}

      {showAllEvents &&
        events.length > 0 &&
        events.map((event) => {
          console.log("[v0] 📍 Rendering event on map:", event.eventId, event.type)
          return (
            <Circle
              key={event.eventId}
              center={[event.location.latitude, event.location.longitude]}
              radius={event.radius}
              pathOptions={{
                color: event.severity === "high" ? "#ef4444" : event.severity === "medium" ? "#f59e0b" : "#3b82f6",
                fillColor: event.severity === "high" ? "#ef4444" : event.severity === "medium" ? "#f59e0b" : "#3b82f6",
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold capitalize">{event.type.replace("_", " ")}</div>
                  <div className="text-xs text-gray-600">{event.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Severity: {event.severity}</div>
                </div>
              </Popup>
            </Circle>
          )
        })}

      <MapController
        currentRoute={currentRoute}
        startCoords={startCoords}
        endCoords={endCoords}
        routeCoordinates={routeCoordinates}
      />
    </MapContainer>
  )
}

"use client"

import { useState } from "react"
import { useApp } from "../context/AppContext"
import MapContainer from "./map/MapContainer"
import RouteMarkers from "./map/RouteMarkers"
import RoutePolyline from "./map/RoutePolyline"
import VehicleMarker from "./map/VehicleMarker"
import EventMarkers from "./map/EventMarkers"
import Sidebar from "./ui/Sidebar"
import MapControls from "./ui/MapControls"
import StatusBar from "./ui/StatusBar"
import ConnectionStatus from "./ui/ConnectionStatus"
import MobileMenu from "./ui/MobileMenu"

const MainApp = () => {
  const { state, dispatch } = useApp()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Provide default values if state is not available yet
  const mapCenter = state?.mapCenter || [12.9716, 77.5946]
  const zoom = state?.zoom || 13

  // Handle map clicks to set points
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng

    // Simple alternating between start and end points
    if (!state?.startPoint) {
      dispatch({
        type: "SET_START_POINT",
        payload: { lat, lng },
      })
      dispatch({ type: "SET_ERROR", payload: null })
    } else if (!state?.endPoint) {
      dispatch({
        type: "SET_END_POINT",
        payload: { lat, lng },
      })
      dispatch({ type: "SET_ERROR", payload: null })
    } else {
      // If both points are set, update start point
      dispatch({
        type: "SET_START_POINT",
        payload: { lat, lng },
      })
      dispatch({ type: "SET_END_POINT", payload: null })
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Connection Status Indicator */}
      <ConnectionStatus />

      {/* Desktop Sidebar */}
      <div className="hide-mobile">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <div className="show-mobile">
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={zoom} onClick={handleMapClick}>
          <RouteMarkers />
          <RoutePolyline />
          <VehicleMarker />
          <EventMarkers />
        </MapContainer>

        <MapControls onMenuClick={() => setIsMobileMenuOpen(true)} />
        <StatusBar />
      </div>
    </div>
  )
}

export default MainApp

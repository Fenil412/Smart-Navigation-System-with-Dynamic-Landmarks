import React from 'react';
import { useApp } from '../context/AppContext';
import MapContainer from './map/MapContainer';
import RouteMarkers from './map/RouteMarkers';
import RoutePolyline from './map/RoutePolyline';
import VehicleMarker from './map/VehicleMarker';
import EventMarkers from './map/EventMarkers';
import Sidebar from './ui/Sidebar';
import MapControls from './ui/MapControls';
import StatusBar from './ui/StatusBar';

const MainApp = () => {
  const { state } = useApp();

  // Provide default values if state is not available yet
  const mapCenter = state?.mapCenter || [12.9716, 77.5946];
  const zoom = state?.zoom || 13;

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={zoom}>
          <RouteMarkers />
          <RoutePolyline />
          <VehicleMarker />
          <EventMarkers />
        </MapContainer>
        
        <MapControls />
        <StatusBar />
      </div>
    </div>
  );
};

export default MainApp;
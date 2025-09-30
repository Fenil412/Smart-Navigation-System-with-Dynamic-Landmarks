import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

// Custom vehicle icon
const vehicleIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#dc2626" stroke="#fff" stroke-width="2"/>
      <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const VehicleMarker = () => {
  const { state } = useApp();

  if (!state?.vehiclePosition?.position) {
    return null;
  }

  const { position, currentSegment, progress } = state.vehiclePosition;

  return (
    <Marker 
      position={[position.latitude, position.longitude]} 
      icon={vehicleIcon}
    >
      <Popup>
        <div className="text-center">
          <strong>Vehicle Position</strong>
          <br />
          Segment: {currentSegment + 1}
          <br />
          Progress: {Math.round(progress * 100)}%
          <br />
          Lat: {position.latitude.toFixed(6)}
          <br />
          Lng: {position.longitude.toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
};

export default VehicleMarker;
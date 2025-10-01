import React from 'react';
import { MapContainer as LeafletMap, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Map events component
const MapEvents = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e);
      }
    },
  });
  return null;
};

const MapContainer = ({ children, center, zoom, onClick }) => {
  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onClick={onClick} />
      {children}
    </LeafletMap>
  );
};

export default MapContainer;
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RouteMarkers = () => {
  const { state } = useApp();

  if (!state?.startPoint && !state?.endPoint) {
    return null;
  }

  return (
    <>
      {state.startPoint && (
        <Marker position={[state.startPoint.lat, state.startPoint.lng]} icon={startIcon}>
          <Popup>
            <div className="text-center">
              <strong>Start Point</strong>
              <br />
              Lat: {state.startPoint.lat.toFixed(6)}
              <br />
              Lng: {state.startPoint.lng.toFixed(6)}
            </div>
          </Popup>
        </Marker>
      )}
      
      {state.endPoint && (
        <Marker position={[state.endPoint.lat, state.endPoint.lng]} icon={endIcon}>
          <Popup>
            <div className="text-center">
              <strong>End Point</strong>
              <br />
              Lat: {state.endPoint.lat.toFixed(6)}
              <br />
              Lng: {state.endPoint.lng.toFixed(6)}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default RouteMarkers;
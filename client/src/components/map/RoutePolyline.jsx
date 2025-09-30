import React from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { useApp } from '../../context/AppContext';

const RoutePolyline = () => {
  const { state } = useApp();

  if (!state?.currentRoute?.path) {
    return null;
  }

  // Convert route path to LatLng array
  const routePositions = state.currentRoute.path.map(segment => {
    const fromNode = state.currentRoute.path.find(s => s.toNode === segment.fromNode) || segment;
    return [fromNode.edgeData?.latitude || 0, fromNode.edgeData?.longitude || 0];
  });

  // Add the final position
  const lastSegment = state.currentRoute.path[state.currentRoute.path.length - 1];
  if (lastSegment) {
    routePositions.push([lastSegment.edgeData?.latitude || 0, lastSegment.edgeData?.longitude || 0]);
  }

  const getRouteColor = (algorithm) => {
    switch (algorithm) {
      case 'dijkstra': return '#3b82f6'; // blue
      case 'astar': return '#10b981'; // green
      case 'dstar_lite': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  };

  return (
    <Polyline
      positions={routePositions}
      color={getRouteColor(state.currentRoute.algorithm)}
      weight={6}
      opacity={0.7}
    >
      <Popup>
        <div className="text-center">
          <strong>Route Details</strong>
          <br />
          Algorithm: {state.currentRoute.algorithm.toUpperCase()}
          <br />
          Distance: {(state.currentRoute.totalDistance / 1000).toFixed(2)} km
          <br />
          Segments: {state.currentRoute.path.length}
        </div>
      </Popup>
    </Polyline>
  );
};

export default RoutePolyline;
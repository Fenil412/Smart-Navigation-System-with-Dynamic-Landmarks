import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';

// Event type icons
const eventIcons = {
  traffic_jam: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 17H20V11H4V17H6V15H18V17Z" fill="#dc2626"/>
        <path d="M8 13H10V15H8V13Z" fill="#fff"/>
        <path d="M14 13H16V15H14V13Z" fill="#fff"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }),
  road_closure: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#ef4444"/>
        <path d="M8 8L16 16M16 8L8 16" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }),
  accident: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L1 21H23L12 2Z" fill="#f59e0b"/>
        <path d="M12 8V14M12 16V18" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }),
  construction: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L1 21H23L12 2Z" fill="#f59e0b"/>
        <path d="M12 8V14M12 16V18" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
};

const EventMarkers = () => {
  const { state } = useApp();

  if (!state?.dynamicEvents || state.dynamicEvents.length === 0) {
    return null;
  }

  return (
    <>
      {state.dynamicEvents
        .filter(event => event.isActive)
        .map((event, index) => (
          <Marker
            key={event.eventId || index}
            position={[event.location.latitude, event.location.longitude]}
            icon={eventIcons[event.type] || eventIcons.traffic_jam}
          >
            <Popup>
              <div className="text-center">
                <strong className="capitalize">{event.type.replace('_', ' ')}</strong>
                <br />
                Severity: <span className="capitalize">{event.severity}</span>
                <br />
                {event.description && (
                  <>
                    Description: {event.description}
                    <br />
                  </>
                )}
                Radius: {event.radius}m
                <br />
                Active: {event.isActive ? 'Yes' : 'No'}
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
};

export default EventMarkers;
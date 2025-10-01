import { useState } from 'react';
import { useApp } from '../context/AppContext';

export const useNavigation = () => {
  const { state, dispatch } = useApp();
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRoute = async () => {
    if (!state?.startPoint || !state?.endPoint) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select both start and end points' });
      return;
    }

    setIsCalculating(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('🔄 Calculating route...', {
        start: state.startPoint,
        end: state.endPoint,
        algorithm: state.selectedAlgorithm
      });

      const response = await fetch('/api/routes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startLat: state.startPoint.lat,
          startLng: state.startPoint.lng,
          endLat: state.endPoint.lat,
          endLng: state.endPoint.lng,
          algorithm: state.selectedAlgorithm,
          options: state.routeOptions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Route calculation response:', data);

      if (data.status === 'success') {
        dispatch({ type: 'SET_CURRENT_ROUTE', payload: data.data.route });
        
        // Join the route room for real-time updates if socket is connected
        if (state.socket?.connected) {
          state.socket.emit('join_route', data.data.route.routeId);
        }
        
        return data.data.route;
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('❌ Route calculation error:', error);
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Cannot connect to server. Please ensure the backend is running on port 5000.'
        : error.message;
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      setIsCalculating(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to create event');
      }

      const data = await response.json();
      return data.event;
    } catch (error) {
      console.error('Event creation error:', error);
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Cannot connect to server. Event features disabled.'
        : error.message;
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    }
  };

  const getActiveEvents = async () => {
    try {
      const response = await fetch('/api/events/active');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || 'Failed to fetch events');
      }

      const data = await response.json();
      dispatch({ type: 'SET_ACTIVE_EVENTS', payload: data.events || [] });
      return data.events;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  };

  const startSimulation = () => {
    if (!state?.activeRouteId) {
      dispatch({ type: 'SET_ERROR', payload: 'No active route to simulate' });
      return;
    }

    if (state.socket?.connected) {
      state.socket.emit('start_vehicle_simulation', {
        routeId: state.activeRouteId,
        updateInterval: 2000
      });
      dispatch({ type: 'SET_SIMULATION_STATUS', payload: true });
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Cannot start simulation: No server connection' });
    }
  };

  const stopSimulation = () => {
    if (state?.activeRouteId && state.socket?.connected) {
      state.socket.emit('stop_vehicle_simulation', state.activeRouteId);
    }
    dispatch({ type: 'SET_SIMULATION_STATUS', payload: false });
    dispatch({ type: 'SET_VEHICLE_POSITION', payload: null });
  };

  const clearRoute = () => {
    if (state?.activeRouteId && state.socket?.connected) {
      state.socket.emit('leave_route', state.activeRouteId);
    }
    stopSimulation();
    dispatch({ type: 'CLEAR_ROUTE' });
  };

  // Manual vehicle position update (works without WebSocket)
  const updateVehiclePosition = (position) => {
    dispatch({ type: 'SET_VEHICLE_POSITION', payload: position });
  };

  return {
    calculateRoute,
    createEvent,
    getActiveEvents,
    startSimulation,
    stopSimulation,
    clearRoute,
    updateVehiclePosition,
    isCalculating
  };
};
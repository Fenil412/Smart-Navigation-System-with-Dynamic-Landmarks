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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate route');
      }

      if (data.status === 'success') {
        dispatch({ type: 'SET_CURRENT_ROUTE', payload: data.data.route });
        
        // Join the route room for real-time updates
        if (state.socket) {
          state.socket.emit('join_route', data.data.route.routeId);
        }
        
        return data.data.route;
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event');
      }

      return data.event;
    } catch (error) {
      console.error('Event creation error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  };

  const startSimulation = () => {
    if (!state?.activeRouteId) {
      dispatch({ type: 'SET_ERROR', payload: 'No active route to simulate' });
      return;
    }

    if (state.socket) {
      state.socket.emit('start_vehicle_simulation', {
        routeId: state.activeRouteId,
        updateInterval: 2000
      });
    }

    dispatch({ type: 'SET_SIMULATION_STATUS', payload: true });
  };

  const stopSimulation = () => {
    if (state?.activeRouteId && state.socket) {
      state.socket.emit('stop_vehicle_simulation', state.activeRouteId);
    }
    dispatch({ type: 'SET_SIMULATION_STATUS', payload: false });
    dispatch({ type: 'SET_VEHICLE_POSITION', payload: null });
  };

  const clearRoute = () => {
    if (state?.activeRouteId && state.socket) {
      state.socket.emit('leave_route', state.activeRouteId);
    }
    stopSimulation();
    dispatch({ type: 'CLEAR_ROUTE' });
  };

  return {
    calculateRoute,
    createEvent,
    startSimulation,
    stopSimulation,
    clearRoute,
    isCalculating
  };
};
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();

const initialState = {
  // Map state
  mapCenter: [12.9716, 77.5946], // Bangalore coordinates
  zoom: 13,
  
  // Route state
  startPoint: null,
  endPoint: null,
  currentRoute: null,
  activeRouteId: null,
  
  // Algorithm state
  selectedAlgorithm: 'astar',
  routeOptions: {
    avoidHighways: false,
    preferMainRoads: false
  },
  
  // Events state
  activeEvents: [],
  dynamicEvents: [],
  
  // Vehicle state
  vehiclePosition: null,
  isSimulating: false,
  
  // UI state
  isLoading: false,
  error: null,
  sidebarOpen: true,
  
  // Socket state
  socket: null,
  isConnected: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_START_POINT':
      return { ...state, startPoint: action.payload };
    
    case 'SET_END_POINT':
      return { ...state, endPoint: action.payload };
    
    case 'SET_CURRENT_ROUTE':
      return { 
        ...state, 
        currentRoute: action.payload,
        activeRouteId: action.payload?.routeId || null,
        error: null 
      };
    
    case 'SET_SELECTED_ALGORITHM':
      return { ...state, selectedAlgorithm: action.payload };
    
    case 'SET_ROUTE_OPTIONS':
      return { ...state, routeOptions: { ...state.routeOptions, ...action.payload } };
    
    case 'SET_ACTIVE_EVENTS':
      return { ...state, activeEvents: action.payload };
    
    case 'ADD_DYNAMIC_EVENT':
      return { ...state, dynamicEvents: [...state.dynamicEvents, action.payload] };
    
    case 'SET_VEHICLE_POSITION':
      return { ...state, vehiclePosition: action.payload };
    
    case 'SET_SIMULATION_STATUS':
      return { ...state, isSimulating: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case 'CLEAR_ROUTE':
      return { 
        ...state, 
        currentRoute: null, 
        activeRouteId: null, 
        vehiclePosition: null,
        isSimulating: false 
      };
    
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize socket connection
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    dispatch({ type: 'SET_SOCKET', payload: socket });

    socket.on('connect', () => {
      console.log('Connected to server');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
    });

    socket.on('route_updated', (updatedRoute) => {
      console.log('Route updated:', updatedRoute);
      dispatch({ type: 'SET_CURRENT_ROUTE', payload: updatedRoute });
    });

    socket.on('new_event', (event) => {
      console.log('New event received:', event);
      dispatch({ type: 'ADD_DYNAMIC_EVENT', payload: event });
      
      // Show notification
      if (event.isActive) {
        showNotification(`New ${event.type} event detected!`);
      }
    });

    socket.on('vehicle_position_update', (positionData) => {
      console.log('Vehicle position update:', positionData);
      dispatch({ type: 'SET_VEHICLE_POSITION', payload: positionData });
    });

    socket.on('graph_data', (graphData) => {
      console.log('Graph data received:', graphData);
      // You can store this in context if needed for visualization
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      dispatch({ type: 'SET_ERROR', payload: 'Disconnected from server' });
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to server' });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const showNotification = (message) => {
    // Simple browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Smart Navigation', { body: message });
    } else if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Smart Navigation', { body: message });
        }
      });
    }
  };

  const value = {
    ...state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
import React from 'react';
import { AlertCircle, Navigation, Car, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const StatusBar = () => {
  const { state } = useApp();

  // Safe access to state properties
  const isConnected = state?.isConnected || false;
  const currentRoute = state?.currentRoute || null;
  const isSimulating = state?.isSimulating || false;
  const dynamicEvents = state?.dynamicEvents || [];
  const error = state?.error || null;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-1000">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi size={16} className="text-green-500" />
            ) : (
              <WifiOff size={16} className="text-red-500" />
            )}
            <span className={isConnected ? "text-green-600" : "text-red-600"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Route Status */}
          <div className="flex items-center gap-2">
            <Navigation size={16} className="text-gray-500" />
            <span className="text-gray-600">
              {currentRoute ? 'Route Active' : 'No Route'}
            </span>
          </div>

          {/* Simulation Status */}
          <div className="flex items-center gap-2">
            <Car size={16} className="text-gray-500" />
            <span className="text-gray-600">
              {isSimulating ? 'Simulating' : 'No Simulation'}
            </span>
          </div>

          {/* Events Status */}
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-gray-500" />
            <span className="text-gray-600">
              {dynamicEvents.filter(e => e.isActive).length} Active Events
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
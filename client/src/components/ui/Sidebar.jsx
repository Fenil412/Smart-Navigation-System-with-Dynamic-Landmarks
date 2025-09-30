import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Play, 
  Square, 
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '../../hooks/useNavigation';

const Sidebar = () => {
  const { state, dispatch } = useApp();
  const { 
    calculateRoute, 
    startSimulation, 
    stopSimulation, 
    clearRoute, 
    isCalculating,
    createEvent 
  } = useNavigation();

  // Safe access to state properties
  const startPoint = state?.startPoint || null;
  const endPoint = state?.endPoint || null;
  const selectedAlgorithm = state?.selectedAlgorithm || 'astar';
  const routeOptions = state?.routeOptions || { avoidHighways: false, preferMainRoads: false };
  const currentRoute = state?.currentRoute || null;
  const isSimulating = state?.isSimulating || false;
  const dynamicEvents = state?.dynamicEvents || [];
  const sidebarOpen = state?.sidebarOpen !== false;

  const handleSetStartPoint = () => {
    dispatch({ 
      type: 'SET_ERROR', 
      payload: 'Click on the map to set start point' 
    });
  };

  const handleSetEndPoint = () => {
    dispatch({ 
      type: 'SET_ERROR', 
      payload: 'Click on the map to set end point' 
    });
  };

  const handleAlgorithmChange = (algorithm) => {
    dispatch({ type: 'SET_SELECTED_ALGORITHM', payload: algorithm });
  };

  const handleCreateEvent = async (type) => {
    if (!startPoint) {
      dispatch({ type: 'SET_ERROR', payload: 'Please set a start point first' });
      return;
    }

    const eventData = {
      type,
      severity: 'medium',
      location: {
        latitude: startPoint.lat,
        longitude: startPoint.lng
      },
      radius: 300,
      description: `${type.replace('_', ' ')} event`
    };

    await createEvent(eventData);
  };

  return (
    <div className={`bg-white shadow-xl h-full flex flex-col transition-all duration-300 ${
      sidebarOpen ? 'w-80' : 'w-0'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Smart Navigation</h1>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Route Points */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Route Points</h2>
          
          <div className="space-y-2">
            <button
              onClick={handleSetStartPoint}
              className="w-full flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <MapPin className="text-green-600" size={20} />
              <span className="text-green-700">
                {startPoint ? 'Start Point Set' : 'Set Start Point'}
              </span>
            </button>

            <button
              onClick={handleSetEndPoint}
              className="w-full flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <MapPin className="text-red-600" size={20} />
              <span className="text-red-700">
                {endPoint ? 'End Point Set' : 'Set End Point'}
              </span>
            </button>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Algorithm</h2>
          <div className="grid grid-cols-1 gap-2">
            {['astar', 'dijkstra', 'dstar_lite'].map((algorithm) => (
              <button
                key={algorithm}
                onClick={() => handleAlgorithmChange(algorithm)}
                className={`p-3 rounded-lg border transition-colors ${
                  selectedAlgorithm === algorithm
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {algorithm.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Route Options */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Options</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={routeOptions.avoidHighways}
                onChange={(e) => dispatch({
                  type: 'SET_ROUTE_OPTIONS',
                  payload: { avoidHighways: e.target.checked }
                })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Avoid Highways</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={routeOptions.preferMainRoads}
                onChange={(e) => dispatch({
                  type: 'SET_ROUTE_OPTIONS',
                  payload: { preferMainRoads: e.target.checked }
                })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Prefer Main Roads</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={calculateRoute}
              disabled={isCalculating || !startPoint || !endPoint}
              className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Navigation size={18} />
              {isCalculating ? 'Calculating...' : 'Calculate Route'}
            </button>

            {isSimulating ? (
              <button
                onClick={stopSimulation}
                className="flex items-center justify-center gap-2 p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Square size={18} />
                Stop
              </button>
            ) : (
              <button
                onClick={startSimulation}
                disabled={!currentRoute}
                className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Play size={18} />
                Simulate
              </button>
            )}

            <button
              onClick={clearRoute}
              className="flex items-center justify-center gap-2 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors col-span-2"
            >
              <Trash2 size={18} />
              Clear Route
            </button>
          </div>
        </div>

        {/* Dynamic Events */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Dynamic Events</h2>
          <div className="grid grid-cols-2 gap-2">
            {['traffic_jam', 'road_closure', 'accident', 'construction'].map((type) => (
              <button
                key={type}
                onClick={() => handleCreateEvent(type)}
                className="p-2 bg-orange-100 border border-orange-200 rounded hover:bg-orange-200 transition-colors text-sm capitalize"
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Route Info */}
        {currentRoute && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">Route Info</h2>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Algorithm:</span>
                <span className="font-medium capitalize">{currentRoute.algorithm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-medium">{(currentRoute.totalDistance / 1000).toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Segments:</span>
                <span className="font-medium">{currentRoute.path.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
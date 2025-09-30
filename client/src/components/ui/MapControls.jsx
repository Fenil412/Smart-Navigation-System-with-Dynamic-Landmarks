import React from 'react';
import { Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MapControls = () => {
  const { dispatch } = useApp();

  return (
    <div className="absolute top-4 left-4 z-1000">
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      >
        <Menu size={20} className="text-gray-700" />
      </button>
    </div>
  );
};

export default MapControls;
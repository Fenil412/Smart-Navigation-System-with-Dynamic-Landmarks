import React from 'react';
import { AppProvider } from './context/AppContext';
import MainApp from './components/MainApp';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
import React from 'react';
import { AppProvider } from './context/AppContext';
import MainApp from './MainApp';

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Navbar />
      <main>
        {/* This is where the routed content will be displayed */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;
import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <main>
        {/* This is where the routed content will be displayed */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;
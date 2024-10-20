import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main>
        {/* Pass setIsLoggedIn to the Login component */}
        <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
      </main>
    </div>
  );
}

export default App;
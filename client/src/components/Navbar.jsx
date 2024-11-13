import React from 'react';
import { Link } from 'react-router-dom';
import '../styling/Navbar.css';
import Logout from './Logout';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false); // Update login status to false
  };

  return (
    <nav className="navbar">
      {/* Home Button */}
      <div className="nav-section">
        <Link to="/" className="nav-button home-btn">Home</Link>
      </div>

      {/* Locations Button */}
      <div className="nav-section logo">
        <Link to="/location" className="nav-button">Locations</Link>
      </div>

      {/* Map, Login/Register or Logout */}
      <div className="nav-section nav-links">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/register" className="nav-button">Register</Link>
          </>
        ) : (
          <Logout handleLogout={handleLogout} className="nav-button logout-button" />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
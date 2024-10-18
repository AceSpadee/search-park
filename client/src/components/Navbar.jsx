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
      <div className="navbar-left">
        <ul className="nav-links">
          <li>
            <Link to="/map">Map</Link>
          </li>
          {!isLoggedIn && (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="navbar-center">
        <Link to="/location" className="logo">
          Locations
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/" className="home-button">
          Home
        </Link>

        {isLoggedIn && <Logout handleLogout={handleLogout} />}
      </div>
    </nav>
  );
};

export default Navbar;
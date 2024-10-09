import React from 'react';
import '../styling/Navbar.css';

const Navbar = () => {
  return (

<nav className="navbar">
  <div className="navbar-left">
    <ul className="nav-links">
      <li>
        <a href="/map">Map</a>
      </li>
      <li>
        <a href="/login">Login</a>
      </li>
      <li>
        <a href="/register">Register</a>
      </li>
    </ul>
  </div>
  <div className="navbar-center">
    {/* <a href="/location" className="logo">
      locations
    </a> */}
  </div>
  <div className="navbar-right">
    <a href="/" className="home-button">
      Home
    </a>
  </div>
</nav>
);
};

export default Navbar;
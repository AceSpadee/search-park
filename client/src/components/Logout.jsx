import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ handleLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout(); // Call the logout function to clear the token and update state
    navigate('/');  // Redirect the user to the home page after logging out
  };

  return (
    <button onClick={handleLogoutClick}>
      Logout
    </button>
  );
};

export default Logout;
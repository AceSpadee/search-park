import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = ({ handleLogout, className }) => {
  const navigate = useNavigate();

  const onLogout  = () => {
    handleLogout(); // Call the logout function to clear the token and update state
    navigate('/');  // Redirect the user to the home page after logging out
  };

  return (
    <button onClick={onLogout} className={className}>
      Logout
    </button>
  );
};

export default Logout;
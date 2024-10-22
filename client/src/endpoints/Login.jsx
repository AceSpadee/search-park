import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Use useOutletContext to get setIsLoggedIn
import "../styling/Login.css"

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setIsLoggedIn } = useOutletContext(); // Retrieve setIsLoggedIn from Outlet context

  const apiUrl = import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_PROD_BACKEND_URL 
    : import.meta.env.VITE_BACKEND_URL;

  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        setMessage('Invalid credentials. Please try again.');
      } else if (error.response.status === 500) {
        setMessage('Server error occurred. Please try again later.');
      } else {
        setMessage(`Login failed: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      setMessage('No response from server. Please check your internet connection.');
    } else {
      setMessage(`Unexpected error: ${error.message}`);
    }
    console.error('Login error:', error);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        userName: userName.trim(),
        password: password.trim(),
      });

      localStorage.setItem('token', response.data.token);
      setMessage('Login successful!');
      setIsLoggedIn(true); // Update login state to true
      navigate('/location');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="text-center mb-4">Login</h2>
        <input
          type="text"
          className="form-control"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-login">Login</button>
        {message && <p className="text-center mt-3 text-danger">{message}</p>}
      </form>
    </div>
  );
};

export default Login;
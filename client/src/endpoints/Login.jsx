import React, { useState } from 'react';
import api from '../utils/axios'; // Import the centralized Axios instance
import { useNavigate, useOutletContext } from 'react-router-dom';
import "../styling/Login.css";

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setIsLoggedIn } = useOutletContext();

  // Handle errors and display appropriate messages
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

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send login request with credentials
      const response = await api.post('/api/auth/login', {
        userName: userName.trim(),
        password: password.trim(),
      });

      // Store the access token in localStorage
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);

      setMessage('Login successful!');
      setIsLoggedIn(true); // Update login state
      navigate('/location'); // Redirect to the location page
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
import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Use the deployed backend URL from environment variables
  const apiUrl = import.meta.env.VITE_BACKEND_URL;  // For Vite
  // const apiUrl = process.env.REACT_APP_BACKEND_URL;  // For Create React App

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send the login request to the deployed backend
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        userName: userName.trim(),  // Trim input to avoid leading/trailing spaces
        password: password.trim(),
      });

      localStorage.setItem('token', response.data.token);
      setMessage('Login successful!');
    } catch (error) {
      // Handle specific Axios errors
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
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
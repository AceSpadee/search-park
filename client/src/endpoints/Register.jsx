import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Dynamically determine the backend URL based on environment
  const isProduction = import.meta.env.MODE === 'production';
  const apiUrl = isProduction 
    ? import.meta.env.VITE_PROD_BACKEND_URL 
    : import.meta.env.VITE_BACKEND_URL;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Make the API request to register the user
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        firstName,
        lastName,
        userName,
        password,
      });

      // Use the response
      if (response.status === 201) {
        setMessage('User registered successfully!');
        console.log('Registration successful:', response.data);
      } else {
        setMessage('Unexpected response from the server.');
      }
    } catch (error) {
      // Handle specific Axios errors
      if (error.response) {
        if (error.response.status === 400) {
          setMessage('User already exists or invalid data.');
        } else if (error.response.status === 500) {
          setMessage('Server error occurred. Please try again later.');
        } else {
          setMessage(`Error registering user: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        setMessage('No response from server. Please check your internet connection.');
      } else {
        setMessage(`Unexpected error: ${error.message}`);
      }
      console.error('Error registering user:', error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
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
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;
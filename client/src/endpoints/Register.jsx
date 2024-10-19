import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Import useNavigate for redirecting

const Register = () => { // Expect setIsLoggedIn from props
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const { setIsLoggedIn } = useOutletContext();

  // Dynamically determine the backend URL based on environment
  const apiUrl = import.meta.env.MODE === 'production' 
    ? import.meta.env.VITE_PROD_BACKEND_URL 
    : import.meta.env.VITE_BACKEND_URL;

  // Function to handle errors
  const handleError = (error) => {
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
  };

  // Function to handle user registration and auto login
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // First, register the user
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        firstName,
        lastName,
        userName,
        password,
      });

      if (response.status === 201) {
        setMessage('User registered successfully! Logging in...');

        // Automatically log the user in after successful registration
        const loginResponse = await axios.post(`${apiUrl}/api/auth/login`, {
          userName: userName.trim(),
          password: password.trim(),
        });

        // Store the token and update login state
        localStorage.setItem('token', loginResponse.data.token);
        setIsLoggedIn(true); // Update the login state to true
        navigate('/location'); // Redirect to location page after successful login
      }
    } catch (error) {
      handleError(error);
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
import React, { useState } from 'react';
import api from '../utils/axios';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Import useNavigate for redirecting
import "../styling/Register.css"

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const { setIsLoggedIn } = useOutletContext();

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

  // Function to handle user registration and auto-login
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // First, register the user
      const response = await api.post(`/api/auth/register`, {
        firstName,
        lastName,
        userName,
        password,
      });

      if (response.status === 201) {
        setMessage('User registered successfully! Logging in...');
        try {
          const loginResponse = await api.post(`/api/auth/login`, {
            userName: userName.trim(),
            password: password.trim(),
          });

          const { accessToken } = loginResponse.data;
          localStorage.setItem('accessToken', accessToken);
          setIsLoggedIn(true);
          navigate('/location');
        } catch (loginError) {
          setMessage('Registration successful, but login failed. Please try logging in manually.');
          console.error('Auto-login error:', loginError);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form w-50 mx-auto">
        <h2 className="text-center mb-4">Register</h2>
        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-register w-100">
          Register
        </button>
      </form>
      {message && <p className="text-center mt-3 text-danger">{message}</p>}
    </div>
  );
};

export default Register;
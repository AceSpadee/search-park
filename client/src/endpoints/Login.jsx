import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/auth/login', {
      userName: userName.trim(),  // Trim input to avoid leading/trailing spaces
      password: password.trim(),
    });

    localStorage.setItem('token', response.data.token);
    setMessage('Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    setMessage('Invalid credentials');
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
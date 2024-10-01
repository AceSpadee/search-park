import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to the Drawing Tracker App!</h1>
      <p style={styles.description}>
        This app allows you to create drawings on a map and store major locations.
        You can start by drawing on the map or viewing your saved drawings.
      </p>
      <div style={styles.buttonContainer}>
        <Link to="/map" style={styles.button}>
          Start Drawing
        </Link>
        <Link to="/drawings" style={styles.button}>
          View Saved Drawings
        </Link>
      </div>
    </div>
  );
};

// Inline styling for simplicity
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: '20px',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1.2rem',
    color: '#fff',
    backgroundColor: '#007BFF',
    textDecoration: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
};

export default HomePage;
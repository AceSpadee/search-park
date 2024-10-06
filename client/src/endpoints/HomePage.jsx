import React from 'react';
import { Link } from 'react-router-dom';
import '../styling/HomePage.css'

const HomePage = () => {
  return (
    <div className='container'>
      <h1 className='title'>Ayo this will help!!!</h1>
      <p className='description'>
        This app allows you to find the park your looking for. hopefully
      </p>
      <div className='button-container'>
        <Link to="/map" className='button'>
          Start Drawing
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
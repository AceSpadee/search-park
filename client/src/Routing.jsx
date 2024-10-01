import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';        // Main App component
import HomePage from './endpoints/HomePage';  // HomePage endpoints
import Drawings from './components/Drawing';   // Drawings component
import DrawingMap from './components/DrawingMap';  // DrawingMap component
import LocationTester from './components/LocationTester';
import LocationTracker from './components/LocationTracker';
// import ErrorPage from './components/ErrorPage';  // Optional: Error page component

// Create the router using React Router v6
const router = createBrowserRouter([
  {
    path: '/',                   // Base path
    element: <App />,            // The App component renders common layout (like Navbar)
    // errorElement: <ErrorPage />,  // Optional: Custom error page
    children: [
      {
        index: true,             // Default route (homepage)
        element: <HomePage />,
      },
      {
        path: 'drawings',        // Path for the drawings component
        element: <Drawings />,
      },
      {
        path: 'map',             // Path for the drawing/map component
        element: <DrawingMap />,
      },
      {
        path: 'LTest',             // Path for the drawing/map component
        element: <LocationTester />,
      },
      {
        path: 'LTracker',             // Path for the drawing/map component
        element: <LocationTracker />,
      },
    ],
  },
]);

// Export the RouterProvider to be used in your app
export default router;
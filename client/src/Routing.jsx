import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';        // Main App component
import HomePage from './endpoints/HomePage';  // HomePage endpoints
import ErrorPage from './endpoints/ErrorPage';  // Optional: Error page component
import Login from './endpoints/Login';
import Register from './endpoints/Register';
import LocationApp from './endpoints/Location';
import GroupMap from './endpoints/GroupMap';
import Mapbox3DMap from './components/Mapbox3DMap';

// Create the router using React Router v6
const router = createBrowserRouter([
  {
    path: '/',                   // Base path
    element: <App />,            // The App component renders common layout (like Navbar)
    errorElement: <ErrorPage />,  // Optional: Custom error page
    children: [
      {
        index: true,             // Default route (homepage)
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'location',
        element: <LocationApp />,
      },
      {
        path: 'groupmap',
        element: <GroupMap />,
      },
      {
        path: 'othermap',
        element: <Mapbox3DMap />,
      },
    ],
  },
]);

// Export the RouterProvider to be used in your app
export default router;
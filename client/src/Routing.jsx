import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';        // Main App component
import HomePage from './endpoints/HomePage';  // HomePage endpoints
import DrawingMap from './components/DrawingMap';  // DrawingMap component
import ErrorPage from './endpoints/ErrorPage';  // Optional: Error page component
import Login from './endpoints/Login';
import Register from './endpoints/Register';

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
        path: 'map',             // Path for the drawing/map component
        element: <DrawingMap />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
]);

// Export the RouterProvider to be used in your app
export default router;
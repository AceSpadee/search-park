import axios from 'axios';

// Dynamically determine the backend URL based on environment
const baseURL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_BACKEND_URL // For production, use this backend URL
    : import.meta.env.VITE_BACKEND_URL;     // For development, use this backend URL

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL, // Automatically prepends this URL to all requests
});

// Add a request interceptor to attach the access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
  if (token) {
    config.headers['x-auth-token'] = token; // Attach the token to the headers
  }
  return config;
});

// Add a response interceptor to handle expired access tokens
api.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 (Unauthorized) and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Make a request to the refresh token endpoint
        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, null, {
          headers: { 'refreshToken': refreshToken },
        });

        const newAccessToken = data.accessToken;

        // Save the new access token in localStorage
        localStorage.setItem('accessToken', newAccessToken);

        // Update the Authorization header and retry the original request
        originalRequest.headers['x-auth-token'] = newAccessToken;

        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);

        // Clear tokens from localStorage if refresh fails and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Redirect to login page
      }
    }

    return Promise.reject(error); // Reject other errors
  }
);

export default api; // Export the Axios instance
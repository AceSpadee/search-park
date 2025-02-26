import axios from 'axios';

// Dynamically determine the backend URL based on environment
const baseURL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PROD_BACKEND_URL
    : import.meta.env.VITE_BACKEND_URL;

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL, // Automatically prepends this URL to all requests
  withCredentials: true, // Include cookies for authentication
});

// Add a request interceptor to attach the access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`; // Attach token to headers
  }
  return config;
});

// Add a response interceptor to handle expired access tokens
api.interceptors.response.use(
  (response) => response, // Pass successful responses through
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 (Unauthorized) and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        // Make a request to the refresh token endpoint
        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, null, {
          withCredentials: true, // Include the HTTP-only cookie
        });

        const newAccessToken = data.accessToken;

        // Save the new access token in localStorage
        localStorage.setItem('accessToken', newAccessToken);

        // Update the Authorization header and retry the original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);

        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Redirect to login page
      }
    }

    return Promise.reject(error); // Reject other errors
  }
);

export default api;
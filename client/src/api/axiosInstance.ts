import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // If we receive a 401 response from the server
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // Using window.location to trigger a full page reload and redirect
      // This is safe since this is an SPA fallback
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

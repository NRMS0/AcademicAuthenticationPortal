import axios from 'axios';

// Automatically use correct baseURL based on environment
const baseURL = import.meta.env.VITE_API_URL + "/api";

console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL, 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
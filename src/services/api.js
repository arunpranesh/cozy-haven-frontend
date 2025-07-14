import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7284',
});

// ✅ Add Authorization header if token exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Auth header:", config.headers.Authorization); // ✅ Keep this for debug
  } else {
    console.warn("No token found in localStorage.");
  }
  return config;
});

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7284',
});

export default api;

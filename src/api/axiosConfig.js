import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Pointing to the new admin-backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('user');
  if (raw) {
    const { token } = JSON.parse(raw) || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
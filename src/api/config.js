const API_URL = 'http://10.10.100.180:5000/api';

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}; 
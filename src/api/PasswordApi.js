import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './apiConfig';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // Tempo limite de 10 segundos
});

// Add interceptor to add token to requests
api.interceptors.request.use(
  async (config) => {
    console.log('Password API Request:', config.method.toUpperCase(), config.url);
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.data) {
      console.log('Request Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => {
    console.log('Password API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status || 'Network Error', error.config?.url);
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Password items API functions
export const createPasswordItem = async (itemData) => {
  try {
    console.log('Creating password item:', itemData.name);
    const response = await api.post('/item', itemData);
    console.log('Password item created successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to create password item:', error.message);
    if (error.response && error.response.data) {
      console.error('Server error message:', error.response.data.message);
      throw error.response.data;
    }
    throw { message: 'Network error or server not responding' };
  }
};

export const getAllPasswordItems = async () => {
  try {
    console.log('Fetching all password items');
    const response = await api.get('/items');
    console.log(`Retrieved ${response.data.length} password items`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch password items:', error.message);
    if (error.response && error.response.data) {
      console.error('Server error message:', error.response.data.message);
      throw error.response.data;
    }
    throw { message: 'Network error or server not responding' };
  }
};

export const deletePasswordItem = async (itemId) => {
  try {
    console.log('Deleting password item with ID:', itemId);
    const response = await api.delete(`/item/${itemId}`);
    console.log('Password item deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to delete password item:', error.message);
    if (error.response && error.response.data) {
      console.error('Server error message:', error.response.data.message);
      throw error.response.data;
    }
    throw { message: 'Network error or server not responding' };
  }
}; 
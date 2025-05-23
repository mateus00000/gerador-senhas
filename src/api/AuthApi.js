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
    console.log('API Request:', config.method.toUpperCase(), config.url);

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
    console.log('API Response:', response.status, response.config.url);
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

// Authentication API functions
export const signUp = async (userData) => {
  try {
    console.log('Trying to sign up with:', userData.email);

    // Validar campos obrigatórios
    if (!userData.name || !userData.email || !userData.password) {
      throw { message: 'Todos os campos são obrigatórios' };
    }

    // Garantir que confirmPassword seja igual à password
    const dataToSend = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.password
    };

    console.log('Sending data to:', `${API_URL}/signup`);
    console.log('Request data:', dataToSend);

    const response = await api.post('/signup', dataToSend);

    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      console.log('Signup successful, token stored');
    }
    return response.data;
  } catch (error) {
    console.error('Signup failed:', error.message);
    if (error.response && error.response.data) {
      console.error('Server error message:', error.response.data.message);
      throw error.response.data;
    }
    throw { message: 'Network error or server not responding' };
  }
};

export const signIn = async (credentials) => {
  try {
    console.log('Trying to sign in with:', credentials.email);
    const response = await api.post('/signin', credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      console.log('Signin successful, token stored');
    }
    return response.data;
  } catch (error) {
    console.error('Signin failed:', error.message);
    if (error.response && error.response.data) {
      console.error('Server error message:', error.response.data.message);
      throw error.response.data;
    }
    throw { message: 'Network error or server not responding' };
  }
};

export const signOut = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const isAuth = !!token;
    console.log('Authentication check:', isAuth ? 'User is authenticated' : 'No authentication token found');
    return isAuth;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}; 
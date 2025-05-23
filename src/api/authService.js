import axios from 'axios';
import { apiConfig } from './config';

const getHeaders = (userId) => ({
  ...apiConfig.headers,
  'user-id': userId,
});

const authService = {
  async register(userData) {
    try {
      const response = await axios.post(`${apiConfig.baseURL}/auth/register`, userData, apiConfig);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error registering user' };
    }
  },

  async login(credentials) {
    try {
      const response = await axios.post(`${apiConfig.baseURL}/auth/login`, credentials, apiConfig);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error logging in' };
    }
  },

  async savePassword(userId, passwordData) {
    try {
      const response = await axios.post(
        `${apiConfig.baseURL}/auth/passwords`,
        passwordData,
        { ...apiConfig, headers: getHeaders(userId) }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error saving password' };
    }
  },

  async getSavedPasswords(userId) {
    try {
      const response = await axios.get(
        `${apiConfig.baseURL}/auth/passwords`,
        { ...apiConfig, headers: getHeaders(userId) }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching saved passwords' };
    }
  },

  async addToHistory(userId, password) {
    try {
      const response = await axios.post(
        `${apiConfig.baseURL}/auth/history`,
        { password },
        { ...apiConfig, headers: getHeaders(userId) }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error adding to history' };
    }
  },

  async getPasswordHistory(userId) {
    try {
      const response = await axios.get(
        `${apiConfig.baseURL}/auth/history`,
        { ...apiConfig, headers: getHeaders(userId) }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching password history' };
    }
  },
};

export default authService; 
import axios from 'axios';
import { API_URL } from './apiConfig';

/**
 * Tests the connection to the API server
 * @returns {Promise<{success: boolean, message: string}>} Result of the test
 */
export const testApiConnection = async () => {
  try {
    const baseUrl = API_URL.replace('/api', '');
    console.log(`Testing connection to: ${baseUrl}`);
    
    const response = await axios.get(baseUrl, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log('API connection test successful');
      return {
        success: true,
        message: 'Connection successful',
        status: response.status,
        data: response.data
      };
    } else {
      console.warn(`API connection test received unexpected status: ${response.status}`);
      return {
        success: false,
        message: `Server responded with status ${response.status}`,
        status: response.status
      };
    }
  } catch (error) {
    console.error('API connection test failed:', error.message);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
}; 
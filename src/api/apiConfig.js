import { Platform } from 'react-native';

// API URL Configuration based on platform
const getApiUrl = () => {
  // Use 10.0.2.2 for Android emulators (this is how Android emulators access the host machine's localhost)
  // Use localhost for web and iOS emulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';
  } else {
    return 'http://localhost:3000/api';
  }
};

export const API_URL = getApiUrl();

// For debugging
console.log(`Using API URL: ${API_URL} for platform: ${Platform.OS}`); 
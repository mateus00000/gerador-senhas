import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signIn, signUp, isAuthenticated } from '../api/AuthApi';
import { clearPasswordHistory } from '../services/storageService';

const AuthContext = createContext({});

// Keys for AsyncStorage
const USER_DATA_KEY = 'userData';
const AUTH_TOKEN_KEY = 'token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (userData && token) {
        console.log('User session found in storage, restoring session...');
        const parsedUserData = JSON.parse(userData);

        setUser({ authenticated: true, ...parsedUserData });
        setSessionData({
          lastLogin: parsedUserData.loginTime ? new Date(parsedUserData.loginTime) : new Date(),
          user: parsedUserData,
          restored: true
        });
      } else {
        console.log('No session found, user needs to log in');
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await signIn(credentials);

      const userData = {
        email: credentials.email,
        loginTime: new Date().toISOString(),
        userId: response.userId || response.id || 'unknown'
      };

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);

      setUser({ authenticated: true, ...userData });
      setSessionData({
        lastLogin: new Date(),
        user: userData
      });

      console.log('Login successful, session data saved');
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await signUp(userData);

      const userInfo = {
        email: userData.email,
        name: userData.name,
        registrationTime: new Date().toISOString(),
        loginTime: new Date().toISOString(),
        userId: response.userId || response.id || 'unknown'
      };

      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userInfo));
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);

      setUser({ authenticated: true, ...userInfo });
      setSessionData({
        lastLogin: new Date(),
        user: userInfo
      });

      console.log('Registration successful, session data saved');
      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user...');

      // Limpar histórico de senhas
      await clearPasswordHistory();

      // Limpar token e dados do usuário do AsyncStorage
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);

      // Limpar dados da sessão da memória
      setSessionData(null);
      setUser(null);

      console.log('Session terminated and data cleared');
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
      return false;
    }
  };

  // Get current session information
  const getSessionInfo = () => {
    return sessionData;
  };

  // Check if current session is active
  const isSessionActive = () => {
    return !!user && user.authenticated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        sessionData,
        getSessionInfo,
        isSessionActive,
        isAuthenticated: !!user && user.authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 
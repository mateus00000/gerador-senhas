import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import SavedPasswordsScreen from './src/screens/SavedPasswordsScreen';
import PasswordHistory from './src/components/password/PasswordHistory';

const Stack = createNativeStackNavigator();

// Routes component with authentication state
const Routes = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [state, setState] = useState({
    initialRoute: null,
    isReady: false
  });

  // Set initial route based on authentication state
  useEffect(() => {
    const route = isAuthenticated ? 'Home' : 'SignIn';
    console.log(`Authentication state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}, setting route to ${route}`);
    setState({
      initialRoute: route,
      isReady: true
    });
  }, [isAuthenticated]);

  if (loading || !state.isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={state.initialRoute}
      >
        {/* Always include all screens, but conditionally set initial route */}
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen} 
          options={{ animationEnabled: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ animationEnabled: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ animationEnabled: false }}
        />
        <Stack.Screen name="SavedPasswords" component={SavedPasswordsScreen} />
        <Stack.Screen name="PasswordHistory" component={PasswordHistory} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

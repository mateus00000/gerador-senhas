import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { testApiConnection } from '../api/apiUtils';
import { API_URL } from '../api/apiConfig';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Test connection when the component mounts
    checkConnection();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && navigation.isFocused()) {
      navigation.navigate('Home');
    }
  }, [isAuthenticated, navigation]);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const result = await testApiConnection();
      setConnectionStatus(result.success ? 'connected' : 'failed');
      setConnectionChecked(true);
      
      if (!result.success) {
        Alert.alert(
          'Problema de Conexão',
          `Não foi possível conectar ao servidor: ${result.message}. \n\nEstamos usando a URL: ${API_URL}\n\nLembre-se que no Android é necessário usar 10.0.2.2 em vez de localhost.`,
          [
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      setConnectionStatus('failed');
      setConnectionChecked(true);
      console.error('Connection check error:', error);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    // Check connection before attempting to sign in
    if (connectionStatus !== 'connected') {
      const shouldContinue = await new Promise(resolve => {
        Alert.alert(
          'Aviso de Conexão',
          'Não foi possível confirmar a conexão com o servidor. Deseja tentar fazer login mesmo assim?',
          [
            { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Testar conexão', onPress: async () => {
              await checkConnection();
              resolve(connectionStatus === 'connected');
            }},
            { text: 'Continuar mesmo assim', onPress: () => resolve(true) },
          ]
        );
      });
      
      if (!shouldContinue) return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      // No need to navigate here, the useEffect will handle it when isAuthenticated changes
    } catch (error) {
      let errorMessage = error.message || 'Erro ao fazer login';
      
      // Add helpful information for connection errors
      if (error.message && error.message.includes('Network Error')) {
        errorMessage = `Erro de conexão com o servidor. Certifique-se de que o servidor está rodando e acessível.\n\nPlatforma: ${Platform.OS}\nURL API: ${API_URL}`;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderConnectionStatus = () => {
    if (connectionStatus === 'checking') {
      return <Text style={styles.connectionChecking}>Verificando conexão...</Text>;
    } else if (connectionStatus === 'connected') {
      return <Text style={styles.connectionSuccess}>Servidor conectado!</Text>;
    } else if (connectionStatus === 'failed') {
      return (
        <TouchableOpacity onPress={checkConnection}>
          <Text style={styles.connectionFailed}>
            Falha na conexão com o servidor. Toque para tentar novamente.
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      {renderConnectionStatus()}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[
          styles.button,
          (!email || !password) && styles.buttonDisabled
        ]}
        onPress={handleSignIn}
        disabled={loading || !email || !password}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('SignUp')}
      >
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#4f4e4e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#212121',
  },
  button: {
    backgroundColor: '#000000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#757575',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  testApiButton: {
    backgroundColor: '#FFAB00',
    marginTop: 20,
  },
  connectionChecking: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#424242',
    fontSize: 14,
  },
  connectionSuccess: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#C8E6C9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  connectionFailed: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: '#FFCDD2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});

export default SignInScreen; 
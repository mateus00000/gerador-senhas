import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { testApiConnection } from '../api/apiUtils';
import { API_URL } from '../api/apiConfig';
import { useAuth } from '../contexts/AuthContext';

const SignupScreen = ({ navigation }) => {
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    // Check connection when the component mounts
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
      console.error('Connection check error:', error);
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

  const handleSignup = async () => {
    // Validações básicas
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Check connection before attempting to sign up
    if (connectionStatus !== 'connected') {
      const shouldContinue = await new Promise(resolve => {
        Alert.alert(
          'Aviso de Conexão',
          'Não foi possível confirmar a conexão com o servidor. Deseja tentar criar a conta mesmo assim?',
          [
            { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
            {
              text: 'Testar conexão', onPress: async () => {
                await checkConnection();
                resolve(connectionStatus === 'connected');
              }
            },
            { text: 'Continuar mesmo assim', onPress: () => resolve(true) },
          ]
        );
      });

      if (!shouldContinue) return;
    }

    try {
      setLoading(true);
      console.log('Iniciando cadastro com dados:', { name, email, password });
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password
      });
      // Navigation will happen automatically through useEffect when isAuthenticated changes
    } catch (error) {
      let errorMessage = error.message || 'Erro ao criar conta';

      // Add helpful information for connection errors
      if (error.message && error.message.includes('Network Error')) {
        errorMessage = `Erro de conexão com o servidor. Certifique-se de que o servidor está rodando e acessível.\n\nPlatforma: ${Platform.OS}\nURL API: ${API_URL}`;
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {renderConnectionStatus()}

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome completo"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu melhor email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Crie uma senha segura"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              (!name || !email || !password || !confirmPassword) && styles.buttonDisabled
            ]}
            onPress={handleSignup}
            disabled={loading || !name || !email || !password || !confirmPassword}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>CRIAR CONTA</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f4e4e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    color: '#212121',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 15,
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

export default SignupScreen; 
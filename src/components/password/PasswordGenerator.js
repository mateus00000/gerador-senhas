import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { generatePassword } from '../../utils/passwordGenerator';
import { savePasswordToHistory } from '../../services/storageService';
import PasswordSaveDialog from '../modals/PasswordSaveDialog';

const PasswordGenerator = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState([]);

  useEffect(() => {
    generateNewPassword();
  }, []);

  const generateNewPassword = async () => {
    try {
      setLoading(true);
      const newPassword = generatePassword(8, true, true, true, false);
      setPassword(newPassword);

      // Salvar a senha no histórico
      await savePasswordToHistory(newPassword);
      console.log('Nova senha gerada e salva no histórico');
    } catch (error) {
      console.error('Erro ao gerar senha:', error);
      Alert.alert('Erro', 'Não foi possível gerar uma nova senha');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!password) return;

    try {
      await Clipboard.setStringAsync(password);
      Alert.alert('Copiado', 'Senha copiada para a área de transferência');
    } catch (error) {
      console.error('Erro ao copiar senha:', error);
      Alert.alert('Erro', 'Não foi possível copiar a senha');
    }
  };

  const clearPassword = () => {
    setPassword('');
  };

  const navigateToHistory = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('PasswordHistory');
    }
  };

  const handleSavePassword = () => {
    if (!password) {
      Alert.alert('Erro', 'Não há senha para salvar.');
      return;
    }

    // Mostrar modal para salvar senha
    setShowSaveDialog(true);
  };

  const navigateToSavedPasswords = () => {
    if (navigation && navigation.navigate) {
      navigation.navigate('SavedPasswords');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.title}>GERADOR DE SENHA</Text>

      {/* Ícone de cadeado */}
      <View style={styles.imageContainer}>
        <View style={styles.iconCircle}>
          <FontAwesome5 name="lock" size={60} color="#4A86E8" />
        </View>
      </View>

      {/* Exibição da senha */}
      <View style={styles.passwordContainer}>
        <Text style={styles.passwordText}>{password}</Text>
      </View>

      {/* Botões */}
      <TouchableOpacity
        style={styles.button}
        onPress={generateNewPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>GERAR</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={copyToClipboard}
        disabled={!password}
      >
        <Text style={styles.buttonText}>COPIAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSavePassword}
        disabled={!password}
      >
        <Text style={styles.buttonText}>SALVAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={clearPassword}
        disabled={!password}
      >
        <Text style={styles.buttonText}>LIMPAR</Text>
      </TouchableOpacity>

      {/* Links para ver históricos */}
      <View style={styles.linksContainer}>
        {/* <TouchableOpacity
          style={styles.linkButton}
          onPress={navigateToHistory}
        >
          <Text style={styles.linkText}>Ver Histórico</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={navigateToSavedPasswords}
        >
          <Text style={styles.linkText}>Ver Senhas Salvas</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para salvar senha */}
      <PasswordSaveDialog
        visible={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        password={password}
        onSave={setSavedPasswords}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A86E8',
    marginBottom: 40,
    marginTop: 20,
  },
  imageContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  passwordText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#333333',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#4A86E8',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: '#4A86E8',
    fontSize: 16,
  },
});

export default PasswordGenerator; 
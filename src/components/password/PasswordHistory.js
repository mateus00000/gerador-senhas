import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome5 } from '@expo/vector-icons';
import { clearPasswordHistory, loadPasswordHistory } from '../../services/storageService';

const PasswordHistory = ({ navigation, route }) => {
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const { clearPasswordHistory: clearHistory } = route.params || {};

  useEffect(() => {
    // Carregar histórico de senhas do storage ao abrir a tela
    loadSavedHistory();

    // Adicionar um listener para recarregar o histórico quando a tela for focada novamente
    const unsubscribe = navigation.addListener('focus', () => {
      loadSavedHistory();
    });

    // Limpeza ao desmontar
    return unsubscribe;
  }, [navigation]);

  const loadSavedHistory = async () => {
    try {
      const history = await loadPasswordHistory();
      setPasswordHistory(history);

      // Inicializa todas as senhas como ocultas
      const initialVisibility = {};
      history.forEach((_, index) => {
        initialVisibility[index] = false;
      });
      setVisiblePasswords(initialVisibility);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de senhas');
    }
  };

  const handleClearHistory = async () => {
    try {
      // Limpar o histórico no AsyncStorage
      await clearPasswordHistory();

      // Atualizar o estado local
      setPasswordHistory([]);

      // Chamar a função de limpeza que foi passada, se existir
      if (clearHistory) {
        clearHistory();
      }

      Alert.alert('Sucesso', 'Histórico de senhas limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      Alert.alert('Erro', 'Não foi possível limpar o histórico de senhas');
    }
  };

  const copyPasswordToClipboard = async (password) => {
    try {
      await Clipboard.setStringAsync(password);
      Alert.alert('Copiado!', 'Senha copiada para a área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar senha:', error);
      Alert.alert('Erro', 'Não foi possível copiar a senha');
    }
  };

  const togglePasswordVisibility = (index) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.passwordItemContainer}>
      <Text style={styles.passwordItem}>
        {visiblePasswords[index] ? item : '••••••••'}
      </Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => togglePasswordVisibility(index)}
          style={styles.iconButton}
        >
          <FontAwesome5
            name={visiblePasswords[index] ? "eye-slash" : "eye"}
            size={16}
            color="#00ACC1"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => copyPasswordToClipboard(item)}
          style={styles.iconButton}
        >
          <FontAwesome5 name="copy" size={16} color="#1A237E" style={styles.copyIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de senhas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>HISTÓRICO DE SENHAS</Text>

        {passwordHistory.length > 0 ? (
          <FlatList
            data={passwordHistory}
            renderItem={renderItem}
            keyExtractor={(item, index) => `password-${index}`}
            style={styles.list}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhuma senha no histórico</Text>
        )}

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearHistory}
        >
          <Text style={styles.clearButtonText}>LIMPAR HISTÓRICO</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    fontSize: 24,
    color: '#1A237E',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    color: '#212121',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  list: {
    width: '100%',
    marginBottom: 20,
  },
  passwordItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  passwordItem: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#212121',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  icon: {
    // marginRight: 5,
  },
  copyIcon: {
    // marginLeft: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  clearButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordHistory; 
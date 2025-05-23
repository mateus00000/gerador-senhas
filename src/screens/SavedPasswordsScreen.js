import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSavedPasswords, clearSavedPasswords } from '../components/modals/PasswordSaveDialog';
import PasswordHistoryItem from '../components/password/PasswordHistoryItem';
import { getAllPasswordItems, deletePasswordItem } from '../api/PasswordApi';
import { useAuth } from '../contexts/AuthContext';

const SavedPasswordsScreen = ({ navigation }) => {
  const { sessionData } = useAuth();
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [loading, setLoading] = useState(true);
  // Novos estados para o modal de confirmação de exclusão
  const [isConfirmDeleteModalVisible, setIsConfirmDeleteModalVisible] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  useEffect(() => {
    loadPasswordsFromAPI();
    
    // Recarregar senhas salvas quando a tela for focada
    const unsubscribe = navigation.addListener('focus', loadPasswordsFromAPI);
    return unsubscribe;
  }, [navigation]);

  // Log session data for debugging
  useEffect(() => {
    if (sessionData) {
      console.log('Current session data in SavedPasswordsScreen:', 
        sessionData.lastLogin, 
        sessionData.user?.email
      );
    }
  }, [sessionData]);

  const loadPasswordsFromAPI = async () => {
    try {
      setLoading(true);
      const items = await getAllPasswordItems();
      setSavedPasswords(items);
      
      // Inicializa todas as senhas como ocultas
      const initialVisibility = {};
      items.forEach(item => {
        initialVisibility[item.id] = false;
      });
      setVisiblePasswords(initialVisibility);
    } catch (error) {
      console.error('Error fetching items:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar suas senhas. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (password) => {
    await Clipboard.setStringAsync(password);
    Alert.alert('Copiado!', 'Senha copiada para a área de transferência.');
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const executeDelete = async (id) => {
    console.log(`[SavedPasswordsScreen] executeDelete chamado para ID: ${id}. Chamando deletePasswordItem...`);
    try {
      await deletePasswordItem(id);
      console.log(`[SavedPasswordsScreen] deletePasswordItem para ID: ${id} supostamente concluído.`);
      Alert.alert('Sucesso', 'Senha excluída com sucesso!');
      loadPasswordsFromAPI(); // Recarrega a lista APÓS o alerta de sucesso
    } catch (error) {
      console.error('[SavedPasswordsScreen] Erro em executeDelete ao excluir senha:', error);
      let detailedMessage = 'Ocorreu um erro ao excluir a senha (dentro de executeDelete).';
      if (error && typeof error === 'object' && error.message) {
        detailedMessage = error.message;
      } else if (typeof error === 'string') {
        detailedMessage = error;
      }
      Alert.alert('Erro na Exclusão', detailedMessage);
    }
  };

  const handleDelete = async (id) => {
    console.log(`[SavedPasswordsScreen] handleDelete (usando modal agora) chamado com ID: ${id}`);
    setItemToDeleteId(id); // Define o ID do item a ser excluído
    setIsConfirmDeleteModalVisible(true); // Mostra o modal de confirmação
    // O Alert.alert anterior será substituído pelo Modal
  };

  const handleConfirmDelete = () => {
    if (itemToDeleteId) {
      console.log(`[SavedPasswordsScreen] Confirmação de exclusão para ID: ${itemToDeleteId} via modal.`);
      executeDelete(itemToDeleteId);
    }
    setIsConfirmDeleteModalVisible(false);
    setItemToDeleteId(null);
  };

  const handleCancelDelete = () => {
    console.log('[SavedPasswordsScreen] Exclusão cancelada via modal.');
    setIsConfirmDeleteModalVisible(false);
    setItemToDeleteId(null);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.passwordItem}>
      <View style={styles.passwordInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.passwordMasked}>
          {visiblePasswords[item.id] ? item.password : '••••••••'}
        </Text>
      </View>
      
      <View style={styles.passwordActions}>
        <TouchableOpacity onPress={() => togglePasswordVisibility(item.id)} style={styles.actionButton}>
          <FontAwesome5 name={visiblePasswords[item.id] ? "eye-slash" : "eye"} size={18} color="#00ACC1" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => copyToClipboard(item.password)} style={styles.actionButton}>
          <FontAwesome5 name="copy" size={18} color="#1A237E" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
          <FontAwesome5 name="trash" size={18} color="#D32F2F" />
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
        <Text style={styles.headerTitle}>Senhas Salvas</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>SENHAS SALVAS</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A237E" />
            <Text style={styles.loadingText}>Carregando senhas...</Text>
          </View>
        ) : savedPasswords.length > 0 ? (
          <FlatList
            data={savedPasswords}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        ) : (
          <Text style={styles.emptyText}>Nenhuma senha salva</Text>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>VOLTAR</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        animationType="fade" // Pode ser "slide", "fade", ou "none"
        transparent={true}
        visible={isConfirmDeleteModalVisible}
        onRequestClose={handleCancelDelete} // Para fechar com botão de voltar do Android
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalMessage}>
              Tem certeza que deseja excluir esta senha permanentemente?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCancelDelete}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelButtonText]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  passwordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 5,
  },
  passwordMasked: {
    fontSize: 14,
    color: '#424242',
  },
  passwordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 'auto',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#424242',
    marginTop: 10,
  },
  // Estilos para o Modal de Confirmação
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundo escurecido
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1, // Para que os botões dividam o espaço
    alignItems: 'center',
    marginHorizontal: 5, // Espaçamento entre os botões
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0', // Cinza claro para cancelar
  },
  modalCancelButtonText: {
    color: '#424242', // Texto cinza escuro
    fontWeight: '600',
  },
  modalDeleteButton: {
    backgroundColor: '#D32F2F', // Vermelho para excluir (Cor de Erro/Exclusão)
  },
  modalButtonText: {
    color: '#FFFFFF', // Texto branco padrão para botões
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SavedPasswordsScreen; 
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PASSWORDS_KEY = '@saved_passwords';

/**
 * Carregar as senhas salvas do AsyncStorage
 */
export const loadSavedPasswords = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SAVED_PASSWORDS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erro ao carregar senhas salvas:', error);
    return [];
  }
};

/**
 * Limpar todas as senhas salvas
 */
export const clearSavedPasswords = async () => {
  try {
    await AsyncStorage.removeItem(SAVED_PASSWORDS_KEY);
  } catch (error) {
    console.error('Erro ao limpar senhas salvas:', error);
  }
};

/**
 * Componente de diálogo para salvar senhas
 */
const PasswordSaveDialog = ({ visible, onClose, password, onSave }) => {
  const [appName, setAppName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!appName.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome para o aplicativo ou serviço.');
      return;
    }

    if (!password) {
      Alert.alert('Erro', 'Nenhuma senha para salvar.');
      return;
    }

    try {
      setLoading(true);
      
      // Carregar senhas existentes
      const savedPasswords = await loadSavedPasswords();
      
      // Verificar se já existe uma senha para este app
      const existingIndex = savedPasswords.findIndex(p => p.appName === appName);
      
      if (existingIndex >= 0) {
        // Perguntar se deseja sobrescrever
        Alert.alert(
          'Senha já existe',
          `Já existe uma senha salva para "${appName}". Deseja substituí-la?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => setLoading(false),
            },
            {
              text: 'Substituir',
              style: 'destructive',
              onPress: async () => {
                // Atualizar senha existente
                savedPasswords[existingIndex].password = password;
                
                // Salvar array atualizado
                await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(savedPasswords));
                
                setAppName('');
                setLoading(false);
                
                // Invocar callback se fornecido
                if (onSave) onSave(savedPasswords);
                
                Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
                onClose();
              },
            },
          ]
        );
      } else {
        // Adicionar nova senha
        const newPasswordEntry = {
          appName,
          password,
          createdAt: new Date().toISOString(),
        };
        
        savedPasswords.push(newPasswordEntry);
        
        // Salvar array atualizado
        await AsyncStorage.setItem(SAVED_PASSWORDS_KEY, JSON.stringify(savedPasswords));
        
        setAppName('');
        setLoading(false);
        
        // Invocar callback se fornecido
        if (onSave) onSave(savedPasswords);
        
        Alert.alert('Sucesso', 'Senha salva com sucesso!');
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
      Alert.alert('Erro', 'Houve um problema ao salvar a senha. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Salvar Senha</Text>
          
          <Text style={styles.label}>Para qual aplicativo ou serviço?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Gmail, Facebook, Netflix..."
            value={appName}
            onChangeText={setAppName}
            autoCapitalize="none"
          />
          
          <Text style={styles.passwordTitle}>Senha a ser salva:</Text>
          <Text style={styles.passwordDisplay}>{password}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>SALVAR</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
    fontWeight: '700',
    color: '#4A86E8',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordTitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  passwordDisplay: {
    backgroundColor: '#F0F6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontWeight: '600',
    color: '#4A86E8',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A86E8',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PasswordSaveDialog; 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const UserProfileIcon = ({ navigation }) => {
  const [showMenu, setShowMenu] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    console.log('UserProfileIcon montado');
    console.log('Auth context:', auth);
  }, []);

  const handleLogout = async () => {
    console.log('Botão de logout clicado');
    console.log('Auth context no handleLogout:', auth);

    if (!auth || !auth.logout) {
      console.error('Auth context ou função logout não disponível');
      Alert.alert('Erro', 'Erro ao fazer logout. Tente novamente.');
      return;
    }

    try {
      console.log('Mostrando diálogo de confirmação');
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('Logout cancelado pelo usuário');
              setShowMenu(false);
            }
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              console.log('Usuário confirmou logout');
              try {
                console.log('Chamando função logout()');
                const success = await auth.logout();
                console.log('Resultado do logout:', success);

                if (success) {
                  console.log('Logout bem sucedido, redirecionando...');
                  setShowMenu(false);
                  if (navigation && navigation.reset) {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'SignIn' }],
                    });
                  } else {
                    console.error('Navigation ou navigation.reset não disponível');
                    Alert.alert('Erro', 'Erro ao redirecionar após logout');
                  }
                } else {
                  console.error('Logout falhou - success é false');
                  Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
                }
              } catch (logoutError) {
                console.error('Erro durante o processo de logout:', logoutError);
                Alert.alert('Erro', 'Ocorreu um erro durante o logout');
              }
            }
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Erro ao mostrar diálogo de logout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer logout');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          console.log('Ícone do usuário clicado');
          setShowMenu(true);
        }}
      >
        <FontAwesome5 name="user-circle" size={24} color="#4A86E8" />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('Modal fechado pelo botão de voltar');
          setShowMenu(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            console.log('Modal fechado pelo overlay');
            setShowMenu(false);
          }}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <FontAwesome5 name="user-circle" size={40} color="#4A86E8" />
              <Text style={styles.userEmail}>{auth?.user?.email || 'Usuário'}</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                console.log('Botão de sair clicado no menu');
                handleLogout();
              }}
            >
              <FontAwesome5 name="sign-out-alt" size={20} color="#FF3B30" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    width: 250,
    marginTop: 50,
    marginRight: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  userEmail: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
  },
  logoutText: {
    color: '#FF3B30',
  },
});

export default UserProfileIcon; 
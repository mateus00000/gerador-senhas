import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = '@user_accounts';

/**
 * Registra um novo usuário
 * @param {string} name - Nome do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Resultado da operação com status e mensagem
 */
export const registerUser = async (name, email, password) => {
  try {
    // Carregar usuários existentes
    const users = await getUsers();
    
    // Verificar se já existe um usuário com o mesmo email
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return { success: false, message: 'Já existe um usuário com este email' };
    }
    
    // Adicionar novo usuário
    const newUser = { name, email, password };
    users.push(newUser);
    
    // Salvar usuários atualizados
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
    return { success: true, message: 'Usuário registrado com sucesso!' };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { success: false, message: 'Erro ao registrar usuário' };
  }
};

/**
 * Realiza login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Resultado da operação com status, mensagem e dados do usuário
 */
export const loginUser = async (email, password) => {
  try {
    // Como especificado, não fazemos validação real no login
    // Qualquer email pode fazer login
    return { 
      success: true, 
      message: 'Login realizado com sucesso',
      user: { 
        email, 
        name: email.split('@')[0] // Usa a parte do email antes do @ como nome
      }
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, message: 'Erro ao fazer login' };
  }
};

/**
 * Obtém a lista de usuários cadastrados
 * @returns {Promise<Array>} Lista de usuários
 */
export const getUsers = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return [];
  }
}; 
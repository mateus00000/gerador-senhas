import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração base da API
const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Authentication API functions
export const signUp = async (userData) => {
    try {
        console.log('Trying to sign up with:', userData.email);

        // Validar campos obrigatórios
        if (!userData.name || !userData.email || !userData.password) {
            throw { message: 'Todos os campos são obrigatórios' };
        }

        // Garantir que confirmPassword seja igual à password
        const dataToSend = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            confirmPassword: userData.password
        };

        console.log('Sending data:', dataToSend);
        const response = await api.post('/api/signup', dataToSend);

        if (response.data.token) {
            await AsyncStorage.setItem('token', response.data.token);
            console.log('Signup successful, token stored');
        }
        return response.data;
    } catch (error) {
        console.error('Signup failed:', error.message);
        if (error.response && error.response.data) {
            console.error('Server error message:', error.response.data.message);
            throw error.response.data;
        }
        throw { message: 'Network error or server not responding' };
    }
}; 
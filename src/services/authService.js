import api from './api';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.get('/users', {
                params: { email, password },
            });

            if (!response.data || response.data.length === 0) {
                throw new Error("Email yoki parol noto'g'ri");
            }

            return response.data[0];
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    logout: async () => {
        localStorage.removeItem('token');
    },

    register: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },
};

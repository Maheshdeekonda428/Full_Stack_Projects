import api from './api';

export const authService = {
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async login(credentials) {
        const formData = new URLSearchParams();
        formData.append('username', credentials.email);
        formData.append('password', credentials.password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            // Fetch user profile after login
            const userResponse = await api.get('/users/profile');
            localStorage.setItem('user', JSON.stringify(userResponse.data));
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user?.isAdmin || false;
    },

    getToken() {
        return localStorage.getItem('token');
    },
};

export default authService;

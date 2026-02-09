import api from './api';

const userService = {
    async updateProfile(userData) {
        const response = await api.put('/users/profile', userData);
        return response.data;
    }
};

export default userService;

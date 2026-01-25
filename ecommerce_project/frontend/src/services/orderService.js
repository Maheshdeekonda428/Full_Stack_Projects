import api from './api';

export const orderService = {
    async createOrder(orderData) {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    async getMyOrders(params = {}) {
        const response = await api.get('/orders/myorders', { params });
        return response.data;
    },

    async getOrder(id) {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    async payOrder(id, paymentResult) {
        const response = await api.put(`/orders/${id}/pay`, paymentResult);
        return response.data;
    },
};

export default orderService;

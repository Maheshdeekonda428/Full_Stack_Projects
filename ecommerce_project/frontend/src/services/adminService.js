import api from './api';

export const adminService = {
    async getAllOrders(params = {}) {
        const response = await api.get('/orders', { params });
        return response.data;
    },

    async updateOrderStatus(orderId, status) {
        const endpoint = status === 'paid' ? `/orders/${orderId}/pay` : `/orders/${orderId}/deliver`;
        const response = await api.put(endpoint);
        return response.data;
    },

    async getDashboardStats() {
        // This would ideally be a single endpoint, but we'll aggregate
        try {
            const [products, orders, users] = await Promise.all([
                api.get('/products'),
                api.get('/orders'),
                api.get('/users'),
            ]);

            const totalRevenue = orders.data.reduce((sum, order) =>
                order.isPaid ? sum + order.totalPrice : sum, 0
            );

            return {
                totalRevenue,
                totalOrders: orders.data.length,
                totalProducts: products.data.length,
                totalUsers: users.data.length,
                recentOrders: orders.data.slice(0, 5),
                lowStockProducts: products.data.filter(p => p.countInStock < 10),
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                totalRevenue: 0,
                totalOrders: 0,
                totalProducts: 0,
                totalUsers: 0,
                recentOrders: [],
                lowStockProducts: [],
            };
        }
    },

    async getAllUsers() {
        const response = await api.get('/users');
        return response.data;
    },

    async deleteOrder(orderId) {
        const response = await api.delete(`/orders/${orderId}`);
        return response.data;
    },
};

export default adminService;

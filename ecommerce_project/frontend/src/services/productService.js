import api from './api';

const productService = {
    async getProducts(params = {}) {
        const response = await api.get('/products', { params });

        // ✅ Normalize backend response
        if (Array.isArray(response.data)) {
            return response.data;
        }

        // If backend returns { items, total, ... }
        return response.data.items || [];
    },

    async getProduct(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async createProduct(productData) {
        const response = await api.post('/products', productData);
        return response.data;
    },

    async updateProduct(id, productData) {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    async deleteProduct(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    async uploadProductImages(files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.images;
    },

    async uploadImageFromUrl(url) {
        const response = await api.post('/upload/url', { url });
        return response.data.url;
    },

    getCategories() {
        return [
            'Electronics',
            'Clothing',
            'Home & Garden',
            'Sports',
            'Books',
            'Toys',
            'Beauty',
            'Automotive',
        ];
    },
};

export default productService;

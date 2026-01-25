import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../services/productService';
import { PageLoader } from '../../components/common/Loader';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        countInStock: '',
        image: '',
        brand: '',
    });

    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProduct(id),
        enabled: isEdit,
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                price: product.price || '',
                countInStock: product.countInStock || '',
                image: product.image || '',
                brand: product.brand || '',
            });
        }
    }, [product]);

    const createMutation = useMutation({
        mutationFn: () => productService.createProduct(),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['products']);
            toast.success('Product created successfully');
            navigate(`/admin/products/edit/${data._id}`);
        },
        onError: () => {
            toast.error('Failed to create product');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => productService.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            queryClient.invalidateQueries(['product', id]);
            toast.success('Product updated successfully');
        },
        onError: () => {
            toast.error('Failed to update product');
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'countInStock' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            updateMutation.mutate(formData);
        }
    };

    const handleCreate = () => {
        createMutation.mutate();
    };

    const categories = productService.getCategories();

    if (isEdit && isLoadingProduct) return <PageLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="section-title mb-8">
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>

            {!isEdit && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="font-medium text-blue-900 mb-2">Create a New Product</h3>
                    <p className="text-blue-700 text-sm mb-4">
                        Click the button below to create a sample product, then customize its details.
                    </p>
                    <button
                        onClick={handleCreate}
                        disabled={createMutation.isLoading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {createMutation.isLoading ? <Loader size="sm" /> : 'Create Sample Product'}
                    </button>
                </div>
            )}

            {isEdit && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="input-field"
                                placeholder="Enter product description"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Brand name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    name="countInStock"
                                    value={formData.countInStock}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                                {formData.countInStock > 0 && formData.countInStock < 10 && (
                                    <p className="text-orange-600 text-sm mt-1">⚠️ Low stock warning</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={updateMutation.isLoading}
                                className="btn-primary flex-1 flex items-center justify-center"
                            >
                                {updateMutation.isLoading ? <Loader size="sm" /> : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                    {/* Preview */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Live Preview</h2>
                        <div className="product-card">
                            <div className="relative overflow-hidden">
                                <img
                                    src={formData.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                {formData.countInStock === 0 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                        <span className="text-white font-bold">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <span className="text-xs text-blue-600 font-medium uppercase">
                                    {formData.category || 'Category'}
                                </span>
                                <h3 className="font-semibold text-gray-900 mt-1 truncate">
                                    {formData.name || 'Product Name'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {formData.description || 'Product description...'}
                                </p>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-lg font-bold text-gray-900">
                                        ₹{formData.price || 0}
                                    </span>
                                    <span className={`text-sm ${formData.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formData.countInStock > 0 ? `${formData.countInStock} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductForm;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../services/productService';
import { PageLoader } from '../../components/common/Loader';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

// Helper function to handle image URLs (local vs web)
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

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
        images: [],
        brand: '',
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [webImageUrl, setWebImageUrl] = useState('');

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
                images: product.images || [],
                brand: product.brand || '',
            });
        }
    }, [product]);

    const createMutation = useMutation({
        mutationFn: () => productService.createProduct(),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['products']);
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

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }

        setSelectedFiles(files);

        // Upload images immediately
        setUploadingImages(true);
        try {
            const imageUrls = await productService.uploadProductImages(files);
            setFormData(prev => ({
                ...prev,
                images: imageUrls,
                image: imageUrls[0] || '',  // Set first image as primary
            }));
            toast.success('Images uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload images');
            console.error(error);
        } finally {
            setUploadingImages(false);
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
            image: prev.images.filter((_, i) => i !== index)[0] || '',
        }));
    };

    const handleAddWebImageUrl = (e) => {
        e.preventDefault();
        if (!webImageUrl) return;

        if (formData.images.length >= 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }

        // Simple validation for URL
        if (!webImageUrl.startsWith('http')) {
            toast.error('Please enter a valid URL starting with http/https');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, webImageUrl],
            image: prev.image || webImageUrl, // Set as primary if none exists
        }));
        setWebImageUrl('');
        toast.success('Web image added');
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
                                    placeholder="Enter price"
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
                                    placeholder="Enter stock quantity"
                                    min="0"
                                    required
                                />
                                {formData.countInStock > 0 && formData.countInStock < 10 && (
                                    <p className="text-orange-600 text-sm mt-1">⚠️ Low stock warning</p>
                                )}
                            </div>
                        </div>

                        {/* Product Images Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Images (Max 3)
                            </label>

                            {/* File Input */}
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={handleFileSelect}
                                disabled={uploadingImages}
                                className="input-field"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Accepted formats: JPG, PNG, WEBP (Max 5MB per image)
                            </p>

                            <div className="mt-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Or Add Web Image URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={webImageUrl}
                                        onChange={(e) => setWebImageUrl(e.target.value)}
                                        className="input-field py-1.5"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddWebImageUrl}
                                        className="btn-secondary py-1.5 px-4"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Image Previews */}
                            {formData.images.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {formData.images.map((imageUrl, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={getImageUrl(imageUrl)}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploadingImages && (
                                <div className="mt-4 text-center">
                                    <Loader size="sm" />
                                    <p className="text-sm text-gray-600 mt-2">Uploading images...</p>
                                </div>
                            )}
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
                                    src={getImageUrl(formData.image) || 'https://via.placeholder.com/300x200?text=No+Image'}
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

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
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
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

    const [selectedFiles, setSelectedFiles] = useState([]); // Array of { file, preview }
    const [pendingUrls, setPendingUrls] = useState([]); // Array of strings (URLs waiting to be uploaded to S3)
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

    // Clean up preview URLs on unmount
    useEffect(() => {
        return () => {
            selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
        };
    }, [selectedFiles]);

    const createMutation = useMutation({
        mutationFn: (data) => productService.createProduct(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['products']);
            toast.success('Product created successfully');
            navigate(`/admin/products`);
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
            navigate('/admin/products');
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

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);

        // Check strictly against the limit of 3 images total
        const totalImages = formData.images.length + selectedFiles.length + pendingUrls.length + files.length;
        if (totalImages > 3) {
            toast.error(`Maximum 3 images allowed. You can add ${3 - (formData.images.length + selectedFiles.length + pendingUrls.length)} more.`);
            e.target.value = '';
            return;
        }

        const newSelectedFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setSelectedFiles(prev => [...prev, ...newSelectedFiles]);

        // If no image is selected yet, set the first new file as the primary preview
        if (!formData.image && newSelectedFiles.length > 0) {
            setFormData(prev => ({
                ...prev,
                image: newSelectedFiles[0].preview
            }));
        }

        // Reset the input value
        e.target.value = '';
    };

    const handleRemoveImage = (index) => {
        const numExisting = formData.images.length;
        const numPendingUrls = pendingUrls.length;

        // 1. Existing images
        if (index < numExisting) {
            setFormData(prev => {
                const updatedImages = prev.images.filter((_, i) => i !== index);
                return {
                    ...prev,
                    images: updatedImages,
                    image: updatedImages[0] || pendingUrls[0] || selectedFiles[0]?.preview || '',
                };
            });
        }
        // 2. Pending Web URLs
        else if (index < numExisting + numPendingUrls) {
            const urlIndex = index - numExisting;
            setPendingUrls(prev => {
                const updated = prev.filter((_, i) => i !== urlIndex);
                // Update primary image if this was the primary
                if (formData.image === prev[urlIndex]) {
                    setFormData(f => ({
                        ...f,
                        image: f.images[0] || updated[0] || selectedFiles[0]?.preview || ''
                    }));
                }
                return updated;
            });
        }
        // 3. Selected Local Files
        else {
            const fileIndex = index - numExisting - numPendingUrls;
            setSelectedFiles(prev => {
                const removed = prev[fileIndex];
                if (removed) {
                    URL.revokeObjectURL(removed.preview);
                    // Update primary image if this was the primary
                    if (formData.image === removed.preview) {
                        setFormData(f => ({
                            ...f,
                            image: f.images[0] || pendingUrls[0] || prev.filter((_, i) => i !== fileIndex)[0]?.preview || ''
                        }));
                    }
                }
                return prev.filter((_, i) => i !== fileIndex);
            });
        }
    };

    const handleAddWebImageUrl = (e) => {
        e.preventDefault();
        if (!webImageUrl) return;

        if (formData.images.length + selectedFiles.length + pendingUrls.length >= 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }

        // Simple validation for URL
        if (!webImageUrl.startsWith('http')) {
            toast.error('Please enter a valid URL starting with http/https');
            return;
        }

        setPendingUrls(prev => [...prev, webImageUrl]);

        // Set as primary preview if none exists
        if (!formData.image) {
            setFormData(prev => ({ ...prev, image: webImageUrl }));
        }

        setWebImageUrl('');
        toast.success('Web image added (pending upload)');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadingImages(true);

        try {
            let finalImages = [...formData.images];

            // 1. Upload new local files
            if (selectedFiles.length > 0) {
                const filesToUpload = selectedFiles.map(f => f.file);
                const uploadedUrls = await productService.uploadProductImages(filesToUpload);
                finalImages = [...finalImages, ...uploadedUrls];
            }

            // 2. Upload pending web URLs to S3
            if (pendingUrls.length > 0) {
                const urlUploadTasks = pendingUrls.map(url => productService.uploadImageFromUrl(url));
                const uploadedUrls = await Promise.all(urlUploadTasks);
                finalImages = [...finalImages, ...uploadedUrls];
            }

            // eslint-disable-next-line no-unused-vars
            const { image: _, ...dataWithoutImage } = formData;

            const submissionData = {
                ...dataWithoutImage,
                images: finalImages,
            };

            if (isEdit) {
                updateMutation.mutate(submissionData);
            } else {
                createMutation.mutate(submissionData);
            }
        } catch (error) {
            toast.error('Failed to upload images');
            console.error(error);
            setUploadingImages(false);
        }
    };

    const handleCreate = () => {
        handleSubmit({ preventDefault: () => { } });
    };

    const categories = productService.getCategories();

    if (isEdit && isLoadingProduct) return <PageLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="section-title mb-8">
                {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>


            {/* Form Section */}
            {(
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
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
                                Description <span className="text-red-500">*</span>
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
                                    Brand <span className="text-red-500">*</span>
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
                                    Price (₹) <span className="text-red-500">*</span>
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
                                    Stock Quantity <span className="text-red-500">*</span>
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
                            {(formData.images.length > 0 || selectedFiles.length > 0 || pendingUrls.length > 0) && (
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {[...formData.images, ...pendingUrls, ...selectedFiles.map(f => f.preview)].map((imageUrl, index) => (
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
                                            {index >= formData.images.length && (
                                                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold shadow-sm">
                                                    Pending
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
                                {updateMutation.isLoading || createMutation.isLoading ? <Loader size="sm" /> : (isEdit ? 'Save Changes' : 'Create Product')}
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

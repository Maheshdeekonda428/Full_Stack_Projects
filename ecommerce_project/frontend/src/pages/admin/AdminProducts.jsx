import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '../../services/productService';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getProducts(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => productService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            toast.success('Product deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete product');
        },
    });

    const handleDelete = (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const categories = productService.getCategories();

    const filteredProducts = products?.filter(product => {
        if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (categoryFilter && product.category !== categoryFilter) {
            return false;
        }
        return true;
    });

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <h1 className="section-title">Manage Products</h1>
                <Link to="/admin/products/new" className="btn-primary">
                    + Add New Product
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-8 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="input-field flex-1"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="input-field md:w-48"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Products Table (Desktop) */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts?.map(product => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            src={product.image || 'https://via.placeholder.com/50'}
                                            alt={product.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                {product.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ₹{product.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.countInStock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.countInStock > 10 ? (
                                        <span className="badge badge-success">In Stock</span>
                                    ) : product.countInStock > 0 ? (
                                        <span className="badge badge-warning">Low Stock</span>
                                    ) : (
                                        <span className="badge badge-danger">Out of Stock</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        to={`/admin/products/edit/${product._id}`}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product._id, product.name)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Products Cards (Mobile) */}
            <div className="md:hidden space-y-4">
                {filteredProducts?.map(product => (
                    <div key={product._id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex gap-4">
                            <img
                                src={product.image || 'https://via.placeholder.com/80'}
                                alt={product.name}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.category}</p>
                                <p className="font-bold text-blue-600 mt-1">₹{product.price}</p>
                                <p className="text-sm text-gray-500">Stock: {product.countInStock}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4 pt-4 border-t">
                            <Link
                                to={`/admin/products/edit/${product._id}`}
                                className="flex-1 btn-secondary text-center text-sm"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(product._id, product.name)}
                                className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-100"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts?.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500">No products found</p>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;

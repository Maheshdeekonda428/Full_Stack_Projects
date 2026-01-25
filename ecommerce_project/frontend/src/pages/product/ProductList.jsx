import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { ProductSkeleton } from '../../components/common/Loader';
import productService from '../../services/productService';

const ProductList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
    });

    const { data: products, isLoading } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => productService.getProducts(filters),
    });

    const categories = productService.getCategories();

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'rating', label: 'Top Rated' },
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (value) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
        setSearchParams(searchParams);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            sort: 'newest',
        });
        setSearchParams({});
    };

    const filteredProducts = products?.filter(product => {
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }
        if (filters.category && product.category !== filters.category) {
            return false;
        }
        if (filters.minPrice && product.price < Number(filters.minPrice)) {
            return false;
        }
        if (filters.maxPrice && product.price > Number(filters.maxPrice)) {
            return false;
        }
        return true;
    });

    const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
        switch (filters.sort) {
            case 'price_low':
                return a.price - b.price;
            case 'price_high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'popular':
                return (b.numReviews || 0) - (a.numReviews || 0);
            default:
                return 0;
        }
    });

    const FilterSidebar = ({ mobile = false }) => (
        <div className={`${mobile ? '' : 'hidden lg:block'} w-full lg:w-64 space-y-6`}>
            {/* Search */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search products..."
                    className="input-field"
                />
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        placeholder="Min"
                        className="input-field"
                    />
                    <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        placeholder="Max"
                        className="input-field"
                    />
                </div>
                {/* Quick Price Filters */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {[500, 1000, 2000, 5000].map(price => (
                        <button
                            key={price}
                            onClick={() => handleFilterChange('maxPrice', price.toString())}
                            className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:border-blue-500 hover:text-blue-600"
                        >
                            Under ₹{price}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            <button onClick={clearFilters} className="btn-secondary w-full">
                Clear Filters
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="section-title">All Products</h1>
                    <p className="section-subtitle">
                        {sortedProducts?.length || 0} products found
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden btn-secondary flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>

                    {/* Sort */}
                    <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="input-field w-48"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
                <div className="lg:hidden mb-8 p-4 bg-white rounded-lg shadow-md">
                    <FilterSidebar mobile />
                </div>
            )}

            <div className="flex gap-8">
                {/* Desktop Sidebar */}
                <FilterSidebar />

                {/* Products Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(9)].map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : sortedProducts?.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
                            <p className="text-gray-600 mt-2 mb-6">Try adjusting your filters</p>
                            <button onClick={clearFilters} className="btn-primary">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedProducts?.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;

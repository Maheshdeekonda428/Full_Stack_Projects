import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Loader';
import productService from '../services/productService';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const Home = () => {
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getProducts(),
    });

    const { recentProducts } = useRecentlyViewed();

    const categories = [
        { name: 'Electronics', gradient: 'from-blue-600 to-cyan-400', icon: '📱' },
        { name: 'Clothing', gradient: 'from-pink-600 to-rose-400', icon: '👕' },
        { name: 'Home & Garden', gradient: 'from-green-600 to-emerald-400', icon: '🏠' },
        { name: 'Sports', gradient: 'from-orange-600 to-amber-400', icon: '⚽' },
        { name: 'Books', gradient: 'from-purple-600 to-violet-400', icon: '📚' },
        { name: 'Beauty', gradient: 'from-fuchsia-600 to-pink-400', icon: '💄' },
    ];

    const features = [
        { icon: '🚚', title: 'Free Shipping', desc: 'On orders over ₹999' },
        { icon: '🔒', title: 'Secure Payment', desc: '100% secure checkout' },
        { icon: '↩️', title: 'Easy Returns', desc: '30 days return policy' },
        { icon: '💬', title: '24/7 Support', desc: 'Dedicated support' },
    ];

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
                <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up">
                            Discover Amazing Products at Unbeatable Prices
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-8">
                            Shop the latest trends with exclusive deals and free shipping on your first order.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/products"
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-300 text-center"
                            >
                                Shop Now
                            </Link>
                            <Link
                                to="/products"
                                className="px-8 py-3 text-white font-bold rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-300 text-center"
                            >
                                Explore Categories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white py-12 border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl mb-3">{feature.icon}</div>
                                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop by Category */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="section-title text-center mb-4">Shop by Category</h2>
                    <p className="section-subtitle text-center mb-12">Find what you're looking for</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat, index) => (
                            <Link
                                key={index}
                                to={`/products?category=${cat.name}`}
                                className={`bg-gradient-to-br ${cat.gradient} rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
                            >
                                <div className="text-4xl mb-3">{cat.icon}</div>
                                <h3 className="font-semibold">{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="section-title">Featured Products</h2>
                            <p className="section-subtitle">Handpicked just for you</p>
                        </div>
                        <Link to="/products" className="btn-outline hidden md:inline-flex">
                            View All
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {isLoading
                            ? [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)
                            : products?.slice(0, 8).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                    </div>

                    {!isLoading && products?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No products available yet.</p>
                        </div>
                    )}

                    <div className="text-center mt-8 md:hidden">
                        <Link to="/products" className="btn-primary">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Recently Viewed */}
            {recentProducts && recentProducts.length > 0 && (
                <section className="py-16 border-t">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="section-title mb-8 text-2xl">Recently Viewed</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {recentProducts.map((product) => (
                                <ProductCard key={`recent-${product._id}`} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Promo Banner */}
            <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Big Sale Up To 50% Off!</h2>
                    <p className="text-xl mb-8">Limited time offer. Don't miss out on amazing deals.</p>
                    <Link to="/products" className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors inline-block">
                        Shop the Sale
                    </Link>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="section-title mb-4">Stay Updated</h2>
                    <p className="section-subtitle mb-8">Subscribe to our newsletter for exclusive deals and updates</p>
                    <form className="flex flex-col sm:flex-row gap-4 justify-center">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="input-field flex-1 max-w-md"
                        />
                        <button type="submit" className="btn-primary">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;

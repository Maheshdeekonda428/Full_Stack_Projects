import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        removeFromWishlist(product._id);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="mb-6">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Save items that you like in your wishlist. Review them anytime and easily move them to the cart.
                </p>
                <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
                    <span>Explore Products</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="text-gray-600 mt-2">{wishlistItems.length} items saved</p>
                </div>
                <Link to="/products" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                    Continue Shopping
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {wishlistItems.map((product) => (
                    <div key={product._id} className="relative group">
                        <ProductCard product={product} />
                        <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeFromWishlist(product._id)}
                                className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-50"
                                title="Remove from wishlist"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-2">
                            <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.countInStock === 0}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
                            >
                                {product.countInStock > 0 ? 'Move to Cart' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;

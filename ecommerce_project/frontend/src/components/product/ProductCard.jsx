import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

// Helper function to format price with commas
const formatPrice = (price) => {
    return price.toLocaleString('en-IN');
};

// Helper function to handle image URLs (local vs web)
const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, isInWishlist } = useWishlist();

    // Set default rating and reviews if not present
    const rating = product.rating || 4.5;
    const numReviews = product.numReviews && product.numReviews > 50 ? product.numReviews : "50+";

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.countInStock > 0) {
            addToCart(product, 1);
        }
    };

    return (
        <Link to={`/products/${product._id}`} className="product-card group block">
            {/* Image Container */}
            <div className="relative overflow-hidden">
                <img
                    src={
                        product.images && product.images.length > 0
                            ? getImageUrl(product.images[0])
                            : getImageUrl(product.image) || 'https://via.placeholder.com/300x300?text=No+Image'
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}% OFF
                    </span>
                )}

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToWishlist(product);
                    }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isInWishlist(product._id)
                        ? 'bg-red-50 text-red-500 opacity-100 scale-110'
                        : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                        }`}
                >
                    <svg
                        className="w-5 h-5"
                        fill={isInWishlist(product._id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Out of Stock Overlay */}
                {product.countInStock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Category */}
                <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                    {product.category}
                </span>

                {/* Name */}
                <h3 className="mt-1 font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center mt-1">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">{rating.toFixed(1)} ({numReviews} {numReviews === 1 ? 'review' : 'reviews'})</span>
                </div>

                {/* Price */}
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-gray-900">₹{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                            <span className="ml-2 text-sm text-gray-400 line-through">₹{formatPrice(product.originalPrice)}</span>
                        )}
                    </div>

                    {/* Stock Indicator */}
                    {product.countInStock > 0 && product.countInStock < 10 && (
                        <span className="text-xs text-orange-600">Only {product.countInStock} left</span>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0}
                    className={`mt-3 w-full py-2 rounded-lg font-medium transition-all ${product.countInStock === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02]'
                        }`}
                >
                    {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;

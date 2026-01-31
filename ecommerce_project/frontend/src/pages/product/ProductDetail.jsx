import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { PageLoader, ProductSkeleton } from '../../components/common/Loader';
import ProductCard from '../../components/product/ProductCard';
import productService from '../../services/productService';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist, isInWishlist } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToRecentlyViewed } = useRecentlyViewed();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProduct(id),
    });

    const { data: allProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getProducts(),
    });

    // Add to recently viewed when product data is ready
    useEffect(() => {
        if (product) {
            addToRecentlyViewed(product);
        }
    }, [product]);

    const relatedProducts = allProducts?.filter(
        p => p._id !== id && p.category === product?.category
    ).slice(0, 4);

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/cart');
    };

    if (isLoading) return <PageLoader />;

    if (error || !product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
                <Link to="/products" className="btn-primary mt-4 inline-block">
                    Back to Products
                </Link>
            </div>
        );
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const images = [product.image, product.image, product.image]; // Placeholder for multiple images

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-8">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-blue-600">Products</Link>
                <span className="mx-2">/</span>
                <Link to={`/products?category=${product.category}`} className="hover:text-blue-600">
                    {product.category}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Images */}
                <div>
                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                        <img
                            src={images[selectedImage] || 'https://via.placeholder.com/600x600?text=No+Image'}
                            alt={product.name}
                            className="w-full h-96 lg:h-[500px] object-cover"
                        />
                        {discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                {discount}% OFF
                            </span>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div className="flex gap-3 mt-4">
                        {images.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                                    }`}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <span className="text-sm text-blue-600 font-medium uppercase tracking-wide">
                        {product.category}
                    </span>

                    <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center mt-4">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600">
                            {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mt-6">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                                    <span className="text-green-600 font-medium">You save ₹{product.originalPrice - product.price}</span>
                                </>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

                    {/* Stock Status */}
                    <div className="mt-6">
                        {product.countInStock > 0 ? (
                            product.countInStock < 10 ? (
                                <span className="badge badge-warning">Only {product.countInStock} left in stock!</span>
                            ) : (
                                <span className="badge badge-success">In Stock</span>
                            )
                        ) : (
                            <span className="badge badge-danger">Out of Stock</span>
                        )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    {product.countInStock > 0 && (
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 font-medium">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-2 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                                        className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleAddToCart} className="btn-primary flex-1">
                                    Add to Cart
                                </button>
                                <button onClick={handleBuyNow} className="btn-secondary flex-1">
                                    Buy Now
                                </button>
                                <button
                                    onClick={() => addToWishlist(product)}
                                    className={`p-3 rounded-lg border flex items-center justify-center transition-all ${isInWishlist(product._id)
                                        ? 'bg-red-50 border-red-200 text-red-500 shadow-sm'
                                        : 'bg-white border-gray-300 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                                        }`}
                                    title={isInWishlist(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill={isInWishlist(product._id) ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Free shipping on orders over ₹999
                            </li>
                            <li className="flex items-center text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                30 days easy returns
                            </li>
                            <li className="flex items-center text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Genuine product guarantee
                            </li>
                            <li className="flex items-center text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Secure checkout
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts?.length > 0 && (
                <section className="mt-16">
                    <h2 className="section-title mb-8">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {relatedProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetail;

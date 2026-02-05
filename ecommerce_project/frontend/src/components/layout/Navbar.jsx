import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { getCartCount } = useCart();
    const { getWishlistCount } = useWishlist();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Sync search input with URL search param
    useEffect(() => {
        const query = searchParams.get('search') || '';
        setSearchQuery(query);
    }, [location.search, searchParams]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsUserMenuOpen(false);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'submit') {
            if (searchQuery.trim()) {
                navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                setIsMenuOpen(false); // Close mobile menu if open
            }
        }
    };

    return (
        <>
            {/* Promo Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm">
                🎉 Free Shipping on orders over ₹999! Use code: FREESHIP
            </div>

            {/* Main Navbar */}
            <nav className="bg-white shadow-nav sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-xl font-bold gradient-text">ShopSmart</span>
                        </Link>

                        {/* Desktop Search */}
                        <div className="hidden md:flex flex-1 max-w-lg mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Products
                            </Link>

                            {isAdmin && (
                                <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                    Admin
                                </Link>
                            )}

                            {/* Wishlist */}
                            {!isAdmin && (
                                <Link to="/wishlist" className="relative group">
                                    <svg className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {getWishlistCount() > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {getWishlistCount()}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Cart */}
                            {!isAdmin && (
                                <Link to="/cart" className="relative group">
                                    <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-7-9v9" />
                                    </svg>
                                    {getCartCount() > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {getCartCount()}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                            <div className="px-4 py-2 border-b">
                                                <p className="font-medium text-gray-900">{user?.name}</p>
                                                <p className="text-sm text-gray-500">{user?.email}</p>
                                            </div>
                                            {!isAdmin && (
                                                <Link
                                                    to="/orders"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    My Orders
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="btn-primary text-sm">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-4 py-3 space-y-3">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <Link to="/products" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                                Products
                            </Link>
                            {!isAdmin && (
                                <Link to="/cart" className="flex items-center justify-between py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                                    <span>Cart</span>
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{getCartCount()}</span>
                                </Link>
                            )}
                            {!isAdmin && (
                                <Link to="/wishlist" className="flex items-center justify-between py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                                    <span>Wishlist</span>
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{getWishlistCount()}</span>
                                </Link>
                            )}
                            {isAdmin && (
                                <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                                    Admin Dashboard
                                </Link>
                            )}
                            {isAuthenticated ? (
                                <>
                                    {!isAdmin && (
                                        <Link to="/orders" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                                            My Orders
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="block w-full text-left py-2 text-red-600"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="block py-2 text-blue-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                                    Login / Register
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;

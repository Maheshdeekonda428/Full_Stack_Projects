import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    };

    const subtotal = getCartTotal();
    const shipping = subtotal > 999 ? 0 : 99;
    const discount = 0;
    const total = subtotal + shipping - discount;

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <div className="text-8xl mb-6">🛒</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="btn-primary">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="section-title mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                            {/* Image */}
                            <Link to={`/products/${item._id}`} className="shrink-0">
                                <img
                                    src={item.image || 'https://via.placeholder.com/100x100'}
                                    alt={item.name}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            </Link>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <Link to={`/products/${item._id}`}>
                                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                                        {item.name}
                                    </h3>
                                </Link>
                                <p className="text-sm text-gray-500">{item.category}</p>
                                <p className="text-lg font-bold text-gray-900 mt-2">₹{item.price}</p>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.qty - 1)}
                                            className="px-3 py-1 hover:bg-gray-100"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 font-medium">{item.qty}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, Math.min(item.countInStock, item.qty + 1))}
                                            className="px-3 py-1 hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-red-500 hover:text-red-600 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                                <p className="font-bold text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleClearCart}
                        className="text-red-500 hover:text-red-600 text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Cart
                    </button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                        {/* Promo Code */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter code"
                                    className="input-field flex-1"
                                />
                                <button className="btn-secondary">Apply</button>
                            </div>
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal ({cartItems.reduce((a, i) => a + i.qty, 0)} items)</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'text-green-600' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {shipping === 0 && (
                            <p className="text-green-600 text-sm text-center mt-4">
                                🎉 You qualify for free shipping!
                            </p>
                        )}

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary w-full mt-6"
                        >
                            Proceed to Checkout
                        </button>

                        <Link to="/products" className="block text-center text-blue-600 hover:text-blue-700 mt-4">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    const [shippingData, setShippingData] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
    });

    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        upiId: '',
    });

    const subtotal = getCartTotal();
    const shipping = subtotal > 999 ? 0 : 99;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    const steps = [
        { id: 1, name: 'Shipping', icon: '📦' },
        { id: 2, name: 'Payment', icon: '💳' },
        { id: 3, name: 'Review', icon: '✓' },
    ];

    const handleShippingChange = (e) => {
        setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    };

    const handlePaymentChange = (e) => {
        setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
    };

    const validateShipping = () => {
        return shippingData.address && shippingData.city && shippingData.postalCode;
    };

    const validatePayment = () => {
        if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
            return paymentData.cardNumber && paymentData.cardName && paymentData.expiryDate && paymentData.cvv;
        }
        if (paymentMethod === 'UPI') {
            return paymentData.upiId && paymentData.upiId.includes('@');
        }
        return true; // COD is always valid
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    product: item._id,
                })),
                shippingAddress: shippingData,
                paymentMethod: paymentMethod,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: total,
                paymentMetadata: paymentMethod === 'UPI' ? { upiId: paymentData.upiId } : null
            };

            await orderService.createOrder(orderData);
            clearCart();
            toast.success('Order placed successfully!');
            navigate('/orders');
        } catch (error) {
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Steps Indicator */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center space-x-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all ${currentStep >= step.id
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                    }`}
                            >
                                {currentStep > step.id ? '✓' : step.icon}
                            </div>
                            <span className={`ml-2 font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.name}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-16 h-1 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        {/* Step 1: Shipping */}
                        {currentStep === 1 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={shippingData.address}
                                            onChange={handleShippingChange}
                                            className="input-field"
                                            placeholder="123 Main Street, Apt 4B"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingData.city}
                                                onChange={handleShippingChange}
                                                className="input-field"
                                                placeholder="Mumbai"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={shippingData.postalCode}
                                                onChange={handleShippingChange}
                                                className="input-field"
                                                placeholder="400001"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <select
                                            name="country"
                                            value={shippingData.country}
                                            onChange={handleShippingChange}
                                            className="input-field"
                                        >
                                            <option value="India">India</option>
                                            <option value="USA">United States</option>
                                            <option value="UK">United Kingdom</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!validateShipping()}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {currentStep === 2 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

                                {/* Method Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {[
                                        { id: 'Credit Card', name: 'Credit Card', icon: '💳' },
                                        { id: 'Debit Card', name: 'Debit Card', icon: '🪪' },
                                        { id: 'UPI', name: 'UPI / PhonePe / GPay', icon: '📱' },
                                        { id: 'COD', name: 'Cash on Delivery', icon: '💵' },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex items-center p-4 border-2 rounded-xl transition-all ${paymentMethod === method.id
                                                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-opacity-10'
                                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-2xl mr-3">{method.icon}</span>
                                            <span className={`font-medium ${paymentMethod === method.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                                {method.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-6">
                                    {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                                        <div className="animate-slide-up">
                                            <p className="text-sm text-gray-500 mb-4">Secure card payment - Encrypted and safe</p>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                                    <input
                                                        type="text"
                                                        name="cardNumber"
                                                        value={paymentData.cardNumber}
                                                        onChange={handlePaymentChange}
                                                        className="input-field"
                                                        placeholder="4242 4242 4242 4242"
                                                        maxLength="19"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                                                    <input
                                                        type="text"
                                                        name="cardName"
                                                        value={paymentData.cardName}
                                                        onChange={handlePaymentChange}
                                                        className="input-field"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                                        <input
                                                            type="text"
                                                            name="expiryDate"
                                                            value={paymentData.expiryDate}
                                                            onChange={handlePaymentChange}
                                                            className="input-field"
                                                            placeholder="MM/YY"
                                                            maxLength="5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                                        <input
                                                            type="password"
                                                            name="cvv"
                                                            value={paymentData.cvv}
                                                            onChange={handlePaymentChange}
                                                            className="input-field"
                                                            placeholder="•••"
                                                            maxLength="3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'UPI' && (
                                        <div className="animate-slide-up">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                                            <input
                                                type="text"
                                                name="upiId"
                                                value={paymentData.upiId}
                                                onChange={handlePaymentChange}
                                                className="input-field"
                                                placeholder="username@bank"
                                            />
                                            <p className="mt-2 text-sm text-gray-500">A payment request will be sent to your UPI app.</p>
                                        </div>
                                    )}

                                    {paymentMethod === 'COD' && (
                                        <div className="animate-slide-up p-4 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-green-800 flex items-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                You can pay in cash when your order is delivered.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        disabled={!validatePayment()}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>

                                {/* Shipping Summary */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Shipping Address</h3>
                                            <p className="text-gray-600 mt-1">
                                                {shippingData.address}<br />
                                                {shippingData.city}, {shippingData.postalCode}<br />
                                                {shippingData.country}
                                            </p>
                                        </div>
                                        <button onClick={() => setCurrentStep(1)} className="text-blue-600 text-sm">
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Summary */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Payment Method</h3>
                                            <p className="text-gray-600 mt-1">
                                                {paymentMethod === 'COD'
                                                    ? 'Cash on Delivery'
                                                    : paymentMethod === 'UPI'
                                                        ? `UPI (${paymentData.upiId})`
                                                        : `${paymentMethod} ending in ****${paymentData.cardNumber.slice(-4)}`
                                                }
                                            </p>
                                        </div>
                                        <button onClick={() => setCurrentStep(2)} className="text-blue-600 text-sm">
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
                                    <div className="space-y-3">
                                        {cartItems.map(item => (
                                            <div key={item._id} className="flex items-center gap-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                                </div>
                                                <p className="font-medium">₹{(item.price * item.qty).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between mt-8">
                                    <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isSubmitting}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader size="sm" /> : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            {cartItems.map(item => (
                                <div key={item._id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate pr-2">{item.name} × {item.qty}</span>
                                    <span className="text-gray-900">₹{(item.price * item.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t pt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'text-green-600' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (18% GST)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

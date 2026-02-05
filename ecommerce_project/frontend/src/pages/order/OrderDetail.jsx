import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import orderService from '../../services/orderService';
import { PageLoader } from '../../components/common/Loader';

const OrderDetail = () => {
    const { id } = useParams();

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderService.getOrder(id),
    });

    const getStatusColor = (order) => {
        if (order.isDelivered) return 'badge-success';
        if (order.isPaid) return 'badge-info';
        return 'badge-warning';
    };

    const getStatusText = (order) => {
        if (order.isDelivered) return 'Delivered';
        if (order.isPaid) return 'Processing';
        return 'Pending Payment';
    };

    if (isLoading) return <PageLoader />;
    if (error || !order) return (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
            <Link to="/orders" className="btn-primary mt-4 inline-block">Back to My Orders</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <nav className="flex items-center text-sm text-gray-500 mb-8">
                <Link to="/orders" className="hover:text-blue-600">My Orders</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">Order #{order._id?.slice(-8)}</span>
            </nav>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-blue-100 text-sm">Order ID</p>
                        <h1 className="text-2xl font-bold">#{order._id}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm`}>
                            {getStatusText(order)}
                        </span>
                        {order.isPaid && (
                            <span className="text-sm font-medium text-blue-100">
                                Paid on {new Date(order.paidAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {/* Progress Tracker (Simplified) */}
                    <div className="relative flex justify-between mb-12">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 -z-10" />
                        <div className={`flex flex-col items-center gap-2 bg-white px-4`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isPaid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                ✓
                            </div>
                            <span className="text-xs font-medium">Paid</span>
                        </div>
                        <div className={`flex flex-col items-center gap-2 bg-white px-4`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isPaid && !order.isDelivered ? 'bg-blue-600 text-white' : order.isDelivered ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                📦
                            </div>
                            <span className="text-xs font-medium">Processed</span>
                        </div>
                        <div className={`flex flex-col items-center gap-2 bg-white px-4`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.isDelivered ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                🏠
                            </div>
                            <span className="text-xs font-medium">Delivered</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        {/* Shipping */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📍</span> Shipping Address
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 text-gray-700 leading-relaxed">
                                {order.shippingAddress?.address}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                {order.shippingAddress?.country}
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>💳</span> Payment Summary
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{(order.totalPrice - order.shippingPrice - order.taxPrice).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹{order.shippingPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{order.taxPrice?.toFixed(2)}</span>
                                </div>
                                <div className="pt-2 border-t flex justify-between font-bold text-gray-900 text-lg">
                                    <span>Total</span>
                                    <span className="text-blue-600">₹{order.totalPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Ordered Items ({order.orderItems?.length})</h3>
                        <div className="space-y-4">
                            {order.orderItems?.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/80'}
                                        alt={item.name}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <p className="text-gray-500 text-sm">Qty: {item.qty} × ₹{item.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{(item.qty * item.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;

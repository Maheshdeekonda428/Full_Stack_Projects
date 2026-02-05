import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';
import { PageLoader } from '../../components/common/Loader';

const OrderList = () => {
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const handleReorder = (order) => {
        order.orderItems.forEach((item) => {
            // Reconstruct product object from order item
            // Note: Use item.product as the _id since that's how it's stored in orderItems
            const product = {
                _id: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                countInStock: item.countInStock || 10, // Fallback if not provided
            };
            addToCart(product, item.qty);
        });
        navigate('/cart');
    };

    const { data: orders, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: () => orderService.getMyOrders(),
    });

    const filters = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
    ];

    const getStatusColor = (order) => {
        if (order.isDelivered) return 'badge-success';
        if (order.isPaid) return 'badge-info';
        return 'badge-warning';
    };

    const getStatusText = (order) => {
        if (order.isDelivered) return 'Delivered';
        if (order.isPaid) return 'Processing';
        return 'Pending';
    };

    const filteredOrders = orders?.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !order.isPaid;
        if (filter === 'processing') return order.isPaid && !order.isDelivered;
        if (filter === 'delivered') return order.isDelivered;
        return true;
    });

    if (isLoading) return <PageLoader />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="section-title mb-8">My Orders</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Orders */}
            {filteredOrders?.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-8xl mb-6">📦</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
                    <p className="text-gray-600 mb-8">
                        {filter === 'all'
                            ? "You haven't placed any orders yet."
                            : `No orders with status "${filter}".`}
                    </p>
                    <Link to="/products" className="btn-primary">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders?.map(order => (
                        <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex flex-wrap gap-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-medium">#{order._id?.slice(-8)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="font-bold text-blue-600">₹{order.totalPrice?.toFixed(2)}</p>
                                    </div>
                                </div>
                                <span className={`badge ${getStatusColor(order)}`}>
                                    {getStatusText(order)}
                                </span>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {order.orderItems?.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <img
                                                src={item.image || 'https://via.placeholder.com/60'}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Address */}
                                <div className="text-sm text-gray-600 mb-4">
                                    <span className="font-medium">Shipping to: </span>
                                    {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link
                                        to={`/orders/${order._id}`}
                                        className="btn-secondary text-sm"
                                    >
                                        Track Order
                                    </Link>
                                    <button
                                        onClick={() => handleReorder(order)}
                                        className="btn-outline text-sm"
                                    >
                                        Reorder
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList;

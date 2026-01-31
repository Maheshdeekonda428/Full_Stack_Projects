import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const queryClient = useQueryClient();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['allOrders'],
        queryFn: () => adminService.getAllOrders(),
    });

    const deliverMutation = useMutation({
        mutationFn: (orderId) => adminService.updateOrderStatus(orderId, 'delivered'),
        onSuccess: () => {
            queryClient.invalidateQueries(['allOrders']);
            toast.success('Order marked as delivered');
        },
        onError: () => {
            toast.error('Failed to update order');
        },
    });

    const payMutation = useMutation({
        mutationFn: (orderId) => adminService.updateOrderStatus(orderId, 'paid'),
        onSuccess: () => {
            queryClient.invalidateQueries(['allOrders']);
            toast.success('Order marked as paid');
        },
        onError: () => {
            toast.error('Failed to mark order as paid');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (orderId) => adminService.deleteOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries(['allOrders']);
            toast.success('Order deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete order');
        },
    });

    const handleDeleteOrder = (orderId) => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            deleteMutation.mutate(orderId);
        }
    };

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

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="section-title mb-8">Manage Orders</h1>

            {orders?.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-8xl mb-6">📦</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
                    <p className="text-gray-600">Orders will appear here when customers place them.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders?.map(order => (
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
                                        <p className="text-sm text-gray-500">Customer</p>
                                        <p className="font-medium">{order.user || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total</p>
                                        <p className="font-bold text-blue-600">₹{order.totalPrice?.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`badge ${getStatusColor(order)}`}>
                                        {getStatusText(order)}
                                    </span>
                                    {!order.isPaid && (
                                        <button
                                            onClick={() => payMutation.mutate(order._id)}
                                            disabled={payMutation.isLoading}
                                            className="btn-primary text-sm bg-green-600 hover:bg-green-700 border-none"
                                        >
                                            Mark Paid
                                        </button>
                                    )}
                                    {order.isPaid && !order.isDelivered && (
                                        <button
                                            onClick={() => deliverMutation.mutate(order._id)}
                                            disabled={deliverMutation.isLoading}
                                            className="btn-primary text-sm"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        disabled={deleteMutation.isLoading}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Order"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="p-6">
                                {/* Items */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                                    <div className="space-y-3">
                                        {order.orderItems?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/50'}
                                                    alt={item.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Qty: {item.qty} × ₹{item.price} = ₹{(item.qty * item.price).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Shipping */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                                        <p className="text-gray-600">
                                            {order.shippingAddress?.address}<br />
                                            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                            {order.shippingAddress?.country}
                                        </p>
                                    </div>

                                    {/* Payment */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">Payment Info</h3>
                                        <p className="text-gray-600">
                                            Method: {order.paymentMethod}<br />
                                            Status: {order.isPaid ? (
                                                <span className="text-green-600">
                                                    Paid on {new Date(order.paidAt).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-red-600">Not Paid</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex flex-wrap gap-6 text-sm">
                                        <div>
                                            <span className="text-gray-500">Subtotal:</span>
                                            <span className="ml-2 font-medium">
                                                ₹{(order.totalPrice - order.shippingPrice - order.taxPrice).toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Shipping:</span>
                                            <span className="ml-2 font-medium">₹{order.shippingPrice?.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Tax:</span>
                                            <span className="ml-2 font-medium">₹{order.taxPrice?.toFixed(2)}</span>
                                        </div>
                                        <div className="font-bold">
                                            <span className="text-gray-900">Total:</span>
                                            <span className="ml-2 text-blue-600">₹{order.totalPrice?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;

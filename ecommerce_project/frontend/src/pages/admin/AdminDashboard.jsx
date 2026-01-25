import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import { PageLoader } from '../../components/common/Loader';

const AdminDashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: () => adminService.getDashboardStats(),
    });

    if (isLoading) return <PageLoader />;

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: '💰',
            gradient: 'from-green-400 to-emerald-600',
        },
        {
            title: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: '📦',
            gradient: 'from-blue-400 to-blue-600',
        },
        {
            title: 'Total Products',
            value: stats?.totalProducts || 0,
            icon: '🛍️',
            gradient: 'from-purple-400 to-purple-600',
        },
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: '👥',
            gradient: 'from-orange-400 to-orange-600',
        },
    ];

    const quickActions = [
        { title: 'Add Product', icon: '➕', link: '/admin/products/new', gradient: 'from-blue-500 to-cyan-500' },
        { title: 'Manage Products', icon: '📋', link: '/admin/products', gradient: 'from-purple-500 to-pink-500' },
        { title: 'Manage Orders', icon: '📦', link: '/admin/orders', gradient: 'from-orange-500 to-red-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="section-title mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 text-white shadow-lg`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">{stat.title}</p>
                                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                            </div>
                            <span className="text-4xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.link}
                            className={`bg-gradient-to-br ${action.gradient} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-all`}
                        >
                            <span className="text-4xl mb-4 block">{action.icon}</span>
                            <h3 className="text-xl font-bold">{action.title}</h3>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-blue-600 text-sm hover:text-blue-700">
                            View All
                        </Link>
                    </div>
                    {stats?.recentOrders?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-4">
                            {stats?.recentOrders?.map(order => (
                                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">#{order._id?.slice(-8)}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600">₹{order.totalPrice?.toFixed(2)}</p>
                                        <span className={`badge ${order.isDelivered ? 'badge-success' : order.isPaid ? 'badge-info' : 'badge-warning'}`}>
                                            {order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
                        <Link to="/admin/products" className="text-blue-600 text-sm hover:text-blue-700">
                            Manage
                        </Link>
                    </div>
                    {stats?.lowStockProducts?.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">All products are well stocked</p>
                    ) : (
                        <div className="space-y-4">
                            {stats?.lowStockProducts?.map(product => (
                                <div key={product._id} className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/50'}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-red-600">Only {product.countInStock} left</p>
                                    </div>
                                    <Link
                                        to={`/admin/products/edit/${product._id}`}
                                        className="text-blue-600 text-sm hover:text-blue-700"
                                    >
                                        Update
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

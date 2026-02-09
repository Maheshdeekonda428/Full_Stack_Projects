import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderList from './pages/order/OrderList';
import OrderDetail from './pages/order/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import NotFound from './pages/NotFound';


function App() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />

                    {/* Protected Routes */}
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/checkout" element={
                        <ProtectedRoute userOnly>
                            <Checkout />
                        </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute userOnly>
                            <OrderList />
                        </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                        <ProtectedRoute userOnly>
                            <OrderDetail />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                        <ProtectedRoute adminOnly>
                            <AdminProducts />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/products/new" element={
                        <ProtectedRoute adminOnly>
                            <ProductForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/products/edit/:id" element={
                        <ProtectedRoute adminOnly>
                            <ProductForm />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <ProtectedRoute adminOnly>
                            <AdminOrders />
                        </ProtectedRoute>
                    } />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;

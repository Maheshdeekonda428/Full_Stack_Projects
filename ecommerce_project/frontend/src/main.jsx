import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <App />
                                <Toaster
                                    position="top-right"
                                    toastOptions={{
                                        duration: 3000,
                                        style: {
                                            background: '#363636',
                                            color: '#fff',
                                        },
                                        success: {
                                            style: {
                                                background: '#22c55e',
                                            },
                                        },
                                        error: {
                                            style: {
                                                background: '#ef4444',
                                            },
                                        },
                                    }}
                                />
                            </WishlistProvider>
                        </CartProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </React.StrictMode>
);

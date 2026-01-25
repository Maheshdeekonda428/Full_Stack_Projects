import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === product._id);

            if (existingItem) {
                const newQty = Math.min(existingItem.qty + quantity, product.countInStock);
                toast.success('Cart updated!');
                return prevItems.map((item) =>
                    item._id === product._id ? { ...item, qty: newQty } : item
                );
            }

            toast.success('Added to cart!');
            return [...prevItems, { ...product, qty: Math.min(quantity, product.countInStock) }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
        toast.success('Removed from cart');
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === productId
                    ? { ...item, qty: Math.min(quantity, item.countInStock) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        toast.success('Cart cleared');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.qty, 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.qty, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;

import { useState, useEffect } from 'react';

const useRecentlyViewed = () => {
    const [recentProducts, setRecentProducts] = useState([]);

    // 1. Initial Load from Local Storage
    useEffect(() => {
        const saved = localStorage.getItem('recentlyViewed');
        if (saved) {
            setRecentProducts(JSON.parse(saved));
        }
    }, []);

    // 2. Function to add a product to the list
    const addToRecentlyViewed = (product) => {
        if (!product || !product._id) return;

        setRecentProducts((prev) => {
            // Remove if already exists (to move it to the front)
            const filtered = prev.filter((p) => p._id !== product._id);

            // Add to front of the array
            const updated = [product, ...filtered].slice(0, 5); // Keep top 5

            // Save to Local Storage
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));
            return updated;
        });
    };

    return { recentProducts, addToRecentlyViewed };
};

export default useRecentlyViewed;

// src/contexts/CartContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { role, user } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        // Only fetch if buyer is logged in
        if (role === 'buyer' && user) {
            try {
                const response = await api.get('/buyer/cart');
                setCartCount(response.data.summary.total_items || 0);
            } catch (error) {
                console.error('Failed to fetch cart count', error);
            }
        } else {
            setCartCount(0);
        }
    };

    // Refetch the cart count if the user logs in as a buyer or changes
    useEffect(() => {
        fetchCartCount();
        
        // Listen for global cart updates
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [role, user]);

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount, setCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

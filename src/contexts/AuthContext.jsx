// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  const [pendingProduct, setPendingProduct] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      const { user, role, token } = response.data;
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
      
      setUser(user);
      setRole(role);

      // Handle redirect after login (for cart items added while logged out)
      if (redirectAfterLogin) {
        const redirectPath = redirectAfterLogin;
        setRedirectAfterLogin(null);
        
        // If there's a pending product to add to cart
        if (pendingProduct) {
          try {
            // FIXED: Use correct endpoint with buyer prefix
            await api.post("/buyer/cart/add", pendingProduct);
            setPendingProduct(null);
          } catch (err) {
            console.error("Failed to add product to cart after login", err);
          }
        }
        
        navigate(redirectPath);
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "buyer") {
        navigate("/buyer/shop/Products");
      } else if (role === "seller") {
        navigate("/seller/dashboard");
      }
    } catch (error) {
      console.error(error.response?.data);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/profile");
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Failed to refresh user", error);
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setUser(null);
      setRole(null);
      setRedirectAfterLogin(null);
      setPendingProduct(null);
      navigate("/");
    } catch (error) {
      console.error(error.response?.data);
      navigate("/");
    }
  };

  // Function to add to cart that handles auth check
  const addToCartWithAuth = async (productId, quantity = 1) => {
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
      // Store the product to add after login
      setPendingProduct({ product_id: productId, quantity });
      setRedirectAfterLogin("/buyer/cart");
      return { requiresLogin: true };
    }
    
    // User is logged in, add to cart directly
    try {
      // FIXED: Use correct endpoint with buyer prefix
      const response = await api.post("/buyer/cart/add", { product_id: productId, quantity });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to add to cart", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      login, 
      logout, 
      refreshUser,
      addToCartWithAuth,
      redirectAfterLogin,
      pendingProduct
    }}>
      {children}
    </AuthContext.Provider>
  );
};
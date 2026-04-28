import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ FIX: Remove JSON header when sending FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Intercept responses to emit global events for cart updates
api.interceptors.response.use(
  (response) => {
    const url = response.config.url;
    const method = response.config.method?.toLowerCase();
    
    // If the cart is modified (add, update, delete, clear, checkout), emit a global event
    if (url && url.includes('/buyer/cart') && ['post', 'put', 'delete'].includes(method)) {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
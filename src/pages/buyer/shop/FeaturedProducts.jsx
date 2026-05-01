// src/pages/buyer/shop/FeaturedProducts.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useLanguage } from "../../../contexts/LanguageContext";
import { successAlert, errorAlert } from '../../../utils/sweetAlertHelper';
import { ShoppingCart, DollarSign, Package, Star, RefreshCw, Image as ImageIcon, Heart, Eye } from "lucide-react";

const FeaturedProducts = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/buyer/shop/featured');
      setProducts(response.data);
      setImageErrors({});
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError(error.response?.data?.message || 'Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post('/buyer/cart/add', { product_id: productId, quantity: 1 });
      successAlert(t('alerts.addedToCart'), t('alerts.productAdded'));
    } catch (error) {
      errorAlert(t('alerts.error'), error.response?.data?.message || t('alerts.cartError') || 'Error adding to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price) => {
    return `Tsh ${Number(price).toLocaleString('en-US')}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#E9B48A]/10 to-transparent min-h-screen">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-yellow-500 rounded-xl">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2A1713]">Featured Products</h2>
              </div>
              <p className="text-sm sm:text-base text-[#956959] mt-1 ml-10 sm:ml-12">Hand-picked selection of our best products</p>
            </div>
            <button
              onClick={fetchFeaturedProducts}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#5C352C] text-white rounded-lg hover:bg-[#956959] transition-colors w-full sm:w-auto justify-center"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C352C]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchFeaturedProducts} className="mt-3 text-[#5C352C] hover:underline">Try Again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center border border-[#E9B48A]/20">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No Featured Products</h3>
            <p className="text-sm sm:text-base text-gray-500">Check back later for featured items</p>
          </div>
        ) : (
          <>
            {/* Products Grid - Responsive */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <Link to={`/buyer/shop/products/${product.id}`}>
                    <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {product.image && !imageErrors[product.id] ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                          <p className="text-xs text-gray-400 mt-1">No image</p>
                        </div>
                      )}
                      {/* Featured Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      </div>
                      {/* Stock Badge */}
                      {product.quantity <= product.min_stock_alert && product.quantity > 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white shadow-md">
                            Low Stock
                          </span>
                        </div>
                      )}
                      {product.quantity === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-800 text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button className="p-2 bg-white rounded-full hover:bg-[#5C352C] hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product.id);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-[#5C352C] hover:text-white transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <Link to={`/buyer/shop/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 hover:text-[#5C352C] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2 hidden sm:block">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div>
                        <span className="font-bold text-[#5C352C] text-base sm:text-lg">{formatPrice(product.price)}</span>
                        {product.old_price && (
                          <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.old_price)}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        by {product.seller?.name?.split(' ')[0] || 'Seller'}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.quantity === 0 || addingToCart[product.id]}
                      className={`mt-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                        product.quantity === 0 
                          ? 'bg-gray-200 cursor-not-allowed text-gray-500' 
                          : 'bg-[#5C352C] text-white hover:bg-[#956959]'
                      }`}
                    >
                      {addingToCart[product.id] ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Products Link */}
            <div className="mt-8 sm:mt-10 text-center">
              <Link to="/buyer/shop/products">
                <button className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-[#5C352C] text-[#5C352C] rounded-lg hover:bg-[#5C352C] hover:text-white transition-all duration-300 font-semibold text-sm sm:text-base">
                  View All Products
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default FeaturedProducts;
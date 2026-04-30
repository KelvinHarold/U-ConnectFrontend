// src/pages/seller/inventory/BulkStockUpdate.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import api from "../../../api/axios";
import { useToast } from "../../../contexts/ToastContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { 
  ArrowLeft, 
  Save, 
  Package, 
  AlertCircle, 
  Upload,
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from "lucide-react";

// ==================== INSTAGRAM-STYLE SHIMMER ANIMATION ====================
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
    background-size: 200% 100%;
  }
`;

const BulkStockUpdate = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [products, setProducts] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Add shimmer style
  useEffect(() => {
    if (!document.querySelector('#shimmer-styles-bulk-stock')) {
      const style = document.createElement('style');
      style.id = 'shimmer-styles-bulk-stock';
      style.textContent = shimmerStyle;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setFetching(true);
    try {
      const response = await api.get('/seller/products', { params: { per_page: 50 } });
      const allProducts = response.data.data || [];
      setProducts(allProducts);
      setUpdates(allProducts.map(p => ({
        id: p.id,
        name: p.name,
        current_stock: p.quantity,
        new_stock: p.quantity,
        image: p.image
      })));
    } catch (error) {
      setError(t('seller.bulkStock.failedToLoad'));
      showToast(t('seller.bulkStock.failedToLoad'), 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleStockChange = (productId, newStock) => {
    setUpdates(prev => prev.map(update => 
      update.id === productId 
        ? { ...update, new_stock: parseInt(newStock) || 0 }
        : update
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const stockUpdates = updates
      .filter(u => u.new_stock !== u.current_stock)
      .map(u => ({
        product_id: u.id,
        quantity: u.new_stock,
        reason: t('seller.bulkStock.bulkUpdateReason')
      }));
    
    if (stockUpdates.length === 0) {
      showToast(t('seller.bulkStock.noChanges'), 'info');
      setLoading(false);
      return;
    }
    
    if (window.confirm(t('seller.bulkStock.confirmUpdate', { count: stockUpdates.length }))) {
      try {
        await api.post('/seller/inventory/bulk-update', { updates: stockUpdates });
        showToast(t('seller.bulkStock.updateSuccess', { count: stockUpdates.length }), 'success');
        setSuccess(t('seller.bulkStock.updateSuccessMessage', { count: stockUpdates.length }));
        setTimeout(() => navigate('/seller/inventory/summary'), 2000);
      } catch (error) {
        const errorMsg = error.response?.data?.message || t('seller.bulkStock.updateError');
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const resetToCurrent = () => {
    setUpdates(updates.map(u => ({ ...u, new_stock: u.current_stock })));
    showToast(t('seller.bulkStock.resetSuccess'), 'info');
  };

  const changedCount = updates.filter(u => u.new_stock !== u.current_stock).length;
  
  let filteredUpdates = updates.filter(update =>
    update.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && fetching) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-24 sm:w-32"></div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer h-16 sm:h-20"></div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-28 sm:w-32 mb-1 sm:mb-2"></div>
                        <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded w-20 sm:w-24"></div>
                      </div>
                      <div className="w-20 sm:w-24 h-8 sm:h-9 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
          
            {/* Back Button - Responsive */}
            <div className="mb-4 sm:mb-6">
              <Link to="/seller/inventory/summary" className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-[#5C352C] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t('seller.bulkStock.backToInventory')}
              </Link>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden shadow-sm">
              {/* Header - Responsive */}
              <div className="p-3 sm:p-5 border-b-2 border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-[#5C352C]/10 rounded-lg sm:rounded-xl">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#5C352C]" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-semibold text-gray-900">{t('seller.bulkStock.title')}</h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{t('seller.bulkStock.subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mx-3 sm:mx-5 mt-3 sm:mt-5 bg-emerald-50 border border-emerald-100 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    <p className="text-xs sm:text-sm text-emerald-700">{success}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mx-3 sm:mx-5 mt-3 sm:mt-5 bg-rose-50 border border-rose-100 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                    <p className="text-xs sm:text-sm text-rose-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Stats Summary - Responsive */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-5 pb-0">
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[8px] sm:text-[10px] text-gray-500">{t('seller.bulkStock.products')}</p>
                  <p className="text-base sm:text-xl font-bold text-gray-900">{updates.length}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2 sm:p-3">
                  <p className="text-[8px] sm:text-[10px] text-amber-600">{t('seller.bulkStock.changes')}</p>
                  <p className="text-base sm:text-xl font-bold text-amber-700">{changedCount}</p>
                </div>
                <button
                  onClick={resetToCurrent}
                  className="bg-gray-100 rounded-lg p-2 sm:p-3 text-center hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mx-auto mb-0.5 sm:mb-1" />
                  <p className="text-[8px] sm:text-[10px] text-gray-600">{t('seller.bulkStock.resetAll')}</p>
                </button>
              </div>

              {/* Search - Responsive */}
              <div className="p-3 sm:p-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isSmallMobile ? t('seller.bulkStock.searchShort') : t('seller.bulkStock.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C] focus:ring-2 focus:ring-[#5C352C]/20 transition-all"
                  />
                </div>
              </div>

              {/* Products Table - Responsive */}
              <div className="px-3 sm:px-5 pb-3 sm:pb-5">
                {fetching ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#5C352C] mx-auto mb-2 sm:mb-3"></div>
                    <p className="text-[11px] sm:text-sm text-gray-500">{t('seller.bulkStock.loadingProducts')}</p>
                  </div>
                ) : filteredUpdates.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-gray-500">{t('seller.bulkStock.noProductsFound')}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table - Hidden on mobile */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-100">
                          <tr>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500">{t('seller.bulkStock.product')}</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500">{t('seller.bulkStock.current')}</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500">{t('seller.bulkStock.newStock')}</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500">{t('seller.bulkStock.change')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredUpdates.map((product) => {
                            const change = product.new_stock - product.current_stock;
                            return (
                              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 sm:px-4 py-2 sm:py-3">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                      {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                      ) : (
                                        <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                                      )}
                                    </div>
                                    <span className="text-[11px] sm:text-sm font-medium text-gray-900 truncate max-w-[150px]">{product.name}</span>
                                  </div>
                                </td>
                                <td className="px-3 sm:px-4 py-2 sm:py-3 text-[11px] sm:text-sm text-gray-700">{product.current_stock}</td>
                                <td className="px-3 sm:px-4 py-2 sm:py-3">
                                  <input
                                    type="number"
                                    value={product.new_stock}
                                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                                    min="0"
                                    className="w-20 sm:w-24 px-1.5 sm:px-2 py-1 sm:py-1.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50 focus:outline-none focus:border-[#5C352C]"
                                  />
                                </td>
                                <td className="px-3 sm:px-4 py-2 sm:py-3">
                                  {change !== 0 && (
                                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {change > 0 ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                      {change > 0 ? '+' : ''}{change}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {filteredUpdates.map((product) => {
                        const change = product.new_stock - product.current_stock;
                        return (
                          <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{product.name}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">{t('seller.bulkStock.currentLabel')}: {product.current_stock}</p>
                              </div>
                              {change !== 0 && (
                                <span className={`text-[10px] sm:text-xs font-medium ${change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {change > 0 ? '+' : ''}{change}
                                </span>
                              )}
                            </div>
                            <input
                              type="number"
                              value={product.new_stock}
                              onChange={(e) => handleStockChange(product.id, e.target.value)}
                              min="0"
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:border-[#5C352C]"
                              placeholder={t('seller.bulkStock.newStockPlaceholder')}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Button - Responsive */}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-gray-100">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || changedCount === 0}
                        className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-[#5C352C] to-[#8B5E4F] text-white rounded-lg font-medium text-xs sm:text-sm hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="hidden xs:inline">{t('seller.bulkStock.updating', { count: changedCount })}</span>
                            <span className="xs:hidden">{t('seller.bulkStock.updatingShort')}</span>
                          </div>
                        ) : (
                          <span className="hidden xs:inline">{t('seller.bulkStock.updateButton', { count: changedCount })}</span>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Info Note - Responsive */}
            <div className="mt-4 sm:mt-6 bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-blue-800">{t('seller.bulkStock.guidelinesTitle')}</p>
                  <p className="text-[8px] sm:text-[10px] text-blue-700 mt-0.5">{t('seller.bulkStock.guidelinesText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BulkStockUpdate;